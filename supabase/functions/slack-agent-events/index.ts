import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const AGENT_WEBHOOK_URL =
  Deno.env.get("N8N_AGENT_WEBHOOK_URL") ?? "https://n8n-prod.10minuteschool.com/webhook/ec-data-agent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, x-slack-signature, x-slack-request-timestamp, x-slack-retry-num, x-slack-retry-reason",
};

type JsonRecord = Record<string, unknown>;
type ChatMode = "ec" | "10ms";

type SlackEventPayload = {
  type?: string;
  challenge?: string;
  team_id?: string;
  event_id?: string;
  event?: {
    type?: string;
    channel?: string;
    user?: string;
    text?: string;
    ts?: string;
    event_ts?: string;
    channel_type?: string;
    bot_id?: string;
    subtype?: string;
  };
};

type SlackUserProfile = {
  email?: string;
  real_name?: string;
  display_name?: string;
  image_192?: string;
  image_72?: string;
};

type SlackUserInfo = {
  id: string;
  name?: string;
  real_name?: string;
  profile?: SlackUserProfile;
};

const encoder = new TextEncoder();

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const textResponse = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: { ...corsHeaders, "Content-Type": "text/plain" },
  });

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getRecord = (value: unknown): JsonRecord => isRecord(value) ? value : {};

const cleanString = (value: unknown) => {
  const text = typeof value === "string" ? value.trim() : "";
  return text ? text : null;
};

const normalizeEmail = (value: unknown) => cleanString(value)?.toLowerCase() ?? null;

const buildServiceClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, serviceRoleKey);
};

const buildMirrorClient = () => {
  const mirrorUrl = Deno.env.get("MIRROR_SUPABASE_URL");
  const mirrorKey = Deno.env.get("MIRROR_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("MIRROR_SUPABASE_KEY");

  if (!mirrorUrl || !mirrorKey) {
    return null;
  }

  return createClient(mirrorUrl, mirrorKey);
};

const mirrorInsert = async (
  mirror: ReturnType<typeof buildMirrorClient>,
  table: string,
  payload: Record<string, unknown> | Record<string, unknown>[],
) => {
  if (!mirror) return;
  const { error } = await mirror.from(table).insert(payload);
  if (error) console.warn(`[mirror] insert ${table} failed:`, error.message);
};

const mirrorUpsert = async (
  mirror: ReturnType<typeof buildMirrorClient>,
  table: string,
  payload: Record<string, unknown>,
  onConflict: string,
) => {
  if (!mirror) return;
  const { error } = await mirror.from(table).upsert(payload, { onConflict });
  if (error) console.warn(`[mirror] upsert ${table} failed:`, error.message);
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
  if (error) console.warn(`[mirror] update ${table} failed:`, error.message);
};

const toHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

const safeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

const verifySlackSignature = async (req: Request, rawBody: string) => {
  const signingSecret = Deno.env.get("SLACK_SIGNING_SECRET");
  if (!signingSecret) {
    console.error("[slack-agent-events] missing SLACK_SIGNING_SECRET");
    return false;
  }

  const timestamp = req.headers.get("x-slack-request-timestamp");
  const signature = req.headers.get("x-slack-signature");
  if (!timestamp || !signature) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > 60 * 5) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(signingSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const baseString = `v0:${timestamp}:${rawBody}`;
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(baseString));
  const expected = `v0=${toHex(digest)}`;
  return safeEqual(expected, signature);
};

const isAllowedTeam = (teamId: string) => {
  const allowedTeams = (Deno.env.get("SLACK_ALLOWED_TEAM_IDS") ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return allowedTeams.length === 0 || allowedTeams.includes(teamId);
};

const slackApi = async (method: string, body: Record<string, unknown>) => {
  const token = Deno.env.get("SLACK_BOT_TOKEN");
  if (!token) throw new Error("SLACK_BOT_TOKEN is not configured.");

  const response = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok === false) {
    throw new Error(`Slack API ${method} failed: ${payload?.error ?? response.status}`);
  }

  return payload;
};

