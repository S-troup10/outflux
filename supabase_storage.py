
from supabase import create_client, Client
from datetime import datetime, timezone
# Replace with your real values
SUPABASE_URL = "https://ksqoiphgapivpmijmvjh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzcW9pcGhnYXBpdnBtaWptdmpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTcyMjA0OCwiZXhwIjoyMDYxMjk4MDQ4fQ.EQOS8--wmkSw78ushX4x3H99dRtY3XWAWAcOSTk2Naw"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)





def add(table, data):
    try:
        response = supabase.table(table).insert(data).execute()
        inserted_id = response.data[0]['id'] if response.data else None
        return {'success': True, 'id': inserted_id}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def delete_multiple(table, id_list):
    """
    Deletes multiple rows by ID from a Supabase table.

    Args:
        table (str): Table name.
        id_list (list): List of record IDs to delete.

    Returns:
        dict: Success or error message.
    """
    try:
        response = supabase.table(table).delete().in_("id", id_list).execute()
        return {'success': True, 'response': response}
    except Exception as e:
        return {'success': False, 'error': str(e)}



def delete(table, record_id):
    """
    Deletes a row from the specified Supabase table by ID.

    Args:
        table (str): Table name.
        record_id (int or str): ID of the record to delete.

    Returns:
        dict: Success or error message.
    """
    try:
        response = supabase.table(table).delete().eq("id", record_id).execute()

        # If the data is empty, the record may not exist
        if not response.data:
            return {'success': False, 'error': 'Record not found'}

        return {'success': True}

    except Exception as e:
        print(f"Delete error on table '{table}': {e}")
        return {'error': str(e), 'success': False}




def bulk_update(table: str, rows: list[dict], primary_key: str):
    """
    Update many rows in `table` in one request.

    Args:
        table       (str)          : table name
        rows        (list[dict])   : list of row dictionaries (must all include primary_key)
        primary_key (str)          : name of the primary‑key column

    Returns:
        dict with:
            success (bool)
            updated (int)  – how many rows Supabase reports as updated
            skipped (int)  – rows skipped because they lacked the PK
            error   (str | None)
            data    (list | None) – rows returned from Supabase on success
    """
    try:
        if not rows:
            return {"success": False, "error": "No rows provided.", "updated": 0, "skipped": 0}

        # Split into valid / invalid rows
        valid_rows   = [r for r in rows if primary_key in r]
        skipped_rows = len(rows) - len(valid_rows)

        if not valid_rows:
            return {"success": False, "error": f"No rows contained primary key '{primary_key}'.",
                    "updated": 0, "skipped": skipped_rows}

        # 1‑call bulk upsert (update existing, ignore non‑matches)
        response = (
            supabase
            .table(table)
            .upsert(valid_rows, on_conflict=primary_key, ignore_duplicates=False)
            .execute()
        )

        # Supabase returns updated rows in .data
        updated_rows = len(response.data) if response.data else 0

        if response.error:
            return {"success": False, "error": str(response.error),
                    "updated": updated_rows, "skipped": skipped_rows}

        return {
            "success": True,
            "updated": updated_rows,
            "skipped": skipped_rows,
            "data":   response.data
        }

    except Exception as e:
        return {"success": False, "error": str(e), "updated": 0, "skipped": len(rows)}

    
    
from itertools import islice

def flag_emails(
    table: str,
    emails: list[str],
    flagged: bool = True,
    chunk_size: int = 500
) -> dict:
    """
    Bulk‑update the `flagged` column for every record whose `email`
    appears in the supplied list.

    Args:
        table (str)        : table name
        emails (list[str]) : list of email strings
        flagged (bool)     : True  → set flagged=TRUE
                             False → set flagged=FALSE  (default True)
        chunk_size (int)   : # of emails per 'IN' chunk (Supabase limit ≈ 1000)

    Returns:
        dict -> {
            success : bool,
            updated : int   # rows Supabase reports updated
            error   : str | None
        }
    """
    try:
        if not emails:
            return {"success": False, "updated": 0, "error": "No emails supplied."}

        total_updated = 0

        def chunks(lst, n):
            "Yield successive n‑sized chunks"
            it = iter(lst)
            while True:
                chunk = list(islice(it, n))
                if not chunk:
                    break
                yield chunk

        for batch in chunks(emails, chunk_size):
            resp = (
                supabase
                .table(table)
                .update({"flagged": flagged})
                .in_("email", batch)
                .execute()
            )

            if resp.error:
                return {"success": False, "updated": total_updated, "error": str(resp.error)}

            # Supabase v2 client returns updated rows in resp.data
            total_updated += len(resp.data or [])

        return {"success": True, "updated": total_updated, "error": None}

    except Exception as exc:
        return {"success": False, "updated": 0, "error": str(exc)}


