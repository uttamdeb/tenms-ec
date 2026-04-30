// 10MS Auth -> Supabase bridge.
// Frontend sends the PKCE code/verifier from the 10MS popup.
// We exchange it server-side for tokens + userinfo, then either find or create
// a Supabase auth user with that email and return a magiclink token hash that
// the browser exchanges for a real Supabase session via verifyOtp.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// 10MS OIDC endpoints (SDK defaults).
const TENMS_TOKEN_URL = "https://auth.10minuteschool.com/oauth/token";
const TENMS_USERINFO_URL = "https://auth.10minuteschool.com/oauth/userinfo";

interface BridgeRequest {
  code?: string;
  codeVerifier?: string;
  clientId?: string;
  redirectUri?: string;
}

interface TenMSTokens {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  user?: TenMSUser;
}

interface TenMSUser {
  sub: string;
  name?: string;
  email?: string;
  phone?: string;
  picture?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  let body: BridgeRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const { code, codeVerifier, clientId, redirectUri } = body;
  if (!code || !codeVerifier || !clientId || !redirectUri) {
    return json(
      { error: "missing_fields", required: ["code", "codeVerifier", "clientId", "redirectUri"] },
      400,
    );
  }

  // 1. Exchange the authorization code for tokens (server-side).
  let tokens: TenMSTokens;
  try {
    const form = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      code_verifier: codeVerifier,
      client_id: clientId,
      redirect_uri: redirectUri,
    });
    const tokenRes = await fetch(TENMS_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error("[tenms-auth-bridge] token exchange failed", tokenRes.status, text);
      return json({ error: "token_exchange_failed", status: tokenRes.status, detail: text }, 400);
    }
    tokens = await tokenRes.json();
  } catch (e) {
    console.error("[tenms-auth-bridge] token exchange error", e);
    return json({ error: "token_exchange_error", detail: String(e) }, 500);
  }

  // 2. Get userinfo (use embedded user if present, else fetch).
  let user: TenMSUser | undefined = tokens.user;
  if (!user) {
    try {
      const uRes = await fetch(TENMS_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (!uRes.ok) {
        const text = await uRes.text();
        console.error("[tenms-auth-bridge] userinfo failed", uRes.status, text);
        return json({ error: "userinfo_failed", status: uRes.status, detail: text }, 400);
      }
      user = await uRes.json();
    } catch (e) {
      console.error("[tenms-auth-bridge] userinfo error", e);
      return json({ error: "userinfo_error", detail: String(e) }, 500);
    }
  }

  if (!user?.email) {
    return json({ error: "no_email_from_provider" }, 400);
  }
  const email = user.email.toLowerCase();
  const fullName = user.name ?? email.split("@")[0];
  const avatarUrl = user.picture ?? null;
  const tenmsSub = user.sub;

  // 3. Admin client.
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "server_misconfigured" }, 500);
  }
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 4. Find existing user by email (link by email per product decision).
  let existingUserId: string | null = null;
  try {
    // Paginate listUsers to find by email. For most workspaces page 1 is enough.
    let page = 1;
    const perPage = 200;
    while (page <= 25) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const match = data.users.find((u) => u.email?.toLowerCase() === email);
      if (match) {
        existingUserId = match.id;
        break;
      }
      if (data.users.length < perPage) break;
      page++;
    }
  } catch (e) {
    console.error("[tenms-auth-bridge] listUsers failed", e);
    return json({ error: "user_lookup_failed", detail: String(e) }, 500);
  }

  // 5. Create or update the user.
  let userId = existingUserId;
  if (!userId) {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        avatar_url: avatarUrl,
        tenms_sub: tenmsSub,
        provider: "tenms",
      },
    });
    if (createErr || !created.user) {
      console.error("[tenms-auth-bridge] createUser failed", createErr);
      return json({ error: "create_user_failed", detail: createErr?.message }, 500);
    }
    userId = created.user.id;
  } else {
    // Merge metadata so we keep tenms_sub on the existing account.
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: fullName,
        avatar_url: avatarUrl,
        tenms_sub: tenmsSub,
      },
    });
  }

  // 6. Mint a magiclink the browser can immediately verify to create a session.
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkErr || !linkData?.properties?.hashed_token) {
    console.error("[tenms-auth-bridge] generateLink failed", linkErr);
    return json({ error: "generate_link_failed", detail: linkErr?.message }, 500);
  }

  // 7. Best-effort: keep the profiles row in sync (handle_new_user handles inserts).
  try {
    await admin
      .from("profiles")
      .update({ full_name: fullName, avatar_url: avatarUrl, email })
      .eq("id", userId);
  } catch (e) {
    console.warn("[tenms-auth-bridge] profile sync failed (non-fatal)", e);
  }

  return json({
    token_hash: linkData.properties.hashed_token,
    type: "magiclink",
    email,
    user_id: userId,
  });
});
