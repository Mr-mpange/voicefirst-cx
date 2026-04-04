import { supabase } from "@/integrations/supabase/client";

const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`;

/** Browser-based SpeechSynthesis fallback */
function playBrowserTTS(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error("SpeechSynthesis not supported"));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);
    window.speechSynthesis.speak(utterance);
  });
}

export async function playTTS(text: string): Promise<void> {
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
      await playBrowserTTS(text);
    } catch (fallbackErr) {
      console.warn("Browser TTS also failed:", fallbackErr);
      // Silently fail — text response is already shown in UI
    }
  }
}
