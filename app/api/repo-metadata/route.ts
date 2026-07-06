import { NextRequest, NextResponse } from "next/server";
import { getRepoLanguages, getRepoMetadata, parseRepoUrl } from "@/lib/github/client";
import type { RepoMetadataResponse } from "@/types";

export async function GET(req: NextRequest): Promise<NextResponse<RepoMetadataResponse>> {
  try {
    const repoUrl = req.nextUrl.searchParams.get("repo") ?? "";
    if (!repoUrl.trim()) {
      return NextResponse.json(
        { metadata: null, status: "error", error: "repo query parameter is required" },
        { status: 400 }
      );
    }

    const { owner, repo } = parseRepoUrl(repoUrl);
    const [metadata, languages] = await Promise.all([
      getRepoMetadata(owner, repo),
      getRepoLanguages(owner, repo),
    ]);

    return NextResponse.json({
      metadata: {
        ...metadata,
        languages,
      },
      status: "ready",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load repository metadata.";
    console.error("[/api/repo-metadata] Error:", message);
    return NextResponse.json(
      { metadata: null, status: "error", error: message },
      { status: 500 }
    );
  }
}
