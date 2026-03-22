-- Daily character usage tracking for Tenergy feature
create table if not exists public.daily_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  characters_used bigint not null default 0,
  primary key (user_id, usage_date)
);

-- Enable RLS
alter table public.daily_usage enable row level security;

-- Users can read their own usage
create policy "Users can read own usage" on public.daily_usage
  for select using (auth.uid() = user_id);

-- Users can insert their own usage rows
create policy "Users can insert own usage" on public.daily_usage
  for insert with check (auth.uid() = user_id);

-- Users can update their own usage rows
create policy "Users can update own usage" on public.daily_usage
  for update using (auth.uid() = user_id);
