"""
Runs all remaining SQL batch files into the mirror Supabase project
via the RPC exec_sql function using the service role key.
"""
import os, sys, glob, json, ssl
from urllib.request import urlopen, Request
from urllib.error import HTTPError

# macOS system Python often lacks certs; bypass SSL verification for localhost-equivalent Supabase
_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE

MIRROR_URL = "https://optizplehhuyixiuycxt.supabase.co"
SERVICE_KEY = "sb_secret_YXYMcTDmWD7-Awl5AO8MLQ_0YsATOqw"

def run_sql(sql: str, label: str):
    url = f"{MIRROR_URL}/rest/v1/rpc/exec_sql"
    body = json.dumps({"sql": sql}).encode("utf-8")
    req = Request(url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("apikey", SERVICE_KEY)
    req.add_header("Authorization", f"Bearer {SERVICE_KEY}")
    try:
        with urlopen(req, timeout=120, context=_ssl_ctx) as resp:
            print(f"OK {label} ({resp.status})")
    except HTTPError as e:
        body = e.read().decode()
        print(f"ERROR {label}: {e.code} {body[:300]}")

base = os.path.dirname(os.path.abspath(__file__))

# chat_messages batches 1-5 (batch 0 already done via MCP)
msg_files = sorted(glob.glob(os.path.join(base, "insert_chat_messages_[1-9].sql")))
# agent_sql_runs batches 0-14
run_files = sorted(glob.glob(os.path.join(base, "insert_agent_sql_runs_*.sql")))

all_files = msg_files + run_files
print(f"Running {len(all_files)} batch files...")

for f in all_files:
    label = os.path.basename(f)
    with open(f, encoding="utf-8") as fh:
        sql = fh.read()
    run_sql(sql, label)

print("Done.")
