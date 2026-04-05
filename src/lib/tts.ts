import { supabase } from "@/integrations/supabase/client";

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

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

export async function playTTS(text: string, lang?: string): Promise<void> {
  // Try ElevenLabs first, fall back to browser TTS
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ text }),
    });

    const contentType = response.headers.get("Content-Type") ?? "";

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `TTS request failed: ${response.status}`);
    }

    if (!contentType.includes("audio/")) {
      const payload = await response.json().catch(() => null);
      const reason =
        payload && typeof payload === "object" && "reason" in payload
          ? String((payload as { reason?: unknown }).reason ?? "TTS audio unavailable")
          : "TTS audio unavailable";
      throw new Error(reason);
    }

    const audioBlob = await response.blob();

    if (!audioBlob.size) {
      throw new Error("TTS audio response was empty");
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        reject(e);
      };
      audio.play().catch(reject);
    });
  } catch (e) {
    console.warn("Hosted TTS unavailable, using browser fallback:", e);
    try {
      await playBrowserTTS(text, lang);
    } catch (fallbackErr) {
      console.warn("Browser TTS also failed:", fallbackErr);
      // Silently fail — text response is already shown in UI
    }
  }
}
