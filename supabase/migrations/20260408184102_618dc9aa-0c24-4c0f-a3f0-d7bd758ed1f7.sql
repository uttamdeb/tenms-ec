
-- Add mode column to chat_sessions
ALTER TABLE public.chat_sessions
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'ec';

-- Add mode column to chat_messages
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'ec';

-- Add mode column to suggested_messages
ALTER TABLE public.suggested_messages
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'ec';

-- Insert 10MS-specific suggested messages
INSERT INTO public.suggested_messages (message, mode) VALUES
  ('How many active subscribers do we have this month?', '10ms'),
  ('Show me the top 10 courses by revenue this quarter', '10ms'),
  ('What is the daily active user trend for the last 30 days?', '10ms'),
  ('Compare monthly revenue between this year and last year', '10ms'),
  ('Which teachers have the highest student ratings?', '10ms');
