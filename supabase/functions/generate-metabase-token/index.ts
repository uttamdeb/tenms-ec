import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { create } from "https://deno.land/x/djwt@v3.0.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const METABASE_SITE_URL = "https://bi.10minuteschool.com";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const secretKey = Deno.env.get('METABASE_SECRET_KEY');
    
    if (!secretKey) {
      console.error('METABASE_SECRET_KEY not found');
      throw new Error('Metabase secret key not configured');
    }

    // Parse request body to get theme and params
    const { theme, params } = await req.json().catch(() => ({ theme: 'light', params: {} }));
    const isDarkMode = theme === 'dark';

    // Create the key for signing
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );

    // Create JWT payload with 10 minute expiration and params for dashboard filters
    const payload = {
      resource: { dashboard: 332 },
      params: params || {},
      exp: Math.round(Date.now() / 1000) + (10 * 60), // 10 minute expiration
      iat: Math.round(Date.now() / 1000),
    };

    // Sign the token
    const token = await create({ alg: "HS256", typ: "JWT" }, payload, key);
    
    // Generate iframe URL with proper theme
    const themeParam = isDarkMode ? 'theme=night&' : '';
    const iframeUrl = `${METABASE_SITE_URL}/embed/dashboard/${token}#${themeParam}bordered=true&titled=true`;

    console.log(`Generated Metabase embed URL successfully (${isDarkMode ? 'dark' : 'light'} mode), params:`, params);

    return new Response(
      JSON.stringify({ iframeUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error generating Metabase token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
