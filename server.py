from flask import Flask, request, jsonify, render_template, session, redirect, abort

import gunicorn
import supabase_storage as storage
import send_email as Email
import requests
import bcrypt
from collections import Counter, defaultdict 
from datetime import datetime, timedelta, timezone

import stripe

STRIPE_SECRET_KEY = "sk_test_51Rm636IPmpPcLP6Dj5kZfuuw5MZs0cdxeNpS0NT3kRqh6rXOkos4L0LzUCVZGxOVWsrVn3lruniiv5nMiOWtKJoF00oTnz2rPY"
stripe.api_key = STRIPE_SECRET_KEY


app = Flask(__name__)
  # Enables CORS for all routes
app.secret_key = 'super_secret_key_123456'

@app.route('/dashboard')
def dashboard():
    if 'user' in session:
        print("User accessing dashboard:", session.get('user'))
        return render_template('dashboard.html')
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
    hashed_password = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt())
    #replace with the hashed password (decode to a string)
    data['password'] = hashed_password.decode('utf-8')
    #add the data back
    res = storage.add('users', data)
    if res.get('success') == False:
        #handle invaliod sign up
        print(res)
        return jsonify({'message': 'customer was unable to be ad', 'success': False}), 200
        
        
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
    return jsonify({'message': 'Sign-up successful',  'success': True, 'redirect': '/dashboard'}), 200



@app.route('/logout',  methods=['POST'])
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

    response , user = storage.get_user_by_email(email)
    if not response:
        return jsonify({'error': 'User not found'}), 404
    print(user)
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
    if not success or not user:
        return jsonify(success=False, message="Invalid email or password")

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
    res = storage.update_row_by_primary_key(
        data.get('table'), data.get('data'), data.get('primary_key')
    )
    if res.get('success'):
        return jsonify(success=True, message="Data saved successfully", response=res)
    else:
        return jsonify(success=False, message="An error occurred while saving data", error=res.get('error'))

    

