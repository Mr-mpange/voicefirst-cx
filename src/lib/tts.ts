import { supabase } from "@/integrations/supabase/client";

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts-stream`;
const TTS_FALLBACK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

/** Global handle so callers can interrupt currently-playing TTS (barge-in) */
let currentAudio: HTMLAudioElement | null = null;
let currentController: AbortController | null = null;

export function stopTTS() {
  if (currentController) {
    try { currentController.abort(); } catch { /* noop */ }
    currentController = null;
  }
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = "";
    } catch { /* noop */ }
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/** Wait for browser voices to load (they're async in most browsers) */
function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    const handler = () => {
      const v = window.speechSynthesis.getVoices();
      resolve(v);
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    // Timeout after 2s – some browsers never fire the event
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 2000);
  });
}

/** Browser-based SpeechSynthesis fallback */
function playBrowserTTS(text: string, lang?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error("SpeechSynthesis not supported"));
      return;
    }

    window.speechSynthesis.cancel();

    ensureVoicesLoaded().then((voices) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;

      // Set language so the browser picks the right voice
      if (lang) {
        const exact = voices.find((v) => v.lang === lang);
        const base = voices.find((v) => v.lang.startsWith(lang.split("-")[0]));
        if (exact) {
          utterance.voice = exact;
          utterance.lang = lang;
        } else if (base) {
          utterance.voice = base;
          utterance.lang = base.lang;
        } else {
          // No voice for this language — use default voice so user hears something
          console.warn(`No browser TTS voice for ${lang}, using default voice`);
          const defaultVoice = voices.find((v) => v.default) || voices[0];
          if (defaultVoice) utterance.voice = defaultVoice;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        // "interrupted" and "canceled" are normal when we cancel previous speech
        if (e.error === "interrupted" || e.error === "canceled") {
          resolve();
        } else {
          reject(e);
        }
      };

      window.speechSynthesis.speak(utterance);

      // Chrome bug: speechSynthesis can pause after ~15s. Keep it alive.
      const keepAlive = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          clearInterval(keepAlive);
        } else {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);

      utterance.onend = () => {
        clearInterval(keepAlive);
        resolve();
      };
    });
  });
}

/** Split text into sentence-sized chunks for faster time-to-first-audio */
function chunkText(text: string): string[] {
  const parts = text
    .replace(/\s+/g, " ")
    .match(/[^.!?]+[.!?]+|\S[^.!?]*$/g);
  return (parts ?? [text]).map((p) => p.trim()).filter(Boolean);
}

async function fetchTtsBlob(url: string, text: string, signal: AbortSignal): Promise<Blob | null> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(url, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ text }),
  });
  const ct = res.headers.get("Content-Type") ?? "";
  if (!res.ok || !ct.includes("audio/")) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `TTS failed ${res.status}`);
  }
  const blob = await res.blob();
  return blob.size ? blob : null;
}

function playBlob(blob: Blob, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    const cleanup = () => {
      URL.revokeObjectURL(audioUrl);
      if (currentAudio === audio) currentAudio = null;
    };
    signal.addEventListener("abort", () => {
      try { audio.pause(); } catch { /* noop */ }
      cleanup();
      resolve();
    });
    audio.onended = () => { cleanup(); resolve(); };
    audio.onerror = (e) => { cleanup(); reject(e); };
    audio.play().catch((err) => { cleanup(); reject(err); });
  });
}

export async function playTTS(text: string, lang?: string): Promise<void> {
  stopTTS();
  const controller = new AbortController();
  currentController = controller;

  const chunks = chunkText(text);

  try {
    // Pre-fetch the next chunk while playing the current one for seamless flow
    let pending: Promise<Blob | null> | null = fetchTtsBlob(TTS_URL, chunks[0], controller.signal);

    for (let i = 0; i < chunks.length; i++) {
      if (controller.signal.aborted) return;
      const blob = await pending!;
      // Start fetching next chunk in parallel
      pending = i + 1 < chunks.length
        ? fetchTtsBlob(TTS_URL, chunks[i + 1], controller.signal).catch((e) => {
            console.warn("TTS chunk fetch failed:", e);
            return null;
          })
        : null;
      if (blob) await playBlob(blob, controller.signal);
      if (controller.signal.aborted) return;
    }
  } catch (e) {
    if (controller.signal.aborted) return;
    console.warn("Streaming TTS failed, trying browser fallback:", e);
    try { await playBrowserTTS(text, lang); } catch { /* silent */ }
  } finally {
    if (currentController === controller) currentController = null;
  }
}
