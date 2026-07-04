/**
 * Module C — Embedding-Based Semantic Scorer
 *
 * Replaces "ask an LLM to grade another LLM" with geometric scoring:
 * 1. Build a deterministic fact_string from AST data
 * 2. Embed it with Gemini text-embedding-004
 * 3. Embed the user's answer with the same model
 * 4. Compute cosine similarity (the score comes from vector geometry,
 *    not from a persuadable model's opinion)
 *
 * PRD Reference: §7
 */

import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";
import type { GeneratedQuestion, AnswerScoreResult } from "@/types";

// ──────────────────────────────────────────────────────────────────────────────
// Embedding model
// ──────────────────────────────────────────────────────────────────────────────

function getEmbeddingModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "text-embedding-004" });
}

// ──────────────────────────────────────────────────────────────────────────────
// Fact String Builder (PRD §7.3)
// Deterministic — no LLM involvement. This is the "ground truth" vector.
// ──────────────────────────────────────────────────────────────────────────────

export function buildFactString(question: GeneratedQuestion): string {
  const { metadata, code_snippet, file } = question;

  // Extract keywords from code snippet for enrichment
  const orderOfOps = metadata.callees.length > 0
    ? `Order of operations: ${metadata.callees.join(" → ")}`
    : "";

  return `Function: ${metadata.function_name}
File: ${file}
Calls: ${metadata.callees.length ? metadata.callees.join(", ") : "none"}
Called by: ${metadata.callers.length ? metadata.callers.join(", ") : "none"}
${orderOfOps}
Code behavior summary (inferred from structure):
${code_snippet.slice(0, 400)}`.trim();
}

// ──────────────────────────────────────────────────────────────────────────────
// Embedding helper
// ──────────────────────────────────────────────────────────────────────────────

async function embed(text: string, taskType: TaskType): Promise<number[]> {
  const model = getEmbeddingModel();
  const result = await model.embedContent({
    content: { role: "user", parts: [{ text }] },
    taskType,
  });
  return result.embedding.values;
}

// ──────────────────────────────────────────────────────────────────────────────
// Cosine Similarity (PRD §7.5)
// ──────────────────────────────────────────────────────────────────────────────

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("Vector dimension mismatch");
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ──────────────────────────────────────────────────────────────────────────────
// Entity Overlap (PRD §7.5)
// Did the user mention the actual function/variable names?
// ──────────────────────────────────────────────────────────────────────────────

export function computeEntityOverlap(
  answer: string,
  question: GeneratedQuestion
): number {
  const entities = [
    question.metadata.function_name,
    ...question.metadata.callers,
    ...question.metadata.callees,
  ].filter(Boolean);

  if (entities.length === 0) return 0;

  const lowerAnswer = answer.toLowerCase();
  const mentioned = entities.filter((e) =>
    lowerAnswer.includes(e.toLowerCase())
  );

  return mentioned.length / entities.length;
}

// ──────────────────────────────────────────────────────────────────────────────
// Specificity Score (PRD §7.5)
// Penalizes very short or vague answers
// ──────────────────────────────────────────────────────────────────────────────

export function computeSpecificityScore(answer: string): number {
  const wordCount = answer.trim().split(/\s+/).length;
  return Math.min(1.0, wordCount / 25);
}

// ──────────────────────────────────────────────────────────────────────────────
// AI-Generated Answer Detection (PRD §7.6 — stretch signal)
// Heuristic: AI text tends to have lower sentence-length variance
// ──────────────────────────────────────────────────────────────────────────────

export function detectAIGeneratedAnswer(answer: string): boolean {
  const sentences = answer.match(/[^.!?]+[.!?]+/g) ?? [];
  if (sentences.length < 3) return false; // not enough signal

  const lengths = sentences.map((s) => s.trim().split(/\s+/).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((s, l) => s + Math.pow(l - mean, 2), 0) / lengths.length;
  const stddev = Math.sqrt(variance);

  // AI text: very uniform sentence lengths → low std-dev
  // Threshold: if std-dev < 2 words AND answer is suspiciously polished
  return stddev < 2.0 && mean > 15;
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Scoring Function (PRD §7.5)
// ──────────────────────────────────────────────────────────────────────────────

export async function scoreAnswer(
  question: GeneratedQuestion,
  answerText: string
): Promise<AnswerScoreResult> {
  // Build deterministic ground truth
  const factString = buildFactString(question);

  // Embed both — same model, same space
  const [factEmbedding, answerEmbedding] = await Promise.all([
    embed(factString, TaskType.RETRIEVAL_DOCUMENT),
    embed(answerText, TaskType.RETRIEVAL_QUERY),
  ]);

  const semanticSimilarity = cosineSimilarity(factEmbedding, answerEmbedding);
  const entityOverlap      = computeEntityOverlap(answerText, question);
  const specificityScore   = computeSpecificityScore(answerText);
  const aiGeneratedFlag    = detectAIGeneratedAnswer(answerText);

  // Final question score (PRD §7.5)
  const finalQuestionScore =
    (0.5 * semanticSimilarity + 0.3 * entityOverlap + 0.2 * specificityScore) * 100;

  return {
    question_id:         question.question_id,
    semantic_similarity: parseFloat(semanticSimilarity.toFixed(4)),
    entity_overlap:      parseFloat(entityOverlap.toFixed(4)),
    specificity_score:   parseFloat(specificityScore.toFixed(4)),
    final_question_score: parseFloat(finalQuestionScore.toFixed(2)),
    ai_generated_flag:   aiGeneratedFlag,
  };
}
