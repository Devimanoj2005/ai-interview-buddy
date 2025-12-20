import { cn } from "@/lib/utils";

interface VoiceWaveProps {
  isActive: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const VoiceWave = ({ isActive, className, size = "md" }: VoiceWaveProps) => {
  const heights = {
    sm: ["h-3", "h-4", "h-5", "h-4", "h-3"],
    md: ["h-4", "h-6", "h-8", "h-6", "h-4"],
    lg: ["h-6", "h-10", "h-14", "h-10", "h-6"],
  };

  const widths = {
    sm: "w-0.5",
    md: "w-1",
    lg: "w-1.5",
  };

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {heights[size].map((height, i) => (
        <div
          key={i}
          className={cn(
            widths[size],
            height,
            "voice-bar transition-all duration-200",
            !isActive && "!h-1 !animate-none opacity-50"
          )}
        />
      ))}
    </div>
  );
};
