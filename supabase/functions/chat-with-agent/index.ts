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
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { user, input, sessionId, attachments, mode } = await req.json();

    if (!user || !input || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user, input, sessionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const webhookBody: Record<string, unknown> = { user, input, sessionId };
    if (mode) {
      webhookBody.mode = mode;
    }
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      webhookBody.attachments = attachments;
    }

    const webhookController = new AbortController();
    const webhookTimeout = setTimeout(() => webhookController.abort(), 115_000); // 115 s — under client's 120 s guard

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

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error calling webhook:', error);
    const isTimeout = error instanceof DOMException && error.name === 'AbortError';
    return new Response(
      JSON.stringify({ error: isTimeout ? 'The request timed out after 115 seconds. Please try again.' : 'Internal server error' }),
      { status: isTimeout ? 504 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
