"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ExampleAnnotation } from "@/lib/db/types";

/**
 * Annotated example: C code with numbered lines; annotated lines are
 * clickable (and hover-highlighted) buttons that show their note below.
 * Keyboard users tab through the annotated lines in order.
 */
export function AnnotatedCode({
  code,
  annotations,
}: {
  code: string;
  annotations: ExampleAnnotation[];
}) {
  const lines = code.split("\n");
  const noteByLine = new Map(annotations.map((a) => [a.line, a.note]));
  const firstAnnotated = annotations[0]?.line ?? 0;
  const [activeLine, setActiveLine] = useState<number | null>(
    firstAnnotated || null,
  );

  const activeNote =
    activeLine !== null ? noteByLine.get(activeLine) : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-lg border border-border bg-surface-2">
        <pre className="min-w-max py-3 text-sm leading-relaxed">
          <code>
            {lines.map((line, i) => {
              const lineNo = i + 1;
              const note = noteByLine.get(lineNo);
              const isActive = activeLine === lineNo;
              const content = (
                <>
                  <span
                    className={cn(
                      "inline-block w-10 select-none pr-3 text-right text-xs tabular-nums",
                      note ? "text-accent" : "text-muted",
                    )}
                  >
                    {lineNo}
                  </span>
                  <span className={cn("whitespace-pre", isActive ? "text-fg" : note ? "text-fg" : "text-muted")}>
                    {line || " "}
                  </span>
                </>
              );
              if (!note) {
                return (
                  <div key={lineNo} className="px-4">
                    {content}
                  </div>
                );
              }
              return (
                <div key={lineNo} className="px-4">
                  <button
                    type="button"
                    onClick={() => setActiveLine(lineNo)}
                    onMouseEnter={() => setActiveLine(lineNo)}
                    onFocus={() => setActiveLine(lineNo)}
                    aria-pressed={isActive}
                    aria-label={`Line ${lineNo}: show its annotation`}
                    className={cn(
                      "-mx-2 w-full rounded px-2 py-0.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      isActive
                        ? "bg-accent/10 ring-1 ring-inset ring-accent/30"
                        : "hover:bg-surface",
                    )}
                  >
                    {content}
                  </button>
                </div>
              );
            })}
          </code>
        </pre>
      </div>

      <div
        aria-live="polite"
        className={cn(
          "min-h-14 rounded-lg border p-3 text-sm",
          activeNote
            ? "border-accent/30 bg-accent/5 text-fg"
            : "border-border bg-surface-2 text-muted",
        )}
      >
        {activeNote ? (
          <p>
            <span className="font-semibold text-accent">Line {activeLine}:</span>{" "}
            {activeNote}
          </p>
        ) : (
          <p>Click a highlighted line number to read its annotation.</p>
        )}
      </div>
      <p className="text-xs text-muted">
        Lines with an indigo number carry an annotation - click or hover them.
      </p>
    </div>
  );
}
