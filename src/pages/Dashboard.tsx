import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { 
  Plus, 
  Calendar, 
  Clock, 
  TrendingUp,
  ChevronRight,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock session data
const sessions = [
  {
    id: 1,
    role: "Frontend Developer",
    level: "Intermediate",
    date: "Dec 19, 2025",
    duration: "18 min",
    score: 82,
    questions: 5
  },
  {
    id: 2,
    role: "Full Stack Developer",
    level: "Advanced",
    date: "Dec 18, 2025",
    duration: "25 min",
    score: 75,
    questions: 8
  },
  {
    id: 3,
    role: "Backend Developer",
    level: "Beginner",
    date: "Dec 17, 2025",
    duration: "12 min",
    score: 88,
    questions: 4
  }
];

const Dashboard = () => {
  const averageScore = Math.round(sessions.reduce((acc, s) => acc + s.score, 0) / sessions.length);
  const totalInterviews = sessions.length;
  const totalTime = sessions.reduce((acc, s) => acc + parseInt(s.duration), 0);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-28 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div className="opacity-0 animate-fade-in">
            <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
            <p className="text-muted-foreground">Track your interview practice progress</p>
          </div>
          <Button variant="hero" asChild className="opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <Link to="/interview/setup">
              <Plus className="w-5 h-5" />
              New Interview
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-card border border-border/50 rounded-xl p-5 shadow-card opacity-0 animate-fade-in" style={{ animationDelay: "150ms" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">Total Interviews</span>
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
            <span className="text-3xl font-bold text-primary">{averageScore}%</span>
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
          <h2 className="text-xl font-semibold text-foreground mb-6">Recent Sessions</h2>
          
          <div className="space-y-3">
            {sessions.map((session, index) => (
              <div 
                key={session.id}
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
                        {session.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {session.duration}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className={cn(
                      "text-lg font-bold",
                      session.score >= 80 ? "text-green-500" : session.score >= 60 ? "text-accent" : "text-destructive"
                    )}>
                      {session.score}%
                    </span>
                    <p className="text-xs text-muted-foreground">{session.questions} questions</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>

          {sessions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No interview sessions yet</p>
              <Button variant="hero" asChild>
                <Link to="/interview/setup">Start Your First Interview</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
