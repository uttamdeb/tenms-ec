"""
Imports all remaining backfill SQL batches into the mirror Supabase project
using the Supabase REST API (pg endpoint via supabase-py).
Run from project root: python3 backfill/import_all.py
"""
import os, sys, glob, json, urllib.request, urllib.error

MIRROR_URL = "https://optizplehhuyixiuycxt.supabase.co"
# Using the service-role / secret key so we bypass RLS
MIRROR_KEY = "sb_secret_YXYMcTDmWD7-Awl5AO8MLQ_0YsATOqw"

def run_sql(sql: str, label: str):
    url = f"{MIRROR_URL}/rest/v1/rpc/exec_sql"
    # Supabase doesn't expose a raw SQL REST endpoint by default.
    # We'll POST to the pg gateway via the postgres REST interface.
    # Actually, use the Supabase Management API style:
    # POST /rest/v1/ with query via the supabase-js compatible approach.
    # The simplest way is using the Supabase SQL query endpoint (requires service role).
    # Supabase exposes: POST https://<project>.supabase.co/rest/v1/ — NOT for raw SQL.
    # Instead use the Database API: POST to /v1/projects/{ref}/database/query (Management API).
    # Use the pg-meta query endpoint.
    pass

# We'll use urllib to call the Supabase management API SQL endpoint
def run_sql_management(sql: str, label: str):
    project_ref = "optizplehhuyixiuycxt"
    # The Supabase Management API SQL endpoint:
    # POST https://api.supabase.com/v1/projects/{ref}/database/query
    # Requires a personal access token (PAT), not the project secret key.
    # Instead, use the pg-meta self-hosted endpoint exposed by Supabase projects:
    # POST https://{project}.supabase.co/pg/query (requires service role)
    # Actually the correct endpoint in Supabase cloud is via their Management API.
    # Let's use the direct postgres connection via supabase's REST SQL:
    # This is not available publicly. We'll use the MCP tool approach instead.
    print(f"Skipping {label} - management API requires PAT")

# Alternative: use psycopg2 with the direct connection
import subprocess

def run_sql_psql(sql: str, label: str):
    """Run SQL via psql with the direct connection string."""
    psql_path = "/opt/homebrew/opt/libpq/bin/psql"
    conn_str = "postgresql://postgres.optizplehhuyixiuycxt:PmzM2a6cFC6R7yEr@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
    
    result = subprocess.run(
        [psql_path, conn_str, "-c", sql],
        capture_output=True, text=True, timeout=120
    )
    if result.returncode != 0:
        print(f"ERROR in {label}: {result.stderr[:500]}")
    else:
        print(f"OK: {label} — {result.stdout.strip()}")

# Gather all SQL files in order
base = os.path.dirname(os.path.abspath(__file__))

# chat_messages batches 1-5 (batch 0 already done)
msg_files = sorted(glob.glob(os.path.join(base, "insert_chat_messages_[1-9].sql")))
# agent_sql_runs batches 0-14
run_files = sorted(glob.glob(os.path.join(base, "insert_agent_sql_runs_*.sql")))

all_files = msg_files + run_files

print(f"Files to import: {len(all_files)}")
for f in all_files:
    label = os.path.basename(f)
    with open(f) as fh:
        sql = fh.read()
    run_sql_psql(sql, label)

print("Done.")