const getSlackUserInfo = async (externalUserId: string): Promise<SlackUserInfo> => {
  const token = Deno.env.get("SLACK_BOT_TOKEN");
  if (!token) throw new Error("SLACK_BOT_TOKEN is not configured.");

  const url = new URL("https://slack.com/api/users.info");
  url.searchParams.set("user", externalUserId);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok === false || !payload?.user) {
    throw new Error(`Slack users.info failed: ${payload?.error ?? response.status}`);
  }

  return payload.user as SlackUserInfo;
};

const postSlackMessage = async (channel: string, text: string) => {
  await slackApi("chat.postMessage", {
    channel,
    text,
    unfurl_links: false,
    unfurl_media: false,
  });
};

const parseModeAndInput = (text: string, fallbackMode: ChatMode): { mode: ChatMode; input: string; explicitMode: boolean } => {
  const cleaned = text.replace(/<@[^>]+>/g, "").trim();
  const match = cleaned.match(/^(?:mode\s*[:=-]\s*)?(10ms|ec)\b(?:\s*[:=-]\s*|\s+)?/i);
  if (!match) return { mode: fallbackMode, input: cleaned, explicitMode: false };

  const mode = match[1].toLowerCase() === "10ms" ? "10ms" : "ec";
  return {
    mode,
    input: cleaned.slice(match[0].length).trim(),
    explicitMode: true,
  };
};

const isNewChatCommand = (text: string) => {
  const normalized = text.trim().toLowerCase();
  return normalized === "new" || normalized === "new chat" || normalized === "/new" || normalized === "reset";
};

const resolveOrCreateUser = async (
  supabase: ReturnType<typeof buildServiceClient>,
  mirror: ReturnType<typeof buildMirrorClient>,
  slackUser: SlackUserInfo,
  workspaceId: string,
) => {
  const email = normalizeEmail(slackUser.profile?.email);
  if (!email) {
    throw new Error("Your Slack profile does not expose an email address to this app. Please ask an admin to grant users:read.email and reinstall the app.");
  }

  const displayName =
    cleanString(slackUser.profile?.real_name) ??
    cleanString(slackUser.real_name) ??
    cleanString(slackUser.profile?.display_name) ??
    cleanString(slackUser.name) ??
    email.split("@")[0];
  const avatarUrl = cleanString(slackUser.profile?.image_192) ?? cleanString(slackUser.profile?.image_72);

  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (profileError) throw profileError;

  let userId = existingProfile?.id ?? null;
  if (!userId) {
    let page = 1;
    const perPage = 200;
    while (page <= 25 && !userId) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const match = data.users.find((user) => user.email?.toLowerCase() === email);
      if (match) {
        userId = match.id;
        break;
      }
      if (data.users.length < perPage) break;
      page += 1;
    }
  }

  if (!userId) {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: displayName,
        avatar_url: avatarUrl,
        provider: "slack",
        slack_workspace_id: workspaceId,
        slack_user_id: slackUser.id,
      },
    });

    if (createError || !created.user) {
      throw createError ?? new Error("Failed to create Supabase user for Slack identity.");
    }

    userId = created.user.id;
  }

  const profilePayload = {
    id: userId,
    email,
    full_name: displayName,
    avatar_url: avatarUrl,
  };
  const { error: upsertProfileError } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "id" });
  if (upsertProfileError) throw upsertProfileError;

  await mirrorUpsert(mirror, "profiles", profilePayload, "id");

  const identityPayload = {
    platform: "slack",
    workspace_id: workspaceId,
    external_user_id: slackUser.id,
    user_id: userId,
    email,
    display_name: displayName,
    avatar_url: avatarUrl,
    metadata: {
      slack_name: slackUser.name ?? null,
    },
  };
  const { error: identityError } = await supabase
    .from("external_chat_identities")
    .upsert(identityPayload, { onConflict: "platform,workspace_id,external_user_id" });
  if (identityError) throw identityError;

  await mirrorUpsert(mirror, "external_chat_identities", identityPayload, "platform,workspace_id,external_user_id");

  return { userId, email, displayName, avatarUrl };
};

