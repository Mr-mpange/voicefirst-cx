export type CallStatus = "ai-handling" | "escalated" | "waiting" | "completed";
export type AIState = "idle" | "listening" | "processing" | "speaking";
export type SystemHealth = "healthy" | "warning" | "critical";

export interface ActiveCall {
  id: string;
  callerName: string;
  callerPhone: string;
  duration: string;
  status: CallStatus;
  aiConfidence: number;
  topic: string;
  transcript: TranscriptMessage[];
}

export interface TranscriptMessage {
  id: string;
  speaker: "ai" | "customer";
  text: string;
  timestamp: string;
}

export interface KnowledgeEntry {
  id: string;
  title: string;
  category: string;
  content: string;
  lastUpdated: string;
}

export const activeCalls: ActiveCall[] = [
  {
    id: "1",
    callerName: "Sarah Mitchell",
    callerPhone: "+1 (555) 234-8901",
    duration: "4:23",
    status: "ai-handling",
    aiConfidence: 94,
    topic: "Billing inquiry",
    transcript: [
      { id: "t1", speaker: "customer", text: "Hi, I have a question about my last invoice.", timestamp: "10:23:01" },
      { id: "t2", speaker: "ai", text: "Of course! I'd be happy to help with your billing inquiry. Could you tell me which invoice you're referring to?", timestamp: "10:23:03" },
      { id: "t3", speaker: "customer", text: "The one from February. There's an extra charge I don't recognize.", timestamp: "10:23:12" },
      { id: "t4", speaker: "ai", text: "I can see your February invoice. The additional charge of $14.99 is for the premium support add-on that was activated on February 3rd. Would you like me to explain this further?", timestamp: "10:23:15" },
    ],
  },
  {
    id: "2",
    callerName: "James Rodriguez",
    callerPhone: "+1 (555) 567-3421",
    duration: "12:07",
    status: "escalated",
    aiConfidence: 42,
    topic: "Technical issue - Service outage",
    transcript: [
      { id: "t5", speaker: "customer", text: "My internet has been down for two days and nobody has helped me.", timestamp: "10:15:30" },
      { id: "t6", speaker: "ai", text: "I'm sorry to hear about the extended outage. Let me check your service status right away.", timestamp: "10:15:33" },
      { id: "t7", speaker: "customer", text: "I've already called three times. I need to speak to someone who can actually fix this.", timestamp: "10:15:45" },
      { id: "t8", speaker: "ai", text: "I completely understand your frustration. I'm connecting you with a senior technical specialist who can resolve this immediately.", timestamp: "10:15:48" },
    ],
  },
  {
    id: "3",
    callerName: "Emily Chen",
    callerPhone: "+1 (555) 890-1234",
    duration: "1:45",
    status: "ai-handling",
    aiConfidence: 87,
    topic: "Plan upgrade inquiry",
    transcript: [
      { id: "t9", speaker: "customer", text: "I want to upgrade my plan to the business tier.", timestamp: "10:25:00" },
      { id: "t10", speaker: "ai", text: "Great choice! The Business tier includes unlimited calls, priority support, and 500GB storage. Would you like me to walk you through the upgrade process?", timestamp: "10:25:03" },
    ],
  },
  {
    id: "4",
    callerName: "Michael Brown",
    callerPhone: "+1 (555) 432-7890",
    duration: "0:32",
    status: "waiting",
    aiConfidence: 0,
    topic: "Unknown",
    transcript: [],
  },
  {
    id: "5",
    callerName: "Lisa Park",
    callerPhone: "+1 (555) 678-9012",
    duration: "8:15",
    status: "ai-handling",
    aiConfidence: 91,
    topic: "Account password reset",
    transcript: [
      { id: "t11", speaker: "customer", text: "I can't log into my account.", timestamp: "10:18:00" },
      { id: "t12", speaker: "ai", text: "I can help you reset your password. I've sent a verification code to your registered email. Could you confirm the code?", timestamp: "10:18:03" },
    ],
  },
  {
    id: "6",
    callerName: "David Kim",
    callerPhone: "+1 (555) 345-6789",
    duration: "6:40",
    status: "escalated",
    aiConfidence: 38,
    topic: "Contract dispute",
    transcript: [
      { id: "t13", speaker: "customer", text: "I was told my contract terms would be different than what I signed.", timestamp: "10:20:00" },
      { id: "t14", speaker: "ai", text: "I understand your concern about the contract terms. Let me connect you with our contracts specialist who can review the details with you.", timestamp: "10:20:03" },
    ],
  },
];

