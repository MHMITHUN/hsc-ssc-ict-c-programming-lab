"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, XCircle, RotateCcw, ClipboardCheck } from "lucide-react";
import { Alert, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { submitQuizAction, type QuizFormState } from "@/app/actions/learning";

/** Question shape sent to the client - correct answers stay on the server. */
export interface QuizPanelQuestion {
  id: string;
  prompt: string;
  options: string[];
}

export interface QuizPanelProps {
  quiz: {
    slug: string;
    title: string;
    questions: QuizPanelQuestion[];
  };
}

export function QuizPanel({ quiz }: QuizPanelProps) {
  // Remounting the form (key) is what makes "Retake" start a clean attempt.
  const [attemptKey, setAttemptKey] = useState(0);

  return (
    <QuizForm
      key={attemptKey}
      quiz={quiz}
      onRetake={() => setAttemptKey((k) => k + 1)}
    />
  );
}

function QuizForm({
  quiz,
  onRetake,
}: {
  quiz: QuizPanelProps["quiz"];
  onRetake: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    submitQuizAction,
    {} as QuizFormState,
  );
  const result = state.result;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="quizSlug" value={quiz.slug} />

      {state.error && (
        <Alert tone="danger" title="Could not submit">
          {state.error}
        </Alert>
      )}

      {quiz.questions.map((question, qi) => {
        const feedback = result?.items[qi];
        return (
          <fieldset
            key={question.id}
            disabled={pending || !!result}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <legend className="px-1 text-sm font-medium text-fg">
              {qi + 1}. {question.prompt}
            </legend>
            <div className="mt-3 flex flex-col gap-2">
              {question.options.map((option, oi) => {
                const isCorrectOption =
                  feedback && oi === feedback.answerIndex;
                return (
                  <label
                    key={oi}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2.5 text-sm transition-colors",
                      "border-border bg-surface hover:bg-surface-2",
                      "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                      isCorrectOption && "border-success/40 bg-success/10",
                    )}
                  >
                    <input
                      type="radio"
                      name={`answer-${qi}`}
                      value={oi}
                      className="size-4 accent-accent"
                    />
                    <span className="text-fg">{option}</span>
                    {isCorrectOption && (
                      <CheckCircle2
                        className="ml-auto size-4 shrink-0 text-success"
                        aria-hidden="true"
                      />
                    )}
                  </label>
                );
              })}
            </div>
            {feedback && (
              <p
                className={cn(
                  "mt-3 flex items-start gap-2 text-sm",
                  feedback.correct ? "text-success" : "text-danger",
                )}
              >
                {feedback.correct ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                )}
                <span>
                  {feedback.correct
                    ? `Correct. ${feedback.explanation}`
                    : `The correct answer is option ${feedback.answerIndex + 1}. ${feedback.explanation}`}
                </span>
              </p>
            )}
          </fieldset>
        );
      })}

      {result ? (
        <div className="flex flex-col gap-4">
          <Alert
            tone={result.score === result.total ? "success" : "info"}
            title={`You scored ${result.score} out of ${result.total}`}
          >
            {result.score === result.total
              ? "Full marks - every concept from this topic looks solid."
              : "Read the explanations above, then retake the quiz to check that the ideas stuck."}{" "}
            This attempt was saved to your progress.
          </Alert>
          <div>
            <Button variant="outline" size="sm" onClick={onRetake}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Retake quiz
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Button type="submit" loading={pending}>
            <ClipboardCheck className="size-4" aria-hidden="true" />
            {pending ? "Submitting..." : "Submit answers"}
          </Button>
          <p className="mt-2 text-xs text-muted">
            Unanswered questions are recorded as skipped. Your score is graded
            on the server and saved to your progress.
          </p>
        </div>
      )}
    </form>
  );
}