const getMostRecentThread = async (
  supabase: ReturnType<typeof buildServiceClient>,
  workspaceId: string,
  channelId: string,
  userId: string,
) => {
  const { data, error } = await supabase
    .from("external_chat_threads")
    .select("session_id, mode")
    .eq("platform", "slack")
    .eq("workspace_id", workspaceId)
    .eq("channel_id", channelId)
    .eq("thread_key", channelId)
    .eq("user_id", userId)
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as { session_id: string; mode: ChatMode } | null;
};

const getModeThread = async (
  supabase: ReturnType<typeof buildServiceClient>,
  workspaceId: string,
  channelId: string,
  userId: string,
  mode: ChatMode,
) => {
  const { data, error } = await supabase
    .from("external_chat_threads")
    .select("session_id, mode")
    .eq("platform", "slack")
    .eq("workspace_id", workspaceId)
    .eq("channel_id", channelId)
    .eq("thread_key", channelId)
    .eq("user_id", userId)
    .eq("mode", mode)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;
  return data as { session_id: string; mode: ChatMode } | null;
};

const createSession = async (
  supabase: ReturnType<typeof buildServiceClient>,
  mirror: ReturnType<typeof buildMirrorClient>,
  userId: string,
  mode: ChatMode,
  title: string,
) => {
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: userId,
      title,
      mode,
      source: "slack",
    })
    .select("id, user_id, title, mode, status, source, created_at, updated_at")
    .single();

  if (error || !data) throw error ?? new Error("Failed to create Slack chat session.");
  await mirrorInsert(mirror, "chat_sessions", data);
  return data.id as string;
};

const upsertThread = async (
  supabase: ReturnType<typeof buildServiceClient>,
  mirror: ReturnType<typeof buildMirrorClient>,
  payload: Record<string, unknown>,
) => {
  const { data, error } = await supabase
    .from("external_chat_threads")
    .upsert(payload, { onConflict: "platform,workspace_id,channel_id,thread_key,user_id,mode" })
    .select("*")
    .single();

  if (error || !data) throw error ?? new Error("Failed to upsert Slack thread mapping.");
  await mirrorUpsert(mirror, "external_chat_threads", data, "platform,workspace_id,channel_id,thread_key,user_id,mode");
  return data;
};

const updateEvent = async (
  supabase: ReturnType<typeof buildServiceClient>,
  mirror: ReturnType<typeof buildMirrorClient>,
  eventId: string,
  updates: Record<string, unknown>,
) => {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };
  await supabase.from("external_chat_events").update(payload).eq("id", eventId);
  await mirrorUpdate(mirror, "external_chat_events", payload, "id", eventId);
};

