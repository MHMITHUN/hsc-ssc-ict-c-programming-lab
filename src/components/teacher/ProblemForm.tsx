"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { Alert, Button, Field, Input, Select, Textarea } from "@/components/ui";
import type { ContentFormState } from "@/lib/validation/content-forms";
import { listTopics } from "@/lib/curriculum/topics";

export interface ProblemFormValues {
  slug?: string;
  title: string;
  topicSlug: string;
  difficulty: string;
  status: string;
  statement: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  hint: string;
  solutionExplanation: string;
  starterCode: string;
  expectedOutput: string;
}

export const EMPTY_PROBLEM_VALUES: ProblemFormValues = {
  title: "",
  topicSlug: "program-structure",
  difficulty: "easy",
  status: "draft",
  statement: "",
  constraints: "",
  sampleInput: "",
  sampleOutput: "",
  hint: "",
  solutionExplanation: "",
  starterCode: "",
  expectedOutput: "",
};

export function ProblemForm({
  action,
  initial,
  mode,
  problemId,
}: {
  action: (state: ContentFormState, formData: FormData) => Promise<ContentFormState>;
  initial: ProblemFormValues;
  mode: "create" | "edit";
  problemId?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ContentFormState);
  const errors = state.fieldErrors ?? {};
  const topics = listTopics();

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {mode === "edit" && problemId && (
        <input type="hidden" name="problemId" value={problemId} />
      )}

      {state.error && (
        <Alert tone="danger" title="Could not save">
          {state.error}
        </Alert>
      )}
      {state.saved && (
        <Alert tone="success" title="Saved">
          The problem was updated. Changes are live wherever it appears.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {mode === "create" && (
          <Field
            label="Slug"
            name="problem-slug"
            hint="URL identifier, lowercase with hyphens (locked after creation)"
            error={errors.slug}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="slug"
                required
                placeholder="e.g. palindrome-check"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
                defaultValue={initial.slug ?? ""}
              />
            )}
          </Field>
        )}
        <Field label="Title" name="problem-title" error={errors.title}>
          {(aria) => (
            <Input
              id={aria.id}
              name="title"
              required
              placeholder="e.g. Palindrome Check"
              invalid={aria.invalid}
              aria-describedby={aria["aria-describedby"]}
              aria-invalid={aria["aria-invalid"]}
              defaultValue={initial.title}
            />
          )}
        </Field>
        <Field label="Topic" name="problem-topic" error={errors.topicSlug}>
          {(aria) => (
            <Select id={aria.id} name="topicSlug" defaultValue={initial.topicSlug}>
              {topics.map((topic) => (
                <option key={topic.slug} value={topic.slug}>
                  {String(topic.order).padStart(2, "0")}. {topic.title}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Difficulty" name="problem-difficulty" error={errors.difficulty}>
          {(aria) => (
            <Select id={aria.id} name="difficulty" defaultValue={initial.difficulty}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          )}
        </Field>
        <Field
          label="Status"
          name="problem-status"
          hint="Draft problems never appear to students"
          error={errors.status}
        >
          {(aria) => (
            <Select id={aria.id} name="status" defaultValue={initial.status}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          )}
        </Field>
      </div>

      <Field label="Statement" name="problem-statement" error={errors.statement}>
        {(aria) => (
          <Textarea
            id={aria.id}
            name="statement"
            rows={6}
            required
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.statement}
          />
        )}
      </Field>

      <Field label="Constraints" name="problem-constraints" error={errors.constraints}>
        {(aria) => (
          <Textarea
            id={aria.id}
            name="constraints"
            rows={2}
            required
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.constraints}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sample input" name="problem-sample-input" error={errors.sampleInput}>
          {(aria) => (
            <Textarea
              id={aria.id}
              name="sampleInput"
              rows={3}
              required
              className="font-mono"
              invalid={aria.invalid}
              aria-describedby={aria["aria-describedby"]}
              aria-invalid={aria["aria-invalid"]}
              defaultValue={initial.sampleInput}
            />
          )}
        </Field>
        <Field label="Sample output" name="problem-sample-output" error={errors.sampleOutput}>
          {(aria) => (
            <Textarea
              id={aria.id}
              name="sampleOutput"
              rows={3}
              required
              className="font-mono"
              invalid={aria.invalid}
              aria-describedby={aria["aria-describedby"]}
              aria-invalid={aria["aria-invalid"]}
              defaultValue={initial.sampleOutput}
            />
          )}
        </Field>
      </div>

      <Field label="Hint" name="problem-hint" error={errors.hint}>
        {(aria) => (
          <Textarea
            id={aria.id}
            name="hint"
            rows={2}
            required
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.hint}
          />
        )}
      </Field>

      <Field
        label="Solution explanation"
        name="problem-solution"
        hint="Shown after the student reveals the approach - explain the reasoning, not just the answer."
        error={errors.solutionExplanation}
      >
        {(aria) => (
          <Textarea
            id={aria.id}
            name="solutionExplanation"
            rows={5}
            required
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.solutionExplanation}
          />
        )}
      </Field>

      <Field label="Starter code" name="problem-starter" error={errors.starterCode}>
        {(aria) => (
          <Textarea
            id={aria.id}
            name="starterCode"
            rows={10}
            required
            className="font-mono"
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.starterCode}
          />
        )}
      </Field>

      <Field
        label="Expected output"
        name="problem-expected"
        hint="Exact stdout for the sample input - submissions are auto-checked against this."
        error={errors.expectedOutput}
      >
        {(aria) => (
          <Textarea
            id={aria.id}
            name="expectedOutput"
            rows={3}
            required
            className="font-mono"
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.expectedOutput}
          />
        )}
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending}>
          <Save className="size-4" aria-hidden="true" />
          {mode === "create" ? "Create problem" : "Save changes"}
        </Button>
        <span aria-live="polite" className="text-sm text-muted">
          {pending ? "Saving..." : state.saved ? "Saved." : ""}
        </span>
      </div>
    </form>
  );
}
