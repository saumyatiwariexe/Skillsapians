import * as React from "react";
import { cn } from "./Button";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: React.ReactNode;
  description: string;
  icon?: React.ReactNode;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, description, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface border border-subtle rounded-md p-6 flex flex-col gap-2",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2 text-text-secondary font-body text-sm font-medium">
          {icon && <span className="text-text-tertiary">{icon}</span>}
          {title}
        </div>
        <div className="font-display font-bold text-[32px] leading-tight text-text-primary">
          {value}
        </div>
        <p className="font-body text-xs text-text-tertiary leading-relaxed mt-1">
          {description}
        </p>
      </div>
    );
  }
);
StatCard.displayName = "StatCard";
