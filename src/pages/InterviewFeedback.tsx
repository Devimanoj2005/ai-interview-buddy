import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  MessageSquare,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useInterview } from "@/hooks/useInterview";
import { useInterviewSession, InterviewFeedback as IFeedback } from "@/hooks/useInterviewSession";

const InterviewFeedback = () => {
  const { clearInterview, sessionId: contextSessionId } = useInterview();
  const { getSession, isAnalyzing } = useInterviewSession();
  const [feedback, setFeedback] = useState<IFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeedback = async () => {
      // First try session storage (from just-completed interview)
      const storedFeedback = sessionStorage.getItem("interviewFeedback");
      const storedSessionId = sessionStorage.getItem("interviewSessionId");
      
      if (storedFeedback) {
        try {
          setFeedback(JSON.parse(storedFeedback));
          sessionStorage.removeItem("interviewFeedback");
          sessionStorage.removeItem("interviewSessionId");
        } catch (e) {
          console.error("Error parsing stored feedback:", e);
        }
      } else if (contextSessionId || storedSessionId) {
        // Load from database
        const session = await getSession(contextSessionId || storedSessionId!);
        if (session && session.overall_score !== null) {
          setFeedback({
            overallScore: session.overall_score,
            technicalScore: session.technical_score || 0,
            communicationScore: session.communication_score || 0,
            problemSolvingScore: session.problem_solving_score || 0,
            strengths: session.strengths,
            improvements: session.improvements,
            detailedFeedback: session.ai_feedback || "",
          });
        }
      }
      
      setIsLoading(false);
    };

    loadFeedback();
  }, [contextSessionId, getSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterview();
    };
  }, [clearInterview]);

  if (isLoading || isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Analyzing Your Interview</h2>
          <p className="text-muted-foreground">Our AI is reviewing your responses...</p>
        </div>
      </div>
    );
  }

  // Fallback mock data if no real feedback
  const displayFeedback = feedback || {
    overallScore: 0,
    technicalScore: 0,
    communicationScore: 0,
    problemSolvingScore: 0,
    strengths: ["Complete an interview to see your strengths"],
    improvements: ["Complete an interview to see areas for improvement"],
    detailedFeedback: "",
  };

  const metrics = [
    { label: "Technical Knowledge", score: displayFeedback.technicalScore, icon: Target },
    { label: "Communication", score: displayFeedback.communicationScore, icon: MessageSquare },
    { label: "Problem Solving", score: displayFeedback.problemSolvingScore, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 opacity-0 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-gradient-primary mx-auto mb-6 flex items-center justify-center shadow-glow">
              <Trophy className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Interview Complete!</h1>
            <p className="text-muted-foreground">
              {feedback ? "Here's your AI-powered performance analysis" : "Complete an interview to see your feedback"}
            </p>
          </div>

          {/* Overall Score */}
          <div className="bg-gradient-card border border-border/50 rounded-2xl p-8 shadow-card mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-1">Overall Performance</h2>
                <p className="text-muted-foreground text-sm">Based on AI analysis of your responses</p>
              </div>
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="hsl(var(--secondary))"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${displayFeedback.overallScore * 2.83} 283`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(180 70% 45%)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">{displayFeedback.overallScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {metrics.map((metric, index) => (
              <div 
                key={metric.label}
                className="bg-gradient-card border border-border/50 rounded-xl p-5 shadow-card opacity-0 animate-fade-in"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <metric.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{metric.label}</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-primary">{metric.score}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-primary rounded-full transition-all duration-1000"
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Feedback */}
          {displayFeedback.detailedFeedback && (
            <div className="bg-gradient-card border border-border/50 rounded-xl p-6 shadow-card mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "450ms" }}>
              <h3 className="font-semibold text-foreground mb-4">Detailed Analysis</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{displayFeedback.detailedFeedback}</p>
            </div>
          )}

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Strengths */}
            <div className="bg-gradient-card border border-border/50 rounded-xl p-6 shadow-card opacity-0 animate-fade-in" style={{ animationDelay: "500ms" }}>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-foreground">Strengths</h3>
              </div>
              <ul className="space-y-3">
                {displayFeedback.strengths.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="bg-gradient-card border border-border/50 rounded-xl p-6 shadow-card opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Areas to Improve</h3>
              </div>
              <ul className="space-y-3">
                {displayFeedback.improvements.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in" style={{ animationDelay: "700ms" }}>
            <Button variant="hero" size="lg" asChild>
              <Link to="/interview/setup">
                <RotateCcw className="w-5 h-5" />
                Practice Again
              </Link>
            </Button>
            <Button variant="glass" size="lg" asChild>
              <Link to="/dashboard">
                View All Sessions
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewFeedback;
