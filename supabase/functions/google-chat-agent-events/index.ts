import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const AGENT_WEBHOOK_URL =
  Deno.env.get("N8N_AGENT_WEBHOOK_URL") ?? "https://n8n-prod.10minuteschool.com/webhook/ec-data-agent";
const GOOGLE_CHAT_ISSUER = "chat@system.gserviceaccount.com";
const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

type JsonRecord = Record<string, unknown>;
type ChatMode = "ec" | "10ms";

type GoogleChatUser = {
  name?: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
  domainId?: string;
  type?: string;
};

type GoogleChatSpace = {
  name?: string;
  type?: string;
  displayName?: string;
  singleUserBotDm?: boolean;
};

type GoogleChatMessage = {
  name?: string;
  text?: string;
  argumentText?: string;
  sender?: GoogleChatUser;
  space?: GoogleChatSpace;
  thread?: {
    name?: string;
    threadKey?: string;
  };
};

type GoogleChatEvent = {
  type?: string;
  eventTime?: string;
  threadKey?: string;
  user?: GoogleChatUser;
  space?: GoogleChatSpace;
  message?: GoogleChatMessage;
};

type GoogleJwk = JsonWebKey & {
  kid?: string;
  alg?: string;
  use?: string;
};

let googleJwksCache: { keys: GoogleJwk[]; expiresAt: number } | null = null;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

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

  if (!mirrorUrl || !mirrorKey) return null;
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

const base64UrlToBytes = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const base64UrlToJson = (value: string) => JSON.parse(textDecoder.decode(base64UrlToBytes(value)));

const getGoogleJwks = async () => {
  if (googleJwksCache && googleJwksCache.expiresAt > Date.now()) {
    return googleJwksCache.keys;
  }

  const response = await fetch(GOOGLE_JWKS_URL);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(payload.keys)) {
    throw new Error("Failed to fetch Google verification keys.");
  }

  const cacheControl = response.headers.get("cache-control") ?? "";
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] ?? 300);
  googleJwksCache = {
    keys: payload.keys as GoogleJwk[],
    expiresAt: Date.now() + maxAge * 1000,
  };
  return googleJwksCache.keys;
};

