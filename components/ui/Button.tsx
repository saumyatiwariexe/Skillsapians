import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex ITEMS-center justify-center rounded-md font-body font-medium text-[15px] transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:ring-accent-purple",
          "disabled:opacity-40 disabled:pointer-events-none",
          "px-5 py-3",
          {
            "bg-accent-purple text-white hover:bg-accent-purple/90": variant === "primary",
            "border border-subtle bg-transparent text-text-primary hover:bg-surface-alt": variant === "secondary",
            "bg-transparent text-text-secondary hover:text-text-primary hover:underline hover:underline-offset-4": variant === "ghost",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, cn };
