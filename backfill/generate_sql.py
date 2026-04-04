import csv, sys
csv.field_size_limit(sys.maxsize)

def esc(v):
    if v is None or v == '':
        return 'NULL'
    return "'" + str(v).replace("'", "''") + "'"

def read_csv(path):
    with open(path, newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f, delimiter=';'))

# --- profiles ---
rows = read_csv('backfill/profiles-export-2026-04-04_13-21-20.csv')
vals = []
for r in rows:
    vals.append(f"({esc(r['id'])},{esc(r['full_name'])},{esc(r['email'])},{esc(r.get('avatar_url'))},{esc(r.get('role'))},{esc(r['created_at'])})")
sql = "INSERT INTO public.profiles (id,full_name,email,avatar_url,role,created_at) VALUES\n" + ",\n".join(vals) + "\nON CONFLICT (id) DO NOTHING;"
with open('backfill/insert_profiles.sql', 'w') as f:
    f.write(sql)
print(f"profiles: {len(rows)} rows")

# --- chat_sessions ---
rows = read_csv('backfill/chat_sessions-export-2026-04-04_13-21-03.csv')
vals = []
for r in rows:
    vals.append(f"({esc(r['id'])},{esc(r['user_id'])},{esc(r['title'])},{esc(r.get('status', 'active'))},{esc(r['created_at'])},{esc(r['updated_at'])})")
sql = "INSERT INTO public.chat_sessions (id,user_id,title,status,created_at,updated_at) VALUES\n" + ",\n".join(vals) + "\nON CONFLICT (id) DO NOTHING;"
with open('backfill/insert_chat_sessions.sql', 'w') as f:
    f.write(sql)
print(f"chat_sessions: {len(rows)} rows")

# --- daily_usage ---
rows = read_csv('backfill/daily_usage-export-2026-04-04_13-21-11.csv')
vals = []
for r in rows:
    vals.append(f"({esc(r['user_id'])},{esc(r['usage_date'])},{r['characters_used']})")
sql = "INSERT INTO public.daily_usage (user_id,usage_date,characters_used) VALUES\n" + ",\n".join(vals) + "\nON CONFLICT (user_id,usage_date) DO NOTHING;"
with open('backfill/insert_daily_usage.sql', 'w') as f:
    f.write(sql)
print(f"daily_usage: {len(rows)} rows")

# --- chat_messages (batches of 100) ---
rows = read_csv('backfill/chat_messages-export-2026-04-04_13-20-52.csv')
batch_size = 100
batches = [rows[i:i+batch_size] for i in range(0, len(rows), batch_size)]
for bi, batch in enumerate(batches):
    vals = []
    for r in batch:
        vals.append(f"({esc(r['id'])},{esc(r['session_id'])},{esc(r['user_id'])},{esc(r['role'])},{esc(r['content'])},{esc(r.get('feedback'))},{esc(r.get('feedback_note'))},{esc(r['created_at'])})")
    sql = "INSERT INTO public.chat_messages (id,session_id,user_id,role,content,feedback,feedback_note,created_at) VALUES\n" + ",\n".join(vals) + "\nON CONFLICT (id) DO NOTHING;"
    with open(f'backfill/insert_chat_messages_{bi}.sql', 'w') as f:
        f.write(sql)
print(f"chat_messages: {len(rows)} rows in {len(batches)} batches")

# --- agent_sql_runs (batches of 5 due to large JSON content) ---
rows = read_csv('backfill/agent_sql_runs-export-2026-04-04_13-18-01.csv')
batch_size = 5
batches = [rows[i:i+batch_size] for i in range(0, len(rows), batch_size)]
for bi, batch in enumerate(batches):
    vals = []
    for r in batch:
        vals.append(f"({esc(r['id'])},{esc(r['message_id'])},{esc(r['executed_sql'])},{esc(r['bq_result'])},{esc(r['created_at'])})")
    sql = "INSERT INTO public.agent_sql_runs (id,message_id,executed_sql,bq_result,created_at) VALUES\n" + ",\n".join(vals) + "\nON CONFLICT (id) DO NOTHING;"
    with open(f'backfill/insert_agent_sql_runs_{bi}.sql', 'w') as f:
        f.write(sql)
print(f"agent_sql_runs: {len(rows)} rows in {len(batches)} batches")
print("All SQL files generated.")
