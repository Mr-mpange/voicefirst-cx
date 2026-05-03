import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Africa's Talking sends application/x-www-form-urlencoded.
// We respond with XML. Reference: https://developers.africastalking.com/docs/voice/overview

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

const admin = createClient(SUPABASE_URL, SERVICE_KEY);

const xml = (body: string) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });

const sayAndHangup = (msg: string) =>
  xml(`<Say voice="en-US-Standard-C" playBeep="false">${escapeXml(msg)}</Say>`);

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!)
  );
}

async function llmReply(history: Array<{ role: string; content: string }>, isGreeting: boolean) {
  const systemPrompt = `You are Alex, a friendly customer support agent on a phone call.
- Plain natural sentences only. NO markdown, lists, or symbols.
- Keep replies short (1-2 sentences) — this is a real phone call.
- Be warm and conversational.
${isGreeting ? "Greet the caller, introduce yourself as Alex, and ask how you can help." : "Continue the conversation naturally."}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: systemPrompt }, ...history],
      max_tokens: 150,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "Sorry, could you repeat that?";
}

async function synthesizeMp3(text: string): Promise<Uint8Array> {
  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": ELEVENLABS_API_KEY!, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: { stability: 0.4, similarity_boost: 0.8, use_speaker_boost: true },
      }),
    }
  );
  if (!r.ok) throw new Error(`TTS ${r.status}: ${await r.text()}`);
  return new Uint8Array(await r.arrayBuffer());
}

async function uploadAudio(sessionId: string, turn: number, bytes: Uint8Array): Promise<string> {
  const path = `${sessionId}/${turn}-${Date.now()}.mp3`;
  const { error } = await admin.storage.from("voice-audio").upload(path, bytes, {
    contentType: "audio/mpeg",
    upsert: true,
  });
  if (error) throw error;
  const { data } = admin.storage.from("voice-audio").getPublicUrl(path);
  return data.publicUrl;
}

async function transcribeRecording(url: string): Promise<string> {
  // Download AT recording (wav/mp3) and send to ElevenLabs STT
  const audioRes = await fetch(url);
  if (!audioRes.ok) throw new Error(`Failed to fetch recording: ${audioRes.status}`);
  const blob = await audioRes.blob();

  const fd = new FormData();
  fd.append("file", blob, "recording.wav");
  fd.append("model_id", "scribe_v2");

  const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": ELEVENLABS_API_KEY! },
    body: fd,
  });
  if (!r.ok) throw new Error(`STT ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return (data.text ?? "").trim();
}

async function loadHistory(sessionId: string) {
  const { data } = await admin
    .from("conversations")
    .select("transcript, id")
    .eq("id", sessionId)
    .maybeSingle();
  if (!data) return { history: [] as Array<{ role: string; content: string }>, turn: 0 };
  const t = (data.transcript as any[]) ?? [];
  const history = t.map((m) => ({
    role: m.speaker === "ai" ? "assistant" : "user",
    content: m.text,
  }));
  return { history, turn: t.length };
}

async function appendTranscript(sessionId: string, speaker: "ai" | "customer", text: string) {
  const { data } = await admin
    .from("conversations")
    .select("transcript")
    .eq("id", sessionId)
    .maybeSingle();
  const t = ((data?.transcript as any[]) ?? []).concat([
    { speaker, text, timestamp: new Date().toISOString() },
  ]);
  await admin.from("conversations").update({ transcript: t }).eq("id", sessionId);
}

serve(async (req) => {
  if (req.method === "GET") {
    return new Response("Africa's Talking voice webhook ready", { status: 200 });
  }

  try {
    const form = await req.formData();
    const params: Record<string, string> = {};
    for (const [k, v] of form.entries()) params[k] = String(v);
    console.log("AT callback:", JSON.stringify(params));

    const sessionId = params.sessionId;
    const isActive = params.isActive === "1" || params.isActive === "true";
    const recordingUrl = params.recordingUrl;
    const dtmfDigits = params.dtmfDigits;

    if (!sessionId) return sayAndHangup("Invalid session.");

    // Call ended
    if (!isActive && !recordingUrl) {
      await admin.from("conversations").update({ status: "completed" }).eq("id", sessionId);
      return new Response("ok", { status: 200 });
    }

    // Ensure conversation row exists
    await admin.from("conversations").upsert({
      id: sessionId,
      language: "en-US",
      status: "active",
      transcript: [],
    });

    const { history, turn } = await loadHistory(sessionId);

    // First turn: greeting
    if (history.length === 0 && !recordingUrl) {
      const greeting = await llmReply([], true);
      const audio = await synthesizeMp3(greeting);
      const url = await uploadAudio(sessionId, turn, audio);
      await appendTranscript(sessionId, "ai", greeting);
      return xml(
        `<Play url="${url}"/><Record finishOnKey="#" maxLength="20" timeout="3" trimSilence="true" playBeep="false" callbackUrl="${SUPABASE_URL}/functions/v1/africastalking-voice"/>`
      );
    }

    // We have a recording from the user
    if (recordingUrl) {
      const userText = await transcribeRecording(recordingUrl);
      if (!userText) {
        return xml(
          `<Say voice="en-US-Standard-C">I did not catch that. Please speak after the tone.</Say><Record finishOnKey="#" maxLength="20" timeout="3" trimSilence="true" playBeep="true" callbackUrl="${SUPABASE_URL}/functions/v1/africastalking-voice"/>`
        );
      }
      await appendTranscript(sessionId, "customer", userText);
      const fullHistory = [...history, { role: "user", content: userText }];
      const reply = await llmReply(fullHistory, false);
      const audio = await synthesizeMp3(reply);
      const url = await uploadAudio(sessionId, turn + 1, audio);
      await appendTranscript(sessionId, "ai", reply);
      return xml(
        `<Play url="${url}"/><Record finishOnKey="#" maxLength="20" timeout="3" trimSilence="true" playBeep="false" callbackUrl="${SUPABASE_URL}/functions/v1/africastalking-voice"/>`
      );
    }

    return sayAndHangup("Goodbye.");
  } catch (e) {
    console.error("AT voice error:", e);
    return sayAndHangup("Sorry, something went wrong. Please try again.");
  }
});