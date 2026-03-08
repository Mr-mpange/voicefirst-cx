import { Bot } from "lucide-react";
import type { AIState } from "@/lib/mockData";

interface AIAvatarProps {
  state: AIState;
  size?: "lg" | "sm";
}

const stateColors: Record<AIState, string> = {
  idle: "border-muted-foreground/30",
  listening: "border-primary",
  processing: "border-warning",
  speaking: "border-success",
};

const stateGlow: Record<AIState, string> = {
  idle: "",
  listening: "shadow-[0_0_20px_hsl(217,91%,60%,0.3)]",
  processing: "shadow-[0_0_20px_hsl(38,92%,50%,0.3)]",
  speaking: "shadow-[0_0_20px_hsl(142,71%,45%,0.3)]",
};

const AIAvatar = ({ state, size = "lg" }: AIAvatarProps) => {
  const dim = size === "lg" ? "h-20 w-20" : "h-10 w-10";
  const iconSize = size === "lg" ? "h-10 w-10" : "h-5 w-5";

  return (
    <div className="relative flex items-center justify-center">
      {state !== "idle" && (
        <div
          className={`absolute ${dim} rounded-full border-2 ${stateColors[state]} animate-pulse-ring`}
        />
      )}
      <div
        className={`${dim} rounded-full border-2 ${stateColors[state]} ${stateGlow[state]} bg-card flex items-center justify-center transition-all duration-300`}
      >
        <Bot className={`${iconSize} text-primary`} />
      </div>
    </div>
  );
};

export default AIAvatar;