const enqueueAgent = async (
  supabase: ReturnType<typeof buildServiceClient>,
  mirror: ReturnType<typeof buildMirrorClient>,
  params: {
    userId: string;
    displayName: string;
    sessionId: string;
    mode: ChatMode;
    input: string;
    channelId: string;
    slackUserId: string;
    teamId: string;
    externalEventId: string;
    eventTs: string | null;
  },
) => {
  const now = new Date().toISOString();
  const { data: userMsg, error: messageError } = await supabase
    .from("chat_messages")
    .insert({
      session_id: params.sessionId,
      user_id: params.userId,
      role: "user",
      content: params.input,
      mode: params.mode,
      source: "slack",
    })
    .select("*")
    .single();

  if (messageError || !userMsg) throw messageError ?? new Error("Failed to save Slack user message.");
  await mirrorInsert(mirror, "chat_messages", userMsg);

  await supabase
    .from("chat_sessions")
    .update({
      title: params.input.slice(0, 50) + (params.input.length > 50 ? "..." : ""),
      updated_at: now,
    })
    .eq("id", params.sessionId)
    .eq("title", "New Chat");

  const requestPayload = {
    user: params.displayName,
    input: params.input,
    sessionId: params.sessionId,
    mode: params.mode,
    source: "slack",
    platform: "slack",
    userMessageId: userMsg.id,
    callbackUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/chat-with-agent/callback`,
    slack: {
      teamId: params.teamId,
      channelId: params.channelId,
      userId: params.slackUserId,
      eventId: params.externalEventId,
      eventTs: params.eventTs,
    },
  };

  const { data: job, error: jobError } = await supabase
    .from("agent_jobs")
    .insert({
      session_id: params.sessionId,
      user_id: params.userId,
      user_message_id: userMsg.id,
      mode: params.mode,
      source: "slack",
      status: "queued",
      request_payload: requestPayload,
    })
    .select("id, status, created_at")
    .single();

  if (jobError || !job) throw jobError ?? new Error("Failed to create Slack agent job.");
  await mirrorInsert(mirror, "agent_jobs", {
    id: job.id,
    session_id: params.sessionId,
    user_id: params.userId,
    user_message_id: userMsg.id,
    mode: params.mode,
    source: "slack",
    status: "queued",
    request_payload: requestPayload,
    created_at: job.created_at,
    updated_at: job.created_at,
  });

  const callbackSecret = Deno.env.get("AGENT_CALLBACK_SECRET");
  const webhookController = new AbortController();
  const webhookTimeout = setTimeout(() => webhookController.abort(), 15_000);

  try {
    const response = await fetch(AGENT_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(callbackSecret ? { "x-agent-callback-secret": callbackSecret } : {}),
      },
      body: JSON.stringify({
        user: params.displayName,
        input: params.input,
        sessionId: params.sessionId,
        mode: params.mode,
        jobId: job.id,
        userMessageId: userMsg.id,
        callbackUrl: requestPayload.callbackUrl,
        source: "slack",
        platform: "slack",
        slack: requestPayload.slack,
      }),
      signal: webhookController.signal,
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(`Failed to enqueue n8n job: HTTP ${response.status} ${responseText.slice(0, 240)}`);
    }
  } finally {
    clearTimeout(webhookTimeout);
  }

  const runningAt = new Date().toISOString();
  await supabase
    .from("agent_jobs")
    .update({ status: "running", updated_at: runningAt })
    .eq("id", job.id)
    .eq("status", "queued");
  await mirrorUpdate(mirror, "agent_jobs", { status: "running", updated_at: runningAt }, "id", job.id);

  return { jobId: job.id as string, userMessageId: userMsg.id as string };
};

const processSlackEvent = async (payload: SlackEventPayload) => {
  const supabase = buildServiceClient();
  const mirror = buildMirrorClient();

  const teamId = cleanString(payload.team_id);
  const event = payload.event;
  const externalEventId = cleanString(payload.event_id) ?? `${event?.channel ?? "unknown"}:${event?.ts ?? crypto.randomUUID()}`;

  if (!teamId || !isAllowedTeam(teamId)) {
    console.warn("[slack-agent-events] ignored event from unauthorized or missing team", { teamId });
    return;
  }

  const eventType = event?.type ?? payload.type ?? "unknown";
  const { data: existingEvent } = await supabase
    .from("external_chat_events")
    .select("id")
    .eq("platform", "slack")
    .eq("workspace_id", teamId)
    .eq("external_event_id", externalEventId)
    .maybeSingle();

  if (existingEvent) return;

  const { data: eventRow, error: eventError } = await supabase
    .from("external_chat_events")
    .insert({
      platform: "slack",
      workspace_id: teamId,
      external_event_id: externalEventId,
      event_type: eventType,
      status: "received",
      payload: payload as unknown as JsonRecord,
    })
    .select("id")
    .single();

  if (eventError || !eventRow) {
    if (eventError?.code !== "23505") {
      console.error("[slack-agent-events] failed to insert event row", eventError);
    }
    return;
  }

  await mirrorInsert(mirror, "external_chat_events", {
    id: eventRow.id,
    platform: "slack",
    workspace_id: teamId,
    external_event_id: externalEventId,
    event_type: eventType,
    status: "received",
    payload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  try {
    if (
      event?.type !== "message" ||
      event.channel_type !== "im" ||
      event.bot_id ||
      event.subtype ||
      !event.user ||
      !event.channel
    ) {
      await updateEvent(supabase, mirror, eventRow.id, { status: "ignored" });
      return;
    }

    const rawText = cleanString(event.text);
    if (!rawText) {
      await postSlackMessage(event.channel, "Send me a text question and I will ask Data Agent.");
      await updateEvent(supabase, mirror, eventRow.id, { status: "ignored" });
      return;
    }

    const slackUser = await getSlackUserInfo(event.user);
    const user = await resolveOrCreateUser(supabase, mirror, slackUser, teamId);
    const recentThread = await getMostRecentThread(supabase, teamId, event.channel, user.userId);
    const fallbackMode = recentThread?.mode ?? "ec";
    const parsed = parseModeAndInput(rawText, fallbackMode);

    if (!parsed.input) {
      await postSlackMessage(event.channel, "Please include a question after the mode. Example: `ec admissions yesterday by branch`.");
      await updateEvent(supabase, mirror, eventRow.id, { status: "ignored", user_id: user.userId });
      return;
    }

    if (isNewChatCommand(parsed.input)) {
      const sessionId = await createSession(supabase, mirror, user.userId, parsed.mode, `Slack DM: ${parsed.mode.toUpperCase()} chat`);
      await upsertThread(supabase, mirror, {
        platform: "slack",
        workspace_id: teamId,
        channel_id: event.channel,
        thread_key: event.channel,
        conversation_type: "dm",
        external_user_id: event.user,
        user_id: user.userId,
        session_id: sessionId,
        mode: parsed.mode,
        metadata: { reset_event_id: externalEventId },
        active: true,
      });
      await postSlackMessage(event.channel, `Started a new ${parsed.mode.toUpperCase()} Data Agent chat.`);
      await updateEvent(supabase, mirror, eventRow.id, { status: "completed", user_id: user.userId, session_id: sessionId });
      return;
    }

    const modeThread = parsed.explicitMode
      ? await getModeThread(supabase, teamId, event.channel, user.userId, parsed.mode)
      : recentThread;

    const sessionId = modeThread?.session_id ??
      await createSession(supabase, mirror, user.userId, parsed.mode, `Slack DM: ${parsed.input.slice(0, 50) || "New Chat"}`);

    await upsertThread(supabase, mirror, {
      platform: "slack",
      workspace_id: teamId,
      channel_id: event.channel,
      thread_key: event.channel,
      conversation_type: "dm",
      external_user_id: event.user,
      user_id: user.userId,
      session_id: sessionId,
      mode: parsed.mode,
      metadata: { last_event_id: externalEventId },
      active: true,
    });

    const enqueued = await enqueueAgent(supabase, mirror, {
      userId: user.userId,
      displayName: user.displayName,
      sessionId,
      mode: parsed.mode,
      input: parsed.input,
      channelId: event.channel,
      slackUserId: event.user,
      teamId,
      externalEventId,
      eventTs: event.ts ?? event.event_ts ?? null,
    });

    await updateEvent(supabase, mirror, eventRow.id, {
      status: "queued",
      user_id: user.userId,
      session_id: sessionId,
      user_message_id: enqueued.userMessageId,
      agent_job_id: enqueued.jobId,
    });
  } catch (error) {
    console.error("[slack-agent-events] processing failed", error);
    const message = error instanceof Error ? error.message : "Slack Data Agent failed.";
    await updateEvent(supabase, mirror, eventRow.id, {
      status: "failed",
      error: message,
    });

    if (event?.channel) {
      try {
        await postSlackMessage(event.channel, `Data Agent could not process that yet: ${message}`);
      } catch (slackError) {
        console.warn("[slack-agent-events] failed to deliver Slack error message", slackError);
      }
    }
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  const rawBody = await req.text();
  const verified = await verifySlackSignature(req, rawBody);
  if (!verified) return jsonResponse({ error: "invalid_slack_signature" }, 401);

  let payload: SlackEventPayload;
  try {
    payload = JSON.parse(rawBody) as SlackEventPayload;
  } catch {
    return jsonResponse({ error: "invalid_json" }, 400);
  }

  if (payload.type === "url_verification") {
    return textResponse(payload.challenge ?? "");
  }

  if (payload.type !== "event_callback") {
    return jsonResponse({ ok: true });
  }

  const edgeRuntime = (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (promise: Promise<unknown>) => void } }).EdgeRuntime;
  const processing = processSlackEvent(payload);
  if (edgeRuntime?.waitUntil) {
    edgeRuntime.waitUntil(processing);
  } else {
    await processing;
  }

  return jsonResponse({ ok: true });
});
