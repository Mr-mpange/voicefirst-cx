import type { AIState } from "@/lib/mockData";
import alexAvatar from "@/assets/alex-avatar.jpg";

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
  const dim = size === "lg" ? "h-24 w-24" : "h-10 w-10";

  return (
    <div className="relative flex items-center justify-center">
      {state !== "idle" && (
        <div
          className={`absolute ${dim} rounded-full border-2 ${stateColors[state]} animate-pulse-ring`}
        />
      )}
      <div
        className={`${dim} rounded-full border-2 ${stateColors[state]} ${stateGlow[state]} overflow-hidden transition-all duration-300`}
      >
        <img
          src={alexAvatar}
          alt="Alex — your support agent"
          className="h-full w-full object-cover"
        />
      </div>
      {state !== "idle" && (
        <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-success border-2 border-background" />
      )}
    </div>
  );
};

export default AIAvatar;
