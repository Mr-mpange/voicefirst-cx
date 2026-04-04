import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
  "X-TTS-Fallback": "browser",
};

function fallbackResponse(reason: string, providerStatus?: number) {
  return new Response(
    JSON.stringify({
      audioAvailable: false,
      fallbackToBrowser: true,
      reason,
      ...(providerStatus ? { providerStatus } : {}),
    }),
    {
      status: 200,
      headers: jsonHeaders,
    }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const voiceId =
      typeof body?.voiceId === "string" && body.voiceId.trim()
        ? body.voiceId.trim()
        : "EXAVITQu4vr4xnSDxMaL";

    if (!text) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      console.warn("ELEVENLABS_API_KEY not configured, returning browser fallback response");
      return fallbackResponse("Hosted TTS is not configured");
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(
        `ElevenLabs rejected the TTS request [${response.status}], returning browser fallback response: ${errorText}`
      );
      return fallbackResponse("Hosted TTS provider unavailable", response.status);
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.warn("TTS request failed, returning browser fallback response:", message);
    return fallbackResponse("Hosted TTS request failed");
  }
});