def fetch(table, filters=None, multi_filters=None, gte_filters=None):
    try:
        query = supabase.table(table).select('*')

        if filters:
            for key, value in filters.items():
                query = query.eq(key, value)
        
        if multi_filters:
            for key, value_list in multi_filters.items():
                query = query.in_(key, value_list)
        
        if gte_filters:
            for key, value in gte_filters.items():
                query = query.gte(key, value)
        
        response = query.execute()
        return response.data

    except Exception as e:
        print('Error in fetch:', e)
        return None






        
            
            



def update_row_by_primary_key(table, data, primary_key):
    """
    Update one row in the table where primary_key = data[primary_key].

    Args:
        table (str): Table name
        data (dict): Fields to update (must include the primary key)
        primary_key (str): The name of the primary key column

    Returns:
        dict: Success status or error message
    """
    try:
        if primary_key not in data:
            raise ValueError(f"Missing primary key '{primary_key}' in data.")

        record = data.copy()
        key_value = record.pop(primary_key)

        response = supabase.table(table).update(record).eq(primary_key, key_value).execute()

        # Check if update affected any records
        if not response.data:
            return {'error': 'Record not found or nothing updated.', 'success': False}

        return {'success': True, 'data': response.data}

    except Exception as e:
        return {'error': str(e), 'success': False}





def bulk_update_by_field(table, filter_field, filter_values, update_data):
    """
    Perform a bulk update on a table where filter_field is in filter_values.

    Args:
        table (str): Table name.
        filter_field (str): Column to filter by (e.g., 'campaign_id').
        filter_values (list): List of values to match.
        update_data (dict): Fields and values to update.

    Returns:
        dict: Success status and response data or error message.
    """
    try:
        response = (
            supabase
            .table(table)
            .update(update_data)
            .in_(filter_field, filter_values)
            .execute()
        )

        return {'success': True, 'data': response.data}

    except Exception as e:
        return {'success': False, 'error': str(e)}

    
def upsert(table: str, data):
    """
    Performs a bulk upsert into the specified table using Supabase.

    Args:
        table (str): Table name as a string.
        data (List[Dict]): List of dictionaries representing rows to insert/update.

    Returns:
        dict: { success: bool, data: list (on success), error: str (on failure) }
    """
    try:
        if not data:
            raise ValueError("Data list is empty")

        response = supabase.table(table).upsert(data).execute()
        print('supabase response : ', response)
        # If response.data is None or empty, treat as failure
        if response:
            return {'success': True, 'data': response.data}
            
        return {'error': 'No data returned from upsert', 'success': False}


    except Exception as e:
        return {'error': str(e), 'success': False}

    

# Initialize the database

def get_user_by_email(email):
    try:
        response = supabase.table("users").select("*").eq("email", email).limit(1).execute()
        print('server response', response)


        if not response.data:
            return False, "No user found with that email"

        return True, response.data[0]

    except Exception as e:
        return False, f"Exception occurred: {e}"






def validate(email, password):
    
    


    if not email or not password:
        return False, 'Email or password not received'

    success, user_or_error = get_user_by_email(email)

    if not success:
        return False, user_or_error# user_or_error is the error string

    user = user_or_error

    if user.get('password') == password:
        user.pop('password', None)
        return True, user
    else:
        return False, 'Credentials invalid'



def query_for_times(up_to: datetime):
    try:
        # Perform the query: get all "pending" entries scheduled up to this time
        response = supabase.table("schedule")\
            .select("*")\
            .lte("scheduled_time", up_to.isoformat())\
            .eq("status", False)\
            .execute()

        if not response.data:
            print(f"[{up_to}] No pending schedules found up to this point.")
            return []

        print(f"[{up_to}] Found {len(response.data)} pending schedule(s).")
        return response.data

    except Exception as e:
        print(f"Error querying schedule table at {up_to}: {e}")
        return []




def log_email_event(events=None, *, list_id=None, campaign_id=None, event_type=None, provider_id=None, meta=None, user_id = None):
    """
    Logs email events to Supabase.

    - If `events` is provided as a list of event dicts, performs batch insert.
    - Otherwise, logs a single event using the other keyword arguments.
    """
    if isinstance(events, list):
        now = datetime.now(timezone.utc).isoformat()
        for event in events:
            event.setdefault("event_time", now)
            event.setdefault("campaign_id", None)
            event.setdefault("list_id", None)
            event.setdefault("event_type", None)
            event.setdefault("provider_id", None)
            event.setdefault("meta", {})
            event.setdefault("user_id", None)
        supabase.table("email_events").insert(events).execute()
    else:
        event = {
            "campaign_id": campaign_id,
            "list_id": list_id,
            "event_type": event_type,
            "provider_id": provider_id,
            "meta": meta or {},
            "event_time": datetime.now(timezone.utc).isoformat(), 
            "user_id": user_id
        }
        supabase.table("email_events").insert(event).execute()


    
    
def get_list_ids_by_email(email):
    resp = supabase.table('list_emails').select('list_id').eq('email', email).execute()
    records = resp.data
    if not records:
        return []
    # Extract all list_ids, remove duplicates just in case
    list_ids = list({record['list_id'] for record in records})
    return list_ids

