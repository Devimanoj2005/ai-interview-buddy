import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { AIAvatar } from "@/components/AIAvatar";
import { Navbar } from "@/components/Navbar";
import { 
  Mic, 
  Brain, 
  FileText, 
  Clock, 
  Shield, 
  Sparkles,
  ArrowRight,
  Play
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        </div>

        <div className="container mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 mb-8 opacity-0 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered Interview Practice</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <span className="text-foreground">Ace Your Next Interview</span>
            <br />
            <span className="text-gradient-primary">With AI That Listens</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
            Practice real-time voice interviews with an AI that responds naturally, 
            asks follow-up questions, and gives you detailed feedback.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup" className="gap-2">
                Start Free Interview
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="/login" className="gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </Link>
            </Button>
          </div>

          {/* AI Avatar Preview */}
          <div className="flex justify-center mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <AIAvatar isSpeaking={true} isListening={false} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why InterviewAI?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to prepare for your dream job interview
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Mic}
              title="Real-Time Voice"
              description="Natural voice conversation with AI that responds instantly to your answers."
              delay={0}
            />
            <FeatureCard
              icon={Brain}
              title="Smart Questions"
              description="AI-generated questions tailored to your role, experience, and tech stack."
              delay={100}
            />
            <FeatureCard
              icon={FileText}
              title="Detailed Feedback"
              description="Get comprehensive feedback with tips to improve your interview skills."
              delay={200}
            />
            <FeatureCard
              icon={Clock}
              title="Save Sessions"
              description="Review your past interviews with full transcripts and recordings."
              delay={300}
            />
            <FeatureCard
              icon={Shield}
              title="Guest Mode"
              description="Try it out without signing up. Your data stays private."
              delay={400}
            />
            <FeatureCard
              icon={Sparkles}
              title="Natural Responses"
              description="AI that uses back-channeling like 'hmm', 'I see' for realistic practice."
              delay={500}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="relative rounded-3xl bg-gradient-card border border-border/50 p-8 md:p-16 text-center overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-primary opacity-5" />
            
            <h2 className="relative text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Practice?
            </h2>
            <p className="relative text-muted-foreground mb-8 max-w-lg mx-auto">
              Start your first AI mock interview in minutes. No credit card required.
            </p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/signup">Create Free Account</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/interview/setup">Try as Guest</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border/50">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
          <div>© 2025 InterviewAI. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
