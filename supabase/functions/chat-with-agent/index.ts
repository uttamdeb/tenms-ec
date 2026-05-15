import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const WEBHOOK_URL = "https://n8n-prod.10minuteschool.com/webhook/ec-data-agent";

type JobStatus = 'queued' | 'running' | 'completed' | 'failed';
type QueryRunPayload = Record<string, unknown>;

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

const buildMirrorClient = () => {
  const mirrorUrl = Deno.env.get('MIRROR_SUPABASE_URL');
  const mirrorKey = Deno.env.get('MIRROR_SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('MIRROR_SUPABASE_KEY');

  if (!mirrorUrl || !mirrorKey) {
    return null;
  }

  return createClient(mirrorUrl, mirrorKey);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const getRecord = (value: unknown): Record<string, unknown> => isRecord(value) ? value : {};

const mirrorInsert = async (
  mirror: ReturnType<typeof buildMirrorClient>,
  table: string,
  payload: Record<string, unknown> | Record<string, unknown>[],
) => {
  if (!mirror) return;

  const { error } = await mirror.from(table).insert(payload);
  if (error) {
    console.warn(`[mirror] insert ${table} failed:`, error.message);
  }
};

const mirrorUpdate = async (
  mirror: ReturnType<typeof buildMirrorClient>,
  table: string,
  payload: Record<string, unknown>,
  column: string,
  value: unknown,
) => {
  if (!mirror) return;

  const { error } = await mirror.from(table).update(payload).eq(column, value);
  if (error) {
    console.warn(`[mirror] update ${table} failed:`, error.message);
  }
};

const slackTextFromAgentOutput = (content: string) => {
  const withChartSummaries = content.replace(/```chart\s*([\s\S]*?)```/gi, (_match, chartJson) => {
    try {
      const chart = JSON.parse(chartJson);
      const title = typeof chart.title === 'string' ? chart.title : 'chart';
      return `\n[Chart: ${title}. Open Data Agent for the interactive chart.]\n`;
    } catch {
      return '\n[Chart generated. Open Data Agent for the interactive chart.]\n';
    }
  });

  const normalized = withChartSummaries
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();

  if (!normalized) return 'Data Agent completed the request, but did not return displayable text.';
  if (normalized.length <= 3900) return normalized;
  return `${normalized.slice(0, 3800).trimEnd()}\n\n...Output truncated for Slack. Open Data Agent for the full answer.`;
};

const postSlackMessage = async (channel: string, text: string) => {
  const token = Deno.env.get('SLACK_BOT_TOKEN');
  if (!token) {
    console.warn('[chat-with-agent] SLACK_BOT_TOKEN missing; skipping Slack response');
    return false;
  }

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      channel,
      text,
      unfurl_links: false,
      unfurl_media: false,
    }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.ok === false) {
    console.warn('[chat-with-agent] Slack post failed:', body?.error ?? response.status);
    return false;
  }

  return true;
};

