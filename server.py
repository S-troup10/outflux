from flask import Flask, request, jsonify, render_template, session, redirect, abort

import gunicorn
import supabase_storage as storage
import send_email as Email
import requests
import bcrypt
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
import threading
import time
import json
from apscheduler.schedulers.background import BackgroundScheduler
import base64, email, re
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials

import stripe

STRIPE_SECRET_KEY = "sk_test_51Rm636IPmpPcLP6Dj5kZfuuw5MZs0cdxeNpS0NT3kRqh6rXOkos4L0LzUCVZGxOVWsrVn3lruniiv5nMiOWtKJoF00oTnz2rPY"
stripe.api_key = STRIPE_SECRET_KEY

CLIENT_ID = '671187242058-mernc7k7i178t0u819hs63ckkbt8q4fp.apps.googleusercontent.com'
CLIENT_SECRET = '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'

# Scheduler instance - will be initialized after app
scheduler = None


def get_google_access_token(refresh_token, user_id):
    res = storage.fetch('users', {"id": user_id})
    if res and isinstance(res, list):
        user = res[0]
        access_token = user.get('access_token')
        expires_at = user.get('expires_at')

        if access_token and expires_at:
            expiry = datetime.fromisoformat(expires_at)
            if expiry > datetime.now(timezone.utc):
                return access_token

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
        expires_in = token_data.get("expires_in", 3600)
        expires_at = (datetime.now(timezone.utc) +
                      timedelta(seconds=expires_in)).isoformat()

        storage.update_row_by_primary_key(table='users',
                                          data={
                                              'id': user_id,
                                              'access_token': access_token,
                                              'expires_at': expires_at
                                          },
                                          primary_key='id')
        return access_token
    else:
        print("❌ Failed to get access token:", response.json())
        return None


def search_inbox_for_failure(refresh_token,
                             user_id,
                             campaign_id,
                             manual_emails=None,
                             list_email=None):
    #first see if the

    token = get_google_access_token(refresh_token, user_id)
    if not token:
        print("⚠️ Access token unavailable. Aborting inbox scan.")
        return

    creds = Credentials(token=token,
                        refresh_token=refresh_token,
                        token_uri="https://oauth2.googleapis.com/token",
                        client_id=CLIENT_ID,
                        client_secret=CLIENT_SECRET,
                        scopes=[
                            "https://www.googleapis.com/auth/gmail.readonly",
                            "https://www.googleapis.com/auth/gmail.modify"
                        ])

    service = build('gmail', 'v1', credentials=creds)

    twenty_minutes_ago = int(
        (datetime.now(timezone.utc) - timedelta(minutes=20)).timestamp())

    query = (f'label:unread '
             f'after:{twenty_minutes_ago} '
             f'(subject:"Delivery Status Notification (Failure)" '
             f'OR subject:"Undelivered Mail Returned to Sender")')

    try:
        results = service.users().messages().list(userId='me',
                                                  q=query,
                                                  maxResults=50).execute()
        messages = results.get('messages', [])
        if not messages:
            print("No bounce messages found.")
            return

        failed_events = []
        failed_email_list = []

        for msg in messages:
            msg_id = msg['id']
            raw_msg = service.users().messages().get(userId='me',
                                                     id=msg_id,
                                                     format='raw').execute()
            raw_bytes = base64.urlsafe_b64decode(raw_msg['raw'])
            mime_msg = email.message_from_bytes(raw_bytes)

            failed_email = None

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

            if failed_email is None:
                body = ''
                for part in mime_msg.walk():
                    if part.get_content_type() == 'text/plain':
                        body += part.get_payload(decode=True).decode(
                            errors='ignore')
                m = re.search(
                    r'Final-Recipient: .*?; *([\\w.\\-+]+@[\\w\\.-]+)', body,
                    re.I)
                if m:
                    failed_email = m.group(1).lower()
                else:
                    m2 = re.search(r'[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}',
                                   body, re.I)
                    if m2:
                        failed_email = m2.group(0).lower()

            snippet = 'unknown'
            for part in mime_msg.walk():
                if part.get_content_type() == 'text/plain':
                    lines = part.get_payload(decode=True).decode(
                        errors='ignore').splitlines()
                    snippet = next(
                        (l
                         for l in lines if '@' in l or 'reason' in l.lower()),
                        'unknown')
                    break

            if not failed_email:
                print(
                    f"Could not extract failed email from message {msg_id}, skipping."
                )
                continue

            ismanual = False
            #need a way to handle
            if manual_emails:
                manual = str(manual_emails).split(',')
                if failed_email in manual:
                    ismanual = True

            if not ismanual:

                list_ids = [
                    r.get('list_id') for r in list_email
                    if r.get('email', '').lower() == failed_email.lower()
                ]

                if not list_ids:
                    print(
                        f"No list mapping for bounced email {failed_email}, skipping."
                    )
                    continue

            failed_email_list.extend(failed_email)

            print(f"Bounce detected: {failed_email} → {snippet}")
            for list_id in list_ids:
                failed_events.append({
                    "campaign_id":
                    campaign_id,
                    "list_id":
                    list_id,
                    "event_type":
                    "failed",
                    "provider_id":
                    None,
                    "meta": {
                        "failed_email": failed_email,
                        "reason": snippet,
                        "message_id": msg_id,
                    },
                    "event_time":
                    datetime.now(timezone.utc).isoformat(),
                    "user_id":
                    user_id,
                })

            try:
                service.users().messages().modify(userId='me',
                                                  id=msg_id,
                                                  body={
                                                      'removeLabelIds':
                                                      ['UNREAD']
                                                  }).execute()
            except Exception as err:
                print(f"⚠️ Could not mark message {msg_id} as read: {err}")

        if failed_events:
            storage.log_email_event(events=failed_events)
            print(f"Logged {len(failed_events)} bounce events to Supabase.")

        result = storage.flag_emails(table="list_emails",
                                     emails=failed_email_list,
                                     flagged=True)
        print(result)
    except Exception as e:
        print("Gmail inbox failure search failed:", e)