export const knowledgeBase: KnowledgeEntry[] = [
  { id: "kb1", title: "How to reset your password", category: "Account", content: "Navigate to Settings > Security > Reset Password. Enter your current password and choose a new one. Passwords must be at least 12 characters with uppercase, lowercase, and numbers.", lastUpdated: "2026-03-01" },
  { id: "kb2", title: "Understanding your monthly bill", category: "Billing", content: "Your monthly bill includes your base plan, any add-ons, taxes, and usage-based charges. Detailed breakdowns are available in the billing portal under Invoice Details.", lastUpdated: "2026-02-28" },
  { id: "kb3", title: "Service outage troubleshooting", category: "Technical", content: "First, restart your modem and router. Wait 2 minutes between unplugging and replugging. If the issue persists, check our status page for area outages. Contact support if unresolved after 30 minutes.", lastUpdated: "2026-03-05" },
  { id: "kb4", title: "Upgrading your plan", category: "Account", content: "Plans can be upgraded at any time through the account portal. Downgrades take effect at the next billing cycle. Pro-rated charges apply for mid-cycle upgrades.", lastUpdated: "2026-03-02" },
  { id: "kb5", title: "Cancellation policy", category: "Billing", content: "Accounts can be cancelled with 30 days notice. Early termination fees may apply for contracts. Refunds are processed within 5-7 business days.", lastUpdated: "2026-02-20" },
  { id: "kb6", title: "Setting up voicemail", category: "Technical", content: "Dial *86 from your phone and follow the setup prompts. You can customize your greeting and set a PIN. Voicemails are stored for 30 days.", lastUpdated: "2026-02-15" },
  { id: "kb7", title: "International calling rates", category: "Billing", content: "International calls are charged per minute based on the destination country. Add the Global Calling add-on for discounted rates to 60+ countries.", lastUpdated: "2026-03-04" },
  { id: "kb8", title: "Network coverage map", category: "Technical", content: "Our network covers 98% of the continental US. Check coverage for your specific address using our online coverage checker tool.", lastUpdated: "2026-03-06" },
  { id: "kb9", title: "Two-factor authentication setup", category: "Account", content: "Enable 2FA in Settings > Security > Two-Factor Authentication. We support authenticator apps and SMS verification. Recovery codes are provided during setup.", lastUpdated: "2026-03-03" },
  { id: "kb10", title: "Data usage monitoring", category: "Technical", content: "Monitor your data usage in real-time through the My Account app or web portal. Set up usage alerts to avoid overage charges. Unlimited plans have no data caps.", lastUpdated: "2026-02-25" },
];

export const callsPerHourData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i.toString().padStart(2, "0")}:00`,
  calls: Math.floor(Math.random() * 80 + (i >= 8 && i <= 18 ? 40 : 5)),
}));

export const aiVsHumanData = [
  { day: "Mon", ai: 156, human: 34 },
  { day: "Tue", ai: 189, human: 28 },
  { day: "Wed", ai: 172, human: 41 },
  { day: "Thu", ai: 201, human: 32 },
  { day: "Fri", ai: 165, human: 38 },
  { day: "Sat", ai: 89, human: 12 },
  { day: "Sun", ai: 67, human: 8 },
];

export const latencyData = Array.from({ length: 20 }, (_, i) => ({
  time: `${(i * 3).toString().padStart(2, "0")}:00`,
  latency: Math.floor(Math.random() * 30 + 15),
}));

export const callCategoriesData = [
  { name: "Billing", value: 35, fill: "hsl(217, 91%, 60%)" },
  { name: "Technical", value: 28, fill: "hsl(142, 71%, 45%)" },
  { name: "Account", value: 22, fill: "hsl(38, 92%, 50%)" },
  { name: "Sales", value: 15, fill: "hsl(280, 65%, 60%)" },
];

export const sparklineData = (base: number, variance: number) =>
  Array.from({ length: 12 }, () => ({
    value: base + Math.floor(Math.random() * variance - variance / 2),
  }));
