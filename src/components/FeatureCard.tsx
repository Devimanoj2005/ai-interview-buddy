import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  delay?: number;
}

export const FeatureCard = ({ icon: Icon, title, description, className, delay = 0 }: FeatureCardProps) => {
  return (
    <div 
      className={cn(
        "group relative p-6 rounded-2xl bg-gradient-card border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-card opacity-0 animate-fade-in",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
      
      {/* Icon container */}
      <div className="relative w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:shadow-glow transition-all duration-500">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      
      {/* Content */}
      <h3 className="relative text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="relative text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
};
