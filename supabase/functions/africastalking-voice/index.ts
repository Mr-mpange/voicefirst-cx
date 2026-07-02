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

type LanguageOption = {
  code: string;
  name: string;
  instruction: string;
  fallbackGreeting: string;
  repeatPrompt: string;
  errorPrompt: string;
  goodbye: string;
};

const LANGUAGES: Record<string, LanguageOption> = {
  "1": {
    code: "en-US",
    name: "English",
    instruction: "Reply only in natural English.",
    fallbackGreeting: "Hi, this is Alex from Audient Assist. How can I help you today?",
    repeatPrompt: "I did not catch that. Please speak after the tone.",
    errorPrompt: "Sorry, something went wrong. Please try again.",
    goodbye: "Goodbye.",
  },
  "2": {
    code: "sw-KE",
    name: "Swahili",
    instruction: "Jibu kwa Kiswahili cha kawaida tu. Usitumie Kiingereza isipokuwa mtumiaji ameomba.",
    fallbackGreeting: "Habari, mimi ni Alex kutoka Audient Assist. Naweza kukusaidia vipi leo?",
    repeatPrompt: "Samahani, sikukusikia vizuri. Tafadhali zungumza baada ya mlio.",
    errorPrompt: "Samahani, kumetokea hitilafu. Tafadhali jaribu tena.",
    goodbye: "Kwaheri.",
  },
  "3": {
    code: "fr-FR",
    name: "French",
    instruction: "Réponds uniquement en français naturel. N'utilise pas l'anglais sauf si l'appelant le demande.",
    fallbackGreeting: "Bonjour, c'est Alex d'Audient Assist. Comment puis-je vous aider aujourd'hui ?",
    repeatPrompt: "Je n'ai pas bien entendu. Parlez après le bip, s'il vous plaît.",
    errorPrompt: "Désolé, une erreur s'est produite. Veuillez réessayer.",
    goodbye: "Au revoir.",
  },
};

const DEFAULT_LANGUAGE = LANGUAGES["1"];

function normalizeDigit(input?: string) {
  return (input ?? "").replace(/[^0-9]/g, "").charAt(0);
}

function languageByCode(code?: string | null) {
  return Object.values(LANGUAGES).find((lang) => lang.code === code) ?? DEFAULT_LANGUAGE;
}

const xml = (body: string) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    status: 200,
    headers: { "Content-Type": "application/xml" },
  });

const sayAndHangup = (msg: string) =>
  xml(`<Say voice="en-US-Standard-C" playBeep="false">${escapeXml(msg)}</Say>`);

const callbackUrl = () => `${SUPABASE_URL}/functions/v1/africastalking-voice`;

const sayAndRecord = (msg: string, playBeep = false) =>
  xml(
    `<Say voice="en-US-Standard-C" playBeep="false">${escapeXml(msg)}</Say>` +
      `<Record finishOnKey="#" maxLength="20" timeout="3" trimSilence="true" playBeep="${playBeep ? "true" : "false"}" callbackUrl="${callbackUrl()}"/>`
  );

const playOrSayAndRecord = async (sessionId: string, turn: number, msg: string, playBeep = false) => {
  try {
    const audio = await synthesizeMp3(msg);
    const url = await uploadAudio(sessionId, turn, audio);
    return xml(
      `<Play url="${url}"/>` +
        `<Record finishOnKey="#" maxLength="20" timeout="3" trimSilence="true" playBeep="${playBeep ? "true" : "false"}" callbackUrl="${callbackUrl()}"/>`
    );
  } catch (e) {
    console.error("TTS failed; continuing call with AT Say fallback:", e);
    return sayAndRecord(msg, playBeep);
  }
};

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!)
  );
}

async function llmReply(history: Array<{ role: string; content: string }>, language: LanguageOption) {
  const systemPrompt = `You are Alex, a friendly human customer support agent on a phone call.
- Speak like a real person, warm and casual — never like a robot or AI.
- Plain natural sentences only. NO markdown, lists, bullets, asterisks or symbols.
- Keep replies short (1-2 sentences) — this is a real phone call.
- Selected call language: ${language.name} (${language.code}).
- ${language.instruction}
- Never switch to English unless the caller clearly asks to use English.`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: systemPrompt }, ...history],
      max_tokens: 150,
    }),
  });
  if (!res.ok) {
    console.error("LLM error", res.status, await res.text());
    return language.repeatPrompt;
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? language.repeatPrompt;
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
    .select("transcript, id, language")
    .eq("id", sessionId)
    .maybeSingle();
  if (!data) return { history: [] as Array<{ role: string; content: string }>, turn: 0, language: DEFAULT_LANGUAGE };
  const t = (data.transcript as any[]) ?? [];
  const history = t.map((m) => ({
    role: m.speaker === "ai" ? "assistant" : "user",
    content: m.text,
  }));
  return { history, turn: t.length, language: languageByCode(data.language as string | null) };
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
    const selectedDigit = normalizeDigit(dtmfDigits);

    if (!sessionId) return sayAndHangup("Invalid session.");

    // Call ended
    if (!isActive && !recordingUrl) {
      await admin.from("conversations").update({ status: "completed" }).eq("id", sessionId);
      return new Response("ok", { status: 200 });
    }

    // Ensure conversation row exists (do not overwrite language/transcript on later hops)
    const { data: existing } = await admin
      .from("conversations")
      .select("id")
      .eq("id", sessionId)
      .maybeSingle();
    if (!existing) {
      await admin.from("conversations").insert({
        id: sessionId,
        language: "en-US",
        status: "active",
        transcript: [],
      });
    }

    const { history, turn, language } = await loadHistory(sessionId);

    // Step 1: brand-new call → play a bilingual language menu (DTMF)
    if (history.length === 0 && !recordingUrl && !selectedDigit) {
      return xml(
        `<GetDigits timeout="15" finishOnKey="#" numDigits="1" callbackUrl="${callbackUrl()}">` +
          `<Say voice="en-US-Standard-C" playBeep="false">` +
            `Welcome to Audient Assist. For English, press 1. Kwa Kiswahili, bonyeza 2. Pour le français, appuyez sur 3.` +
          `</Say>` +
        `</GetDigits>`
      );
    }

    // Step 2: caller pressed a digit → set language & greet
    if (history.length === 0 && selectedDigit) {
      const chosen = LANGUAGES[selectedDigit] ?? DEFAULT_LANGUAGE;
      console.log(`Language selected for ${sessionId}: ${chosen.code} from digit ${dtmfDigits}`);
      await admin.from("conversations").update({ language: chosen.code }).eq("id", sessionId);
      const greeting = chosen.fallbackGreeting;
      await appendTranscript(sessionId, "ai", greeting);
      return await playOrSayAndRecord(sessionId, turn, greeting);
    }

    // We have a recording from the user
    if (recordingUrl) {
      const userText = await transcribeRecording(recordingUrl);
      if (!userText) {
        return sayAndRecord(language.repeatPrompt, true);
      }
      await appendTranscript(sessionId, "customer", userText);
      const fullHistory = [...history, { role: "user", content: userText }];
      const reply = await llmReply(fullHistory, language);
      await appendTranscript(sessionId, "ai", reply);
      return await playOrSayAndRecord(sessionId, turn + 1, reply);
    }

    return sayAndHangup(language.goodbye);
  } catch (e) {
    console.error("AT voice error:", e);
    return sayAndHangup(DEFAULT_LANGUAGE.errorPrompt);
  }
});