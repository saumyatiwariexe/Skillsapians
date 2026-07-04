/**
 * Module B — AST-Based Question Generator
 *
 * Uses @babel/parser + @babel/traverse to extract structural
 * information from JavaScript/TypeScript source files. Ranks
 * extracted nodes by "interest score" (PRD §6.4), then uses
 * Gemini to phrase natural questions about real code decisions.
 *
 * PRD Reference: §6
 */

import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import type { ASTNode, GeneratedQuestion } from "@/types";

// ──────────────────────────────────────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────────────────────────────────────

const BOILERPLATE_FILES = new Set([
  "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  ".eslintrc", ".prettierrc", "tsconfig.json", "jest.config",
  "next.config", "vite.config", "webpack.config",
  "tailwind.config", "postcss.config",
]);

const MAX_FILE_COUNT  = 10; // top N most substantive files
const QUESTIONS_COUNT = { min: 5, max: 8 };

// External API / side-effect call patterns (regex on callee names)
const EXTERNAL_API_PATTERNS = [
  /^fetch$/, /^axios/, /^got$/, /^request$/,
  /^useEffect$/, /^setTimeout$/, /^setInterval$/,
  /supabase/, /prisma/, /mongoose/, /sequelize/,
  /stripe/, /twilio/, /sendgrid/, /openai/, /generativeai/,
];

function touchesExternalApi(callee: string): boolean {
  return EXTERNAL_API_PATTERNS.some((p) => p.test(callee));
}

// ──────────────────────────────────────────────────────────────────────────────
// File filtering: pick the most substantive code files
// ──────────────────────────────────────────────────────────────────────────────

export function selectTopFiles(
  files: Array<{ path: string; content: string }>
): Array<{ path: string; content: string }> {
  return files
    .filter(({ path }) => {
      const fileName = path.split("/").pop() ?? "";
      return !BOILERPLATE_FILES.has(fileName.replace(/\.[^.]+$/, ""));
    })
    .sort((a, b) => b.content.split("\n").length - a.content.split("\n").length)
    .slice(0, MAX_FILE_COUNT);
}

// ──────────────────────────────────────────────────────────────────────────────
// AST Extraction: parse one file, extract function nodes
// ──────────────────────────────────────────────────────────────────────────────

export function extractNodesFromFile(
  filePath: string,
  source: string
): ASTNode[] {
  const nodes: ASTNode[] = [];

  let ast;
  try {
    ast = parse(source, {
      sourceType: "module",
      plugins: ["typescript", "jsx", "decorators-legacy", "classProperties"],
    });
  } catch {
    // Non-parseable file — skip silently
    return [];
  }

  const lines = source.split("\n");

  // Track all callee names within each function for call-graph edges
  const functionCallMap = new Map<string, Set<string>>(); // fnName → callees
  const callerMap       = new Map<string, Set<string>>(); // fnName → callers
  let currentFunction   = "";

  traverse(ast, {
    // ── Function declarations and expressions ────────────────────────────────
    "FunctionDeclaration|FunctionExpression|ArrowFunctionExpression"(path) {
      const node = path.node;
      const parent = path.parent;

      // Determine function name
      let name = "(anonymous)";
      if (t.isFunctionDeclaration(node) && node.id) {
        name = node.id.name;
      } else if (
        t.isVariableDeclarator(parent) &&
        t.isIdentifier(parent.id)
      ) {
        name = parent.id.name;
      } else if (
        t.isObjectProperty(parent) &&
        t.isIdentifier(parent.key)
      ) {
        name = parent.key.name;
      } else if (
        t.isClassMethod(parent) &&
        t.isIdentifier(parent.key)
      ) {
        name = parent.key.name;
      }

      if (name === "(anonymous)") return; // skip unnamed small arrow fns

      currentFunction = name;
      if (!functionCallMap.has(name)) functionCallMap.set(name, new Set());

      const start = node.loc?.start.line ?? 0;
      const end   = node.loc?.end.line ?? 0;
      const snippet = lines.slice(start - 1, end).join("\n").slice(0, 800);

      // Count control flow branches (cyclomatic complexity proxy)
      let branchCount = 0;
      let isAsync = false;
      let hasExternalCall = false;

      if (t.isFunctionDeclaration(node) || t.isFunctionExpression(node)) {
        isAsync = node.async;
      } else if (t.isArrowFunctionExpression(node)) {
        isAsync = node.async;
      }

      // Count branches by traversing inner nodes
      path.traverse({
        IfStatement()            { branchCount++; },
        ConditionalExpression()  { branchCount++; },
        SwitchCase()             { branchCount++; },
        ForStatement()           { branchCount++; },
        ForInStatement()         { branchCount++; },
        ForOfStatement()         { branchCount++; },
        WhileStatement()         { branchCount++; },
        DoWhileStatement()       { branchCount++; },
        TryStatement()           { branchCount++; },
        CallExpression(innerPath) {
          const callee = innerPath.node.callee;
          let calleeName = "";

          if (t.isIdentifier(callee)) {
            calleeName = callee.name;
          } else if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
            calleeName = callee.property.name;
          }

          if (calleeName) {
            functionCallMap.get(name)?.add(calleeName);
            if (touchesExternalApi(calleeName)) hasExternalCall = true;

            // Update caller map
            if (!callerMap.has(calleeName)) callerMap.set(calleeName, new Set());
            callerMap.get(calleeName)?.add(name);
          }
        },
      });

      nodes.push({
        name,
        type: t.isArrowFunctionExpression(node) ? "arrow" : "function",
        filePath,
        startLine: start,
        endLine: end,
        codeSnippet: snippet,
        callers: [],          // filled in post-processing below
        callees: Array.from(functionCallMap.get(name) ?? []),
        branchCount,
        isAsync,
        touchesExternalApi: hasExternalCall,
        crossFileCalls: 0,    // approximated below
        interestScore: 0,     // computed below
      });
    },
  });

  // Post-process: fill callers from callerMap
  for (const node of nodes) {
    node.callers = Array.from(callerMap.get(node.name) ?? []);
  }

  return nodes;
}

