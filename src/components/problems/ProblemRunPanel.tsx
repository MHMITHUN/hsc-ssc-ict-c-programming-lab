"use client";

import { useState } from "react";
import { Play, Copy, RotateCcw, CheckCircle2, CircleAlert } from "lucide-react";
import { Alert, Badge, Button, Label, Textarea } from "@/components/ui";
import { CodeEditor } from "@/components/code/CodeEditor";
import {
  recordSubmissionAction,
  type SubmissionRecordResult,
} from "@/app/actions/learning";
import type { RunResult } from "@/lib/code-execution/executor-types";
import { cn } from "@/lib/utils";

/**
 * Code + run panel on a problem page: edit the starter code, run it against
 * the sample input, compare the produced output with the expected output,
 * and (signed-in students) record the attempt. In demo mode a catalog hit
 * replays the recorded output and anything else fails honestly.
 */
export function ProblemRunPanel({
  slug,
  starterCode,
  sampleInput,
  expectedOutput,
  canRecord,
}: {
  slug: string;
  starterCode: string;
  sampleInput: string;
  expectedOutput: string;
  canRecord: boolean;
}) {
  const [code, setCode] = useState(starterCode);
  const [stdin, setStdin] = useState(sampleInput);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [record, setRecord] = useState<SubmissionRecordResult | null>(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    setRunning(true);
    setResult(null);
    setRecord(null);
    try {
      const response = await fetch("/api/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, stdin }),
      });
      const data = (await response.json()) as RunResult & { error?: string };
      if (!response.ok) {
        setResult({
          mode: "demo",
          ok: false,
          note: data.error ?? "The run request failed.",
        });
        return;
      }
      setResult(data);
      if (canRecord && data.ok) {
        const recorded = await recordSubmissionAction(
          slug,
          code,
          data.stdout ?? "",
        );
        setRecord(recorded);
      }
    } catch {
      setResult({
        mode: "demo",
        ok: false,
        note: "Could not reach the run endpoint. Check your connection and try again.",
      });
    } finally {
      setRunning(false);
    }
  }

  const matches =
    result?.ok && result.stdout !== undefined
      ? result.stdout.trim() === expectedOutput.trim()
      : null;

  return (
    <div className="flex flex-col gap-4">
      <CodeEditor
        value={code}
        onChange={setCode}
        label="Your C solution"
        minHeight={300}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor={`stdin-${slug}`}>Standard input (the sample input)</Label>
        <Textarea
          id={`stdin-${slug}`}
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          rows={3}
          className="font-mono text-xs"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={run} loading={running}>
          <Play className="size-4" aria-hidden="true" />
          {running ? "Running..." : "Run"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {
              setCopied(false);
            }
          }}
        >
          <Copy className="size-4" aria-hidden="true" />
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setCode(starterCode);
            setStdin(sampleInput);
            setResult(null);
            setRecord(null);
          }}
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset
        </Button>
      </div>

      <div aria-live="polite" className="flex flex-col gap-3">
        {result && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={result.mode === "demo" ? "warning" : "success"}>
                {result.mode === "demo" ? "Demo: pre-recorded" : "Judge0: live"}
              </Badge>
              {result.ok && result.exitCode !== undefined && (
                <Badge tone="neutral">exit code {result.exitCode}</Badge>
              )}
              {record?.recorded && (
                <Badge tone={record.status === "accepted" ? "success" : "warning"}>
                  {record.status === "accepted" ? "Saved: accepted" : "Saved: wrong answer"}
                </Badge>
              )}
            </div>

            {result.stdout !== undefined && (
              <figure className="overflow-hidden rounded-lg border border-border">
                <figcaption className="border-b border-border bg-surface-2 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Program output
                </figcaption>
                <pre className="overflow-x-auto bg-surface-2 px-4 py-3 text-sm text-fg">
                  <code>{result.stdout}</code>
                </pre>
              </figure>
            )}

            {result.stderr !== undefined && (
              <Alert tone="danger" title="Errors">
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs">
                  {result.stderr}
                </pre>
              </Alert>
            )}

            {matches !== null && (
              <Alert
                tone={matches ? "success" : "warning"}
                title={matches ? "Matches the expected output" : "Output does not match"}
              >
                {matches ? (
                  <span className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                    Your program produced exactly the expected output for the
                    sample input.
                  </span>
                ) : (
                  <span className="flex items-start gap-2">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                    Compare your output with the expected output shown in the
                    statement - check labels, spelling and spacing.
                  </span>
                )}
              </Alert>
            )}

            {!result.ok && (
              <Alert tone="warning" title="Not executed">
                {result.note}
              </Alert>
            )}
            {result.ok && (
              <p className={cn("text-xs text-muted")}>{result.note}</p>
            )}
          </>
        )}
        {!result && (
          <p className="text-sm text-muted">
            Press Run to execute your program against the sample input.
          </p>
        )}
      </div>
    </div>
  );
}
