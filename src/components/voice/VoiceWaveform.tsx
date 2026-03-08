interface VoiceWaveformProps {
  active: boolean;
  variant?: "large" | "small";
  className?: string;
}

const VoiceWaveform = ({ active, variant = "large", className = "" }: VoiceWaveformProps) => {
  const barCount = variant === "large" ? 7 : 5;
  const animations = [
    "animate-waveform-1",
    "animate-waveform-2",
    "animate-waveform-3",
    "animate-waveform-4",
    "animate-waveform-5",
    "animate-waveform-1",
    "animate-waveform-3",
  ];

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full bg-primary transition-all duration-300 ${
            variant === "large" ? "w-1.5" : "w-1"
          } ${
            active
              ? animations[i % animations.length]
              : variant === "large"
              ? "h-3"
              : "h-1.5"
          }`}
          style={active ? undefined : { height: variant === "large" ? "12px" : "6px" }}
        />
      ))}
    </div>
  );
};

export default VoiceWaveform;
