// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This code runs at the Edge via Supabase Edge Functions / Cloudflare Workers

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { streamUrl, userId } = await req.json();

    if (!streamUrl) {
      return new Response(
        JSON.stringify({ error: "Missing streamUrl parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const signingSecret = Deno.env.get("STREAM_SIGNING_SECRET") || "cuddlecast_edge_secret_key_2026";
    const ttlSeconds = 3600; // 1 hour token validity
    const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;

    // HMAC-SHA256 Token calculation
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(signingSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const payload = `${streamUrl}|${userId || "anon"}|${expiresAt}`;
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload)
    );

    const signatureHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, 32);

    const token = `${expiresAt}.${signatureHex}`;
    const signedUrl = new URL(streamUrl);
    signedUrl.searchParams.set("token", token);
    signedUrl.searchParams.set("exp", expiresAt.toString());

    return new Response(
      JSON.stringify({
        signedUrl: signedUrl.toString(),
        token,
        expiresAt,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
