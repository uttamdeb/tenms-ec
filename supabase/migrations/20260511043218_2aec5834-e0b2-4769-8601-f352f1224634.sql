create table if not exists public.agent_query_runs (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.chat_messages(id) on delete cascade,
  agent_sql_run_id uuid references public.agent_sql_runs(id) on delete set null,
  query_index integer not null default 1,
  raw_sql text not null,
  parameterized_sql text,
  date_binding jsonb not null default '{}'::jsonb,
  result_schema jsonb not null default '[]'::jsonb,
  result_rows jsonb not null default '[]'::jsonb,
  result_text text,
  n8n_execution_id text,
  created_at timestamptz not null default now(),
  constraint agent_query_runs_query_index_check check (query_index between 1 and 10)
);

create index if not exists agent_query_runs_message_idx
  on public.agent_query_runs (message_id, query_index);

alter table public.agent_query_runs enable row level security;

alter table public.dashboard_elements
  add column if not exists source_query_run_id uuid references public.agent_query_runs(id) on delete set null;

create index if not exists dashboard_elements_source_query_run_idx
  on public.dashboard_elements (source_query_run_id)
  where source_query_run_id is not null;

create unique index if not exists dashboard_element_cache_element_filter_hash_uidx
  on public.dashboard_element_cache (element_id, filter_hash);

create index if not exists dashboard_element_cache_user_idx
  on public.dashboard_element_cache (user_id, refreshed_at desc);

drop policy if exists "BI users can view own dashboard cache" on public.dashboard_element_cache;
create policy "BI users can view own dashboard cache"
  on public.dashboard_element_cache
  for select
  using (
    auth.uid() = user_id
    and public.is_current_user_bi()
    and exists (
      select 1
      from public.dashboard_elements
      where dashboard_elements.id = dashboard_element_cache.element_id
        and dashboard_elements.user_id = auth.uid()
    )
  );

drop policy if exists "BI users can manage own dashboard cache" on public.dashboard_element_cache;
create policy "BI users can manage own dashboard cache"
  on public.dashboard_element_cache
  for all
  using (
    auth.uid() = user_id
    and public.is_current_user_bi()
    and exists (
      select 1
      from public.dashboard_elements
      where dashboard_elements.id = dashboard_element_cache.element_id
        and dashboard_elements.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and public.is_current_user_bi()
    and exists (
      select 1
      from public.dashboard_elements
      where dashboard_elements.id = dashboard_element_cache.element_id
        and dashboard_elements.user_id = auth.uid()
    )
  );

drop policy if exists "BI users can view own agent query runs" on public.agent_query_runs;
create policy "BI users can view own agent query runs"
  on public.agent_query_runs
  for select
  using (
    public.is_current_user_bi()
    and exists (
      select 1
      from public.chat_messages
      where chat_messages.id = agent_query_runs.message_id
        and chat_messages.user_id = auth.uid()
    )
  );

NOTIFY pgrst, 'reload schema';