def run_campaign_job(schedule_id, campaign_id):
    print(f"Running campaign {campaign_id}, schedule ID: {schedule_id}")

    campaign = storage.fetch('campaigns', {'id': campaign_id})
    if campaign:
        campaign = campaign[0]

    user_id = campaign.get('user_id')
    list_ids = json.loads(campaign['list_id'])

    if not isinstance(list_ids, list):
        list_ids = [list_ids]

    email_list, extended_list = get_all_emails_from_lists(list_ids)
    #make a list with all the manual emails
    manual_string = campaign.get('manual_emails', '')
    manual_list = [
        email.strip() for email in manual_string.split(',') if email.strip()
    ]

    for item in manual_list:
        email_list.append(item)

    subject = campaign['subject']
    body = campaign['body']

    user = storage.fetch('users', {'id': user_id})
    if user:
        user = user[0]

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
        pass

    if not access:
        print("❌ No access token, aborting email send.")
        return

    res = Email.send_email_oauth2(email_list, subject, email, access, body)
    if res:
        storage.log_email_event(campaign_id=campaign_id,
                                event_type='failed',
                                meta={"error": "email failed to send"},
                                user_id=user_id)
        print('email not sent')
        print(res)
        return

    print(res)
    storage.log_email_event(campaign_id=campaign_id,
                            event_type='sent',
                            meta={"count": len(email_list)},
                            user_id=user_id)

    queue_inbox_failure_scan(refresh_token,
                             user_id,
                             campaign_id,
                             manual_emails=campaign.get('manual_emails'),
                             list_email=extended_list)

    try:
        result = storage.bulk_update_by_field(table='schedule',
                                              filter_field='campaign_id',
                                              filter_values=[campaign_id],
                                              update_data={'status': True})

        if not result.get('success'):
            print("Update failed:", result.get('error'))
        else:
            print("Update successful:", result.get('data'))

    except Exception as e:
        print("Unexpected error during bulk update:", str(e))


def get_all_emails_from_lists(list_ids):
    if list_ids:
        all_emails = storage.fetch(table='list_emails',
                                   filters=None,
                                   multi_filters={
                                       'list_id': list_ids,
                                       'flagged': False
                                   })
        if all_emails:
            return [item['email'] for item in all_emails
                    if 'email' in item], all_emails
    return [], []


