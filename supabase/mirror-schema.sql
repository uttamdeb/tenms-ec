-- Mirror schema for the secondary Supabase project (optizplehhuyixiuycxt).
-- This creates the same tables as the Lovable project but WITHOUT:
--   - auth.users foreign keys (no auth on mirror)
--   - Row Level Security (mirror is private/backend-only)
--   - Triggers (no handle_new_user)
--   - suggested_messages table (not needed)

-- 1. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. chat_sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Chat',
  mode TEXT NOT NULL DEFAULT 'ec',
  status TEXT NOT NULL DEFAULT 'active',
  source TEXT NOT NULL DEFAULT 'web',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. chat_messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'ec',
  source TEXT NOT NULL DEFAULT 'web',
  feedback TEXT,
  feedback_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT chat_messages_feedback_check
    CHECK (feedback IS NULL OR feedback IN ('like', 'dislike'))
);

-- 4. agent_sql_runs
CREATE TABLE IF NOT EXISTS public.agent_sql_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  executed_sql TEXT NOT NULL,
  bq_result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. daily_usage
CREATE TABLE IF NOT EXISTS public.daily_usage (
  user_id UUID NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  characters_used BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, usage_date)
);

-- 6. dashboards
CREATE TABLE IF NOT EXISTS public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mode TEXT NOT NULL DEFAULT 'ec',
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL DEFAULT '{"dateRange":{"preset":"last_7_days"}}'::jsonb,
  layout JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  archived_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS dashboards_user_mode_updated_at_idx
  ON public.dashboards (user_id, mode, updated_at DESC)
  WHERE archived_at IS NULL;

-- 7. dashboard_elements
CREATE TABLE IF NOT EXISTS public.dashboard_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  mode TEXT NOT NULL DEFAULT 'ec',
  element_type TEXT NOT NULL,
  title TEXT NOT NULL,
  source_message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  source_sql_run_id UUID REFERENCES public.agent_sql_runs(id) ON DELETE SET NULL,
  source_query_run_id UUID,
  visual_spec JSONB NOT NULL DEFAULT '{}'::jsonb,
  query_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  layout JSONB NOT NULL DEFAULT '{"x":0,"y":0,"w":6,"h":4}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dashboard_elements_dashboard_position_idx
  ON public.dashboard_elements (dashboard_id, position, created_at);

CREATE INDEX IF NOT EXISTS dashboard_elements_user_mode_idx
  ON public.dashboard_elements (user_id, mode, created_at DESC);

-- 8. dashboard_element_cache
CREATE TABLE IF NOT EXISTS public.dashboard_element_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  element_id UUID NOT NULL REFERENCES public.dashboard_elements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  filter_hash TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  executed_sql TEXT,
  status TEXT NOT NULL DEFAULT 'fresh',
  refreshed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stale_after TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (element_id, filter_hash)
);

CREATE UNIQUE INDEX IF NOT EXISTS dashboard_element_cache_element_filter_hash_uidx
  ON public.dashboard_element_cache (element_id, filter_hash);

CREATE INDEX IF NOT EXISTS dashboard_element_cache_user_idx
  ON public.dashboard_element_cache (user_id, refreshed_at DESC);

-- 9. dashboard_refresh_jobs
CREATE TABLE IF NOT EXISTS public.dashboard_refresh_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  mode TEXT NOT NULL DEFAULT 'ec',
  status TEXT NOT NULL DEFAULT 'queued',
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  element_ids UUID[] NOT NULL DEFAULT '{}'::uuid[],
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 10. agent_query_runs
CREATE TABLE IF NOT EXISTS public.agent_query_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  agent_sql_run_id UUID REFERENCES public.agent_sql_runs(id) ON DELETE SET NULL,
  query_index INTEGER NOT NULL DEFAULT 1,
  raw_sql TEXT NOT NULL,
  parameterized_sql TEXT,
  date_binding JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_schema JSONB NOT NULL DEFAULT '[]'::jsonb,
  result_rows JSONB NOT NULL DEFAULT '[]'::jsonb,
  result_text TEXT,
  n8n_execution_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dashboard_elements
  ADD COLUMN IF NOT EXISTS source_query_run_id UUID;

CREATE INDEX IF NOT EXISTS dashboard_elements_source_query_run_idx
  ON public.dashboard_elements (source_query_run_id)
  WHERE source_query_run_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS agent_query_runs_message_idx
  ON public.agent_query_runs (message_id, query_index);

-- 11. agent_jobs
CREATE TABLE IF NOT EXISTS public.agent_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  assistant_message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  mode TEXT NOT NULL DEFAULT 'ec',
  source TEXT NOT NULL DEFAULT 'web',
  status TEXT NOT NULL DEFAULT 'queued',
  error TEXT,
  request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS agent_jobs_user_id_created_at_idx
  ON public.agent_jobs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS agent_jobs_session_id_created_at_idx
  ON public.agent_jobs (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS agent_jobs_status_created_at_idx
  ON public.agent_jobs (status, created_at DESC);

-- 12. external chat bridge tables
CREATE TABLE IF NOT EXISTS public.external_chat_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  external_user_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (platform, workspace_id, external_user_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS external_chat_identities_platform_workspace_email_uidx
  ON public.external_chat_identities (platform, workspace_id, lower(email))
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS external_chat_identities_user_idx
  ON public.external_chat_identities (user_id, platform, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.external_chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  thread_key TEXT NOT NULL,
  conversation_type TEXT NOT NULL DEFAULT 'dm',
  external_user_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'ec',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (platform, workspace_id, channel_id, thread_key, user_id, mode)
);

CREATE INDEX IF NOT EXISTS external_chat_threads_session_idx
  ON public.external_chat_threads (session_id);

CREATE INDEX IF NOT EXISTS external_chat_threads_user_idx
  ON public.external_chat_threads (user_id, platform, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.external_chat_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  workspace_id TEXT NOT NULL,
  external_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  user_id UUID,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
  user_message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  agent_job_id UUID REFERENCES public.agent_jobs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'received',
  error TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (platform, workspace_id, external_event_id)
);

CREATE INDEX IF NOT EXISTS external_chat_events_job_idx
  ON public.external_chat_events (agent_job_id)
  WHERE agent_job_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS external_chat_events_user_idx
  ON public.external_chat_events (user_id, platform, created_at DESC);

ALTER TABLE public.chat_sessions
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'web';

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'web';

ALTER TABLE public.agent_jobs
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'web';
