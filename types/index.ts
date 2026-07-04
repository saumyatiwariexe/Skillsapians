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
  final_question_score: number;  // 0–100
  ai_generated_flag: boolean;
}

// -----------------------------------------------------------
// Aggregation — Verified Skill Report
// -----------------------------------------------------------

export type SkillArea = "frontend" | "backend" | "fullstack" | "data";

export interface VerifiedSkillReport {
  report_id: string;
  repo: string;
  skill_area: SkillArea;
  verified_skill_score: number;     // 0–100, weighted A+C
  authenticity_score: number;       // Module A
  average_question_score: number;   // Module C average
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

// POST /api/answer
export interface AnswerRequest {
  report_id: string;
  question_id: string;
  answer_text: string;
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
