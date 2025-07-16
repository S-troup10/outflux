import time
from datetime import datetime, timedelta, timezone
import send_email
import supabase_storage as storage

import json
import requests
from apscheduler.schedulers.background import BackgroundScheduler
import time

CLIENT_ID = '671187242058-mernc7k7i178t0u819hs63ckkbt8q4fp.apps.googleusercontent.com'
CLIENT_SECRET = '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'



import base64, email, re
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

from datetime import datetime, timedelta

from datetime import datetime, timedelta

def get_google_access_token(refresh_token, user_id):
    # Check stored access token and its expiry first
    res = storage.fetch('users', {"id": user_id})
    if res and isinstance(res, list):
        user = res[0]
        access_token = user.get('access_token')
        expires_at = user.get('expires_at')

        # If access token exists and hasn't expired, reuse it
        if access_token and expires_at:
                expiry = datetime.fromisoformat(expires_at)           # aware (tzinfo=UTC)
                if expiry > datetime.now(timezone.utc):    
                    return access_token

    # Otherwise, refresh the token
    url = "https://oauth2.googleapis.com/token"
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }

    response = requests.post(url, data=data)
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get("access_token")
        expires_in = token_data.get("expires_in", 3600)  # seconds until expiry
        expires_at = (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).isoformat()

        # Save new token and expiry
        storage.update_row_by_primary_key(
            table='users',
            data={
                'id': user_id,
                'access_token': access_token,
                'expires_at': expires_at
            },
            primary_key='id'
        )

        return access_token
    else:
        print("❌ Failed to get access token:", response.json())
        return None












def search_inbox_for_failure(refresh_token, user_id, campaign_id):
    """
    Scan Gmail for bounce DSNs and log failures to Supabase.
    """
    # 1. Get (or refresh) a valid access token
    token = get_google_access_token(refresh_token, user_id)
    if not token:
        print("⚠️ Access token unavailable. Aborting inbox scan.")
        return

    creds = Credentials(
        token=token,
        refresh_token=refresh_token,                # <-- include refresh_token
        token_uri="https://oauth2.googleapis.com/token",
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        scopes=["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.modify"]
    )
    # creds.refresh(Request())  # not needed; token just refreshed above

    service = build('gmail', 'v1', credentials=creds)

    query = ('label:unread '
             'subject:"Delivery Status Notification (Failure)" '
             'OR subject:"Undelivered Mail Returned to Sender"')

    try:
        results = service.users().messages().list(
            userId='me', q=query, maxResults=50).execute()
        messages = results.get('messages', [])
        if not messages:
            print("No bounce messages found.")
            return

        failed_events = []
        failed_email_list = []

        for msg in messages:
            msg_id = msg['id']
            raw_msg = service.users().messages().get(
                userId='me', id=msg_id, format='raw').execute()
            raw_bytes = base64.urlsafe_b64decode(raw_msg['raw'])
            mime_msg  = email.message_from_bytes(raw_bytes)

            # 2. --- Find failed recipient ------------------------------------
            failed_email = None

            # a) look in message/delivery-status part
            for part in mime_msg.walk():
                if part.get_content_type() == "message/delivery-status":
                    raw_payload = part.get_payload(decode=True)
                    if raw_payload:
                        dsn = raw_payload.decode(errors="ignore")
                    else:
                        dsn = part.get_payload() or ""

                    if isinstance(dsn, list):
                        dsn = "\n".join(str(p) for p in dsn)
                    for line in dsn.splitlines():

                        if line.lower().startswith("final-recipient:"):
                            failed_email = line.split(";")[-1].strip().lower()
                            break
                if failed_email:
                    break

            # b) fallback to text/plain regex
            if failed_email is None:
                body = ''
                for part in mime_msg.walk():
                    if part.get_content_type() == 'text/plain':
                        body += part.get_payload(decode=True).decode(errors='ignore')
                m = re.search(r'Final-Recipient: .*?; *([\\w.\\-+]+@[\\w\\.-]+)', body, re.I)
                if m:
                    failed_email = m.group(1).lower()
                else:
                    # last‑ditch generic email grab to reduce skips
                    m2 = re.search(r'[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}', body, re.I)
                    if m2:
                        failed_email = m2.group(0).lower()

            # 3. --- Short snippet for display --------------------------------
            snippet = 'unknown'
            for part in mime_msg.walk():
                if part.get_content_type() == 'text/plain':
                    lines = part.get_payload(decode=True).decode(errors='ignore').splitlines()
                    snippet = next((l for l in lines if '@' in l or 'reason' in l.lower()), 'unknown')
                    break

            if not failed_email:
                print(f"Could not extract failed email from message {msg_id}, skipping.")
                continue

            # 4. --- Map to list IDs -----------------------------------------
            list_ids = storage.get_list_ids_by_email(failed_email)
            if not list_ids:
                print(f"No list mapping for bounced email {failed_email}, skipping.")
                continue
            
            #add to list for supabase updating their flagged
            failed_email_list.extend(failed_email)
            
            

            print(f"Bounce detected: {failed_email} → {snippet}")
            for list_id in list_ids:
                failed_events.append({
                    "campaign_id": campaign_id,
                    "list_id":   list_id,         
                    "event_type": "failed",
                    "provider_id": None,
                    "meta": {
                        "failed_email": failed_email,
                        "reason": snippet,
                        "message_id": msg_id,
                        
                    },
                    "event_time": datetime.now(timezone.utc).isoformat(),
                    "user_id": user_id,
                })

            # 5. Mark as read so we don't process again
            try:
                service.users().messages().modify(
                    userId='me',
                    id=msg_id,
                    body={'removeLabelIds': ['UNREAD']}
                ).execute()
            except Exception as err:
                print(f"⚠️ Could not mark message {msg_id} as read: {err}")


        # 6. Batch insert into Supabase
        if failed_events:
            storage.log_email_event(events=failed_events)
            print(f"Logged {len(failed_events)} bounce events to Supabase.")
        
        result = storage.flag_emails(
            table   = "list_emails",
            emails  = failed_email_list,
            flagged = True   
        )
        print(result)
    except Exception as e:
        print("Gmail inbox failure search failed:", e)


