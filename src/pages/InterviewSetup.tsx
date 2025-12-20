import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { 
  ArrowRight, 
  Briefcase, 
  Code, 
  HelpCircle,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const roles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "ML Engineer",
  "Data Scientist",
  "DevOps Engineer",
  "Mobile Developer",
  "Other"
];

const levels = ["Beginner", "Intermediate", "Advanced"];

const techStacks = [
  "React", "Vue", "Angular", "Node.js", "Python", 
  "Java", "C++", "Go", "Rust", "TypeScript",
  "AWS", "Docker", "Kubernetes", "TensorFlow", "PyTorch"
];

const InterviewSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [level, setLevel] = useState("");
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(5);

  const handleTechToggle = (tech: string) => {
    setSelectedTech(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    );
  };

  const handleStartInterview = () => {
    // Store interview config (will use zustand/context later)
    const config = {
      role: role === "Other" ? customRole : role,
      level,
      techStack: selectedTech,
      questionCount
    };
    console.log("Interview config:", config);
    navigate("/interview/room");
  };

  const canProceed = () => {
    if (step === 1) return role && (role !== "Other" || customRole);
    if (step === 2) return level;
    if (step === 3) return selectedTech.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-12 opacity-0 animate-fade-in">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                  step >= s 
                    ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                    : "bg-secondary text-muted-foreground"
                )}>
                  {s}
                </div>
                {s < 4 && (
                  <ChevronRight className={cn(
                    "w-5 h-5 transition-colors duration-300",
                    step > s ? "text-primary" : "text-muted-foreground"
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="bg-gradient-card border border-border/50 rounded-2xl p-8 shadow-card">
            {/* Step 1: Role */}
            {step === 1 && (
              <div className="space-y-6 opacity-0 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">What role are you interviewing for?</h2>
                    <p className="text-muted-foreground">Select your target job position</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {roles.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all duration-300",
                        role === r
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {role === "Other" && (
                  <div className="space-y-2 opacity-0 animate-fade-in">
                    <Label htmlFor="customRole">Specify your role</Label>
                    <Input
                      id="customRole"
                      placeholder="e.g., Product Manager, UX Designer"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="h-12 bg-secondary/50 border-border/50 focus:border-primary"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Experience Level */}
            {step === 2 && (
              <div className="space-y-6 opacity-0 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">What's your experience level?</h2>
                    <p className="text-muted-foreground">This helps us tailor question difficulty</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {levels.map((l) => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all duration-300",
                        level === l
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <span className="font-semibold">{l}</span>
                      <p className="text-sm mt-1 text-muted-foreground">
                        {l === "Beginner" && "0-2 years of experience"}
                        {l === "Intermediate" && "2-5 years of experience"}
                        {l === "Advanced" && "5+ years of experience"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Tech Stack */}
            {step === 3 && (
              <div className="space-y-6 opacity-0 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Code className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">What's your tech stack?</h2>
                    <p className="text-muted-foreground">Select technologies you want to be interviewed on</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {techStacks.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => handleTechToggle(tech)}
                      className={cn(
                        "px-4 py-2 rounded-full border text-sm font-medium transition-all duration-300",
                        selectedTech.includes(tech)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Question Count */}
            {step === 4 && (
              <div className="space-y-6 opacity-0 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">How many questions?</h2>
                    <p className="text-muted-foreground">Choose your interview length</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Number of questions</span>
                    <span className="text-2xl font-bold text-primary">{questionCount}</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>3 questions</span>
                    <span>~{questionCount * 3} minutes</span>
                    <span>15 questions</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-8 p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <h3 className="font-semibold text-foreground mb-3">Interview Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <span className="text-foreground">{role === "Other" ? customRole : role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level:</span>
                      <span className="text-foreground">{level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tech Stack:</span>
                      <span className="text-foreground">{selectedTech.join(", ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Questions:</span>
                      <span className="text-foreground">{questionCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
              {step > 1 ? (
                <Button variant="ghost" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              {step < 4 ? (
                <Button 
                  variant="hero" 
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button 
                  variant="hero" 
                  onClick={handleStartInterview}
                >
                  Start Interview
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
