CREATE TABLE public.agent_sql_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  executed_sql text NOT NULL,
  bq_result text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_sql_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sql runs" ON public.agent_sql_runs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm WHERE cm.id = agent_sql_runs.message_id AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own sql runs" ON public.agent_sql_runs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm WHERE cm.id = agent_sql_runs.message_id AND cm.user_id = auth.uid()
    )
  );