def queue_inbox_failure_scan(refresh_token: str,
                             user_id: int,
                             campaign_id: int,
                             delay_sec: int = 15,
                             manual_emails=None,
                             list_email=None):
    run_at = datetime.now(timezone.utc) + timedelta(seconds=delay_sec)
    job_id = f"bounce-scan-{user_id}-{int(run_at.timestamp())}"

    scheduler.add_job(
        func=search_inbox_for_failure,
        trigger='date',
        run_date=run_at,
        args=[refresh_token, user_id, campaign_id, manual_emails, list_email],
        id=job_id,
        misfire_grace_time=60,
        replace_existing=False)
    print(f"Bounce scan scheduled for {run_at.isoformat()} (job id {job_id})")


def schedule_jobs():
    print('Scheduler job ran')
    scheduled_time = datetime.now()
    res = storage.query_for_times(scheduled_time)
    print(res)
    if res:
        for items in res:
            run_campaign_job(items.get('schedule_id'),
                             items.get('campaign_id'))


def run_scheduler():
    """Background thread function to run the scheduler"""
    global scheduler
    scheduler = BackgroundScheduler()
    scheduler.add_job(schedule_jobs, 'interval', minutes=4)
    scheduler.start()

    try:
        while True:
            time.sleep(1)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()


app = Flask(__name__)
# Enables CORS for all routes
app.secret_key = 'super_secret_key_123456'


@app.route('/dashboard')
def dashboard():
    print(f"🔍 Dashboard access attempt - Session keys: {list(session.keys())}")
    print(f"📋 Full session: {dict(session)}")
    
    if 'user' in session and session['user']:
        user_data = session.get('user')
        print(f"✅ Valid user session found: {user_data}")
        print(f"👤 User ID: {user_data.get('id')}, Email: {user_data.get('email')}")
        return render_template('dashboard.html')
    
    print("❌ No valid user session, redirecting to home")
    print(f"❌ Session 'user' key exists: {'user' in session}")
    print(f"❌ Session 'user' value: {session.get('user')}")
    return redirect('/')


@app.route('/')
def landingPage():
    return render_template('index.html')


#save incoming sign up
@app.route('/sign_up', methods=['POST'])
def sign_up():
    data = request.json
    print(data)
    #this will return the id

    raw_password = data.get('password')
    #hash the password
    hashed_password = bcrypt.hashpw(raw_password.encode('utf-8'),
                                    bcrypt.gensalt())
    #replace with the hashed password (decode to a string)
    data['password'] = hashed_password.decode('utf-8')
    #add the data back
    res = storage.add('users', data)
    if res.get('success') == False:
        #handle invaliod sign up
        print(res)
        return jsonify({
            'message': 'customer was unable to be ad',
            'success': False
        }), 200

    #send confrimation email
    #find a way to do this async
    Email.confirmationEmail(data.get('email'), data.get('firstName'))

    #make sure only one person is logged in
    session.pop('user', None)

    session['user'] = {
        'first_name': data.get('firstName'),
        'last_name': data.get('lastName'),
        'email': data.get('email'),
        'id': res.get('id')
    }
    return jsonify({
        'message': 'Sign-up successful',
        'success': True,
        'redirect': '/dashboard'
    }), 200


@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return redirect('/')


#return names , photo, and other stuff for the page to render
@app.route('/session_user')
def session_user():
    session_user = session.get('user', {})
    email = session_user.get('email')

    if not email:
        return jsonify({'error': 'No user in session'}), 401

    response, user = storage.get_user_by_email(email)
    if not response:
        return jsonify({'error': 'User not found'}), 404
    
    user.pop('password', None)

    if user.get('refresh_token') is None:
        user['refresh_token'] = False
    else:
        user['refresh_token'] = True

    return jsonify(user), 200


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    pw = data.get('password')

    # Get user from DB by email
    success, user = storage.get_user_by_email(email)
    if not success:
        return jsonify(success=False, message="Connection error")
    if not user:
        return jsonify(success=False,
                       message="no account associated with email")

    stored_hash = user.get('password')
    if not stored_hash:
        return jsonify(success=False, message="Missing password for user")

    if not bcrypt.checkpw(pw.encode('utf-8'), stored_hash.encode('utf-8')):
        return jsonify(success=False, message="Invalid email or password")

    # Password is correct, log them in
    session['user'] = {
        'first_name': user['first_name'],
        'last_name': user['last_name'],
        'email': user['email'],
        'id': user['id']
    }
    return jsonify(success=True, message="Logged in successfully")


