create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.chat_sessions
  add column if not exists source text not null default 'web';

alter table public.chat_messages
  add column if not exists source text not null default 'web';

alter table public.agent_jobs
  add column if not exists source text not null default 'web';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chat_sessions_source_check') then
    alter table public.chat_sessions add constraint chat_sessions_source_check check (source in ('web', 'slack', 'google_chat'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'chat_messages_source_check') then
    alter table public.chat_messages add constraint chat_messages_source_check check (source in ('web', 'slack', 'google_chat'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'agent_jobs_source_check') then
    alter table public.agent_jobs add constraint agent_jobs_source_check check (source in ('web', 'slack', 'google_chat'));
  end if;
end $$;

create table if not exists public.external_chat_identities (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('slack', 'google_chat')),
  workspace_id text not null,
  external_user_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, workspace_id, external_user_id)
);

create unique index if not exists external_chat_identities_platform_workspace_email_uidx
  on public.external_chat_identities (platform, workspace_id, lower(email))
  where email is not null;

create index if not exists external_chat_identities_user_idx
  on public.external_chat_identities (user_id, platform, updated_at desc);

drop trigger if exists external_chat_identities_set_updated_at on public.external_chat_identities;
create trigger external_chat_identities_set_updated_at
  before update on public.external_chat_identities
  for each row execute function public.set_updated_at();

create table if not exists public.external_chat_threads (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('slack', 'google_chat')),
  workspace_id text not null,
  channel_id text not null,
  thread_key text not null,
  conversation_type text not null default 'dm' check (conversation_type in ('dm', 'channel', 'group')),
  external_user_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  mode text not null default 'ec' check (mode in ('ec', '10ms')),
  metadata jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, workspace_id, channel_id, thread_key, user_id, mode)
);

create index if not exists external_chat_threads_session_idx on public.external_chat_threads (session_id);
create index if not exists external_chat_threads_user_idx on public.external_chat_threads (user_id, platform, updated_at desc);

drop trigger if exists external_chat_threads_set_updated_at on public.external_chat_threads;
create trigger external_chat_threads_set_updated_at
  before update on public.external_chat_threads
  for each row execute function public.set_updated_at();

create table if not exists public.external_chat_events (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('slack', 'google_chat')),
  workspace_id text not null,
  external_event_id text not null,
  event_type text not null,
  user_id uuid references auth.users(id) on delete set null,
  session_id uuid references public.chat_sessions(id) on delete set null,
  user_message_id uuid references public.chat_messages(id) on delete set null,
  agent_job_id uuid references public.agent_jobs(id) on delete set null,
  status text not null default 'received' check (status in ('received', 'ignored', 'queued', 'completed', 'failed')),
  error text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, workspace_id, external_event_id)
);

create index if not exists external_chat_events_job_idx on public.external_chat_events (agent_job_id) where agent_job_id is not null;
create index if not exists external_chat_events_user_idx on public.external_chat_events (user_id, platform, created_at desc);

drop trigger if exists external_chat_events_set_updated_at on public.external_chat_events;
create trigger external_chat_events_set_updated_at
  before update on public.external_chat_events
  for each row execute function public.set_updated_at();

alter table public.external_chat_identities enable row level security;
alter table public.external_chat_threads enable row level security;
alter table public.external_chat_events enable row level security;

create policy "Users view own external identities" on public.external_chat_identities for select to authenticated using (auth.uid() = user_id);
create policy "Users view own external threads" on public.external_chat_threads for select to authenticated using (auth.uid() = user_id);
create policy "Users view own external events" on public.external_chat_events for select to authenticated using (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';