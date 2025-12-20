import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AIAvatar } from "@/components/AIAvatar";
import { VoiceWave } from "@/components/VoiceWave";
import { Navbar } from "@/components/Navbar";
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare,
  Volume2,
  VolumeX,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

const InterviewRoom = () => {
  const navigate = useNavigate();
  const [isMicOn, setIsMicOn] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isAISpeaking, setIsAISpeaking] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [transcript, setTranscript] = useState<Array<{speaker: string, text: string}>>([
    { speaker: "AI", text: "Hello! Welcome to your mock interview. I'm your AI interviewer today. Let's start with a simple question - can you tell me a bit about yourself and your background?" }
  ]);

  const handleMicToggle = () => {
    setIsMicOn(!isMicOn);
    if (!isMicOn) {
      // When turning mic on, AI stops speaking
      setIsAISpeaking(false);
    }
  };

  const handleEndInterview = () => {
    navigate("/interview/feedback");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Navbar />
      
      {/* Main Interview Area */}
      <div className="flex-1 container mx-auto px-4 pt-24 pb-32">
        <div className="h-full flex flex-col lg:flex-row gap-8">
          {/* AI Avatar Section */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative mb-20">
              <AIAvatar 
                isSpeaking={isAISpeaking} 
                isListening={isMicOn}
              />
            </div>

            {/* Question Counter */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Question {currentQuestion} of 5</span>
            </div>
          </div>

          {/* Transcript Section */}
          <div className="w-full lg:w-96 bg-gradient-card border border-border/50 rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Live Transcript</h3>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {transcript.map((entry, index) => (
                <div 
                  key={index}
                  className={cn(
                    "p-3 rounded-xl text-sm",
                    entry.speaker === "AI" 
                      ? "bg-primary/10 border border-primary/20" 
                      : "bg-secondary/50 border border-border/50"
                  )}
                >
                  <span className={cn(
                    "text-xs font-semibold block mb-1",
                    entry.speaker === "AI" ? "text-primary" : "text-accent"
                  )}>
                    {entry.speaker === "AI" ? "AI Interviewer" : "You"}
                  </span>
                  <p className="text-foreground">{entry.text}</p>
                </div>
              ))}
            </div>

            {/* User Speaking Indicator */}
            {isMicOn && (
              <div className="mt-4 p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-3">
                <VoiceWave isActive={true} size="sm" />
                <span className="text-sm text-accent">Listening to you...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-border/50 py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4">
            {/* Mic Button */}
            <Button
              variant={isMicOn ? "hero" : "glass"}
              size="icon-lg"
              onClick={handleMicToggle}
              className={cn(
                "rounded-full",
                isMicOn && "animate-pulse"
              )}
            >
              {isMicOn ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </Button>

            {/* Speaker Button */}
            <Button
              variant="glass"
              size="icon-lg"
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className="rounded-full"
            >
              {isSpeakerOn ? (
                <Volume2 className="w-6 h-6" />
              ) : (
                <VolumeX className="w-6 h-6" />
              )}
            </Button>

            {/* End Call Button */}
            <Button
              variant="destructive"
              size="icon-lg"
              onClick={handleEndInterview}
              className="rounded-full"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-3">
            {isMicOn ? "Tap mic to pause" : "Tap mic to speak"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
