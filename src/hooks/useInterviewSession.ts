import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { InterviewConfig, TranscriptEntry } from "@/hooks/useInterview";
import { useToast } from "@/hooks/use-toast";

export interface InterviewFeedback {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
}

export interface InterviewSession {
  id: string;
  role: string;
  level: string;
  tech_stack: string[];
  question_count: number;
  transcript: TranscriptEntry[];
  overall_score: number | null;
  technical_score: number | null;
  communication_score: number | null;
  problem_solving_score: number | null;
  strengths: string[];
  improvements: string[];
  ai_feedback: string | null;
  duration_seconds: number | null;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export const useInterviewSession = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const createSession = async (config: InterviewConfig): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to save your interview sessions.",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("interview_sessions")
        .insert({
          user_id: user.id,
          role: config.role,
          level: config.level,
          tech_stack: config.techStack,
          question_count: config.questionCount,
          status: "in_progress",
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSessionId(data.id);
      return data.id;
    } catch (error) {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: "Failed to create interview session.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTranscript = async (
    sessionId: string,
    transcript: TranscriptEntry[]
  ) => {
    try {
      const { error } = await supabase
        .from("interview_sessions")
        .update({
          transcript: JSON.parse(JSON.stringify(transcript)),
        })
        .eq("id", sessionId);

      if (error) throw error;
    } catch (error) {
      console.error("Error updating transcript:", error);
    }
  };

  const analyzeAndComplete = async (
    sessionId: string,
    transcript: TranscriptEntry[],
    config: InterviewConfig,
    durationSeconds: number
  ): Promise<InterviewFeedback | null> => {
    setIsAnalyzing(true);

    try {
      // First update the transcript
      await updateTranscript(sessionId, transcript);

      // Call the AI analysis function
      const { data, error } = await supabase.functions.invoke("analyze-interview", {
        body: {
          transcript,
          role: config.role,
          level: config.level,
          techStack: config.techStack,
        },
      });

      if (error) throw error;

      const feedback: InterviewFeedback = {
        overallScore: data.overallScore,
        technicalScore: data.technicalScore,
        communicationScore: data.communicationScore,
        problemSolvingScore: data.problemSolvingScore,
        strengths: data.strengths || [],
        improvements: data.improvements || [],
        detailedFeedback: data.detailedFeedback || "",
      };

      // Update the session with analysis results
      const { error: updateError } = await supabase
        .from("interview_sessions")
        .update({
          transcript: JSON.parse(JSON.stringify(transcript)),
          overall_score: feedback.overallScore,
          technical_score: feedback.technicalScore,
          communication_score: feedback.communicationScore,
          problem_solving_score: feedback.problemSolvingScore,
          strengths: feedback.strengths,
          improvements: feedback.improvements,
          ai_feedback: feedback.detailedFeedback,
          duration_seconds: durationSeconds,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (updateError) throw updateError;

      return feedback;
    } catch (error) {
      console.error("Error analyzing interview:", error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze interview. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSession = async (sessionId: string): Promise<InterviewSession | null> => {
    try {
      const { data, error } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("id", sessionId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;

      return {
        ...data,
        transcript: (data.transcript as unknown as TranscriptEntry[]) || [],
        strengths: data.strengths || [],
        improvements: data.improvements || [],
      };
    } catch (error) {
      console.error("Error fetching session:", error);
      return null;
    }
  };

  const getUserSessions = async (): Promise<InterviewSession[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((session) => ({
        ...session,
        transcript: (session.transcript as unknown as TranscriptEntry[]) || [],
        strengths: session.strengths || [],
        improvements: session.improvements || [],
      }));
    } catch (error) {
      console.error("Error fetching sessions:", error);
      return [];
    }
  };

  return {
    currentSessionId,
    isAnalyzing,
    createSession,
    updateTranscript,
    analyzeAndComplete,
    getSession,
    getUserSessions,
  };
};