@app.route('/update', methods=['POST'])
def save():
    data = request.json
    print(data)
    res = storage.update_row_by_primary_key(data.get('table'),
                                            data.get('data'),
                                            data.get('primary_key'))
    if res.get('success'):
        return jsonify(success=True,
                       message="Data saved successfully",
                       response=res)
    else:
        return jsonify(success=False,
                       message="An error occurred while saving data",
                       error=res.get('error'))


@app.route('/add', methods=['POST'])
def add():
    data = request.json
    # { table: _____  , data : _______  }
    res = storage.add(data.get('table'), data.get('data'))
    # retun { res : ____ , success : ____}

    if res.get('success') == True:
        return jsonify(success=True,
                       message="data saved sucsessfully",
                       response=res,
                       identification=res.get('id')), 200
    else:

        return jsonify(success=False,
                       message="an error occured in saving the data",
                       error=res.get('error'))


@app.route('/api/save_campaign', methods=['POST'])
def execute_sql():
    data = request.json

    campaign_data = data.get('campaign')
    schedule = data.get('schedule', {})

    inserts = schedule.get('inserts', [])
    updates = schedule.get('updates', [])
    deletes = schedule.get('deletes', [])

    camp_id = campaign_data.get('id')

    # Update the campaign
    res = storage.update_row_by_primary_key('campaigns', campaign_data, 'id')
    if not res.get('success'):
        return jsonify(success=False, error=res.get('error'))

    # Handle inserts
    if inserts:
        res_insert = storage.add('schedule', inserts)
        if not res_insert.get('success'):
            return jsonify(success=False,
                           error="Insert failed: " +
                           res_insert.get('error', ''))

    # Handle updates
    for item in updates:
        res_update = storage.update_row_by_primary_key('schedule', item, 'id')
        if not res_update.get('success'):
            return jsonify(success=False,
                           error="Update failed: " +
                           res_update.get('error', ''))

    # Handle deletes (bulk)
    if deletes:
        res_delete = storage.delete_multiple('schedule', deletes)
        if not res_delete.get('success'):
            return jsonify(success=False,
                           error="Delete failed: " +
                           res_delete.get('error', ''))

    # if all are successful

    #get the new schedule associated with the campaign
    fetch = storage.fetch('schedule', {'campaign_id': camp_id})

    if fetch is None:  # if fetch failed or returned empty
        print("No data found or fetch failed")
        return jsonify(success=False, error="fetch failed")

    return jsonify(success=True, data=fetch)


@app.route('/getEmails', methods=['POST'])
def get_emails():
    try:
        #get the emails based on a list id passed in the list tab when the sidebar is opened
        data = request.get_json()
        list_id = data.get('list_id')

        if list_id is None:
            return jsonify({'success': False, 'error': 'Missing list_id'}), 400

        emails = storage.fetch('list_emails', {'list_id': list_id})
        return jsonify({'success': True, 'emails': emails})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/add_campaign', methods=['POST'])
def add_campaign():
    try:
        #get data and insert it
        data = request.json
        data['user_id'] = session.get('user').get('id')
        res = storage.add('campaigns', data)

        if res.get('success') == True:
            return jsonify(success=True,
                           message="added successfully",
                           campaign_id=res.get('id'))
        else:
            return jsonify(success=False, message="insert failed", error=res)

    except KeyError as e:
        print(e)
        return jsonify(success=False,
                       message=f'Missing required key: {str(e)}')
    except Exception as e:
        print(e)
        return jsonify(success=False,
                       message=f'An unexpected error occurred: {str(e)}')


@app.route('/api/delete', methods=['POST'])
def delete():
    data = request.get_json()

    table = data.get('table')
    _id = data.get('id')

    res = storage.delete(table, _id)

    if res.get('success'):
        return jsonify({"success": True, "message": "Deleted successfully."})
    else:
        return jsonify({"success": False, "error": res.get('error')})


@app.route('/api/fetch', methods=['POST'])
def fetch():
    data = request.get_json()

    table = data.get('table')
    args = data.get('args')

    res = storage.fetch(table, args)

    if res != None:
        return jsonify({"success": True, "data": res})
    else:
        return jsonify({"success": False, "error": res.get('error')})


