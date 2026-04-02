alter table public.chat_sessions
add column if not exists status text not null default 'active';

update public.chat_sessions
set status = 'active'
where status is null;
