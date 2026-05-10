import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const buildServiceClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, serviceRoleKey);
};

const buildUserClient = (authHeader: string) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
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
  payload: Record<string, unknown>,
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
  id: string,
) => {
  if (!mirror) return;

  const { error } = await mirror.from(table).update(payload).eq("id", id);
  if (error) {
    console.warn(`[mirror] update ${table} failed:`, error.message);
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const userSupabase = buildUserClient(authHeader);
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { dashboardId, mode, filters } = await req.json();
    if (!dashboardId || typeof dashboardId !== "string") {
      return jsonResponse({ error: "Missing required field: dashboardId" }, 400);
    }

    const supabase = buildServiceClient();
    const mirror = buildMirrorClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "BI") {
      return jsonResponse({ error: "Dashboards are only available to BI users" }, 403);
    }

    const { data: dashboard, error: dashboardError } = await supabase
      .from("dashboards")
      .select("id, user_id, mode, filters, archived_at")
      .eq("id", dashboardId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (dashboardError || !dashboard || dashboard.archived_at) {
      return jsonResponse({ error: "Dashboard not found" }, 404);
    }

    if (mode && mode !== dashboard.mode) {
      return jsonResponse({ error: "Dashboard mode mismatch" }, 400);
    }

    const { data: elements, error: elementsError } = await supabase
      .from("dashboard_elements")
      .select("id, query_config")
      .eq("dashboard_id", dashboard.id)
      .eq("user_id", user.id);

    if (elementsError) {
      console.error("Failed to load dashboard elements:", elementsError);
      return jsonResponse({ error: "Failed to load dashboard elements" }, 500);
    }

    const refreshableElementIds = (elements ?? [])
      .filter((element) => {
        const queryConfig = element.query_config;
        return Boolean(
          queryConfig &&
          typeof queryConfig === "object" &&
          !Array.isArray(queryConfig) &&
          (queryConfig as Record<string, unknown>).refreshable === true,
        );
      })
      .map((element) => element.id);

    const now = new Date().toISOString();
    const { data: job, error: jobError } = await supabase
      .from("dashboard_refresh_jobs")
      .insert({
        dashboard_id: dashboard.id,
        user_id: user.id,
        mode: dashboard.mode,
        status: "running",
        filters: filters ?? dashboard.filters ?? {},
        element_ids: refreshableElementIds,
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (jobError || !job) {
      console.error("Failed to create dashboard refresh job:", jobError);
      return jsonResponse({ error: "Failed to create dashboard refresh job" }, 500);
    }

    await mirrorInsert(mirror, "dashboard_refresh_jobs", job as Record<string, unknown>);

    const completedAt = new Date().toISOString();
    const completionPayload = {
      status: "completed",
      completed_at: completedAt,
      updated_at: completedAt,
      error: refreshableElementIds.length === 0
        ? "No refreshable dashboard elements yet. Newly pinned chat artifacts remain static until n8n returns structured query runs."
        : null,
    };

    const { error: completeError } = await supabase
      .from("dashboard_refresh_jobs")
      .update(completionPayload)
      .eq("id", job.id);

    if (completeError) {
      console.error("Failed to complete dashboard refresh job:", completeError);
      return jsonResponse({ error: "Failed to complete dashboard refresh job" }, 500);
    }

    await mirrorUpdate(mirror, "dashboard_refresh_jobs", completionPayload, job.id);

    return jsonResponse({
      ok: true,
      jobId: job.id,
      refreshed: 0,
      refreshableElements: refreshableElementIds.length,
      message: refreshableElementIds.length === 0
        ? "No refreshable elements yet. Pinned chat artifacts are saved and will refresh once structured n8n query runs are available."
        : "Dashboard refresh job recorded. Query rerun support will use these element IDs.",
    });
  } catch (error) {
    console.error("Dashboard refresh error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
