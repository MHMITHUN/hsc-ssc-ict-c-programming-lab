import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiGuard } from "@/lib/auth/guards";
import { getExecutor } from "@/lib/code-execution/executor";
import { runRequestSchema as bodySchema } from "@/lib/validation/run-request";

/**
 * POST /api/run - execute C code.
 * Requires a signed-in user (students have accounts; demo accounts work).
 * Body: { code: string (max 20000), stdin?: string (max 10000) }.
 * Returns the honest RunResult of the active executor (demo or Judge0).
 */

export async function POST(req: NextRequest) {
  const guard = await apiGuard(req);
  if ("response" in guard) return guard.response;

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