@app.route('/save-lists', methods=['POST'])
def save_lists():
    data = request.json

    if not data:
        return jsonify({"error": "No data received"}), 400
    #ecxtracxt all the data
    to_add = data.get('to_add', [])
    to_update = data.get('to_update', [])
    to_delete = data.get('to_delete', [])
    list_id = data.get('list_id', '')
    count = data.get('count', '')

    print("To Add:", to_add)
    print("To Update:", to_update)
    print("To Delete:", to_delete)

    success = True
    errors = []

    new_id_map = {}

    for record in to_add:
        record['flagged'] = False
        temp_id = record.get('temp')
        if temp_id:
            del record['temp']
        res = storage.add('list_emails', record)

        if not res.get('success'):
            success = False
            errors.append(f"Add failed: {res.get('error')}")
        else:
            if temp_id and temp_id.startswith('temp-'):
                new_id_map[temp_id] = res.get('id')

    # Update existing records
    for record in to_update:
        res = storage.update_row_by_primary_key('list_emails', record, 'id')
        if not res.get('success'):
            success = False
            errors.append(
                f"Update failed for ID {record['id']}: {res.get('error')}")

    # Delete records by ID
    for record_id in to_delete:
        res = storage.delete('list_emails', record_id)
        if not res.get('success'):
            success = False
            errors.append(
                f"Delete failed for ID {record_id}: {res.get('error')}")

    #update count

    res = storage.update_row_by_primary_key('lists', {
        'count': count,
        'id': list_id
    }, 'id')

    if success:
        return jsonify({
            "status": "success",
            "message": "Changes saved successfully.",
            'new_id_map': new_id_map
        }), 200
    else:
        return jsonify({
            "status": "partial",
            "message": "Some operations failed.",
            "errors": errors
        }), 207


from datetime import datetime, timedelta, timezone
from collections import Counter
from dateutil import parser


@app.route('/all_data')
def all_data():
    # ─── 1. Auth ------------------------------------------------
    user = session.get('user')
    if not user:
        return jsonify(success=False, message="User not authenticated")

    user_id = user['id']

    # ─── 2. Lists & campaigns ----------------------------------
    lists = storage.fetch('lists', {'user_id': user_id}) or []
    campaigns = storage.fetch('campaigns', {'user_id': user_id}) or []

    all_schedule: list[dict] = []  # flat list of *every* schedule row

    three_weeks_ago = (datetime.now(timezone.utc) -
                       timedelta(weeks=3)).isoformat()

    for camp in campaigns:
        # grab every schedule row for this campaign, whatever its status
        rows = storage.fetch("schedule", {"campaign_id": camp["id"]},
                             gte_filters={"scheduled_time": three_weeks_ago
                                          }) or []

        # 1) accumulate ALL rows across all campaigns  →  all_schedule
        all_schedule.extend(rows)

        # 2) keep only the *upcoming* rows on the campaign object itself
        camp["schedule"] = [r for r in rows if r.get("status") is False]

    #for each schedule remove the ones with status = FALSE

    # Handy lookup for campaign names
    campaign_lookup = {
        c['id']: c.get('name', f"Campaign {c['id']}")
        for c in campaigns
    }

    # ─── 3. Fetch last‑14‑days events --------------------------
    now = datetime.now(timezone.utc)
    one_week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)

    events = storage.fetch(
        'email_events',
        filters={'user_id': user_id},
        gte_filters={'event_time': two_weeks_ago.isoformat()}) or []

    sent_list = []
    this_week_events = []
    last_week_events = []

    # Dict: {campaign_id: {"this_week": [], "last_week": []}}
    campaign_buckets = defaultdict(lambda: {"this_week": [], "last_week": []})

    # ─── 4. Single pass: split by week & campaign --------------
    for ev in events:
        # Parse timestamp once
        ev_time = parser.isoparse(ev['event_time'])
        if ev_time.tzinfo is None:
            ev_time = ev_time.replace(tzinfo=timezone.utc)

        week_bucket = "this_week" if ev_time >= one_week_ago else "last_week"
        (this_week_events
         if week_bucket == "this_week" else last_week_events).append(ev)

        # Track sent events for your existing /sent graph
        if ev['event_type'] == 'sent':
            sent_list.append(ev)

        # Per‑campaign buckets
        camp_id = ev.get('campaign_id')
        if camp_id is not None:
            campaign_buckets[camp_id][week_bucket].append(ev)

    # ─── 5. Helper to compute stats ----------------------------
    def compute_stats(bucket):
        counter = Counter(e['event_type'] for e in bucket)
        sent_rows = counter.get('sent', 0)
        failed_rows = counter.get('failed', 0)

        total_recipients = 0
        for ev in bucket:
            if ev['event_type'] != 'sent':
                continue
            meta = ev.get('meta') or {}
            if isinstance(meta.get('count'), int):
                total_recipients += meta['count']
            elif isinstance(meta.get('recipients'), list):
                total_recipients += len(meta['recipients'])
            else:
                total_recipients += 1

        failed_meta = [{
            **ev.get('meta', {}), "list_id": ev.get('list_id'),
            "event_id": ev['id'],
            "event_time": ev['event_time']
        } for ev in bucket if ev['event_type'] == 'failed' and ev.get(
            'meta', {}).get('reason') and ev.get('list_id') is not None]

        return {
            "total_emails_sent": sent_rows,
            "total_recipients": total_recipients,
            "total_failed": failed_rows,
            "failed_events": failed_meta
        }

    # ─── 6. Per‑campaign stats ---------------------------------
    campaign_stats = {}
    for camp_id, buckets in campaign_buckets.items():
        campaign_stats[camp_id] = {
            "name": campaign_lookup.get(camp_id, f"Campaign {camp_id}"),
            "this_week": compute_stats(buckets["this_week"]),
            "last_week": compute_stats(buckets["last_week"])
        }

    # ─── 7. Global stats & payload -----------------------------
    stats = {
        "this_week": compute_stats(this_week_events),
        "last_week": compute_stats(last_week_events),
        "sent": sent_list,
        "campaigns": campaign_stats,
        "schedule": all_schedule,
    }

    return jsonify(success=True, lists=lists, campaigns=campaigns, stats=stats)


