"use client";

import { useEffect, useState } from "react";

const TIPS = [
  "Write descriptive commit messages — they reveal how you think about problems.",
  "Break large changes into small, logical commits. Monolithic commits are harder to verify.",
  "Consistent naming conventions across files signal organized engineering habits.",
  "Code reviews and pull requests show collaboration skills that employers value.",
  "README files and inline comments demonstrate documentation discipline.",
  "Use branches to separate features, fixes, and experiments. History tells a story.",
  "Good repos balance abstraction and clarity — neither over-engineering nor copy-pasting.",
  "Time spent debugging thoughtfully often matters more than lines written quickly.",
  "Refactoring without changing behavior shows mature engineering judgment.",
  "Test coverage, even basic, signals that you care about correctness.",
  "Error handling choices reveal your assumptions about the real world.",
  "Avoid committing secrets, build artifacts, or generated files.",
  "Consistent indentation and formatting reduce cognitive load for reviewers.",
  "Pair programming and co-authored commits reflect teamwork.",
  "Delete dead code instead of commenting it out. Clean history builds trust.",
];

export default function TipsPanel() {
  const [tip, setTip] = useState("");

  useEffect(() => {
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
  }, []);

  return (
    <div className="w-full max-w-[240px] shrink-0">
      <div className="bg-surface border border-subtle rounded-md p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-accent-yellow font-body text-sm font-medium">💡 Tip</span>
        </div>
        <p className="font-body text-sm text-text-secondary leading-relaxed">{tip}</p>
      </div>
    </div>
  );
}
