"use client";

import { useState } from "react";
import { Play, Copy, RotateCcw } from "lucide-react";
import { Alert, Badge, Button, Label, Select, Textarea } from "@/components/ui";
import { CodeEditor } from "@/components/code/CodeEditor";
import {
  PLAYGROUND_SAMPLES,
} from "@/lib/code-execution/catalog";
import type { RunResult } from "@/lib/code-execution/executor-types";

/**
 * Full code playground: sample dropdown (catalog programs), custom stdin,
 * run, output panel with an execution-mode badge, error panel, copy, reset.
 */
export function PlaygroundClient({ defaultMode }: { defaultMode: "demo" | "judge0" }) {
  const first = PLAYGROUND_SAMPLES[0];
  const [sampleName, setSampleName] = useState(first?.name ?? "Custom");
  const [code, setCode] = useState(first?.code ?? "");
  const [stdin, setStdin] = useState(first?.stdin ?? "");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [copied, setCopied] = useState(false);

  function loadSample(name: string) {
    const sample = PLAYGROUND_SAMPLES.find((s) => s.name === name);
    setSampleName(name);
    setResult(null);
    if (sample) {
      setCode(sample.code);
      setStdin(sample.stdin);
    }
  }

  async function run() {
    setRunning(true);
    setResult(null);
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:max-w-xs">
        <Label htmlFor="playground-sample">Sample program</Label>
        <Select
          id="playground-sample"
          value={sampleName}
          onChange={(e) => loadSample(e.target.value)}
        >
          {PLAYGROUND_SAMPLES.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </Select>
        <p className="text-xs text-muted">
          {PLAYGROUND_SAMPLES.find((s) => s.name === sampleName)?.description ??
            "Write your own program below."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <CodeEditor
            value={code}
            onChange={setCode}
            label="C code editor"
            minHeight={380}
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="playground-stdin">
              Standard input (what scanf will read)
            </Label>
            <Textarea
              id="playground-stdin"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              rows={4}
              className="font-mono text-xs"
              spellCheck={false}
              placeholder="e.g. 12 11"
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
              {copied ? "Copied" : "Copy code"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadSample(sampleName)}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset to sample
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3" aria-live="polite">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-fg">Output</h2>
            <Badge tone={result?.mode === "judge0" ? "success" : "warning"}>
              {result?.mode === "judge0"
                ? "Judge0: live"
                : defaultMode === "judge0"
                  ? "Judge0: live"
                  : "Demo: pre-recorded"}
            </Badge>
          </div>

          {result ? (
            <>
              <figure className="min-h-40 overflow-hidden rounded-lg border border-border">
                <figcaption className="border-b border-border bg-surface-2 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Program output
                </figcaption>
                <pre className="overflow-x-auto bg-surface-2 px-4 py-3 text-sm text-fg">
                  <code>{result.stdout ?? "(no output)"}</code>
                </pre>
              </figure>
              {result.stderr !== undefined && (
                <Alert tone="danger" title="Errors">
                  <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs">
                    {result.stderr}
                  </pre>
                </Alert>
              )}
              <Alert tone={result.ok ? "success" : "warning"} title={result.ok ? "Executed" : "Not executed"}>
                {result.note}
              </Alert>
            </>
          ) : (
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-surface text-sm text-muted">
              Output appears here after you press Run.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