CLIENT_ID = '671187242058-mernc7k7i178t0u819hs63ckkbt8q4fp.apps.googleusercontent.com'
CLIENT_SECRET = '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'


############GOOGLE STUFF
@app.route('/auth/google')
#inital send to google auth
def google_auth():
    scope = 'openid email https://mail.google.com/'

    redirect_uri = 'http://127.0.0.1:5000/auth/google/callback'
    client_id = CLIENT_ID
    auth_url = ('https://accounts.google.com/o/oauth2/v2/auth'
                f'?response_type=code&client_id={client_id}'
                f'&redirect_uri={redirect_uri}'
                f'&scope={scope}&access_type=offline&prompt=consent')
    return redirect(auth_url)


#this is where google has gotten the user to sign in and thefor we can now extrat the tokens and data
@app.route('/auth/google/callback')
def google_callback():
    code = request.args.get('code')
    if not code:
        print("❌ Google OAuth: No authorization code received")
        return redirect('/?error=auth_failed')

    token_url = 'https://oauth2.googleapis.com/token'
    data = {
        'code': code,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'redirect_uri': 'http://127.0.0.1:5000/auth/google/callback',
        'grant_type': 'authorization_code'
    }

    try:
        token_response = requests.post(token_url, data=data, timeout=10)
        token_data = token_response.json()
    except Exception as e:
        print(f"❌ Google OAuth: Token request failed: {e}")
        return redirect('/?error=token_failed')

    if 'error' in token_data:
        print(f"❌ Google OAuth: Token error: {token_data.get('error_description', 'Unknown error')}")
        return redirect('/?error=token_error')

    access_token = token_data.get('access_token')
    refresh_token = token_data.get('refresh_token')

    if not access_token:
        print("❌ Google OAuth: No access token received")
        return redirect('/?error=no_access_token')

    try:
        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get('https://openidconnect.googleapis.com/v1/userinfo', headers=headers, timeout=10)
        user_info = user_response.json()
    except Exception as e:
        print(f"❌ Google OAuth: User info request failed: {e}")
        return redirect('/?error=userinfo_failed')

    user_email = user_info.get('email')
    user_name = user_info.get('name', '').split(' ', 1)
    first_name = user_name[0] if user_name else ''
    last_name = user_name[1] if len(user_name) > 1 else ''

    if not user_email:
        print("❌ Google OAuth: No email received from Google")
        return redirect('/?error=no_email')

    print(f"🔍 Google OAuth: Processing user {user_email}")

    try:
        success, existing_user = storage.get_user_by_email(user_email)

        if success:
            print(f"👤 Found existing user: {existing_user['email']}")
            update_data = {
                'refresh_token': refresh_token,
                'send_email': user_email,
                'email_provider': 'google',
                'access_token': access_token,
                'expires_at': (datetime.now(timezone.utc) + timedelta(seconds=3600)).isoformat(),
                'id': existing_user['id']
            }

            update_result = storage.update_row_by_primary_key('users', update_data, 'id')
            if not update_result.get('success'):
                print(f"❌ Failed to update existing user: {update_result.get('error')}")
                return redirect('/?error=update_failed')

            session.clear()
            session['user'] = {
                'first_name': existing_user['first_name'],
                'last_name': existing_user['last_name'],
                'email': existing_user['email'],
                'id': existing_user['id']
            }

            print(f"✅ Existing user {existing_user['email']} logged in successfully")
            print(f"📋 Session set: {session.get('user')}")
            return redirect('/dashboard')

        else:
            print(f"👤 Creating new user: {user_email}")
            new_user_data = {
                'first_name': first_name,
                'last_name': last_name,
                'email': user_email,
                'password': '',
                'refresh_token': refresh_token,
                'send_email': user_email,
                'email_provider': 'google',
                'access_token': access_token,
                'expires_at': (datetime.now(timezone.utc) + timedelta(seconds=3600)).isoformat()
            }

            create_result = storage.add('users', new_user_data)
            if not create_result.get('success'):
                print(f"❌ Failed to create new user: {create_result.get('error')}")
                return redirect('/?error=create_failed')

            user_id = create_result.get('id')
            print(f"✅ New user created with ID: {user_id}")

            try:
                Email.confirmationEmail(user_email, first_name)
                print(f"📧 Confirmation email sent to {user_email}")
            except Exception as e:
                print(f"⚠️ Failed to send confirmation email: {e}")

            session.clear()
            session['user'] = {
                'first_name': first_name,
                'last_name': last_name,
                'email': user_email,
                'id': user_id
            }

            print(f"✅ New user {user_email} created and logged in successfully")
            print(f"📋 Session set: {session.get('user')}")
            return redirect('/dashboard#new-user')

    except Exception as e:
        print(f"❌ Google OAuth: Database error: {e}")
        return redirect('/?error=database_error')



