import * as React from "react";
import { cn } from "./Button"; // re-using the cn utility

export type StatusVariant = 
  | "verified" 
  | "good" 
  | "fair" 
  | "flagged" 
  | "pending" 
  | "active";

export interface StatusChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: StatusVariant;
  label: React.ReactNode;
}

export const StatusChip = React.forwardRef<HTMLDivElement, StatusChipProps>(
  ({ className, variant, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 font-body text-xs font-semibold select-none",
          {
            "bg-accent-green/15 text-accent-green": variant === "verified",
            "bg-accent-blue/15 text-accent-blue": variant === "good",
            "bg-accent-yellow/15 text-accent-yellow": variant === "fair",
            "bg-accent-red/15 text-accent-red": variant === "flagged",
            "bg-accent-orange/15 text-accent-orange": variant === "pending",
            "bg-accent-purple/15 text-accent-purple": variant === "active",
          },
          className
        )}
        {...props}
      >
        {label}
      </div>
    );
  }
);
StatusChip.displayName = "StatusChip";
