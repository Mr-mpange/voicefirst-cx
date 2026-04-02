import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Mic, PhoneOff, UserPlus, Timer, Globe, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AIAvatar from "@/components/voice/AIAvatar";
import VoiceWaveform from "@/components/voice/VoiceWaveform";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { useSpeechRecognition, SUPPORTED_LANGUAGES } from "@/hooks/useSpeechRecognition";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { playTTS } from "@/lib/tts";
import type { AIState, TranscriptMessage } from "@/lib/mockData";

// Greetings & responses per language
const LOCALIZED_FLOW: Record<string, {
  greeting: string;
  topics: Array<{ trigger: string[]; text: string; followUp: string }>;
  fallback: string;
  fallbackDeep: string;
}> = {
  "en-US": {
    greeting: "Hello! Thank you for calling our support line. My name is Alex, your AI assistant. How can I help you today? Are you calling about billing, account access, technical support, or something else?",
    topics: [
      { trigger: ["bill", "invoice", "charge", "payment", "price"], text: "I understand you have a billing concern. Could you please provide me with your account number or the email associated with your account?", followUp: "Thank you. I can see your recent charges. Would you like me to explain a charge, issue a refund, or help with something else?" },
      { trigger: ["password", "login", "account", "access", "sign in", "locked"], text: "I can help you with account access. For security, could you confirm the email registered to your account?", followUp: "I'm sending a password reset link to your email now. Is there anything else I can help with?" },
      { trigger: ["cancel", "stop", "end", "unsubscribe"], text: "I understand you're considering cancellation. May I ask what's prompting this decision?", followUp: "I have a few options that might work better for you. Would you like to hear about alternative plans?" },
      { trigger: ["technical", "bug", "error", "broken", "not working", "issue", "problem"], text: "I'm sorry about the technical difficulties. Could you describe what's happening?", followUp: "Let me check our systems. Could you try clearing your browser cache and refreshing?" },
    ],
    fallback: "I didn't quite catch the topic. Could you tell me if this is about billing, account access, technical support, or another issue?",
    fallbackDeep: "Thank you for that information. Let me look into this for you. Is there anything specific you'd like me to check?",
  },
  "sw-KE": {
    greeting: "Habari! Asante kwa kupiga simu kwenye huduma yetu. Mimi ni Alex, msaidizi wako wa AI. Ninawezaje kukusaidia leo? Je, unapiga simu kuhusu malipo, upatikanaji wa akaunti, msaada wa kiufundi, au kitu kingine?",
    topics: [
      { trigger: ["malipo", "bili", "ankara", "bei", "pesa"], text: "Naelewa una wasiwasi kuhusu malipo. Tafadhali nipe nambari ya akaunti yako au barua pepe inayohusiana na akaunti yako.", followUp: "Asante. Ninaweza kuona malipo yako ya hivi karibuni. Je, ungependa nikusaidie na nini?" },
      { trigger: ["nenosiri", "kuingia", "akaunti", "imefungwa"], text: "Ninaweza kukusaidia na upatikanaji wa akaunti. Kwa usalama, tafadhali thibitisha barua pepe iliyosajiliwa kwenye akaunti yako.", followUp: "Ninatuma kiungo cha kuweka upya nenosiri kwenye barua pepe yako sasa. Kuna kitu kingine ninachoweza kusaidia?" },
      { trigger: ["ghairi", "simamisha", "sitisha"], text: "Naelewa unafikiria kughairi. Naweza kuuliza ni nini kinachosababisha uamuzi huu?", followUp: "Nina chaguo kadhaa ambazo zinaweza kufanya kazi vizuri zaidi kwako. Je, ungependa kusikia kuhusu mipango mbadala?" },
      { trigger: ["tatizo", "hitilafu", "haifanyi kazi", "imevunjika"], text: "Samahani kuhusu matatizo ya kiufundi. Je, unaweza kuelezea kinachoendelea?", followUp: "Acha niangalie mifumo yetu. Je, unaweza kujaribu kusafisha kashe ya kivinjari chako na kuonyesha upya?" },
    ],
    fallback: "Sikuelewa mada vizuri. Tafadhali niambie kama hii inahusu malipo, upatikanaji wa akaunti, msaada wa kiufundi, au suala lingine.",
    fallbackDeep: "Asante kwa habari hiyo. Acha nichunguze hili. Je, kuna kitu maalum ungependa niangalie?",
  },
  "sw-TZ": {
    greeting: "Habari! Asante kwa kupiga simu kwenye huduma yetu. Mimi ni Alex, msaidizi wako wa AI. Ninawezaje kukusaidia leo? Je, unapiga simu kuhusu malipo, akaunti, msaada wa kiufundi, au jambo jingine?",
    topics: [
      { trigger: ["malipo", "bili", "ankara", "bei", "pesa"], text: "Naelewa una wasiwasi kuhusu malipo. Tafadhali nipe nambari ya akaunti yako au barua pepe yako.", followUp: "Asante. Ninaweza kuona malipo yako. Je, ungependa nikusaidie na nini zaidi?" },
      { trigger: ["nenosiri", "kuingia", "akaunti", "imefungwa"], text: "Ninaweza kukusaidia na akaunti yako. Tafadhali thibitisha barua pepe iliyosajiliwa.", followUp: "Ninatuma kiungo cha kubadilisha nenosiri sasa. Kuna kitu kingine?" },
      { trigger: ["ghairi", "simamisha", "sitisha"], text: "Naelewa unafikiria kughairi. Ni nini kinachosababisha uamuzi huu?", followUp: "Nina chaguo mbadala ambazo zinaweza kukusaidia. Ungependa kusikia zaidi?" },
      { trigger: ["tatizo", "hitilafu", "haifanyi kazi", "imevunjika"], text: "Pole kuhusu matatizo hayo. Elezea kinachoendelea tafadhali.", followUp: "Acha niangalie mifumo yetu. Jaribu kusafisha kashe ya kivinjari na kuonyesha upya." },
    ],
    fallback: "Sikuelewa vizuri. Niambie kama inahusu malipo, akaunti, msaada wa kiufundi, au kitu kingine.",
    fallbackDeep: "Asante. Acha nichunguze. Kuna kitu maalum ungependa niangalie?",
  },
  "es-ES": {
    greeting: "¡Hola! Gracias por llamar a nuestra línea de soporte. Soy Alex, tu asistente de IA. ¿En qué puedo ayudarte hoy? ¿Llamas por facturación, acceso a tu cuenta, soporte técnico u otra cosa?",
    topics: [
      { trigger: ["factura", "cobro", "pago", "precio", "cargo"], text: "Entiendo que tienes una consulta de facturación. ¿Podrías darme tu número de cuenta o correo electrónico?", followUp: "Gracias. Puedo ver tus cargos recientes. ¿Te gustaría que te explique algún cargo o te ayude con otra cosa?" },
      { trigger: ["contraseña", "iniciar sesión", "cuenta", "acceso", "bloqueado"], text: "Puedo ayudarte con el acceso a tu cuenta. ¿Podrías confirmar el correo registrado?", followUp: "Estoy enviando un enlace para restablecer tu contraseña. ¿Hay algo más en lo que pueda ayudarte?" },
      { trigger: ["cancelar", "baja", "dar de baja"], text: "Entiendo que estás considerando la cancelación. ¿Puedo preguntar qué motiva esta decisión?", followUp: "Tengo algunas opciones alternativas. ¿Te gustaría conocerlas?" },
      { trigger: ["técnico", "error", "fallo", "no funciona", "problema"], text: "Lamento los problemas técnicos. ¿Podrías describir qué está pasando?", followUp: "Déjame revisar nuestros sistemas. ¿Podrías intentar limpiar la caché de tu navegador?" },
    ],
    fallback: "No capté bien el tema. ¿Podrías decirme si es sobre facturación, acceso a cuenta, soporte técnico u otro tema?",
    fallbackDeep: "Gracias por esa información. Déjame investigar esto. ¿Hay algo específico que quieras que revise?",
  },
  "fr-FR": {
    greeting: "Bonjour ! Merci d'avoir appelé notre service d'assistance. Je suis Alex, votre assistant IA. Comment puis-je vous aider aujourd'hui ? Appelez-vous pour la facturation, l'accès au compte, le support technique ou autre chose ?",
    topics: [
      { trigger: ["facture", "paiement", "prix", "frais"], text: "Je comprends votre préoccupation concernant la facturation. Pourriez-vous me fournir votre numéro de compte ou votre adresse e-mail ?", followUp: "Merci. Je peux voir vos frais récents. Souhaitez-vous que je vous explique un frais ou vous aide avec autre chose ?" },
      { trigger: ["mot de passe", "connexion", "compte", "accès", "bloqué"], text: "Je peux vous aider avec l'accès à votre compte. Pourriez-vous confirmer l'e-mail enregistré ?", followUp: "J'envoie un lien de réinitialisation à votre e-mail maintenant. Y a-t-il autre chose ?" },
      { trigger: ["annuler", "résiliation", "désinscription"], text: "Je comprends que vous envisagez l'annulation. Puis-je vous demander ce qui motive cette décision ?", followUp: "J'ai quelques options alternatives. Souhaitez-vous les connaître ?" },
      { trigger: ["technique", "erreur", "bug", "ne fonctionne pas", "problème"], text: "Je suis désolé pour ces difficultés techniques. Pourriez-vous décrire ce qui se passe ?", followUp: "Laissez-moi vérifier nos systèmes. Pourriez-vous essayer de vider le cache de votre navigateur ?" },
    ],
    fallback: "Je n'ai pas bien compris le sujet. Pourriez-vous me dire s'il s'agit de facturation, d'accès au compte, de support technique ou d'un autre sujet ?",
    fallbackDeep: "Merci pour cette information. Laissez-moi examiner cela. Y a-t-il quelque chose de spécifique que vous aimeriez que je vérifie ?",
  },
};

