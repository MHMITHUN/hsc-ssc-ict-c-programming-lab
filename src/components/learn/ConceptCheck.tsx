"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { LessonCheck } from "@/lib/db/types";

/**
 * Inline concept-check question: instant feedback, explanation, try-again.
 * Not persisted anywhere - it is a self-check, not a graded quiz.
 */
export function ConceptCheck({
  check,
  index,
}: {
  check: LessonCheck;
  index: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = answered && selected === check.answerIndex;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="flex items-start gap-2 text-sm font-medium text-fg">
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
          {index + 1}
        </span>
        {check.question}
      </p>

      <div className="mt-3 flex flex-col gap-2" role="group" aria-label={`Options for check ${index + 1}`}>
        {check.options.map((option, i) => {
          const chosen = selected === i;
          const showCorrect = answered && i === check.answerIndex;
          const showWrong = answered && chosen && !isCorrect;
          return (
            <button
              key={i}
              type="button"
              disabled={answered}
              onClick={() => setSelected(i)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                !answered && "border-border bg-surface hover:bg-surface-2",
                showCorrect && "border-success/40 bg-success/10 text-fg",
                showWrong && "border-danger/40 bg-danger/10 text-fg",
                answered && !showCorrect && !showWrong && "border-border bg-surface text-muted",
              )}
            >
              <span>{option}</span>
              {showCorrect && (
                <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
              )}
              {showWrong && (
                <XCircle className="size-4 shrink-0 text-danger" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-3 flex flex-col gap-3">
          <p
            role="status"
            className={cn(
              "text-sm font-medium",
              isCorrect ? "text-success" : "text-danger",
            )}
          >
            {isCorrect ? "Correct!" : "Not quite - the correct answer is highlighted."}
          </p>
          <p className="rounded-lg border border-border bg-surface-2 p-3 text-sm text-fg">
            {check.explanation}
          </p>
          <div>
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
