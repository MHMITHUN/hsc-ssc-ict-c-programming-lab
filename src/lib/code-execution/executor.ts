import type { CodeExecutor, RunResult } from "./executor-types";
import { DemoExecutor } from "./demo";

export type { CodeExecutor, RunResult };

/** C (GCC) language id used by the Judge0 API. */
const JUDGE0_C_LANGUAGE_ID = 50;

/** Judge0 status id for a finished, successful execution. */
const JUDGE0_STATUS_ACCEPTED = 3;

interface Judge0Submission {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  exit_code?: number | null;
  status?: { id: number; description: string } | null;
}

/**
 * Real execution through a Judge0 API (CE or RapidAPI).
 * POST /submissions?base64_encoded=true&wait=true — source and stdin are
 * base64-encoded, response fields are decoded back to UTF-8.
 */
export class Judge0Executor implements CodeExecutor {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  async run(code: string, stdin: string): Promise<RunResult> {
    const url = `${this.baseUrl.replace(/\/+$/, "")}/submissions?base64_encoded=true&wait=true`;
    let host: string | undefined;
    try {
      host = new URL(this.baseUrl).host;
    } catch {
      host = undefined;
    }

    let submission: Judge0Submission;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          // Self-hosted Judge0 uses X-Auth-Token; RapidAPI uses its own pair.
          "X-Auth-Token": this.apiKey,
          "X-RapidAPI-Key": this.apiKey,
          ...(host ? { "X-RapidAPI-Host": host } : {}),
        },
        body: JSON.stringify({
          source_code: encode(code),
          language_id: JUDGE0_C_LANGUAGE_ID,
          stdin: encode(stdin),
        }),
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) {
        return {
          mode: "judge0",
          ok: false,
          note: `Judge0 request failed: HTTP ${response.status}.`,
        };
      }
      submission = (await response.json()) as Judge0Submission;
    } catch (error) {
      const message = error instanceof Error ? error.message : "network error";
      return {
        mode: "judge0",
        ok: false,
        note: `Judge0 request failed: ${message}.`,
      };
    }

    const stdout = decode(submission.stdout);
    const compileOutput = decode(submission.compile_output);
    const stderr = decode(submission.stderr);
    const statusId = submission.status?.id ?? -1;
    const ok = statusId === JUDGE0_STATUS_ACCEPTED;
    const statusText = submission.status?.description ?? "unknown status";

    return {
      mode: "judge0",
      ok,
      stdout: stdout || undefined,
      stderr: compileOutput || stderr || undefined,
      exitCode: submission.exit_code ?? (ok ? 0 : 1),
      note: ok
        ? `Judge0 live execution (${statusText}).`
        : compileOutput
          ? `Judge0 live execution - compile error (${statusText}).`
          : `Judge0 live execution (${statusText}).`,
    };
  }
}

function encode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64");
}

function decode(value: string | null | undefined): string {
  if (!value) return "";
  return Buffer.from(value, "base64").toString("utf8");
}

/**
 * Pick the executor from the environment:
 * - EXECUTION_MODE=demo forces demo execution;
 * - otherwise Judge0 when JUDGE0_API_URL + JUDGE0_API_KEY are both set;
 * - otherwise demo execution.
 */
export function getExecutor(): CodeExecutor {
  const { EXECUTION_MODE, JUDGE0_API_URL, JUDGE0_API_KEY } = process.env;
  if (EXECUTION_MODE === "demo") {
    return new DemoExecutor();
  }
  if (JUDGE0_API_URL && JUDGE0_API_KEY) {
    return new Judge0Executor(JUDGE0_API_URL, JUDGE0_API_KEY);
  }
  return new DemoExecutor();
}
