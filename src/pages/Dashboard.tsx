import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { 
  Plus, 
  Calendar, 
  Clock, 
  TrendingUp,
  ChevronRight,
  Briefcase,
  LogOut,
  FileText,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptEntry {
  speaker: string;
  text: string;
}

interface Session {
  id: string;
  role: string;
  level: string;
  created_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  overall_score: number | null;
  question_count: number;
  transcript: TranscriptEntry[] | unknown;
  strengths: string[] | null;
  improvements: string[] | null;
  ai_feedback: string | null;
  technical_score: number | null;
  communication_score: number | null;
  problem_solving_score: number | null;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("interview_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching sessions:", error);
      } else {
        setSessions(data as Session[]);
      }
      setLoading(false);
    };

    fetchSessions();
  }, [user]);

  const completedSessions = sessions.filter(s => s.completed_at && s.overall_score);
  const averageScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((acc, s) => acc + (s.overall_score || 0), 0) / completedSessions.length)
    : 0;
  const totalInterviews = completedSessions.length;
  const totalTime = Math.round(sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) / 60);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-accent";
    return "text-destructive";
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-28 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="opacity-0 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ''}! Track your interview practice progress
            </p>
          </div>
          <div className="flex items-center gap-3 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <Button variant="glass" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
            <Button variant="hero" asChild>
              <Link to="/interview/setup">
                <Plus className="w-5 h-5" />
                New Interview
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-card border border-border/50 rounded-xl p-5 shadow-card opacity-0 animate-fade-in" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">Completed Interviews</span>
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
            </div>
            <span className="text-3xl font-bold text-foreground">{totalInterviews}</span>
          </div>

          <div className="bg-gradient-card border border-border/50 rounded-xl p-5 shadow-card opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">Average Score</span>
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
            <span className={cn("text-3xl font-bold", averageScore > 0 ? "text-primary" : "text-muted-foreground")}>
              {averageScore > 0 ? `${averageScore}%` : "—"}
            </span>
          </div>

          <div className="bg-gradient-card border border-border/50 rounded-xl p-5 shadow-card opacity-0 animate-fade-in" style={{ animationDelay: "250ms" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">Total Practice Time</span>
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
            </div>
            <span className="text-3xl font-bold text-foreground">{totalTime} min</span>
          </div>
        </div>

        {/* Session History */}
        <div className="bg-gradient-card border border-border/50 rounded-2xl p-6 shadow-card opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
          <h2 className="text-xl font-semibold text-foreground mb-6">Session History</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div 
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className="group flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/30 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{session.role}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(session.created_at), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDuration(session.duration_seconds)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-xs">
                          {session.level}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {session.overall_score ? (
                        <>
                          <span className={cn("text-lg font-bold", getScoreColor(session.overall_score))}>
                            {session.overall_score}%
                          </span>
                          <p className="text-xs text-muted-foreground">{session.question_count} questions</p>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">In Progress</span>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No interview sessions yet</p>
              <Button variant="hero" asChild>
                <Link to="/interview/setup">Start Your First Interview</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Session Detail Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-primary" />
              {selectedSession?.role} - {selectedSession?.level}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Scores */}
                {selectedSession.overall_score && (
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                      <div className="text-2xl font-bold text-primary">{selectedSession.overall_score}%</div>
                      <div className="text-xs text-muted-foreground">Overall</div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-center">
                      <div className="text-xl font-bold text-foreground">{selectedSession.technical_score || "—"}%</div>
                      <div className="text-xs text-muted-foreground">Technical</div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-center">
                      <div className="text-xl font-bold text-foreground">{selectedSession.communication_score || "—"}%</div>
                      <div className="text-xs text-muted-foreground">Communication</div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-center">
                      <div className="text-xl font-bold text-foreground">{selectedSession.problem_solving_score || "—"}%</div>
                      <div className="text-xs text-muted-foreground">Problem Solving</div>
                    </div>
                  </div>
                )}

                {/* AI Feedback */}
                {selectedSession.ai_feedback && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">AI Feedback</h4>
                    <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg">
                      {selectedSession.ai_feedback}
                    </p>
                  </div>
                )}

                {/* Strengths & Improvements */}
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedSession.strengths && selectedSession.strengths.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 text-green-500">Strengths</h4>
                      <ul className="space-y-1">
                        {selectedSession.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-500">✓</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedSession.improvements && selectedSession.improvements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 text-accent">Areas to Improve</h4>
                      <ul className="space-y-1">
                        {selectedSession.improvements.map((s, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-accent">→</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Transcript */}
                {selectedSession.transcript && Array.isArray(selectedSession.transcript) && selectedSession.transcript.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Transcript
                    </h4>
                    <div className="space-y-2 bg-secondary/20 p-4 rounded-lg max-h-64 overflow-y-auto">
                      {(selectedSession.transcript as TranscriptEntry[]).map((entry, index) => (
                        <div 
                          key={index}
                          className={cn(
                            "p-2 rounded-lg text-sm",
                            entry.speaker === "AI" 
                              ? "bg-primary/10 border border-primary/20" 
                              : "bg-secondary/50 border border-border/50"
                          )}
                        >
                          <span className={cn(
                            "text-xs font-semibold",
                            entry.speaker === "AI" ? "text-primary" : "text-accent"
                          )}>
                            {entry.speaker === "AI" ? "AI Interviewer" : "You"}:
                          </span>
                          <span className="text-foreground ml-2">{entry.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Session Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border/50 pt-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedSession.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(selectedSession.duration_seconds)}
                  </span>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
