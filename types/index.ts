// ============================================================
// Skillsapians — Shared TypeScript Types
// ============================================================

// -----------------------------------------------------------
// GitHub / Repository
// -----------------------------------------------------------

export interface RepoMetadata {
  owner: string;
  repo: string;
  fullName: string;
  defaultBranch: string;
  size: number;
  isFork: boolean;
  createdAt: string;
  language: string | null;
}

export interface RepoLanguageStat {
  name: string;
  bytes: number;
  percent: number;
}

export interface CommitSummary {
  sha: string;
  message: string;
  date: string;
  author: string;
  additions: number;
  deletions: number;
  filesChanged: number;
}

export interface RepoFile {
  path: string;
  size: number;
  type: "blob" | "tree";
}

// -----------------------------------------------------------
// Module A — Git Forensics
// -----------------------------------------------------------

export type FlagSeverity = "none" | "low" | "medium" | "high";

export interface ForensicFlag {
  signal: string;
  value: number | string | boolean;
  unit?: string;
  severity: FlagSeverity;
  note?: string;
}

export interface GitForensicsResult {
  authenticity_score: number;       // 0–100
  flags: ForensicFlag[];
  commit_count: number;
  time_span_days: number;
  initial_commit_ratio: number;
  is_fork: boolean;
}

// -----------------------------------------------------------
// Module B — AST Question Generator
// -----------------------------------------------------------

export interface ASTNode {
  name: string;
  type: "function" | "method" | "arrow" | "class";
  filePath: string;
  startLine: number;
  endLine: number;
  codeSnippet: string;
  callers: string[];
  callees: string[];
  branchCount: number;        // cyclomatic complexity proxy
  isAsync: boolean;
  touchesExternalApi: boolean;
  crossFileCalls: number;
  interestScore: number;
}

export interface GeneratedQuestion {
  question_id: string;
  file: string;
  code_snippet: string;
  question: string;
  interest_score: number;
  metadata: {
    callers: string[];
    callees: string[];
    function_name: string;
    skill_focus?: string;
  };
}

// -----------------------------------------------------------
// Module C — Embedding Scorer
// -----------------------------------------------------------

export interface AnswerScoreResult {
  question_id: string;
  user_answer?: string;
  semantic_similarity: number;   // 0–1, cosine sim
  entity_overlap: number;        // 0–1
  specificity_score: number;     // 0–1
  time_score: number;             // 0-1
  time_taken_seconds?: number;
  tab_out_count?: number;
  integrity_penalty: number;      // point deduction
  final_question_score: number;  // 0–100
  ai_generated_flag: boolean;
}

// -----------------------------------------------------------
// Aggregation — Verified Skill Report
// -----------------------------------------------------------

export type SkillArea = string;

export interface ReportBadge {
  key: string;
  label: string;
  description: string;
  tone: "green" | "blue" | "purple" | "yellow" | "red";
}

export interface VerifiedSkillReport {
  report_id: string;
  user_id?: string | null;
  repo: string;
  skill_area: SkillArea;
  verified_skill_score: number;     // 0–100, weighted A+C
  authenticity_score: number;       // Module A
  average_question_score: number;   // Module C average
  point_score: number;
  badge: ReportBadge | null;
  flagged_for_review: boolean;      // true if authenticity_score < 30
  flags: ForensicFlag[];
  questions: Array<GeneratedQuestion & { score?: AnswerScoreResult }>;
  share_url: string;
  created_at: string;
}

// -----------------------------------------------------------
// API Request / Response Shapes
// -----------------------------------------------------------

// POST /api/analyze
export interface AnalyzeRequest {
  repo_url: string;
  skill_area: SkillArea;
}

export interface AnalyzeResponse {
  report_id: string;
  authenticity_score: number;
  flags: ForensicFlag[];
  questions: GeneratedQuestion[];
  status: "ready" | "partial" | "error";
  error?: string;
}

// GET /api/repo-metadata
export interface RepoMetadataResponse {
  metadata: (RepoMetadata & { languages: RepoLanguageStat[] }) | null;
  status: "ready" | "error";
  error?: string;
}

// POST /api/answer
export interface AnswerRequest {
  report_id: string;
  question_id: string;
  answer_text: string;
  time_taken_seconds?: number;
  tab_out_count?: number;
}

export interface AnswerResponse {
  question_id: string;
  score: AnswerScoreResult;
  status: "scored" | "error";
  error?: string;
}

// GET /api/report/:id
export interface ReportResponse {
  report: VerifiedSkillReport | null;
  status: "complete" | "in_progress" | "not_found" | "error";
  answered_count: number;
  total_questions: number;
}

// Auth/Profile
export interface Profile {
  user_id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  website: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileReportSummary {
  report_id: string;
  repo: string;
  skill_area: string;
  verified_skill_score: number;
  authenticity_score: number;
  average_question_score: number;
  point_score: number;
  badge: ReportBadge | null;
  created_at: string;
  completed_at: string | null;
  question_count: number;
}

export interface ProfileResponse {
  profile: Profile | null;
  reports: ProfileReportSummary[];
  totals: {
    report_count: number;
    average_score: number;
    total_points: number;
    badge_count: number;
  };
  status: "ready" | "unauthorized" | "error";
  error?: string;
}