@app.route('/disconnect_account', methods=['POST'])
def disconnect_account():
    user_id = session.get('user', {}).get('id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    # Get the user's refresh token from the DB
    success, user = storage.get_user_by_email(session.get('user', {}).get('email'))
    if not success or not user:
        return jsonify({'error': 'User not found'}), 404
    
    refresh_token = user.get('refresh_token')

    # Revoke refresh token if it exists
    if refresh_token:
        if user.get('email_provider') == 'google':
            try:
                revoke_response = requests.post(
                    'https://oauth2.googleapis.com/revoke',
                    params={'token': refresh_token},
                    headers={
                        'content-type': 'application/x-www-form-urlencoded'
                    })
                print('Google token revoke status:',
                      revoke_response.status_code)
            except Exception as e:
                print('Error revoking Google refresh token:', e)

    # Clear OAuth data from DB
    update_data = {
        'refresh_token': None,
        'send_email': None,
        'email_provider': None,
        'access_token': None,
        'expires_at': None,
        'id': user_id
    }

    try:
        res = storage.update_row_by_primary_key('users', update_data, 'id')
        return jsonify({
            'success': True,
            'message': 'Disconnected successfully.'
        })
    except Exception as e:
        print('Error disconnecting account:', e)
        return jsonify({
            'success': False,
            'error': 'Failed to disconnect account'
        })


STRIPE_PUBLISHABLE_KEY = "pk_live_51R9hrqAGOU4usCEpsYRUz6KpAz|5AWPqdbvOKnnBBGZ1puSeDZlj1qvOrBFCUXdSujM1t@2EUHrXWRcY3HFSU005gUgf3M79"


@app.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():
    data = request.get_json()
    user_id = session.get('user', {}).get('id')

    if not user_id:
        return jsonify(error="User not authenticated"), 401

    try:
        # Map price IDs to plan names
        price_to_plan = {
            'price_1Rm64rIPmpPcLP6DYH3FZ0yr': 'pro',
            'price_1RmCvzIPmpPcLP6D0PcDSfqt': 'premium'
        }

        plan_name = price_to_plan.get(data["priceId"], 'unknown')

        checkout_session = stripe.checkout.Session.create(
            success_url=
            "http://127.0.0.1:5000/api/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url="http://127.0.0.1:5000/api/cancel",
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{
                "price": data["priceId"],
                "quantity": 1,
            }],
            metadata={
                "user_id": str(user_id),
                "plan": plan_name
            },
            customer_email=session.get('user', {}).get('email'))
        return jsonify({"url": checkout_session.url})
    except Exception as e:
        print(f"Stripe Error: {e}")
        return jsonify(error=str(e)), 400


