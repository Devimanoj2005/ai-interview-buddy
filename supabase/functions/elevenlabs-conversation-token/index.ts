import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    
    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY is not configured");
      throw new Error("ElevenLabs API key is not configured");
    }

    const { agentId, interviewConfig } = await req.json();
    
    if (!agentId) {
      throw new Error("Agent ID is required");
    }

    console.log("Requesting conversation credentials for agent:", agentId);
    console.log("Interview config:", interviewConfig);

    let token: string | null = null;
    let signedUrl: string | null = null;

    // Prefer WebRTC token (recommended by ElevenLabs)
    try {
      const tokenRes = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agentId}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
          },
        }
      );

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        token = tokenData?.token ?? null;
        console.log("Got WebRTC token successfully");
      } else {
        const errorText = await tokenRes.text();
        console.warn("Token endpoint failed:", tokenRes.status, errorText);
      }
    } catch (e) {
      console.warn("Token endpoint threw:", e);
    }

    // Fallback to signed URL (WebSocket)
    if (!token) {
      const signedRes = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
        {
          method: "GET",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
          },
        }
      );

      if (!signedRes.ok) {
        const errorText = await signedRes.text();
        console.error("ElevenLabs API error:", signedRes.status, errorText);
        throw new Error(`ElevenLabs API error: ${signedRes.status}`);
      }

      const signedData = await signedRes.json();
      signedUrl = signedData?.signed_url ?? null;
      console.log("Got signed URL successfully");
    }

    if (!token && !signedUrl) {
      throw new Error("Failed to obtain conversation token or signed URL");
    }

    return new Response(
      JSON.stringify({ token, signed_url: signedUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in elevenlabs-conversation-token:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
