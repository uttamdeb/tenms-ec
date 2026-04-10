create table if not exists public.agent_jobs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null,
  user_message_id uuid not null references public.chat_messages(id) on delete cascade,
  assistant_message_id uuid references public.chat_messages(id) on delete set null,
  mode text not null default 'ec',
  status text not null default 'queued',
  error text,
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists agent_jobs_user_id_created_at_idx
  on public.agent_jobs (user_id, created_at desc);

create index if not exists agent_jobs_session_id_created_at_idx
  on public.agent_jobs (session_id, created_at desc);

create index if not exists agent_jobs_status_created_at_idx
  on public.agent_jobs (status, created_at desc);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'agent_jobs_status_check'
  ) then
    alter table public.agent_jobs
      add constraint agent_jobs_status_check
      check (status in ('queued', 'running', 'completed', 'failed'));
  end if;
end $$;

alter table public.agent_jobs enable row level security;

create policy "Users can view their own agent jobs"
  on public.agent_jobs
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own agent jobs"
  on public.agent_jobs
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own queued agent jobs"
  on public.agent_jobs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);