// ──────────────────────────────────────────────────────────────────────────────
// Interest Score (PRD §6.4)
// ──────────────────────────────────────────────────────────────────────────────

function computeInterestScore(node: ASTNode): number {
  const isTrivialGetterSetter =
    node.name.startsWith("get") || node.name.startsWith("set")
      ? node.branchCount === 0 && node.callees.length <= 1
      : false;

  return (
    node.branchCount * 2 +
    node.crossFileCalls * 3 +
    (node.isAsync || node.touchesExternalApi ? 2 : 0) +
    (node.touchesExternalApi ? 3 : 0) -
    (isTrivialGetterSetter ? 5 : 0)
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Select Top N nodes across all files
// ──────────────────────────────────────────────────────────────────────────────

export function selectTopNodes(allNodes: ASTNode[]): ASTNode[] {
  return allNodes
    .map((n) => ({ ...n, interestScore: computeInterestScore(n) }))
    .filter((n) => n.interestScore > 0)
    .sort((a, b) => b.interestScore - a.interestScore)
    .slice(0, QUESTIONS_COUNT.max);
}

// ──────────────────────────────────────────────────────────────────────────────
// Gemini — Question Phrasing (PRD §6.5 Step 2)
// The LLM's ONLY job: phrase a question about facts we already extracted.
// It must NOT invent new facts about the code.
// ──────────────────────────────────────────────────────────────────────────────

const QUESTION_PROMPT_TEMPLATE = (
  codeSnippet: string,
  callers: string[],
  callees: string[],
  filePath: string
) => `You are generating a code-comprehension question. You are given:
- A code snippet from file: ${filePath}
- The names of functions that call this function: ${callers.length ? callers.join(", ") : "none identified"}
- The names of functions this function calls: ${callees.length ? callees.join(", ") : "none identified"}

Do NOT invent any information not present below. Ask a specific question about a DECISION made in this code — why an order of operations, why an error is handled a certain way, why this function depends on that one — NOT a generic definition question.

Code:
\`\`\`
${codeSnippet}
\`\`\`

Return ONLY the question text, nothing else. Do not include labels, preamble, or explanation.`;

async function phraseQuestion(node: ASTNode): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const genAI  = new GoogleGenerativeAI(apiKey);
  const model  = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = QUESTION_PROMPT_TEMPLATE(
    node.codeSnippet,
    node.callers,
    node.callees,
    node.filePath
  );

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// ──────────────────────────────────────────────────────────────────────────────
// Full Pipeline: files → extracted nodes → questions
// ──────────────────────────────────────────────────────────────────────────────

export async function generateQuestions(
  files: Array<{ path: string; content: string }>
): Promise<GeneratedQuestion[]> {
  // Step 1: extract AST nodes from all files
  const allNodes: ASTNode[] = [];
  const topFiles = selectTopFiles(files);

  for (const file of topFiles) {
    const nodes = extractNodesFromFile(file.path, file.content);
    allNodes.push(...nodes);
  }

  // Step 2: rank by interest score, pick top 5–8
  const topNodes = selectTopNodes(allNodes);

  // Step 3: phrase questions with Gemini
  const questions: GeneratedQuestion[] = [];
  for (let i = 0; i < topNodes.length; i++) {
    const node = topNodes[i];
    try {
      const questionText = await phraseQuestion(node);
      questions.push({
        question_id: `q_${String(i + 1).padStart(2, "0")}`,
        file: node.filePath,
        code_snippet: node.codeSnippet,
        question: questionText,
        interest_score: node.interestScore,
        metadata: {
          callers: node.callers,
          callees: node.callees,
          function_name: node.name,
        },
      });
    } catch {
      // Skip this node if Gemini fails — continue with remaining
      continue;
    }
  }

  return questions;
}
