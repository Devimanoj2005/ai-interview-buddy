import { useConversation } from "@elevenlabs/react";
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseVoiceInterviewOptions {
  onTranscript?: (speaker: "AI" | "User", text: string) => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  onListeningChange?: (isListening: boolean) => void;
}

export const useVoiceInterview = (options: UseVoiceInterviewOptions = {}) => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs agent");
      setIsConnecting(false);
      setError(null);
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs agent");
      options.onSpeakingChange?.(false);
      options.onListeningChange?.(false);
    },
    onMessage: (message: unknown) => {
      console.log("Received message:", JSON.stringify(message, null, 2));
      
      // Handle different message types from ElevenLabs
      const msg = message as Record<string, unknown>;
      const messageType = msg.type as string;
      
      // User transcript - finalized speech-to-text
      if (messageType === "user_transcript") {
        // Try multiple possible property paths for user transcript
        const userTranscript = 
          (msg.user_transcription_event as Record<string, unknown>)?.user_transcript ||
          (msg.user_transcript_event as Record<string, unknown>)?.user_transcript ||
          msg.user_transcript ||
          msg.text;
        
        if (userTranscript && typeof userTranscript === "string" && userTranscript.trim()) {
          console.log("User said:", userTranscript);
          options.onTranscript?.("User", userTranscript.trim());
        }
      } 
      // Agent response - AI's spoken text
      else if (messageType === "agent_response") {
        const agentResponse = 
          (msg.agent_response_event as Record<string, unknown>)?.agent_response ||
          msg.agent_response ||
          msg.text;
        
        if (agentResponse && typeof agentResponse === "string" && agentResponse.trim()) {
          console.log("Agent said:", agentResponse);
          options.onTranscript?.("AI", agentResponse.trim());
        }
      }
      // Handle transcript type directly (some ElevenLabs versions)
      else if (messageType === "transcript" && msg.text) {
        const text = msg.text as string;
        const role = msg.role as string;
        if (text.trim()) {
          console.log(`Transcript [${role}]:`, text);
          options.onTranscript?.(role === "agent" ? "AI" : "User", text.trim());
        }
      }
      // Handle audio_transcript for live transcription
      else if (messageType === "audio" && msg.audio_event) {
        const audioEvent = msg.audio_event as Record<string, unknown>;
        if (audioEvent.transcript) {
          const transcript = audioEvent.transcript as string;
          console.log("Audio transcript:", transcript);
        }
      }
    },
    onError: (err: unknown) => {
      console.error("ElevenLabs error:", err);
      const errorMessage = typeof err === "string" ? err : "Connection error";
      setError(errorMessage);
      setIsConnecting(false);
      toast({
        variant: "destructive",
        title: "Voice Connection Error",
        description: errorMessage,
      });
    },
  });

  // Track speaking/listening states
  const isSpeaking = conversation.isSpeaking;

  const startConversation = useCallback(async (agentId: string, interviewConfig?: any) => {
    setIsConnecting(true);
    setError(null);

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get signed URL from edge function
      const { data, error: fnError } = await supabase.functions.invoke(
        "elevenlabs-conversation-token",
        {
          body: { agentId, interviewConfig },
        }
      );

      if (fnError) {
        throw new Error(fnError.message || "Failed to get conversation token");
      }

      if (!data?.signed_url) {
        throw new Error("No signed URL received");
      }

      // Start the conversation with WebSocket
      await conversation.startSession({
        signedUrl: data.signed_url,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start conversation";
      console.error("Failed to start conversation:", err);
      setError(errorMessage);
      setIsConnecting(false);
      
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: errorMessage,
      });
    }
  }, [conversation, toast]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
    options.onSpeakingChange?.(false);
    options.onListeningChange?.(false);
  }, [conversation, options]);

  return {
    isConnected: conversation.status === "connected",
    isConnecting,
    isSpeaking,
    error,
    startConversation,
    endConversation,
    sendMessage: conversation.sendUserMessage,
  };
};