const maybePostExternalChatResponse = async (
  supabase: ReturnType<typeof buildServiceClient>,
  mirror: ReturnType<typeof buildMirrorClient>,
  job: { id: string; request_payload?: unknown },
  assistantContent: string,
  eventStatus: 'completed' | 'failed' = 'completed',
) => {
  const requestPayload = getRecord(job.request_payload);
  if (requestPayload.source !== 'slack' && requestPayload.platform !== 'slack') {
    return;
  }

  const slack = getRecord(requestPayload.slack);
  const channelId = typeof slack.channelId === 'string' ? slack.channelId : null;
  const eventId = typeof slack.eventId === 'string' ? slack.eventId : null;
  const teamId = typeof slack.teamId === 'string' ? slack.teamId : null;
  if (!channelId) {
    console.warn('[chat-with-agent] Slack callback payload missing channelId', { jobId: job.id });
    return;
  }

  let delivered = false;
  try {
    delivered = await postSlackMessage(channelId, slackTextFromAgentOutput(assistantContent));
  } catch (error) {
    console.warn('[chat-with-agent] Slack response delivery failed:', error);
  }

  if (eventId && teamId) {
    const updates = {
      status: delivered ? eventStatus : 'failed',
      error: delivered ? null : 'Slack delivery failed',
      updated_at: new Date().toISOString(),
    };
    await supabase
      .from('external_chat_events')
      .update(updates)
      .eq('platform', 'slack')
      .eq('workspace_id', teamId)
      .eq('external_event_id', eventId);
    await mirrorUpdate(mirror, 'external_chat_events', updates, 'external_event_id', eventId);
  }
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

const markJobRunningIfQueued = async (
  supabase: ReturnType<typeof buildServiceClient>,
  jobId: string,
) => {
  const updatedAt = new Date().toISOString();
  const { data, error } = await supabase
    .from('agent_jobs')
    .update({
      status: 'running',
      updated_at: updatedAt,
    })
    .eq('id', jobId)
    .eq('status', 'queued')
    .select('id, status, updated_at')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

const markJobCompleted = async (
  supabase: ReturnType<typeof buildServiceClient>,
  jobId: string,
  assistantMessageId: string,
  responsePayload: Record<string, unknown>,
) => {
  const completedAt = new Date().toISOString();
  const payload = {
    status: 'completed' as const,
    assistant_message_id: assistantMessageId,
    error: null,
    response_payload: responsePayload,
    updated_at: completedAt,
    completed_at: completedAt,
  };

  const { data, error } = await supabase
    .from('agent_jobs')
    .update(payload)
    .eq('id', jobId)
    .select('id, status, assistant_message_id, updated_at, completed_at')
    .single();

  if (error) {
    console.error('Failed to mark agent job completed:', { jobId, error });
    throw error;
  }

  if (!data || data.status !== 'completed') {
    console.error('Agent job completion verification failed:', { jobId, data });
    throw new Error('Agent job status did not persist as completed');
  }

  return data;
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
    query_runs,
    n8n_execution_id,
    error,
    responsePayload,
  } = await req.json();

  if (!jobId || !status) {
    return jsonResponse({ error: 'Missing required fields: jobId, status' }, 400);
  }

  const supabase = buildServiceClient();
  const mirror = buildMirrorClient();
  const { data: job, error: jobError } = await supabase
    .from('agent_jobs')
    .select('id, session_id, user_id, mode, source, assistant_message_id, request_payload')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    return jsonResponse({ error: 'Job not found' }, 404);
  }

  if (status === 'failed') {
    const failureMessage = typeof error === 'string' ? error : 'Agent job failed';
    await updateJobStatus(supabase, jobId, 'failed', {
      error: failureMessage,
      response_payload: responsePayload ?? null,
    });
    await maybePostExternalChatResponse(
      supabase,
      mirror,
      job,
      `Data Agent could not complete that request: ${failureMessage}`,
      'failed',
    );
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
        source: job.source ?? 'web',
      })
      .select('id')
      .single();

    if (assistantErr || !assistantMsg) {
      console.error('Failed to save assistant callback message:', assistantErr);
      return jsonResponse({ error: 'Failed to save assistant message' }, 500);
    }

    assistantMessageId = assistantMsg.id;

    await mirrorInsert(mirror, 'chat_messages', {
      id: assistantMsg.id,
      session_id: job.session_id,
      user_id: job.user_id,
      role: 'assistant',
      content: assistantContent,
      mode: job.mode,
      source: job.source ?? 'web',
      created_at: new Date().toISOString(),
    });
  }

  const finalResponsePayload = responsePayload ?? {
    output: assistantContent,
    executed_sql: executed_sql ?? null,
    bq_result: bq_result ?? null,
  };

  let agentSqlRunId: string | null = null;
  if (executed_sql && bq_result) {
    const bqResultStr = typeof bq_result === 'string' ? bq_result : JSON.stringify(bq_result);
    const { data: sqlRun, error: sqlRunError } = await supabase
      .from('agent_sql_runs')
      .insert({
        message_id: assistantMessageId,
        executed_sql,
        bq_result: bqResultStr,
      })
      .select('id, message_id, executed_sql, bq_result, created_at')
      .single();

    if (sqlRunError || !sqlRun) {
      console.error('Failed to save agent SQL run:', { jobId, assistantMessageId, sqlRunError });
      throw sqlRunError ?? new Error('Failed to save agent SQL run');
    }

    agentSqlRunId = sqlRun.id;
    await mirrorInsert(mirror, 'agent_sql_runs', sqlRun);
  }

  if (Array.isArray(query_runs) && query_runs.length > 0) {
    const queryRunRows: Record<string, unknown>[] = [];
    query_runs
      .filter(isRecord)
      .forEach((queryRun: QueryRunPayload, index: number) => {
        const rawSql = queryRun.raw_sql ?? queryRun.sql ?? queryRun.executed_sql;
        if (typeof rawSql !== 'string' || !rawSql.trim()) {
          return;
        }

        queryRunRows.push({
          message_id: assistantMessageId,
          agent_sql_run_id: agentSqlRunId,
          query_index: typeof queryRun.query_index === 'number' ? queryRun.query_index : index + 1,
          raw_sql: rawSql,
          parameterized_sql: typeof queryRun.parameterized_sql === 'string' ? queryRun.parameterized_sql : null,
          date_binding: isRecord(queryRun.date_binding) ? queryRun.date_binding : {},
          result_schema: Array.isArray(queryRun.result_schema) ? queryRun.result_schema : [],
          result_rows: Array.isArray(queryRun.result_rows) ? queryRun.result_rows : [],
          result_text: typeof queryRun.result_text === 'string' ? queryRun.result_text : null,
          n8n_execution_id: typeof n8n_execution_id === 'string'
            ? n8n_execution_id
            : typeof n8n_execution_id === 'number'
              ? String(n8n_execution_id)
              : null,
        });
      });

    if (queryRunRows.length > 0) {
      const { data: savedQueryRuns, error: queryRunError } = await supabase
        .from('agent_query_runs')
        .insert(queryRunRows)
        .select('*');

      if (queryRunError) {
        console.error('Failed to save structured query runs:', { jobId, assistantMessageId, queryRunError });
      } else if (savedQueryRuns) {
        await mirrorInsert(mirror, 'agent_query_runs', savedQueryRuns);
      }
    }
  }

  await markJobCompleted(
    supabase,
    jobId,
    assistantMessageId,
    finalResponsePayload,
  );

  await maybePostExternalChatResponse(supabase, mirror, job, assistantContent);

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
        source: 'web',
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

    await markJobRunningIfQueued(serviceSupabase, job.id);

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
