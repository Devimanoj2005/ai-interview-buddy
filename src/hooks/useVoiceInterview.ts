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
      console.log("Received message:", message);
      
      // Handle different message types
      const msg = message as Record<string, unknown>;
      if (msg.type === "user_transcript") {
        const event = msg.user_transcription_event as Record<string, unknown> | undefined;
        const userMessage = event?.user_transcript as string | undefined;
        if (userMessage) {
          options.onTranscript?.("User", userMessage);
        }
      } else if (msg.type === "agent_response") {
        const event = msg.agent_response_event as Record<string, unknown> | undefined;
        const agentMessage = event?.agent_response as string | undefined;
        if (agentMessage) {
          options.onTranscript?.("AI", agentMessage);
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
