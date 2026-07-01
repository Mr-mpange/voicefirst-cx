import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { PhoneCall, Copy, Check, Save } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHero from "@/components/layout/PageHero";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const PROJECT_REF = "njlqnzkjffaxjabltkrn";
const FN_BASE = `https://${PROJECT_REF}.supabase.co/functions/v1`;

const ENDPOINTS: { name: string; path: string; note: string }[] = [
  { name: "Africa's Talking voice callback", path: "africastalking-voice", note: "Paste this in your AT voice number settings" },
  { name: "Voice chat (Alex replies)", path: "voice-chat", note: "POST { messages, language, type }" },
  { name: "Summarize conversation", path: "summarize-conversation", note: "POST { conversationId }" },
  { name: "Text to speech", path: "elevenlabs-tts", note: "POST { text, language } → mp3" },
  { name: "Text to speech (stream)", path: "elevenlabs-tts-stream", note: "POST { text } → audio stream" },
  { name: "Knowledge ingest", path: "process-knowledge-file", note: "POST { path } after upload" },
  { name: "Health check", path: "health-check", note: "GET — returns service status" },
];

const CopyRow = ({ url }: { url: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div className="flex items-center gap-2">
      <code className="flex-1 min-w-0 truncate rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-xs font-mono text-foreground/90">
        {url}
      </code>
      <Button size="sm" variant="outline" onClick={copy} className="shrink-0 gap-1.5">
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
};

const PhoneIntegration = () => {
  const callbackUrl = `${FN_BASE}/africastalking-voice`;
  const [username, setUsername] = useState(() => localStorage.getItem("at_username") || "IAA");
  const [phone, setPhone] = useState(() => localStorage.getItem("at_phone") || "");

  const save = () => {
    localStorage.setItem("at_username", username.trim());
    localStorage.setItem("at_phone", phone.trim());
    toast.success("Phone integration saved");
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Phone Integration — AudientAssist</title>
        <meta name="description" content="Connect your Africa's Talking number so Alex handles inbound calls automatically." />
      </Helmet>

      <PageHero
        eyebrow="Telephony"
        title="Connect a real"
        accent="phone line"
        description="Point your Africa's Talking voice number at Alex. Inbound callers hear a short language menu, then talk to your assistant like a human."
        icon={PhoneCall}
        meta={
          <>
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Africa's Talking ready</Badge>
            <Badge variant="outline" className="border-border/60">Bilingual: EN · SW · FR</Badge>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Callback URL cell */}
        <Card className="lg:col-span-2 p-6 bg-card/60 backdrop-blur-sm border-border/60">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-serif text-xl">Callback URL</h3>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Paste in AT</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            In your Africa's Talking dashboard, open Voice → Phone Numbers → your number, and set the callback URL below. Method: POST.
          </p>
          <CopyRow url={callbackUrl} />
          <ol className="mt-5 space-y-2 text-xs text-muted-foreground list-decimal list-inside leading-relaxed">
            <li>Sign in to Africa's Talking with the username <span className="font-mono text-foreground">IAA</span>.</li>
            <li>Go to Voice → Phone Numbers, pick your number.</li>
            <li>Paste the callback URL above and save.</li>
            <li>Call the number — you will hear the language menu, then Alex.</li>
          </ol>
        </Card>

        {/* Config cell */}
        <Card className="p-6 bg-card/60 backdrop-blur-sm border-border/60">
          <h3 className="font-serif text-xl mb-4">Your line</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="at-user" className="text-xs uppercase tracking-widest text-muted-foreground">AT Username</Label>
              <Input id="at-user" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="IAA" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="at-phone" className="text-xs uppercase tracking-widest text-muted-foreground">Phone Number</Label>
              <Input id="at-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254700000000" />
            </div>
            <Button onClick={save} className="w-full gap-2">
              <Save className="h-4 w-4" /> Save configuration
            </Button>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              These values live in your browser and are shown on this page for reference. The callback URL above is what actually routes calls.
            </p>
          </div>
        </Card>

        {/* Endpoints cell */}
        <Card className="lg:col-span-3 p-6 bg-card/60 backdrop-blur-sm border-border/60">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-serif text-xl">Assistant endpoints</h3>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">For your own apps</span>
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            Every capability behind Alex — replies, summaries, speech, knowledge — is exposed as an HTTPS endpoint. Use them from any backend or third-party workflow.
          </p>
          <div className="space-y-4">
            {ENDPOINTS.map((ep) => (
              <div key={ep.path} className="rounded-lg border border-border/60 bg-background/40 p-4">
                <div className="flex items-center justify-between mb-1.5 gap-3">
                  <p className="text-sm font-medium">{ep.name}</p>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">{ep.note}</span>
                </div>
                <CopyRow url={`${FN_BASE}/${ep.path}`} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PhoneIntegration;