@app.route("/api/success")
def success():
    session_id = request.args.get('session_id')

    if not session_id:
        return redirect('/dashboard#settings?error=no_session')

    try:
        # Retrieve the session from Stripe
        checkout_session = stripe.checkout.Session.retrieve(session_id, expand=['subscription'])

        if checkout_session.payment_status == 'paid':
            user_id = checkout_session.metadata.get('user_id')
            plan = checkout_session.metadata.get('plan')

            if user_id and plan:
                # Update user subscription in database
                update_data = {
                    'subscription': plan,
                    'stripe_customer_id': checkout_session.customer,
                    'stripe_subscription_id': checkout_session.subscription.get('id'),
                    'id': int(user_id)
                }

                res = storage.update_row_by_primary_key(
                    'users', update_data, 'id')

                if res.get('success'):
                    return redirect(
                        '/dashboard#settings?success=subscription_updated')
                else:
                    print(f"Database update failed: {res}")
                    return redirect(
                        '/dashboard#settings?error=db_update_failed')
            else:
                return redirect('/dashboard#settings?error=missing_metadata')
        else:
            return redirect('/dashboard#settings?error=payment_not_completed')

    except Exception as e:
        print(f"Error processing success: {e}")
        return redirect('/dashboard#settings?error=processing_failed')


@app.route("/api/cancel")
def cancel():
    return redirect('/dashboard#settings?cancelled=true')


@app.route('/create-customer-portal-session', methods=['POST'])
def create_customer_portal_session():
    user_id = session.get('user', {}).get('id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        # Get user from database
        success, user = storage.get_user_by_email(session.get('user', {}).get('email'))
        if not success or not user:
            return jsonify({'error': 'User not found'}), 404

        customer_id = user.get('stripe_customer_id')
        if not customer_id:
            return jsonify({'error': 'No Stripe customer found'}), 404

        # Create customer portal session
        portal_session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=request.url_root + 'dashboard#settings'
        )

        return jsonify({'url': portal_session.url})

    except stripe.error.StripeError as e:
        print(f"Stripe error creating portal session: {e}")
        return jsonify({'error': 'Failed to create portal session'}), 500
    except Exception as e:
        print(f"Error creating portal session: {e}")
        return jsonify({'error': 'An error occurred'}), 500

@app.route('/get-subscription-status', methods=['GET'])
def get_subscription_status():
    user_id = session.get('user', {}).get('id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        success, user = storage.get_user_by_email(
            session.get('user', {}).get('email'))
        if not success or not user:
            return jsonify({'error': 'User not found'}), 404

        subscription_id = user.get('stripe_subscription_id')
        customer_id = user.get('stripe_customer_id')

        if not subscription_id:
            return jsonify({
                'subscription': user.get('subscription', 'none'),
                'status': 'inactive',
                'has_customer': bool(customer_id)
            })

        # Retrieve the subscription from Stripe
        subscription = stripe.Subscription.retrieve(subscription_id)

        # Safely access StripeObject attributes using getattr()
        return jsonify({
            'subscription': user.get('subscription', 'none'),
            'status': getattr(subscription, 'status', 'unknown'),
            'cancel_at_period_end': getattr(subscription, 'cancel_at_period_end', False),
            'current_period_end': getattr(subscription, 'current_period_end', None),
            'cancel_at': getattr(subscription, 'cancel_at', None),
            'has_customer': bool(customer_id)
        })

    except stripe.error.StripeError as e:
        print(f"Stripe error getting subscription: {e}")
        return jsonify({'error': 'Failed to get subscription status'}), 500
    except Exception as e:
        print(f"Error getting subscription status: {e}")
        return jsonify({'error': 'An error occurred'}), 500




#start the app
#The scheduler is integrated into the Flask app using a background thread, ensuring that scheduling tasks do not block the main server process.
if __name__ == '__main__':
    # Start scheduler in background thread
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()

    app.run(debug=True, use_reloader=False, host='0.0.0.0', port=5000)