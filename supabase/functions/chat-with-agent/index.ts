import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const WEBHOOK_URL = "https://n8n-prod.10minuteschool.com/webhook/ec-data-agent";

type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const buildServiceClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, serviceRoleKey);
};

const updateJobStatus = async (
  supabase: ReturnType<typeof buildServiceClient>,
  jobId: string,
  status: JobStatus,
  updates: Record<string, unknown> = {},
) => {
  const payload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
    ...updates,
  };

  if (status === 'completed' || status === 'failed') {
    payload.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('agent_jobs')
    .update(payload)
    .eq('id', jobId);

  if (error) {
    throw error;
  }
};

const handleCallback = async (req: Request) => {
  const callbackSecret = Deno.env.get('AGENT_CALLBACK_SECRET');
  const providedSecret = req.headers.get('x-agent-callback-secret');

  if (!callbackSecret || providedSecret !== callbackSecret) {
    return jsonResponse({ error: 'Unauthorized callback' }, 401);
  }

  const {
    jobId,
    status,
    output,
    message,
    response,
    executed_sql,
    bq_result,
    error,
    responsePayload,
  } = await req.json();

  if (!jobId || !status) {
    return jsonResponse({ error: 'Missing required fields: jobId, status' }, 400);
  }

  const supabase = buildServiceClient();
  const { data: job, error: jobError } = await supabase
    .from('agent_jobs')
    .select('id, session_id, user_id, mode, assistant_message_id')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    return jsonResponse({ error: 'Job not found' }, 404);
  }

  if (status === 'failed') {
    await updateJobStatus(supabase, jobId, 'failed', {
      error: typeof error === 'string' ? error : 'Agent job failed',
      response_payload: responsePayload ?? null,
    });
    return jsonResponse({ ok: true });
  }

  const assistantContent = output || message || response;
  if (!assistantContent || typeof assistantContent !== 'string') {
    return jsonResponse({ error: 'Missing assistant response content' }, 400);
  }

  let assistantMessageId = job.assistant_message_id;
  if (!assistantMessageId) {
    const { data: assistantMsg, error: assistantErr } = await supabase
      .from('chat_messages')
      .insert({
        session_id: job.session_id,
        user_id: job.user_id,
        role: 'assistant',
        content: assistantContent,
        mode: job.mode,
      })
      .select('id')
      .single();

    if (assistantErr || !assistantMsg) {
      console.error('Failed to save assistant callback message:', assistantErr);
      return jsonResponse({ error: 'Failed to save assistant message' }, 500);
    }

    assistantMessageId = assistantMsg.id;
  }

  if (executed_sql && bq_result) {
    const bqResultStr = typeof bq_result === 'string' ? bq_result : JSON.stringify(bq_result);
    await supabase.from('agent_sql_runs').insert({
      message_id: assistantMessageId,
      executed_sql,
      bq_result: bqResultStr,
    });
  }

  await updateJobStatus(supabase, jobId, 'completed', {
    assistant_message_id: assistantMessageId,
    error: null,
    response_payload: responsePayload ?? {
      output: assistantContent,
      executed_sql: executed_sql ?? null,
      bq_result: bq_result ?? null,
    },
  });

  return jsonResponse({ ok: true, assistantMessageId });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    if (url.pathname.endsWith('/callback')) {
      return await handleCallback(req);
    }

    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { user, input, sessionId, attachments, mode, userMessageId } = await req.json();

    if (!user || !input || !sessionId || !userMessageId) {
      return jsonResponse({ error: 'Missing required fields: user, input, sessionId, userMessageId' }, 400);
    }

    const serviceSupabase = buildServiceClient();
    const { data: job, error: jobError } = await serviceSupabase
      .from('agent_jobs')
      .insert({
        session_id: sessionId,
        user_id: authUser.id,
        user_message_id: userMessageId,
        mode: mode ?? 'ec',
        status: 'queued',
        request_payload: {
          user,
          input,
          sessionId,
          attachments: attachments ?? [],
          mode: mode ?? 'ec',
        },
      })
      .select('id, status, created_at')
      .single();

    if (jobError || !job) {
      console.error('Failed to create agent job:', jobError);
      return jsonResponse({ error: 'Failed to create agent job' }, 500);
    }

    const callbackBaseUrl = Deno.env.get('SUPABASE_URL')!;
    const webhookBody: Record<string, unknown> = {
      user,
      input,
      sessionId,
      mode: mode ?? 'ec',
      jobId: job.id,
      userMessageId,
      callbackUrl: `${callbackBaseUrl}/functions/v1/chat-with-agent/callback`,
    };
    if (mode) {
      webhookBody.mode = mode;
    }
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      webhookBody.attachments = attachments;
    }

    const callbackSecret = Deno.env.get('AGENT_CALLBACK_SECRET');
    const webhookController = new AbortController();
    const webhookTimeout = setTimeout(() => webhookController.abort(), 15_000);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(callbackSecret ? { 'x-agent-callback-secret': callbackSecret } : {}),
        },
        body: JSON.stringify(webhookBody),
        signal: webhookController.signal,
      });

      if (!response.ok) {
        const responseText = await response.text();
        await updateJobStatus(serviceSupabase, job.id, 'failed', {
          error: `Failed to enqueue agent job: HTTP ${response.status}`,
          response_payload: { raw: responseText },
        });
        return jsonResponse({ error: 'Failed to enqueue agent job' }, 502);
      }
    } catch (error) {
      console.error('Error enqueueing webhook:', error);
      await updateJobStatus(serviceSupabase, job.id, 'failed', {
        error: error instanceof Error ? error.message : 'Failed to enqueue agent job',
      });
      return jsonResponse({ error: 'Failed to enqueue agent job' }, 502);
    } finally {
      clearTimeout(webhookTimeout);
    }

    await updateJobStatus(serviceSupabase, job.id, 'running');

    return jsonResponse({
      jobId: job.id,
      status: 'running',
      queuedAt: job.created_at,
    });
  } catch (error) {
    console.error('Error calling webhook:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
