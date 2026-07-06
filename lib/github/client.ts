import { Octokit } from "@octokit/rest";
import type { RepoMetadata, CommitSummary, RepoFile, RepoLanguageStat } from "@/types";

// ──────────────────────────────────────────────────────────────────────────────
// GitHub client — server-side only
// Uses a baked-in Personal Access Token for authenticated requests
// (5,000 req/hr vs 60/hr unauthenticated)
// ──────────────────────────────────────────────────────────────────────────────

function getOctokit(): Octokit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN is not set. Add it to .env.local (see .env.local.example)."
    );
  }
  return new Octokit({ auth: token });
}

// ──────────────────────────────────────────────────────────────────────────────
// URL Parser
// ──────────────────────────────────────────────────────────────────────────────

export function parseRepoUrl(url: string): { owner: string; repo: string } {
  // Handles: https://github.com/owner/repo, github.com/owner/repo, owner/repo
  const cleaned = url
    .trim()
    .replace(/\/$/, "")
    .replace(/^https?:\/\//, "")
    .replace(/^github\.com\//, "");

  const parts = cleaned.split("/");
  if (parts.length < 2) {
    throw new Error(`Invalid GitHub repo URL: "${url}". Expected format: github.com/owner/repo`);
  }

  return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
}

// ──────────────────────────────────────────────────────────────────────────────
// Repo Metadata
// ──────────────────────────────────────────────────────────────────────────────

export async function getRepoMetadata(
  owner: string,
  repo: string
): Promise<RepoMetadata> {
  const octokit = getOctokit();
  const { data } = await octokit.repos.get({ owner, repo });

  return {
    owner,
    repo,
    fullName: data.full_name,
    defaultBranch: data.default_branch,
    size: data.size,
    isFork: data.fork,
    createdAt: data.created_at ?? new Date().toISOString(),
    language: data.language ?? null,
  };
}

export async function getRepoLanguages(
  owner: string,
  repo: string
): Promise<RepoLanguageStat[]> {
  const octokit = getOctokit();
  const { data } = await octokit.repos.listLanguages({ owner, repo });
  const totalBytes = Object.values(data).reduce((sum, bytes) => sum + bytes, 0);

  return Object.entries(data)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percent: totalBytes > 0 ? Math.round((bytes / totalBytes) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.bytes - a.bytes);
}

// ──────────────────────────────────────────────────────────────────────────────
// Commit History
// Caps at 300 commits (hackathon budget — see PRD §5.2)
// ──────────────────────────────────────────────────────────────────────────────

export async function getCommitHistory(
  owner: string,
  repo: string,
  maxCommits = 300
): Promise<CommitSummary[]> {
  const octokit = getOctokit();
  const commits: CommitSummary[] = [];
  let page = 1;

  while (commits.length < maxCommits) {
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 100,
      page,
    });

    if (data.length === 0) break;

    for (const c of data) {
      if (commits.length >= maxCommits) break;
      commits.push({
        sha: c.sha,
        message: c.commit.message.split("\n")[0], // first line only
        date: c.commit.author?.date ?? c.commit.committer?.date ?? "",
        author: c.commit.author?.name ?? "unknown",
        additions: 0,   // filled lazily in forensics engine
        deletions: 0,
        filesChanged: 0,
      });
    }

    if (data.length < 100) break;
    page++;
  }

  return commits;
}

// ──────────────────────────────────────────────────────────────────────────────
// Per-commit diff stats
// Called by the forensics engine for the commits it needs details on
// ──────────────────────────────────────────────────────────────────────────────

export async function getCommitStats(
  owner: string,
  repo: string,
  sha: string
): Promise<{ additions: number; deletions: number; filesChanged: number }> {
  const octokit = getOctokit();
  const { data } = await octokit.repos.getCommit({ owner, repo, ref: sha });

  return {
    additions: data.stats?.additions ?? 0,
    deletions: data.stats?.deletions ?? 0,
    filesChanged: data.files?.length ?? 0,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// File Tree
// Returns the flat list of files in the repo (excluding node_modules etc.)
// ──────────────────────────────────────────────────────────────────────────────

const EXCLUDED_PATHS = [
  "node_modules",
  ".next",
  "dist",
  "build",
  ".git",
  "__pycache__",
  ".venv",
  "venv",
];

const CODE_EXTENSIONS = new Set([
  ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".rb",
  ".php",
  ".cpp", ".cc", ".c", ".h", ".hpp",
]);

export async function getFileTree(
  owner: string,
  repo: string,
  branch: string
): Promise<RepoFile[]> {
  const octokit = getOctokit();
  const { data } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: branch,
    recursive: "1",
  });

  return (data.tree as Array<{ path?: string; size?: number; type?: string }>)
    .filter((f) => {
      if (!f.path || f.type !== "blob") return false;
      const isExcluded = EXCLUDED_PATHS.some((ex) => f.path!.includes(ex));
      if (isExcluded) return false;
      const ext = "." + f.path.split(".").pop();
      return CODE_EXTENSIONS.has(ext);
    })
    .map((f) => ({
      path: f.path!,
      size: f.size ?? 0,
      type: "blob" as const,
    }));
}

// ──────────────────────────────────────────────────────────────────────────────
// File Content
// Fetch raw file content by path
// ──────────────────────────────────────────────────────────────────────────────

export async function getFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string> {
  const octokit = getOctokit();
  const { data } = await octokit.repos.getContent({ owner, repo, path });

  if ("content" in data && data.encoding === "base64") {
    return Buffer.from(data.content, "base64").toString("utf-8");
  }

  throw new Error(`Could not retrieve content for ${path}`);
}
