import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/db";

/**
 * GET /api/problems - public, paginated problem listing.
 * Only PUBLISHED problems are ever returned (spec 15.4), and coaching
 * fields (hint, solutionExplanation, expectedOutput) are stripped: this
 * is a catalog API, not an answer key.
 *
 * Query: ?topic=<topicSlug>&difficulty=easy|medium|hard&q=<title search>
 *        &page=1&pageSize=10 (pageSize capped at 50)
 */

const querySchema = z.object({
  topic: z.string().min(1).max(100).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  q: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(req: NextRequest) {
  const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid query.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const { topic, difficulty, q, page, pageSize } = parsed.data;

  const store = await getStore();
  const result = await store.listProblems({
    status: "published",
    topicSlug: topic,
    difficulty,
    q,
    page,
    pageSize,
  });

  return NextResponse.json({
    items: result.items.map((problem) => ({
      slug: problem.slug,
      title: problem.title,
      statement: problem.statement,
      difficulty: problem.difficulty,
      topicSlug: problem.topicSlug,
      constraints: problem.constraints,
      sampleInput: problem.sampleInput,
      sampleOutput: problem.sampleOutput,
      status: problem.status,
      createdAt: problem.createdAt,
    })),
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
  });
}
