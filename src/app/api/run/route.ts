import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiGuard } from "@/lib/auth/guards";
import { getExecutor } from "@/lib/code-execution/executor";
import { rateLimit } from "@/lib/rate-limit";
import { runRequestSchema as bodySchema } from "@/lib/validation/run-request";

/**
 * POST /api/run - execute C code.
 * Requires a signed-in user (students have accounts; demo accounts work).
 * Rate limited per user: 12 requests per minute (in-memory fixed window;
 * per-instance on serverless - see src/lib/rate-limit.ts).
 * Body: { code: string (max 20000), stdin?: string (max 10000) }.
 * Returns the honest RunResult of the active executor (demo or Judge0).
 */

const RUN_RATE_LIMIT = { max: 12, windowMs: 60_000 };

export async function POST(req: NextRequest) {
  const guard = await apiGuard(req);
  if ("response" in guard) return guard.response;

  const limit = rateLimit(
    `run:${guard.user.id}`,
    RUN_RATE_LIMIT.max,
    RUN_RATE_LIMIT.windowMs,
  );
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: "Too many run requests - try again shortly",
        retryAfterSec: limit.retryAfterSec,
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request body.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const executor = getExecutor();
  const result = await executor.run(parsed.data.code, parsed.data.stdin);
  return NextResponse.json(result);
}
