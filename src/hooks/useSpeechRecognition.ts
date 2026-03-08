import { useState, useCallback, useRef, useEffect } from "react";

// Supported languages for the Web Speech API
export const SUPPORTED_LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "es-ES", label: "Español" },
  { code: "fr-FR", label: "Français" },
  { code: "de-DE", label: "Deutsch" },
  { code: "it-IT", label: "Italiano" },
  { code: "pt-BR", label: "Português (BR)" },
  { code: "pt-PT", label: "Português (PT)" },
  { code: "zh-CN", label: "中文 (简体)" },
  { code: "zh-TW", label: "中文 (繁體)" },
  { code: "ja-JP", label: "日本語" },
  { code: "ko-KR", label: "한국어" },
  { code: "ar-SA", label: "العربية" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "ru-RU", label: "Русский" },
  { code: "nl-NL", label: "Nederlands" },
  { code: "sv-SE", label: "Svenska" },
  { code: "pl-PL", label: "Polski" },
  { code: "tr-TR", label: "Türkçe" },
  { code: "th-TH", label: "ไทย" },
  { code: "vi-VN", label: "Tiếng Việt" },
  { code: "id-ID", label: "Bahasa Indonesia" },
  { code: "ms-MY", label: "Bahasa Melayu" },
  { code: "uk-UA", label: "Українська" },
  { code: "cs-CZ", label: "Čeština" },
  { code: "ro-RO", label: "Română" },
  { code: "el-GR", label: "Ελληνικά" },
  { code: "he-IL", label: "עברית" },
  { code: "da-DK", label: "Dansk" },
  { code: "fi-FI", label: "Suomi" },
  { code: "nb-NO", label: "Norsk" },
  { code: "hu-HU", label: "Magyar" },
  { code: "sk-SK", label: "Slovenčina" },
  { code: "bg-BG", label: "Български" },
  { code: "hr-HR", label: "Hrvatski" },
  { code: "ca-ES", label: "Català" },
  { code: "fil-PH", label: "Filipino" },
  { code: "sw-KE", label: "Kiswahili" },
  { code: "af-ZA", label: "Afrikaans" },
  { code: "am-ET", label: "አማርኛ" },
  { code: "bn-IN", label: "বাংলা" },
  { code: "ta-IN", label: "தமிழ்" },
  { code: "te-IN", label: "తెలుగు" },
  { code: "ur-PK", label: "اردو" },
  { code: "fa-IR", label: "فارسی" },
];

interface UseSpeechRecognitionOptions {
  language?: string;
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
}

// Extend Window for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export function useSpeechRecognition({
  language = "en-US",
  onResult,
  onError,
  continuous = true,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const start = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError?.("Speech recognition not supported in this browser. Please use Chrome.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }

      if (finalText) {
        onResult?.(finalText.trim(), true);
      } else if (interimText) {
        onResult?.(interimText.trim(), false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech" && event.error !== "aborted") {
        onError?.(event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart if still expected to listen
      if (recognitionRef.current === recognition && continuous) {
        try {
          recognition.start();
        } catch {
          // ignore - may already be started
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [language, onResult, onError, continuous]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      const ref = recognitionRef.current;
      recognitionRef.current = null;
      ref.stop();
      setIsListening(false);
    }
  }, []);

  return { isListening, isSupported, start, stop };
}
