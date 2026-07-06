import type { ReportBadge } from "@/types";

interface BadgeInput {
  verifiedScore: number;
  averageQuestionScore: number;
  authenticityScore: number;
  skillArea: string;
  averageTimeSeconds: number;
  totalTabOuts: number;
}

const cleanFocus = (skillArea: string) =>
  skillArea
    .split(/[,\s/]+/)
    .map((part) => part.trim())
    .filter(Boolean)[0] ?? "Skill";

function titleCase(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function assignBadge(input: BadgeInput): ReportBadge {
  const focus = input.skillArea.toLowerCase();
  const primaryFocus = titleCase(cleanFocus(input.skillArea));

  if (input.authenticityScore < 30 || input.totalTabOuts >= 3) {
    return {
      key: "review-needed",
      label: "Review Needed",
      description: "This report needs manual review because integrity signals were weak.",
      tone: "red",
    };
  }

  if (
    input.verifiedScore >= 88 &&
    (focus.includes("ai") || focus.includes("ml") || focus.includes("data"))
  ) {
    return {
      key: "ai-expert",
      label: "AI Expert",
      description: "Strong code understanding in an AI, ML, or data-heavy verification.",
      tone: "purple",
    };
  }

  if (input.verifiedScore >= 82 && input.averageTimeSeconds > 0 && input.averageTimeSeconds < 110) {
    return {
      key: "fast-implementer",
      label: "Fast Implementer",
      description: "Answered quickly while preserving strong semantic accuracy.",
      tone: "yellow",
    };
  }

  if (input.verifiedScore >= 85) {
    return {
      key: "expert",
      label: `${primaryFocus} Expert`,
      description: "Excellent verification score across repo history and code reasoning.",
      tone: "green",
    };
  }

  if (input.verifiedScore >= 65) {
    return {
      key: "verified-builder",
      label: "Verified Builder",
      description: "Good evidence of practical understanding from real project work.",
      tone: "blue",
    };
  }

  return {
    key: "emerging-builder",
    label: "Emerging Builder",
    description: "Some skill signals were present, with room to improve the evidence.",
    tone: "yellow",
  };
}

export function computePointScore(input: BadgeInput): number {
  const speedBonus =
    input.averageTimeSeconds > 0 && input.averageTimeSeconds < 120 && input.totalTabOuts === 0
      ? 75
      : 0;
  const tabPenalty = input.totalTabOuts * 40;

  return Math.max(
    0,
    Math.round(
      input.verifiedScore * 10 +
        input.averageQuestionScore * 2 +
        input.authenticityScore +
        speedBonus -
        tabPenalty
    )
  );
}
