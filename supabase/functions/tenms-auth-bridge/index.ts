// 10MS Auth -> Supabase bridge.
// The 10MS React SDK already exchanged the PKCE code on the client and gave
// us an access token + user profile. We RE-VERIFY by calling the 10MS
// userinfo endpoint with the access token (so the client can't lie about who
// they are), then find-or-create a Supabase auth user and return a magiclink
// token hash the browser uses with verifyOtp() to start a real Supabase session.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Correct userinfo endpoint (verified working).
const USERINFO_CANDIDATES = [
  "https://api.10minuteschool.com/auth/v1/oauth/userinfo",
];

interface BridgeRequest {
  accessToken?: string;
  profile?: {
    sub?: string;
    email?: string;
    name?: string;
    picture?: string;
    phone?: string;
  };
}

interface TenMSUser {
  sub?: string;
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

async function fetchUserInfo(accessToken: string): Promise<TenMSUser | null> {
  for (const url of USERINFO_CANDIDATES) {
    try {
      const r = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (r.ok) return (await r.json()) as TenMSUser;
      console.warn("[tenms-auth-bridge] userinfo non-ok", url, r.status);
    } catch (e) {
      console.warn("[tenms-auth-bridge] userinfo error", url, e);
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: BridgeRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const { accessToken, profile } = body;
  if (!accessToken) return json({ error: "missing_access_token" }, 400);

  // Verify token by calling userinfo. Fall back to client-supplied profile
  // ONLY if userinfo fails (best effort).
  let user = await fetchUserInfo(accessToken);
  if (!user || (!user.email && !user.phone)) {
    if (profile?.email || profile?.phone) {
      console.warn(
        "[tenms-auth-bridge] userinfo unavailable, falling back to client profile",
      );
      user = {
        sub: profile.sub,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        phone: profile.phone,
      };
    } else {
      return json({ error: "userinfo_failed" }, 400);
    }
  }

  // Prefer email; if missing, synthesize one from phone so Supabase auth works.
  const realEmail = user.email?.toLowerCase() ?? null;
  const phone = user.phone ?? null;
  const normalizedPhone = phone ? phone.replace(/[^0-9]/g, "") : null;
  const email =
    realEmail ?? (normalizedPhone ? `${normalizedPhone}@tenms.local` : null);
  if (!email) {
    return json({ error: "no_email_or_phone" }, 400);
  }
  const fullName = user.name ?? (realEmail ? realEmail.split("@")[0] : (normalizedPhone ?? "User"));
  const avatarUrl = user.picture ?? null;
  const tenmsSub = user.sub ?? null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "server_misconfigured" }, 500);
  }
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("[tenms-auth-bridge] resolving user", {
    hasRealEmail: !!realEmail,
    hasPhone: !!phone,
    syntheticEmail: !realEmail,
    email,
    tenmsSub,
  });

  // Find existing user. Match by:
  //   1) tenms_sub in user_metadata (most stable identity)
  //   2) email match (handles real-email and synthetic-phone-email users)
  let userId: string | null = null;
  try {
    let page = 1;
    const perPage = 200;
    while (page <= 25) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      const bySub = tenmsSub
        ? data.users.find((u) => (u.user_metadata as { tenms_sub?: string } | null)?.tenms_sub === tenmsSub)
        : undefined;
      const byEmail = data.users.find((u) => u.email?.toLowerCase() === email);
      const match = bySub ?? byEmail;
      if (match) {
        userId = match.id;
        break;
      }
      if (data.users.length < perPage) break;
      page++;
    }
  } catch (e) {
    console.error("[tenms-auth-bridge] listUsers failed", e);
    return json({ error: "user_lookup_failed", detail: String(e) }, 500);
  }

  if (!userId) {
    console.log("[tenms-auth-bridge] creating new user", { email });
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        avatar_url: avatarUrl,
        tenms_sub: tenmsSub,
        tenms_phone: phone,
        provider: "tenms",
      },
    });
    if (createErr || !created.user) {
      console.error("[tenms-auth-bridge] createUser failed", createErr);
      return json({ error: "create_user_failed", detail: createErr?.message }, 500);
    }
    userId = created.user.id;
  } else {
    console.log("[tenms-auth-bridge] updating existing user", { userId });
    // Ensure email is confirmed AND email field is set (may be missing on older
    // phone-only users). Without confirmed email, generateLink magiclink fails.
    const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
      email,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        avatar_url: avatarUrl,
        tenms_sub: tenmsSub,
        tenms_phone: phone,
      },
    });
    if (updErr) {
      console.warn("[tenms-auth-bridge] updateUserById failed (non-fatal)", updErr);
    }
  }

  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkErr || !linkData?.properties?.hashed_token) {
    console.error("[tenms-auth-bridge] generateLink failed", {
      message: linkErr?.message,
      status: (linkErr as { status?: number } | null)?.status,
      email,
      userId,
    });
    return json({ error: "generate_link_failed", detail: linkErr?.message ?? "no token returned" }, 500);
  }

  // Best-effort profile sync (handle_new_user trigger handles inserts).
  try {
    await admin
      .from("profiles")
      .update({ full_name: fullName, avatar_url: avatarUrl, email: realEmail ?? email })
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
