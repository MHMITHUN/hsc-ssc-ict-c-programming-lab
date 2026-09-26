/**
 * Shared executor contract (kept in its own module so demo.ts and
 * executor.ts can both import it without any import cycle).
 *
 * A RunResult must describe honestly what happened — demo mode never
 * pretends to be a real compiler (spec section 36).
 */
export interface RunResult {
  mode: "judge0" | "demo";
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  ok: boolean;
  note: string;
}

export interface CodeExecutor {
  run(code: string, stdin: string): Promise<RunResult>;
}
