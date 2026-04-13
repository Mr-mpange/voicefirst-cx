import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Status = "healthy" | "warning" | "critical";

interface ServiceResult {
  name: string;
  status: Status;
  latencyMs: number;
  detail?: string;
}

async function checkDatabase(): Promise<ServiceResult> {
  const start = Date.now();
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(url, key);
    const { error } = await sb.from("conversations").select("id").limit(1);
    const latencyMs = Date.now() - start;
    if (error) return { name: "Database", status: "critical", latencyMs, detail: error.message };
    return { name: "Database", status: latencyMs > 2000 ? "warning" : "healthy", latencyMs };
  } catch (e) {
    return { name: "Database", status: "critical", latencyMs: Date.now() - start, detail: (e as Error).message };
  }
}

async function checkTTS(): Promise<ServiceResult> {
  const start = Date.now();
  try {
    const key = Deno.env.get("ELEVENLABS_API_KEY");
    if (!key) return { name: "Text-to-Speech (ElevenLabs)", status: "warning", latencyMs: 0, detail: "API key not configured – browser fallback active" };
    const resp = await fetch("https://api.elevenlabs.io/v1/user", {
      headers: { "xi-api-key": key },
    });
    const latencyMs = Date.now() - start;
    if (resp.ok) return { name: "Text-to-Speech (ElevenLabs)", status: "healthy", latencyMs };
    const body = await resp.text();
    return { name: "Text-to-Speech (ElevenLabs)", status: resp.status === 401 ? "warning" : "critical", latencyMs, detail: `HTTP ${resp.status} – browser fallback active` };
  } catch (e) {
    return { name: "Text-to-Speech (ElevenLabs)", status: "critical", latencyMs: Date.now() - start, detail: (e as Error).message };
  }
}

async function checkSummarize(): Promise<ServiceResult> {
  const start = Date.now();
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    // Just check the function endpoint responds (OPTIONS)
    const resp = await fetch(`${url}/functions/v1/summarize-conversation`, { method: "OPTIONS" });
    const latencyMs = Date.now() - start;
    return { name: "AI Summarization", status: resp.ok || resp.status === 204 ? "healthy" : "warning", latencyMs };
  } catch (e) {
    return { name: "AI Summarization", status: "critical", latencyMs: Date.now() - start, detail: (e as Error).message };
  }
}

async function checkAuth(): Promise<ServiceResult> {
  const start = Date.now();
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(url, key);
    const { error } = await sb.auth.getUser("00000000-0000-0000-0000-000000000000");
    const latencyMs = Date.now() - start;
    // A "user not found" error means auth service is responding fine
    return { name: "Authentication", status: latencyMs > 2000 ? "warning" : "healthy", latencyMs };
  } catch (e) {
    return { name: "Authentication", status: "critical", latencyMs: Date.now() - start, detail: (e as Error).message };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const [db, tts, summarize, auth] = await Promise.all([
    checkDatabase(),
    checkTTS(),
    checkSummarize(),
    checkAuth(),
  ]);

  // Speech recognition is browser-only, report as info
  const speechRec: ServiceResult = {
    name: "Voice Recognition (Browser)",
    status: "healthy",
    latencyMs: 0,
    detail: "Client-side Web Speech API – no server dependency",
  };

  const services = [db, auth, tts, summarize, speechRec];
  const overall: Status = services.some((s) => s.status === "critical")
    ? "critical"
    : services.some((s) => s.status === "warning")
    ? "warning"
    : "healthy";

  return new Response(
    JSON.stringify({ overall, services, checkedAt: new Date().toISOString() }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});