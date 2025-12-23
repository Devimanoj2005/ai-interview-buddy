import { useConversation } from "@elevenlabs/react";
import { useCallback, useRef, useState } from "react";
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
  const userEndedRef = useRef(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs agent");
      userEndedRef.current = false;
      setIsConnecting(false);
      setError(null);
    },
    onDisconnect: (details) => {
      console.log("Disconnected from ElevenLabs agent", details);
      setIsConnecting(false);
      options.onSpeakingChange?.(false);
      options.onListeningChange?.(false);

      // If we didn't intentionally end it, surface a helpful error.
      if (!userEndedRef.current) {
        const message =
          details?.reason === "error"
            ? details.message
            : "The interview disconnected unexpectedly. Please try again.";

        setError(message);
        toast({
          variant: "destructive",
          title: "Interview disconnected",
          description: message,
        });
      }
    },
    onModeChange: ({ mode }) => {
      options.onSpeakingChange?.(mode === "speaking");
      options.onListeningChange?.(mode === "listening");
    },
    onStatusChange: ({ status }) => {
      console.log("ElevenLabs status:", status);
    },
    onMessage: (payload: unknown) => {
      // In @elevenlabs/react v0.12.x, onMessage is a simplified payload:
      // { message: string, role: 'user' | 'agent', source: 'user' | 'ai' }
      console.log("ElevenLabs message:", payload);

      const msg = payload as any;
      const text = (msg?.message ?? msg?.text) as unknown;
      const role = (msg?.role ?? msg?.source) as unknown;

      if (typeof text === "string" && text.trim()) {
        const speaker: "AI" | "User" = role === "agent" || role === "ai" ? "AI" : "User";
        options.onTranscript?.(speaker, text.trim());
      }
    },
    onError: (message: string) => {
      console.error("ElevenLabs error:", message);
      setError(message || "Connection error");
      setIsConnecting(false);
      toast({
        variant: "destructive",
        title: "Voice Connection Error",
        description: message || "Connection error",
      });
    },
    onDebug: (info) => {
      console.log("ElevenLabs debug:", info);
    },
  });

  const isSpeaking = conversation.isSpeaking;

  const startConversation = useCallback(
    async (agentId: string, interviewConfig?: any) => {
      setIsConnecting(true);
      setError(null);
      userEndedRef.current = false;

      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });

        // Get WebRTC token (preferred) or signed URL (fallback)
        const { data, error: fnError } = await supabase.functions.invoke(
          "elevenlabs-conversation-token",
          {
            body: { agentId, interviewConfig },
          }
        );

        if (fnError) {
          throw new Error(fnError.message || "Failed to get conversation credentials");
        }

        if (data?.token) {
          await conversation.startSession({
            conversationToken: data.token,
            connectionType: "webrtc",
          });
          return;
        }

        if (data?.signed_url) {
          await conversation.startSession({
            signedUrl: data.signed_url,
            connectionType: "websocket",
          });
          return;
        }

        throw new Error("No conversation token or signed URL received");
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
    },
    [conversation, toast]
  );

  const endConversation = useCallback(async () => {
    userEndedRef.current = true;
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