@app.route('/add', methods=['POST'])
def add():
    data = request.json
    # { table: _____  , data : _______  }
    res = storage.add(data.get('table'), data.get('data'))
    # retun { res : ____ , success : ____}
   
    if res.get('success') == True:
        return jsonify(success=True, message="data saved sucsessfully" , response=res, identification=res.get('id')), 200
    else:
        
        return jsonify(success=False, message="an error occured in saving the data", error=res.get('error'))



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
            return jsonify(success=False, error="Insert failed: " + res_insert.get('error', ''))

    # Handle updates
    for item in updates:
        res_update = storage.update_row_by_primary_key('schedule', item, 'id')
        if not res_update.get('success'):
            return jsonify(success=False, error="Update failed: " + res_update.get('error', ''))

    # Handle deletes (bulk)
    if deletes:
        res_delete = storage.delete_multiple('schedule', deletes)
        if not res_delete.get('success'):
            return jsonify(success=False, error="Delete failed: " + res_delete.get('error', ''))
        
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
            return jsonify(success=True, message="added successfully", campaign_id=res.get('id'))
        else:
            return jsonify(success=False, message="insert failed", error=res)

    except KeyError as e:
        print(e)
        return jsonify(success=False, message=f'Missing required key: {str(e)}')
    except Exception as e:
        print(e)
        return jsonify(success=False, message=f'An unexpected error occurred: {str(e)}')

    


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
        if temp_id : 
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
        res = storage.update_row_by_primary_key('list_emails',  record,  'id')
        if not res.get('success'):
            success = False
            errors.append(f"Update failed for ID {record['id']}: {res.get('error')}")

    # Delete records by ID
    for record_id in to_delete:
        res = storage.delete('list_emails', record_id)
        if not res.get('success'):
            success = False
            errors.append(f"Delete failed for ID {record_id}: {res.get('error')}")
            
    #update count 

    res = storage.update_row_by_primary_key('lists', {'count': count, 'id':list_id}, 'id')
    
    

    if success:
        return jsonify({"status": "success", "message": "Changes saved successfully.", 'new_id_map':new_id_map}), 200
    else:
        return jsonify({"status": "partial", "message": "Some operations failed.", "errors": errors}), 207


    
    

    
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
    lists = storage.fetch('lists',      {'user_id': user_id}) or []
    campaigns = storage.fetch('campaigns', {'user_id': user_id}) or []

    all_schedule: list[dict] = []          # flat list of *every* schedule row

    three_weeks_ago = (datetime.now(timezone.utc) - timedelta(weeks=3)).isoformat()
    
    for camp in campaigns:
        # grab every schedule row for this campaign, whatever its status
        rows = storage.fetch("schedule", 
                             {"campaign_id": camp["id"]},
                             gte_filters  = {"scheduled_time": three_weeks_ago}
                             ) or []

        # 1) accumulate ALL rows across all campaigns  →  all_schedule
        all_schedule.extend(rows) 

        # 2) keep only the *upcoming* rows on the campaign object itself
        camp["schedule"] = [r for r in rows if r.get("status") is False]

        

    
    #for each schedule remove the ones with status = FALSE

    
    
    
    
    
    # Handy lookup for campaign names
    campaign_lookup = {c['id']: c.get('name', f"Campaign {c['id']}") for c in campaigns}

    # ─── 3. Fetch last‑14‑days events --------------------------
    now           = datetime.now(timezone.utc)
    one_week_ago  = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)

    events = storage.fetch(
        'email_events',
        filters     = {'user_id': user_id},
        gte_filters = {'event_time': two_weeks_ago.isoformat()}
    ) or []

    sent_list        = []
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
        (this_week_events if week_bucket == "this_week" else last_week_events).append(ev)

        # Track sent events for your existing /sent graph
        if ev['event_type'] == 'sent':
            sent_list.append(ev)

        # Per‑campaign buckets
        camp_id = ev.get('campaign_id')
        if camp_id is not None:
            campaign_buckets[camp_id][week_bucket].append(ev)

    # ─── 5. Helper to compute stats ----------------------------
    def compute_stats(bucket):
        counter       = Counter(e['event_type'] for e in bucket)
        sent_rows     = counter.get('sent',   0)
        failed_rows   = counter.get('failed', 0)

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

        failed_meta = [
            {
                **ev.get('meta', {}),
                "list_id":    ev.get('list_id'),
                "event_id":   ev['id'],
                "event_time": ev['event_time']
            }
            for ev in bucket
            if ev['event_type'] == 'failed'
               and ev.get('meta', {}).get('reason')
               and ev.get('list_id') is not None
        ]

        return {
            "total_emails_sent": sent_rows,
            "total_recipients":  total_recipients,
            "total_failed":      failed_rows,
            "failed_events":     failed_meta
        }

    # ─── 6. Per‑campaign stats ---------------------------------
    campaign_stats = {}
    for camp_id, buckets in campaign_buckets.items():
        campaign_stats[camp_id] = {
            "name":       campaign_lookup.get(camp_id, f"Campaign {camp_id}"),
            "this_week":  compute_stats(buckets["this_week"]),
            "last_week":  compute_stats(buckets["last_week"])
        }


    # ─── 7. Global stats & payload -----------------------------
    stats = {
        "this_week": compute_stats(this_week_events),
        "last_week": compute_stats(last_week_events),
        "sent":      sent_list,
        "campaigns": campaign_stats,
        "schedule": all_schedule,
    }

    return jsonify(
        success   = True,
        lists     = lists,
        campaigns = campaigns,
        stats     = stats
    )




CLIENT_ID = '671187242058-mernc7k7i178t0u819hs63ckkbt8q4fp.apps.googleusercontent.com'
CLIENT_SECRET = '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'



############GOOGLE STUFF
@app.route('/auth/google')
#inital send to google auth 
def google_auth():
    scope = 'openid email https://mail.google.com/'

    redirect_uri = 'http://127.0.0.1:5000/auth/google/callback'
    client_id = CLIENT_ID
    auth_url = (
        'https://accounts.google.com/o/oauth2/v2/auth'
        f'?response_type=code&client_id={client_id}'
        f'&redirect_uri={redirect_uri}'
        f'&scope={scope}&access_type=offline&prompt=consent'
    )
    return redirect(auth_url)

