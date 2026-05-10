create or replace function public.is_current_user_bi()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'BI'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.dashboards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null default 'ec' check (mode in ('ec', '10ms')),
  name text not null,
  description text,
  filters jsonb not null default '{"dateRange":{"preset":"last_7_days"}}'::jsonb,
  layout jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint dashboards_name_length check (char_length(trim(name)) between 1 and 80)
);

create index if not exists dashboards_user_mode_updated_at_idx
  on public.dashboards (user_id, mode, updated_at desc)
  where archived_at is null;

create or replace function public.enforce_dashboard_limit()
returns trigger
language plpgsql
as $$
declare
  active_count integer;
begin
  if new.archived_at is not null then
    return new;
  end if;

  select count(*)
    into active_count
  from public.dashboards
  where user_id = new.user_id
    and mode = new.mode
    and archived_at is null
    and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

  if active_count >= 10 then
    raise exception 'A user can have up to 10 active dashboards per mode';
  end if;

  return new;
end;
$$;

drop trigger if exists dashboards_enforce_limit on public.dashboards;
create trigger dashboards_enforce_limit
  before insert or update of user_id, mode, archived_at
  on public.dashboards
  for each row
  execute function public.enforce_dashboard_limit();

drop trigger if exists dashboards_set_updated_at on public.dashboards;
create trigger dashboards_set_updated_at
  before update on public.dashboards
  for each row
  execute function public.set_updated_at();

create table if not exists public.dashboard_elements (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references public.dashboards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null default 'ec' check (mode in ('ec', '10ms')),
  element_type text not null check (element_type in ('chart', 'table', 'text', 'kpi')),
  title text not null,
  source_message_id uuid references public.chat_messages(id) on delete set null,
  source_sql_run_id uuid references public.agent_sql_runs(id) on delete set null,
  visual_spec jsonb not null default '{}'::jsonb,
  query_config jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,
  layout jsonb not null default '{"x":0,"y":0,"w":6,"h":4}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dashboard_elements_title_length check (char_length(trim(title)) between 1 and 120)
);

create index if not exists dashboard_elements_dashboard_position_idx
  on public.dashboard_elements (dashboard_id, position, created_at);

create index if not exists dashboard_elements_user_mode_idx
  on public.dashboard_elements (user_id, mode, created_at desc);

drop trigger if exists dashboard_elements_set_updated_at on public.dashboard_elements;
create trigger dashboard_elements_set_updated_at
  before update on public.dashboard_elements
  for each row
  execute function public.set_updated_at();

create table if not exists public.dashboard_element_cache (
  id uuid primary key default gen_random_uuid(),
  element_id uuid not null references public.dashboard_elements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  filter_hash text not null,
  filters jsonb not null default '{}'::jsonb,
  data jsonb not null default '{}'::jsonb,
  executed_sql text,
  status text not null default 'fresh' check (status in ('fresh', 'stale', 'failed')),
  refreshed_at timestamptz not null default now(),
  stale_after timestamptz,
  created_at timestamptz not null default now(),
  unique (element_id, filter_hash)
);

create index if not exists dashboard_element_cache_user_idx
  on public.dashboard_element_cache (user_id, refreshed_at desc);

create table if not exists public.dashboard_refresh_jobs (
  id uuid primary key default gen_random_uuid(),
  dashboard_id uuid not null references public.dashboards(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null default 'ec' check (mode in ('ec', '10ms')),
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  filters jsonb not null default '{}'::jsonb,
  element_ids uuid[] not null default '{}'::uuid[],
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists dashboard_refresh_jobs_user_created_at_idx
  on public.dashboard_refresh_jobs (user_id, created_at desc);

drop trigger if exists dashboard_refresh_jobs_set_updated_at on public.dashboard_refresh_jobs;
create trigger dashboard_refresh_jobs_set_updated_at
  before update on public.dashboard_refresh_jobs
  for each row
  execute function public.set_updated_at();

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

alter table public.dashboard_elements
  add column if not exists source_query_run_id uuid references public.agent_query_runs(id) on delete set null;

create index if not exists dashboard_elements_source_query_run_idx
  on public.dashboard_elements (source_query_run_id)
  where source_query_run_id is not null;

alter table public.dashboards enable row level security;
alter table public.dashboard_elements enable row level security;
alter table public.dashboard_element_cache enable row level security;
alter table public.dashboard_refresh_jobs enable row level security;
alter table public.agent_query_runs enable row level security;

create policy "BI users can view own dashboards"
  on public.dashboards
  for select
  using (auth.uid() = user_id and public.is_current_user_bi());

create policy "BI users can insert own dashboards"
  on public.dashboards
  for insert
  with check (auth.uid() = user_id and public.is_current_user_bi());

create policy "BI users can update own dashboards"
  on public.dashboards
  for update
  using (auth.uid() = user_id and public.is_current_user_bi())
  with check (auth.uid() = user_id and public.is_current_user_bi());

create policy "BI users can delete own dashboards"
  on public.dashboards
  for delete
  using (auth.uid() = user_id and public.is_current_user_bi());

create policy "BI users can view own dashboard elements"
  on public.dashboard_elements
  for select
  using (auth.uid() = user_id and public.is_current_user_bi());

create policy "BI users can insert own dashboard elements"
  on public.dashboard_elements
  for insert
  with check (
    auth.uid() = user_id
    and public.is_current_user_bi()
    and exists (
      select 1
      from public.dashboards
      where dashboards.id = dashboard_id
        and dashboards.user_id = auth.uid()
        and dashboards.mode = dashboard_elements.mode
        and dashboards.archived_at is null
    )
  );

create policy "BI users can update own dashboard elements"
  on public.dashboard_elements
  for update
  using (auth.uid() = user_id and public.is_current_user_bi())
  with check (
    auth.uid() = user_id
    and public.is_current_user_bi()
    and exists (
      select 1
      from public.dashboards
      where dashboards.id = dashboard_id
        and dashboards.user_id = auth.uid()
        and dashboards.mode = dashboard_elements.mode
        and dashboards.archived_at is null
    )
  );

create policy "BI users can delete own dashboard elements"
  on public.dashboard_elements
  for delete
  using (auth.uid() = user_id and public.is_current_user_bi());

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

create policy "BI users can view own dashboard refresh jobs"
  on public.dashboard_refresh_jobs
  for select
  using (auth.uid() = user_id and public.is_current_user_bi());

create policy "BI users can insert own dashboard refresh jobs"
  on public.dashboard_refresh_jobs
  for insert
  with check (
    auth.uid() = user_id
    and public.is_current_user_bi()
    and exists (
      select 1
      from public.dashboards
      where dashboards.id = dashboard_id
        and dashboards.user_id = auth.uid()
        and dashboards.mode = dashboard_refresh_jobs.mode
        and dashboards.archived_at is null
    )
  );

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