const verifyGoogleChatRequest = async (req: Request) => {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return false;

  const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) return false;

  const header = base64UrlToJson(encodedHeader) as JsonRecord;
  if (header.alg !== "RS256" || typeof header.kid !== "string") return false;

  const jwk = (await getGoogleJwks()).find((key) => key.kid === header.kid);
  if (!jwk) return false;

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    base64UrlToBytes(encodedSignature),
    textEncoder.encode(`${encodedHeader}.${encodedPayload}`),
  );
  if (!verified) return false;

  const claims = base64UrlToJson(encodedPayload) as JsonRecord;
  const audience = Deno.env.get("GOOGLE_CHAT_REQUEST_AUDIENCE") ??
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/google-chat-agent-events`;
  const now = Math.floor(Date.now() / 1000);
  const issuer = claims.iss;
  const email = claims.email;
  const exp = Number(claims.exp);
  const iat = Number(claims.iat);

  return (
    (issuer === "https://accounts.google.com" || issuer === "accounts.google.com") &&
    claims.aud === audience &&
    email === GOOGLE_CHAT_ISSUER &&
    Number.isFinite(exp) &&
    exp > now - 60 &&
    (!Number.isFinite(iat) || iat < now + 300)
  );
};

const stripGoogleChatMentions = (text: string) =>
  text.replace(/<users\/[^>]+>/g, "").replace(/\s+/g, " ").trim();

const getEventUser = (payload: GoogleChatEvent) => payload.user ?? payload.message?.sender ?? {};

const getEventSpace = (payload: GoogleChatEvent) => payload.space ?? payload.message?.space ?? {};

const getMessageInput = (payload: GoogleChatEvent) => {
  const text = cleanString(payload.message?.argumentText) ?? cleanString(payload.message?.text);
  return text ? stripGoogleChatMentions(text) : null;
};

const getWorkspaceId = (email: string | null, user: GoogleChatUser) =>
  cleanString(user.domainId) ?? email?.split("@")[1] ?? "google_chat";

const isAllowedDomain = (email: string | null) => {
  const allowedDomains = (Deno.env.get("GOOGLE_CHAT_ALLOWED_DOMAIN") ?? "")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);

  if (allowedDomains.length === 0) return true;
  const domain = email?.split("@")[1];
  return Boolean(domain && allowedDomains.includes(domain));
};

const parseModeAndInput = (text: string, fallbackMode: ChatMode): { mode: ChatMode; input: string; explicitMode: boolean } => {
  const cleaned = text.trim();
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
  googleUser: GoogleChatUser,
  workspaceId: string,
) => {
  const email = normalizeEmail(googleUser.email);
  if (!email) {
    throw new Error("Google Chat did not provide your email address to this app.");
  }
  if (!isAllowedDomain(email)) {
    throw new Error("This Google Chat app is currently limited to approved 10MS domains.");
  }

  const displayName = cleanString(googleUser.displayName) ?? email.split("@")[0];
  const avatarUrl = cleanString(googleUser.avatarUrl);

  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .order("created_at", { ascending: false })
    .limit(1)
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
        provider: "google_chat",
        google_chat_workspace_id: workspaceId,
        google_chat_user_id: googleUser.name,
      },
    });
    if (createError || !created.user) {
      throw createError ?? new Error("Failed to create Supabase user for Google Chat identity.");
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
    platform: "google_chat",
    workspace_id: workspaceId,
    external_user_id: cleanString(googleUser.name) ?? email,
    user_id: userId,
    email,
    display_name: displayName,
    avatar_url: avatarUrl,
    metadata: {
      google_user_name: googleUser.name ?? null,
      google_user_type: googleUser.type ?? null,
    },
  };
  const { error: identityError } = await supabase
    .from("external_chat_identities")
    .upsert(identityPayload, { onConflict: "platform,workspace_id,external_user_id" });
  if (identityError) throw identityError;
  await mirrorUpsert(mirror, "external_chat_identities", identityPayload, "platform,workspace_id,external_user_id");

  return {
    userId,
    email,
    displayName,
    avatarUrl,
    externalUserId: identityPayload.external_user_id,
  };
};

const getMostRecentThread = async (
  supabase: ReturnType<typeof buildServiceClient>,
  workspaceId: string,
  spaceName: string,
  threadKey: string,
  userId: string,
) => {
  const { data, error } = await supabase
    .from("external_chat_threads")
    .select("session_id, mode")
    .eq("platform", "google_chat")
    .eq("workspace_id", workspaceId)
    .eq("channel_id", spaceName)
    .eq("thread_key", threadKey)
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
  spaceName: string,
  threadKey: string,
  userId: string,
  mode: ChatMode,
) => {
  const { data, error } = await supabase
    .from("external_chat_threads")
    .select("session_id, mode")
    .eq("platform", "google_chat")
    .eq("workspace_id", workspaceId)
    .eq("channel_id", spaceName)
    .eq("thread_key", threadKey)
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
      source: "google_chat",
    })
    .select("id, user_id, title, mode, status, source, created_at, updated_at")
    .single();

  if (error || !data) throw error ?? new Error("Failed to create Google Chat session.");
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

  if (error || !data) throw error ?? new Error("Failed to upsert Google Chat thread mapping.");
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
    spaceName: string;
    threadName: string | null;
    threadKey: string;
    workspaceId: string;
    externalUserId: string;
    externalEventId: string;
    eventTime: string | null;
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
      source: "google_chat",
    })
    .select("*")
    .single();

  if (messageError || !userMsg) throw messageError ?? new Error("Failed to save Google Chat user message.");
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
    source: "google_chat",
    platform: "google_chat",
    userMessageId: userMsg.id,
    callbackUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/chat-with-agent/callback`,
    googleChat: {
      workspaceId: params.workspaceId,
      spaceName: params.spaceName,
      threadName: params.threadName,
      threadKey: params.threadKey,
      userId: params.externalUserId,
      eventId: params.externalEventId,
      eventTime: params.eventTime,
    },
  };

  const { data: job, error: jobError } = await supabase
    .from("agent_jobs")
    .insert({
      session_id: params.sessionId,
      user_id: params.userId,
      user_message_id: userMsg.id,
      mode: params.mode,
      source: "google_chat",
      status: "queued",
      request_payload: requestPayload,
    })
    .select("id, status, created_at")
    .single();

  if (jobError || !job) throw jobError ?? new Error("Failed to create Google Chat agent job.");
  await mirrorInsert(mirror, "agent_jobs", {
    id: job.id,
    session_id: params.sessionId,
    user_id: params.userId,
    user_message_id: userMsg.id,
    mode: params.mode,
    source: "google_chat",
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
        source: "google_chat",
        platform: "google_chat",
        googleChat: requestPayload.googleChat,
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

const processGoogleChatMessage = async (payload: GoogleChatEvent, input: string) => {
  const supabase = buildServiceClient();
  const mirror = buildMirrorClient();
  const googleUser = getEventUser(payload);
  const space = getEventSpace(payload);
  const email = normalizeEmail(googleUser.email);
  const workspaceId = getWorkspaceId(email, googleUser);
  const spaceName = cleanString(space.name);
  const threadName = cleanString(payload.message?.thread?.name);
  const threadKey = cleanString(payload.threadKey) ?? cleanString(payload.message?.thread?.threadKey) ?? threadName ?? spaceName;
  const externalUserId = cleanString(googleUser.name) ?? email;
  const externalEventId = cleanString(payload.message?.name) ??
    `${spaceName ?? "space"}:${payload.eventTime ?? new Date().toISOString()}:${externalUserId ?? crypto.randomUUID()}`;

  if (!spaceName || !threadKey || !externalUserId) {
    throw new Error("Google Chat event is missing space, thread, or user identifiers.");
  }

  const eventType = payload.type ?? "unknown";
  const { data: existingEvent } = await supabase
    .from("external_chat_events")
    .select("id")
    .eq("platform", "google_chat")
    .eq("workspace_id", workspaceId)
    .eq("external_event_id", externalEventId)
    .maybeSingle();
  if (existingEvent) return;

  const { data: eventRow, error: eventError } = await supabase
    .from("external_chat_events")
    .insert({
      platform: "google_chat",
      workspace_id: workspaceId,
      external_event_id: externalEventId,
      event_type: eventType,
      status: "received",
      payload: payload as unknown as JsonRecord,
    })
    .select("id")
    .single();

  if (eventError || !eventRow) {
    if (eventError?.code !== "23505") {
      console.error("[google-chat-agent-events] failed to insert event row", eventError);
    }
    return;
  }

  await mirrorInsert(mirror, "external_chat_events", {
    id: eventRow.id,
    platform: "google_chat",
    workspace_id: workspaceId,
    external_event_id: externalEventId,
    event_type: eventType,
    status: "received",
    payload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  try {
    const user = await resolveOrCreateUser(supabase, mirror, googleUser, workspaceId);
    const recentThread = await getMostRecentThread(supabase, workspaceId, spaceName, threadKey, user.userId);
    const fallbackMode = recentThread?.mode ?? "ec";
    const parsed = parseModeAndInput(input, fallbackMode);

    if (!parsed.input) {
      await updateEvent(supabase, mirror, eventRow.id, { status: "ignored", user_id: user.userId });
      return;
    }

    if (isNewChatCommand(parsed.input)) {
      const sessionId = await createSession(supabase, mirror, user.userId, parsed.mode, `Google Chat: ${parsed.mode.toUpperCase()} chat`);
      await upsertThread(supabase, mirror, {
        platform: "google_chat",
        workspace_id: workspaceId,
        channel_id: spaceName,
        thread_key: threadKey,
        conversation_type: space.singleUserBotDm || space.type === "DM" ? "dm" : space.type === "GROUP_CHAT" ? "group" : "channel",
        external_user_id: user.externalUserId,
        user_id: user.userId,
        session_id: sessionId,
        mode: parsed.mode,
        metadata: {
          reset_event_id: externalEventId,
          thread_name: threadName,
          space_type: space.type ?? null,
        },
        active: true,
      });
      await updateEvent(supabase, mirror, eventRow.id, { status: "completed", user_id: user.userId, session_id: sessionId });
      return;
    }

    const modeThread = parsed.explicitMode
      ? await getModeThread(supabase, workspaceId, spaceName, threadKey, user.userId, parsed.mode)
      : recentThread;

    const sessionId = modeThread?.session_id ??
      await createSession(supabase, mirror, user.userId, parsed.mode, `Google Chat: ${parsed.input.slice(0, 50) || "New Chat"}`);

    await upsertThread(supabase, mirror, {
      platform: "google_chat",
      workspace_id: workspaceId,
      channel_id: spaceName,
      thread_key: threadKey,
      conversation_type: space.singleUserBotDm || space.type === "DM" ? "dm" : space.type === "GROUP_CHAT" ? "group" : "channel",
      external_user_id: user.externalUserId,
      user_id: user.userId,
      session_id: sessionId,
      mode: parsed.mode,
      metadata: {
        last_event_id: externalEventId,
        thread_name: threadName,
        space_type: space.type ?? null,
      },
      active: true,
    });

    const enqueued = await enqueueAgent(supabase, mirror, {
      userId: user.userId,
      displayName: user.displayName,
      sessionId,
      mode: parsed.mode,
      input: parsed.input,
      spaceName,
      threadName,
      threadKey,
      workspaceId,
      externalUserId: user.externalUserId,
      externalEventId,
      eventTime: payload.eventTime ?? null,
    });

    await updateEvent(supabase, mirror, eventRow.id, {
      status: "queued",
      user_id: user.userId,
      session_id: sessionId,
      user_message_id: enqueued.userMessageId,
      agent_job_id: enqueued.jobId,
    });
  } catch (error) {
    console.error("[google-chat-agent-events] processing failed", error);
    await updateEvent(supabase, mirror, eventRow.id, {
      status: "failed",
      error: error instanceof Error ? error.message : "Google Chat Data Agent failed.",
    });
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    const verified = await verifyGoogleChatRequest(req);
    if (!verified) return jsonResponse({ error: "invalid_google_chat_token" }, 401);

    const payload = await req.json() as GoogleChatEvent;

    if (payload.type === "ADDED_TO_SPACE") {
      return jsonResponse({ text: "10MS Data Agent is ready. DM me or ask a question with `ec` or `10ms` first." });
    }

    if (payload.type !== "MESSAGE") {
      return jsonResponse({});
    }

    const input = getMessageInput(payload);
    const user = getEventUser(payload);
    const email = normalizeEmail(user.email);
    if (!email) {
      return jsonResponse({ text: "I need access to your Google Workspace email before I can create a Data Agent session." });
    }
    if (!isAllowedDomain(email)) {
      return jsonResponse({ text: "This Data Agent is currently limited to approved 10MS domains." });
    }
    if (!input) {
      return jsonResponse({ text: "Send me a data question. Example: `ec revenue today`" });
    }

    const edgeRuntime = (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (promise: Promise<unknown>) => void } }).EdgeRuntime;
    const processing = processGoogleChatMessage(payload, input);
    if (edgeRuntime?.waitUntil) {
      edgeRuntime.waitUntil(processing);
    } else {
      await processing;
    }

    const parsed = parseModeAndInput(input, "ec");
    if (isNewChatCommand(parsed.input)) {
      return jsonResponse({ text: `Started a new ${parsed.mode.toUpperCase()} Data Agent chat.` });
    }

    return jsonResponse({ text: "Data Agent is checking the data..." });
  } catch (error) {
    console.error("[google-chat-agent-events] request failed", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
