import { useState } from "react";
import { Phone, Bot, Clock, AlertTriangle, User, Mail, PhoneCall, MessageSquare, Lightbulb } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MetricCard from "@/components/dashboard/MetricCard";
import CallCard from "@/components/dashboard/CallCard";
import TranscriptFeed from "@/components/voice/TranscriptFeed";
import VoiceWaveform from "@/components/voice/VoiceWaveform";
import { Card } from "@/components/ui/card";
import { activeCalls } from "@/lib/mockData";

const suggestions = [
  "I can see the customer's contract includes a service guarantee. You may want to reference clause 4.2.",
  "Based on the conversation, the customer may be eligible for a loyalty discount of 15%.",
  "Previous interactions show this customer prefers email follow-ups after phone calls.",
];

const Dashboard = () => {
  const [selectedCallId, setSelectedCallId] = useState<string>(activeCalls[0].id);
  const selectedCall = activeCalls.find((c) => c.id === selectedCallId) || activeCalls[0];

  const stats = {
    active: activeCalls.filter((c) => c.status !== "completed").length,
    aiHandled: activeCalls.filter((c) => c.status === "ai-handling").length,
    waiting: activeCalls.filter((c) => c.status === "waiting").length,
    escalated: activeCalls.filter((c) => c.status === "escalated").length,
  };

  return (
    <DashboardLayout title="Live Call Monitoring">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={Phone} label="Active Calls" value={stats.active} trend={{ value: "+3 from last hour", positive: true }} />
        <MetricCard icon={Bot} label="AI-Handled" value={847} trend={{ value: "94% resolution", positive: true }} />
        <MetricCard icon={Clock} label="Waiting" value={stats.waiting} />
        <MetricCard icon={AlertTriangle} label="Escalated" value={stats.escalated} trend={{ value: "2 need attention", positive: false }} />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Call list */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Active Calls</h2>
          {activeCalls.map((call) => (
            <CallCard key={call.id} call={call} selected={call.id === selectedCallId} onSelect={setSelectedCallId} />
          ))}
        </div>

        {/* Transcript */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Transcript</h2>
          <Card className="p-4 border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{selectedCall.callerName}</span>
                <VoiceWaveform active={selectedCall.status === "ai-handling"} variant="small" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">{selectedCall.duration}</span>
            </div>
            <TranscriptFeed messages={selectedCall.transcript} maxHeight="400px" />
          </Card>
        </div>

        {/* Caller details */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Caller Details</h2>
          <Card className="p-4 border-border/50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{selectedCall.callerName}</p>
                <p className="text-xs text-muted-foreground">{selectedCall.callerPhone}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{selectedCall.callerName.toLowerCase().replace(" ", ".")}@email.com</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <PhoneCall className="h-3 w-3" />
                <span>12 previous calls</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>Customer since 2024</span>
              </div>
            </div>
          </Card>

          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">AI Suggestions</h2>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <Card key={i} className="p-3 border-border/50 text-xs text-foreground flex gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-warning flex-shrink-0 mt-0.5" />
                {s}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