// Default English fallback for unlisted languages
const DEFAULT_LANG = "en-US";

function getFlowForLanguage(langCode: string) {
  // Try exact match, then base language match (e.g. "en" from "en-GB")
  if (LOCALIZED_FLOW[langCode]) return LOCALIZED_FLOW[langCode];
  const base = langCode.split("-")[0];
  const match = Object.keys(LOCALIZED_FLOW).find((k) => k.startsWith(base + "-"));
  if (match) return LOCALIZED_FLOW[match];
  return LOCALIZED_FLOW[DEFAULT_LANG];
}

const Index = () => {
  const { user } = useAuth();
  const [aiState, setAiState] = useState<AIState>("idle");
  const [callActive, setCallActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [interimText, setInterimText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [isSaving, setIsSaving] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const msgCountRef = useRef(0);
  const conversationStepRef = useRef(0); // tracks which flow step we're on
  const matchedTopicRef = useRef<typeof AI_FLOW[number] | null>(null);
  const isSpeakingRef = useRef(false);

  // AI speaks a message, then starts listening
  const aiSpeak = useCallback(async (text: string) => {
    if (isSpeakingRef.current) return;
    isSpeakingRef.current = true;
    setAiState("speaking");
    const aiTs = new Date().toLocaleTimeString();
    const aiMsg: TranscriptMessage = {
      id: `m${msgCountRef.current++}`,
      speaker: "ai",
      text,
      timestamp: aiTs,
    };
    setMessages((prev) => [...prev, aiMsg]);

    try {
      await playTTS(text);
    } catch (e) {
      console.error("TTS playback failed:", e);
    }
    isSpeakingRef.current = false;
    setAiState("listening");
  }, []);

  // Determine AI response based on conversation context
  function getAIResponse(input: string): string {
    const lower = input.toLowerCase();
    const step = conversationStepRef.current;

    // If we already matched a topic and this is a follow-up
    if (matchedTopicRef.current && step >= 2) {
      if (matchedTopicRef.current.followUp) {
        const followUp = matchedTopicRef.current.followUp;
        matchedTopicRef.current = null; // reset after using follow-up
        conversationStepRef.current++;
        return followUp;
      }
    }

    // Try to match a topic from user input
    for (const flow of AI_FLOW) {
      if ("trigger" in flow && flow.trigger) {
        if (flow.trigger.some((t) => lower.includes(t))) {
          matchedTopicRef.current = flow;
          conversationStepRef.current = 2;
          return flow.text;
        }
      }
    }

    // Generic follow-up if no topic matched
    conversationStepRef.current++;
    if (step <= 1) {
      return "I didn't quite catch the topic. Could you tell me if this is about billing, account access, technical support, or another issue? I'm here to help.";
    }
    return "Thank you for that information. Let me look into this for you. Is there anything specific you'd like me to check?";
  }

  const { isListening, isSupported, start: startListening, stop: stopListening } =
    useSpeechRecognition({
      language: selectedLanguage,
      continuous: true,
      onResult: (text, isFinal) => {
        if (isFinal && !isSpeakingRef.current) {
          const ts = new Date().toLocaleTimeString();
          const newMsg: TranscriptMessage = {
            id: `m${msgCountRef.current++}`,
            speaker: "customer",
            text,
            timestamp: ts,
          };
          setMessages((prev) => [...prev, newMsg]);
          setInterimText("");
          setAiState("processing");

          const responseText = getAIResponse(text);
          setTimeout(() => {
            aiSpeak(responseText);
          }, 600);
        } else if (!isFinal) {
          setInterimText(text);
        }
      },
      onError: (error) => {
        toast.error(`Speech recognition error: ${error}`);
      },
    });

  // Timer
  useEffect(() => {
    if (!callActive) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [callActive]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleMicClick = useCallback(async () => {
    if (!callActive) {
      if (!isSupported) {
        toast.error("Speech recognition is not supported in this browser. Please use Chrome.");
        return;
      }

      // Create conversation record
      try {
        const { data, error } = await supabase
          .from("conversations")
          .insert({ language: selectedLanguage, status: "active", user_id: user?.id })
          .select("id")
          .single();
        if (error) throw error;
        setConversationId(data.id);
      } catch {
        toast.error("Failed to create conversation record");
      }

      setCallActive(true);
      setSeconds(0);
      setMessages([]);
      setInterimText("");
      msgCountRef.current = 0;
      conversationStepRef.current = 0;
      matchedTopicRef.current = null;

      // AI greets first, THEN starts listening
      const greeting = AI_FLOW[0].text;
      conversationStepRef.current = 1;
      await aiSpeak(greeting);
      startListening();
    }
  }, [callActive, isSupported, selectedLanguage, startListening, aiSpeak]);

  const handleEndCall = useCallback(async () => {
    stopListening();
    setCallActive(false);
    setAiState("idle");
    setInterimText("");

    // Save conversation
    if (conversationId && messages.length > 0) {
      setIsSaving(true);
      try {
        const transcript = messages.map((m) => ({
          speaker: m.speaker,
          text: m.text,
          timestamp: m.timestamp,
        }));
        const { error } = await supabase
          .from("conversations")
          .update({
            transcript,
            duration_seconds: seconds,
            status: "completed",
          })
          .eq("id", conversationId);
        if (error) throw error;

        // Auto-summarize
        const { data, error: sumError } = await supabase.functions.invoke(
          "summarize-conversation",
          { body: { conversationId } }
        );
        if (sumError) console.error("Summary error:", sumError);
        else toast.success("Conversation saved & summarized!");
      } catch (e: any) {
        toast.error("Failed to save conversation");
        console.error(e);
      } finally {
        setIsSaving(false);
      }
    }

    setSeconds(0);
    setMessages([]);
    setConversationId(null);
  }, [stopListening, conversationId, messages, seconds]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative px-4">
      {/* Nav */}
      <div className="absolute top-4 left-4 flex items-center gap-4">
        <Link
          to="/dashboard"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          ← Agent Dashboard
        </Link>
        <Link
          to="/conversations"
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          📝 Conversation History
        </Link>
      </div>

      {/* Timer */}
      {callActive && (
        <div className="absolute top-4 right-4 flex items-center gap-2 text-muted-foreground">
          <Timer className="h-4 w-4" />
          <span className="font-mono text-sm">{formatTime(seconds)}</span>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col items-center gap-6 max-w-md w-full">
        {/* AI Avatar */}
        <div className="animate-float">
          <AIAvatar state={aiState} size="lg" />
        </div>

        {/* Status */}
        <StatusBadge status={aiState} />

        {/* Language selector */}
        {!callActive && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-48 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="text-xs">
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Processing dots */}
        {aiState === "processing" && (
          <div className="flex gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary animate-thinking-1" />
            <div className="h-2 w-2 rounded-full bg-primary animate-thinking-2" />
            <div className="h-2 w-2 rounded-full bg-primary animate-thinking-3" />
          </div>
        )}

        {/* Waveform */}
        <VoiceWaveform active={aiState === "listening" || aiState === "speaking"} variant="large" />

        {/* Mic button */}
        <div className="relative">
          {callActive && (
            <>
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
              <div
                className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-ring"
                style={{ animationDelay: "0.5s" }}
              />
            </>
          )}
          <button
            onClick={handleMicClick}
            disabled={callActive}
            className={`relative z-10 h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              callActive
                ? "bg-primary shadow-[0_0_30px_hsl(217,91%,60%,0.4)]"
                : "bg-card border-2 border-border hover:border-primary hover:shadow-[0_0_20px_hsl(217,91%,60%,0.2)]"
            }`}
          >
            <Mic
              className={`h-8 w-8 ${callActive ? "text-primary-foreground" : "text-muted-foreground"}`}
            />
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          {callActive
            ? `Listening in ${SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.label || selectedLanguage} — speak naturally`
            : "Select your language and tap the microphone to start"}
        </p>

        {/* Interim text */}
        {interimText && (
          <div className="w-full rounded-lg bg-card/50 border border-border/30 p-3 animate-fade-in">
            <p className="text-sm text-muted-foreground italic">🎙️ {interimText}...</p>
          </div>
        )}

        {/* Transcript */}
        {messages.length > 0 && (
          <div className="w-full rounded-lg bg-card border border-border/50 p-4 max-h-48 overflow-y-auto space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="animate-fade-in">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-[10px] font-bold ${
                      msg.speaker === "ai" ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {msg.speaker === "ai" ? "AI" : "You"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                </div>
                <p className="text-sm text-foreground">{msg.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {callActive && (
          <div className="flex gap-3 animate-fade-in">
            <Button variant="destructive" onClick={handleEndCall} disabled={isSaving} className="gap-2">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PhoneOff className="h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "End Call"}
            </Button>
            <Button variant="outline" className="gap-2">
              <UserPlus className="h-4 w-4" />
              Connect to Human
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
