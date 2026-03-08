import type { TranscriptMessage } from "@/lib/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptFeedProps {
  messages: TranscriptMessage[];
  maxHeight?: string;
}

const TranscriptFeed = ({ messages, maxHeight = "300px" }: TranscriptFeedProps) => {
  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
        No transcript available
      </div>
    );
  }

  return (
    <ScrollArea style={{ maxHeight }}>
      <div className="space-y-3 p-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-fade-in ${
              msg.speaker === "ai" ? "flex-row" : "flex-row-reverse"
            }`}
          >
            <div
              className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                msg.speaker === "ai"
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {msg.speaker === "ai" ? "AI" : "C"}
            </div>
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                msg.speaker === "ai"
                  ? "bg-primary/10 text-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <p>{msg.text}</p>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default TranscriptFeed;
