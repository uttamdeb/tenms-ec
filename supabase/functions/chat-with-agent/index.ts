import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const WEBHOOK_URL = "https://n8n-prod.10minuteschool.com/webhook/ec-data-agent";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Auth client — uses the caller's JWT for auth check
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: authUser }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { user, input, sessionId, attachments } = await req.json();

    if (!user || !input || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user, input, sessionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Service-role client — used to write results back to the DB (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const webhookBody: Record<string, unknown> = { user, input, sessionId };
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      webhookBody.attachments = attachments;
    }

    // --- Fire the webhook, write result to DB (runs in background) ---
    const backgroundTask = (async () => {
      try {
        const webhookController = new AbortController();
        const webhookTimeout = setTimeout(() => webhookController.abort(), 175_000);

        let response: Response;
        try {
          response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookBody),
            signal: webhookController.signal,
          });
        } finally {
          clearTimeout(webhookTimeout);
        }

        const responseText = await response.text();
        let result;
        try {
          result = JSON.parse(responseText);
        } catch {
          result = { output: responseText };
        }

        const responseData = Array.isArray(result) ? result[0] : result;
        const assistantContent = responseData?.output || responseData?.message || responseData?.response || JSON.stringify(responseData);

        // Write assistant message to DB
        const { data: assistantMsg, error: insertErr } = await supabaseAdmin
          .from("chat_messages")
          .insert({
            session_id: sessionId,
            user_id: authUser.id,
            role: "assistant",
            content: assistantContent,
          })
          .select()
          .single();

        if (insertErr) {
          console.error("Failed to insert assistant message:", insertErr);
          return;
        }

        // Write SQL run data if present
        if (responseData?.executed_sql && responseData?.bq_result) {
          const bqResultStr = typeof responseData.bq_result === 'string'
            ? responseData.bq_result
            : JSON.stringify(responseData.bq_result);
          await supabaseAdmin.from("agent_sql_runs").insert({
            message_id: assistantMsg.id,
            executed_sql: responseData.executed_sql,
            bq_result: bqResultStr,
          });
        }

        // Update session timestamp
        await supabaseAdmin
          .from("chat_sessions")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", sessionId);

        console.log("Background webhook task completed successfully");
      } catch (err) {
        console.error("Background webhook task failed:", err);
        // Write an error message so the client knows something went wrong
        await supabaseAdmin
          .from("chat_messages")
          .insert({
            session_id: sessionId,
            user_id: authUser.id,
            role: "assistant",
            content: "Sorry, something went wrong while processing your request. Please try again.",
          });
      }
    })();

    // Keep the Deno isolate alive until the background task finishes,
    // but return the HTTP response immediately so Cloudflare doesn't time out.
    // @ts-ignore — EdgeRuntime.waitUntil is available on Supabase Edge Functions (Deno Deploy)
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(backgroundTask);
    } else {
      // Fallback: just let the promise float — isolate stays alive until it resolves
      backgroundTask.catch((e) => console.error("Unhandled background error:", e));
    }

    // Respond instantly — the client will poll chat_messages for the result
    return new Response(
      JSON.stringify({ status: "processing" }),
      { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat-with-agent:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
