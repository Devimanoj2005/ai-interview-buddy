import { createContext, useContext, useState, ReactNode } from "react";

export interface InterviewConfig {
  role: string;
  level: string;
  techStack: string[];
  questionCount: number;
}

export interface Question {
  id: number;
  type: "technical" | "behavioral";
  question: string;
  followUp?: string;
}

export interface TranscriptEntry {
  speaker: "AI" | "User";
  text: string;
  timestamp: Date;
}

interface InterviewContextType {
  config: InterviewConfig | null;
  setConfig: (config: InterviewConfig) => void;
  questions: Question[];
  setQuestions: (questions: Question[]) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  transcript: TranscriptEntry[];
  addTranscriptEntry: (entry: Omit<TranscriptEntry, "timestamp">) => void;
  clearInterview: () => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const InterviewProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const addTranscriptEntry = (entry: Omit<TranscriptEntry, "timestamp">) => {
    setTranscript((prev) => [...prev, { ...entry, timestamp: new Date() }]);
  };

  const clearInterview = () => {
    setConfig(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setTranscript([]);
  };

  return (
    <InterviewContext.Provider
      value={{
        config,
        setConfig,
        questions,
        setQuestions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        transcript,
        addTranscriptEntry,
        clearInterview,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (context === undefined) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return context;
};
