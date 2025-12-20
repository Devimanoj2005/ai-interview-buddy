import { cn } from "@/lib/utils";
import { VoiceWave } from "./VoiceWave";
import { Bot } from "lucide-react";

interface AIAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  className?: string;
}

export const AIAvatar = ({ isSpeaking, isListening, className }: AIAvatarProps) => {
  return (
    <div className={cn("relative", className)}>
      {/* Outer glow rings */}
      {(isSpeaking || isListening) && (
        <>
          <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20 animate-pulse-ring" />
          <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-10 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
        </>
      )}
      
      {/* Main avatar circle */}
      <div className={cn(
        "relative w-32 h-32 rounded-full bg-gradient-card border-2 border-primary/30 flex items-center justify-center transition-all duration-500",
        isSpeaking && "shadow-glow border-primary/60",
        isListening && "border-accent/60"
      )}>
        {/* Inner gradient */}
        <div className="absolute inset-2 rounded-full bg-gradient-primary opacity-10" />
        
        {/* AI Icon */}
        <Bot className={cn(
          "w-12 h-12 text-primary transition-all duration-300",
          isSpeaking && "text-primary animate-pulse",
          isListening && "text-accent"
        )} />
        
        {/* Voice wave indicator */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
          <VoiceWave isActive={isSpeaking} size="md" />
        </div>
      </div>
      
      {/* Status text */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className={cn(
          "text-sm font-medium transition-colors duration-300",
          isSpeaking && "text-primary",
          isListening && "text-accent",
          !isSpeaking && !isListening && "text-muted-foreground"
        )}>
          {isSpeaking ? "AI Speaking..." : isListening ? "Listening..." : "Ready"}
        </span>
      </div>
    </div>
  );
};