#this is where google has gotten the user to sign in and thefor we can now extrat the tokens and data
@app.route('/auth/google/callback')
def google_callback():
    code = request.args.get('code')
    if not code:
        return 'Authorization failed.'

    token_url = 'https://oauth2.googleapis.com/token'
    data = {
        'code': code,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'redirect_uri': 'http://127.0.0.1:5000/auth/google/callback',
        'grant_type': 'authorization_code'
    }
    token_response = requests.post(token_url, data=data).json()

    if 'error' in token_response:
        return f"Token error: {token_response['error_description']}"

    access_token = token_response.get('access_token')
    refresh_token = token_response.get('refresh_token')

    if not access_token:
        return 'Failed to obtain access token.'

    headers = {'Authorization': f'Bearer {access_token}'}
    user_info = requests.get('https://openidconnect.googleapis.com/v1/userinfo', headers=headers).json()

    user_email = user_info.get('email')
    if not user_email:
        return 'Failed to get user email.'

    # Save refresh token and email to DB
    user_id = session.get('user', {}).get('id')
    if user_id:
        update_data = {
            'refresh_token': refresh_token,
            'send_email': user_email,
            'email_provider': 'google',
            'id': user_id
        }
        res = storage.update_row_by_primary_key('users', update_data, 'id')
        print(res)

    return redirect('/dashboard#settings')





@app.route('/disconnect_account', methods=['POST'])
def disconnect_account():
    user_id = session.get('user', {}).get('id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    # Get the user's refresh token from the DB
    user = session.get('user')
    refresh_token = user.get('refresh_token')

    # Revoke refresh token if it exists
    if refresh_token:
        
        if user.get('email_provider') == 'google':
            try:
                revoke_response = requests.post(
                    'https://oauth2.googleapis.com/revoke',
                    params={'token': refresh_token},
                    headers={'content-type': 'application/x-www-form-urlencoded'}
                )
                print('Google token revoke status:', revoke_response.status_code)
            except Exception as e:
                print('Error revoking Google refresh token:', e)



    # Clear OAuth data from DB
    update_data = {
        'refresh_token': None,
        'send_email': None,
        'email_provider': None,
        'id': user_id
    }

    try:
        res = storage.update_row_by_primary_key('users', update_data, 'id')
        return jsonify({'success': True, 'message': 'Disconnected successfully.'})
    except Exception as e:
        print('Error disconnecting account:', e)
        return jsonify({'success': False,  'error': 'Failed to disconnect account'})



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
            success_url="http://127.0.0.1:5000/api/success?session_id={CHECKOUT_SESSION_ID}",
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
            customer_email=session.get('user', {}).get('email')
        )
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
        checkout_session = stripe.checkout.Session.retrieve(session_id)

        if checkout_session.payment_status == 'paid':
            user_id = checkout_session.metadata.get('user_id')
            plan = checkout_session.metadata.get('plan')

            if user_id and plan:
                # Update user subscription in database
                update_data = {
                    'subscription': plan,
                    'stripe_customer_id': checkout_session.customer,
                    'stripe_subscription_id': checkout_session.subscription,
                    'id': int(user_id)
                }

                res = storage.update_row_by_primary_key('users', update_data, 'id')

                if res.get('success'):
                    return redirect('/dashboard#settings?success=subscription_updated')
                else:
                    print(f"Database update failed: {res}")
                    return redirect('/dashboard#settings?error=db_update_failed')
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

@app.route("/webhook", methods=["POST"])
def stripe_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')

    # You'll need to set this in your Stripe dashboard webhook settings
    endpoint_secret = "whsec_cHnBQVn1k7VXzZxtnOVIF9hZ5lTnwaVX"  # Replace with actual secret

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        print(f"Invalid payload: {e}")
        return jsonify(error="Invalid payload"), 400
    except stripe.error.SignatureVerificationError as e:
        print(f"Invalid signature: {e}")
        return jsonify(error="Invalid signature"), 400

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_checkout_session_completed(session)

    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        handle_subscription_updated(subscription)

    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        handle_subscription_cancelled(subscription)

    elif event['type'] == 'invoice.payment_failed':
        invoice = event['data']['object']
        handle_payment_failed(invoice)

    return jsonify(success=True)

def handle_checkout_session_completed(session):
    """Handle successful checkout completion"""
    user_id = session['metadata'].get('user_id')
    plan = session['metadata'].get('plan')

    if user_id and plan:
        update_data = {
            'subscription': plan,
            'stripe_customer_id': session['customer'],
            'stripe_subscription_id': session['subscription'],
            'id': int(user_id)
        }

        result = storage.update_row_by_primary_key('users', update_data, 'id')
        print(f"Subscription updated for user {user_id}: {result}")

