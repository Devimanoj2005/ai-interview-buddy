import { useState, useEffect, useRef } from "react";
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
  Clock,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInterview, TranscriptEntry } from "@/hooks/useInterview";
import { useVoiceInterview } from "@/hooks/useVoiceInterview";
import { Input } from "@/components/ui/input";

// You'll need to create an ElevenLabs agent and add the ID here
// Create one at: https://elevenlabs.io/conversational-ai
const ELEVENLABS_AGENT_ID = "";

const InterviewRoom = () => {
  const navigate = useNavigate();
  const { config, questions, currentQuestionIndex, transcript, addTranscriptEntry } = useInterview();
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [agentId, setAgentId] = useState(ELEVENLABS_AGENT_ID);
  const [showAgentInput, setShowAgentInput] = useState(!ELEVENLABS_AGENT_ID);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const {
    isConnected,
    isConnecting,
    isSpeaking,
    error,
    startConversation,
    endConversation,
  } = useVoiceInterview({
    onTranscript: (speaker, text) => {
      addTranscriptEntry({ speaker, text });
    },
    onSpeakingChange: (speaking) => {
      console.log("AI speaking:", speaking);
    },
  });

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleStartInterview = async () => {
    if (!agentId.trim()) {
      setShowAgentInput(true);
      return;
    }
    await startConversation(agentId, config);
  };

  const handleEndInterview = async () => {
    await endConversation();
    navigate("/interview/feedback");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <Navbar />
      
      {/* Main Interview Area */}
      <div className="flex-1 container mx-auto px-4 pt-24 pb-32">
        {/* Agent ID Input (if not configured) */}
        {showAgentInput && !isConnected && (
          <div className="max-w-md mx-auto mb-8 p-6 bg-gradient-card border border-border/50 rounded-2xl shadow-card opacity-0 animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-accent" />
              <h3 className="font-semibold text-foreground">ElevenLabs Agent Required</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              To use voice interviews, you need an ElevenLabs Conversational AI agent. 
              <a 
                href="https://elevenlabs.io/conversational-ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                Create one here
              </a>
            </p>
            <Input
              placeholder="Enter your ElevenLabs Agent ID"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="mb-4 h-12 bg-secondary/50 border-border/50"
            />
            <Button 
              variant="hero" 
              className="w-full"
              onClick={() => setShowAgentInput(false)}
              disabled={!agentId.trim()}
            >
              Continue
            </Button>
          </div>
        )}

        <div className="h-full flex flex-col lg:flex-row gap-8">
          {/* AI Avatar Section */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative mb-20">
              <AIAvatar 
                isSpeaking={isSpeaking} 
                isListening={isConnected && !isSpeaking}
              />
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500" : isConnecting ? "bg-yellow-500 animate-pulse" : "bg-muted-foreground"
              )} />
              <span className="text-sm">
                {isConnected ? "Connected" : isConnecting ? "Connecting..." : "Disconnected"}
              </span>
            </div>

            {/* Question Counter */}
            {config && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  Question {currentQuestionIndex + 1} of {config.questionCount}
                </span>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Transcript Section */}
          <div className="w-full lg:w-96 bg-gradient-card border border-border/50 rounded-2xl p-6 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Live Transcript</h3>
            </div>

            <div 
              ref={transcriptRef}
              className="space-y-4 max-h-[400px] overflow-y-auto pr-2"
            >
              {transcript.length === 0 && !isConnected && (
                <p className="text-center text-muted-foreground text-sm py-8">
                  Start the interview to begin the conversation
                </p>
              )}
              
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

            {/* Speaking Indicator */}
            {isConnected && !isSpeaking && (
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
            {/* Start/Mic Button */}
            {!isConnected ? (
              <Button
                variant="hero"
                size="icon-lg"
                onClick={handleStartInterview}
                disabled={isConnecting}
                className="rounded-full"
              >
                {isConnecting ? (
                  <div className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </Button>
            ) : (
              <Button
                variant="hero"
                size="icon-lg"
                className={cn("rounded-full", !isSpeaking && "animate-pulse")}
                disabled
              >
                <Mic className="w-6 h-6" />
              </Button>
            )}

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
            {!isConnected 
              ? "Tap mic to start interview" 
              : isSpeaking 
                ? "AI is speaking..." 
                : "Speak now - AI is listening"
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
