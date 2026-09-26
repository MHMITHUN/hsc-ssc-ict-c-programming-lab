import type { CodeExecutor, RunResult } from "./executor-types";
import { lookupCatalog } from "./catalog";

export const DEMO_HIT_NOTE =
  "Demo execution: pre-recorded output for this exact program.";

export const DEMO_MISS_NOTE =
  "Demo mode: no live compiler. This program is not in the pre-recorded " +
  "catalog - connect Judge0 via JUDGE0_API_URL/JUDGE0_API_KEY (see " +
  ".env.example) for real execution.";

export const DEMO_STDIN_NOTE =
  "Demo mode: this program is in the pre-recorded catalog, but with a " +
  "different standard input, so its recorded output cannot be replayed " +
  "honestly. Use the recorded input shown with the sample, or connect " +
  "Judge0 via JUDGE0_API_URL/JUDGE0_API_KEY (see .env.example).";

/**
 * Demo executor: matches the submitted source (whitespace-normalized)
 * against the pre-recorded catalog. A hit replays the recorded stdout for
 * the recorded stdin; a miss is an honest failure. NEVER fabricates output
 * (spec section 36).
 */
export class DemoExecutor implements CodeExecutor {
  async run(code: string, stdin: string): Promise<RunResult> {
    const entry = lookupCatalog(code);
    if (!entry) {
      return { mode: "demo", ok: false, note: DEMO_MISS_NOTE };
    }
    // The catalog recording is tied to its own stdin; a different input
    // must not claim the recorded output as its own.
    if (stdin.trim() !== entry.stdin.trim()) {
      return { mode: "demo", ok: false, note: DEMO_STDIN_NOTE };
    }
    return {
      mode: "demo",
      ok: true,
      stdout: entry.stdout,
      exitCode: 0,
      note: DEMO_HIT_NOTE,
    };
  }
}