def handle_subscription_updated(subscription):
    """Handle subscription updates (plan changes, etc.)"""
    customer_id = subscription['customer']

    # Find user by stripe customer ID
    users = storage.fetch('users', {'stripe_customer_id': customer_id})

    if users and len(users) > 0:
        user = users[0]

        # Determine plan based on subscription status and price
        if subscription['status'] == 'active':
            # You might need to map price IDs to plan names here
            plan = 'pro'  # Default, or determine from subscription items
            for item in subscription['items']['data']:
                if item['price']['id'] == 'price_1RmCvzIPmpPcLP6D0PcDSfqt':
                    plan = 'premium'
                elif item['price']['id'] == 'price_1Rm64rIPmpPcLP6DYH3FZ0yr':
                    plan = 'pro'
        else:
            plan = 'none'

        update_data = {
            'subscription': plan,
            'stripe_subscription_id': subscription['id'],
            'id': user['id']
        }

        result = storage.update_row_by_primary_key('users', update_data, 'id')
        print(f"Subscription status updated for user {user['id']}: {result}")

def handle_subscription_cancelled(subscription):
    """Handle subscription cancellation"""
    customer_id = subscription['customer']

    # Find user by stripe customer ID
    users = storage.fetch('users', {'stripe_customer_id': customer_id})

    if users and len(users) > 0:
        user = users[0]

        update_data = {
            'subscription': 'none',
            'stripe_subscription_id': None,
            'id': user['id']
        }

        result = storage.update_row_by_primary_key('users', update_data, 'id')
        print(f"Subscription cancelled for user {user['id']}: {result}")

def handle_payment_failed(invoice):
    """Handle failed payment"""
    customer_id = invoice['customer']

    # Find user by stripe customer ID
    users = storage.fetch('users', {'stripe_customer_id': customer_id})

    if users and len(users) > 0:
        user = users[0]
        print(f"Payment failed for user {user['id']}, customer {customer_id}")
        # You might want to send an email notification here
        # Email.payment_failed_notification(user['email'], user['first_name'])

@app.route('/cancel-subscription', methods=['POST'])
def cancel_subscription():
    user_id = session.get('user', {}).get('id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        # Get user's subscription ID
        success, user = storage.get_user_by_email(session.get('user', {}).get('email'))
        if not success or not user:
            return jsonify({'error': 'User not found'}), 404

        subscription_id = user.get('stripe_subscription_id')
        if not subscription_id:
            return jsonify({'error': 'No active subscription found'}), 400

        # Cancel the subscription in Stripe
        subscription = stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True
        )

        return jsonify({
            'success': True, 
            'message': 'Subscription will be cancelled at the end of the billing period',
            'cancel_at': subscription.cancel_at
        })

    except stripe.error.StripeError as e:
        print(f"Stripe error cancelling subscription: {e}")
        return jsonify({'error': 'Failed to cancel subscription'}), 500
    except Exception as e:
        print(f"Error cancelling subscription: {e}")
        return jsonify({'error': 'An error occurred'}), 500

@app.route('/get-subscription-status', methods=['GET'])
def get_subscription_status():
    user_id = session.get('user', {}).get('id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        success, user = storage.get_user_by_email(session.get('user', {}).get('email'))
        if not success or not user:
            return jsonify({'error': 'User not found'}), 404

        subscription_id = user.get('stripe_subscription_id')
        if not subscription_id:
            return jsonify({
                'subscription': 'none',
                'status': 'inactive'
            })

        # Get subscription details from Stripe
        subscription = stripe.Subscription.retrieve(subscription_id)

        return jsonify({
            'subscription': user.get('subscription', 'none'),
            'status': subscription.status,
            'cancel_at_period_end': subscription.cancel_at_period_end,
            'current_period_end': subscription.current_period_end,
            'cancel_at': subscription.cancel_at
        })

    except stripe.error.StripeError as e:
        print(f"Stripe error getting subscription: {e}")
        return jsonify({'error': 'Failed to get subscription status'}), 500
    except Exception as e:
        print(f"Error getting subscription status: {e}")
        return jsonify({'error': 'An error occurred'}), 500

#start the app

if __name__ == '__main__':
    app.run(debug=True)