#search_inbox_for_failure('1//03x8md9geLKqqCgYIARAAGAMSNwF-L9IroDft1I_HqVPoq38wF2GjHrx_tymldlwheh---Z8r3o0UfIvM-3FzR6dHv6X9zbUnCJU', 11)

def run_campaign_job(schedule_id, campaign_id):
    print(f"Running campaign {campaign_id}, schedule ID: {schedule_id}")
    print(scheduler.get_jobs())

    #get the campaogn details 
    campaign = storage.fetch('campaigns', {'id': campaign_id})
    
    
    
    if campaign:
        campaign = campaign[0]
        
    user_id = campaign.get('user_id')
        
    # extract the elements - parese it
    list_ids = json.loads(campaign['list_id'])
  
    # Make sure it's a list
    if not isinstance(list_ids, list):
        list_ids = [list_ids]

    # Get all emails
    email_list = get_all_emails_from_lists(list_ids)
    #print(email_list)
        
    subject = campaign['subject']
    body = campaign['body']
    
    # from user id get the email and the refresh token
    
    user = storage.fetch('users', {'id': user_id})
    if user:
        user = user[0]
    #print('user : ', user)
    
    if not user:
        print('no user found with id : ', user_id)
        return
    
    email = user.get('send_email')
    refresh_token = user.get('refresh_token')
    provider = user.get('email_provider')
    
    if provider == 'google':
        access = get_google_access_token(refresh_token, user_id)
        print(access)
        
    
    elif provider == 'microsoft':
        pass
    
    else:
        #no proveider , return or somthing
        pass
        
    
    res = send_email.send_email_oauth2(email_list, subject, email, access, body)
    if res:
        storage.log_email_event(campaign_id=campaign_id, event_type='failed', meta={"error": "email failed to send"} , user_id=user_id)
        print('email not sent')
        print(res)
        return
    
    
    
    
    
    #send email here
    print(res)
    storage.log_email_event(campaign_id=campaign_id, event_type='sent', meta={"count":len(email_list)}, user_id=user_id)
    
    # schedule a scan for inbox in 2 minutes
    queue_inbox_failure_scan(refresh_token, user_id, campaign_id)
    
    
    # Set all rows with campaign_id in the list to status=True
    try:
        result = storage.bulk_update_by_field(
            table='schedule',
            filter_field='campaign_id',
            filter_values=[campaign_id],
            update_data={'status': True}
        )

        if not result.get('success'):
            print("Update failed:", result.get('error'))
        else:
            print("Update successful:", result.get('data'))

    except Exception as e:
        print("Unexpected error during bulk update:", str(e))
        
    



def get_all_emails_from_lists(list_ids):
    if list_ids:
        all_emails = storage.fetch(
            table='list_emails',
            filters=None,
            multi_filters={'list_id': list_ids, 'flagged': False}
        )
        if all_emails:
            return [item['email'] for item in all_emails if 'email' in item]
    return []


scheduler = BackgroundScheduler()

def queue_inbox_failure_scan(refresh_token: str, user_id: int, campaign_id: int , delay_sec: int = 15):
    """
    Schedule search_inbox_for_failure(refresh_token, user_id) once, delay_sec seconds from now.
    """
    run_at = datetime.now(timezone.utc) + timedelta(seconds=delay_sec)
    job_id = f"bounce-scan-{user_id}-{int(run_at.timestamp())}"

    # reuse SAE scheduler instnce
    scheduler.add_job(
        func=search_inbox_for_failure,
        trigger='date',
        run_date=run_at,
        args=[refresh_token, user_id, campaign_id],
        id=job_id,
        misfire_grace_time=60,
        replace_existing=False
    )
    print(f" bounce scan scheduled for {run_at.isoformat()} (job id {job_id})")


# call it



#run campaign job takes in the schedule id and campgin id
#every 5 minutes run this 

def schedule_jobs():
    print('job ran')
    scheduled_time = datetime(2025, 10, 27, 13, 0, 0)
    #res = storage.query_for_times(datetime.now())
    res = storage.query_for_times(scheduled_time)
    print(res)
    if res:
        for items in res:
            run_campaign_job(items.get('schedule_id'), items.get('campaign_id'))


schedule_jobs()
# Set up the scheduler

scheduler.add_job(schedule_jobs, 'interval', minutes=1)
scheduler.start()

# Prevent script from exiting
try:
    while True:
        time.sleep(1)
except (KeyboardInterrupt, SystemExit):
    scheduler.shutdown()
    
    


    