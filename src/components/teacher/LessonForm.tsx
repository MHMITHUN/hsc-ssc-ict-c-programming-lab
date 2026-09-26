"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { Alert, Button, Field, Input, Select, Textarea } from "@/components/ui";
import type { ContentFormState } from "@/lib/validation/content-forms";
import { listTopics, LEVEL_LABELS } from "@/lib/curriculum/topics";

export interface LessonFormValues {
  slug?: string;
  title: string;
  topicSlug: string;
  level: string;
  audience: string;
  status: string;
  summary: string;
  objective: string;
  conceptMd: string;
  syntax: string;
  exampleCode: string;
  annotationsText: string;
  mistakesText: string;
  dryRunText: string;
  sampleInput: string;
  sampleOutput: string;
  practiceTask: string;
  checksText: string;
}

export const EMPTY_LESSON_VALUES: LessonFormValues = {
  title: "",
  topicSlug: "program-structure",
  level: "beginner",
  audience: "both",
  status: "draft",
  summary: "",
  objective: "",
  conceptMd: "",
  syntax: "",
  exampleCode: "",
  annotationsText: "",
  mistakesText: "",
  dryRunText: "",
  sampleInput: "",
  sampleOutput: "",
  practiceTask: "",
  checksText: "",
};

export function LessonForm({
  action,
  initial,
  mode,
  lessonId,
}: {
  action: (state: ContentFormState, formData: FormData) => Promise<ContentFormState>;
  initial: LessonFormValues;
  mode: "create" | "edit";
  lessonId?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as ContentFormState);
  const errors = state.fieldErrors ?? {};
  const topics = listTopics();

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      {mode === "edit" && lessonId && (
        <input type="hidden" name="lessonId" value={lessonId} />
      )}

      {state.error && (
        <Alert tone="danger" title="Could not save">
          {state.error}
        </Alert>
      )}
      {state.saved && (
        <Alert tone="success" title="Saved">
          The lesson was updated. Changes are live wherever it appears.
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {mode === "create" && (
          <Field
            label="Slug"
            name="lesson-slug"
            hint="URL identifier, lowercase with hyphens (locked after creation)"
            error={errors.slug}
          >
            {(aria) => (
              <Input
                id={aria.id}
                name="slug"
                required
                placeholder="e.g. strings-intro"
                invalid={aria.invalid}
                aria-describedby={aria["aria-describedby"]}
                aria-invalid={aria["aria-invalid"]}
                defaultValue={initial.slug ?? ""}
              />
            )}
          </Field>
        )}
        <Field label="Title" name="lesson-title" error={errors.title}>
          {(aria) => (
            <Input
              id={aria.id}
              name="title"
              required
              placeholder="e.g. Strings: Text as a Row of Characters"
              invalid={aria.invalid}
              aria-describedby={aria["aria-describedby"]}
              aria-invalid={aria["aria-invalid"]}
              defaultValue={initial.title}
            />
          )}
        </Field>
        <Field label="Topic" name="lesson-topic" error={errors.topicSlug}>
          {(aria) => (
            <Select
              id={aria.id}
              name="topicSlug"
              defaultValue={initial.topicSlug}
              aria-describedby={aria["aria-describedby"]}
              aria-invalid={aria["aria-invalid"]}
            >
              {topics.map((topic) => (
                <option key={topic.slug} value={topic.slug}>
                  {String(topic.order).padStart(2, "0")}. {topic.title}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Level" name="lesson-level" error={errors.level}>
          {(aria) => (
            <Select id={aria.id} name="level" defaultValue={initial.level}>
              {Object.entries(LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Audience" name="lesson-audience" error={errors.audience}>
          {(aria) => (
            <Select id={aria.id} name="audience" defaultValue={initial.audience}>
              <option value="SSC">SSC</option>
              <option value="HSC">HSC</option>
              <option value="both">SSC + HSC</option>
            </Select>
          )}
        </Field>
        <Field
          label="Status"
          name="lesson-status"
          hint="Draft lessons never appear to students"
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

      <Field label="Summary" name="lesson-summary" error={errors.summary}>
        {(aria) => (
          <Textarea
            id={aria.id}
            name="summary"
            rows={2}
            required
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.summary}
          />
        )}
      </Field>

      <Field label="Learning objective" name="lesson-objective" error={errors.objective}>
        {(aria) => (
          <Textarea
            id={aria.id}
            name="objective"
            rows={3}
            required
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.objective}
          />
        )}
      </Field>

      <Field
        label="Concept explanation"
        name="lesson-concept"
        hint="Plain paragraphs separated by blank lines - simple explanations, examples, why it works."
        error={errors.conceptMd}
      >
        {(aria) => (
          <Textarea
            id={aria.id}
            name="conceptMd"
            rows={12}
            required
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.conceptMd}
          />
        )}
      </Field>

      <Field label="Syntax" name="lesson-syntax" error={errors.syntax}>
        {(aria) => (
          <Textarea
            id={aria.id}
            name="syntax"
            rows={5}
            required
            className="font-mono"
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.syntax}
          />
        )}
      </Field>

      <Field label="Example code" name="lesson-example" error={errors.exampleCode}>
        {(aria) => (
          <Textarea
            id={aria.id}
            name="exampleCode"
            rows={12}
            required
            className="font-mono"
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.exampleCode}
          />
        )}
      </Field>

      <Field
        label="Annotations"
        name="lesson-annotations"
        hint='One per line as "lineNumber|note", e.g. "6|scanf needs no & before an array".'
        error={errors.annotationsText}
      >
        {(aria) => (
          <Textarea
            id={aria.id}
            name="annotationsText"
            rows={6}
            className="font-mono"
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.annotationsText}
          />
        )}
      </Field>

      <Field
        label="Common mistakes"
        name="lesson-mistakes"
        hint="One mistake per line, each a full sentence with the fix."
        error={errors.mistakesText}
      >
        {(aria) => (
          <Textarea
            id={aria.id}
            name="mistakesText"
            rows={5}
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.mistakesText}
          />
        )}
      </Field>

      <Field
        label="Dry-run trace (optional)"
        name="lesson-dryrun"
        hint='One step per line as "step|line|variable|value|explanation". Leave empty for no trace.'
        error={errors.dryRunText}
      >
        {(aria) => (
          <Textarea
            id={aria.id}
            name="dryRunText"
            rows={5}
            className="font-mono"
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.dryRunText}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sample input" name="lesson-sample-input" error={errors.sampleInput}>
          {(aria) => (
            <Textarea
              id={aria.id}
              name="sampleInput"
              rows={3}
              className="font-mono"
              aria-describedby={aria["aria-describedby"]}
              aria-invalid={aria["aria-invalid"]}
              defaultValue={initial.sampleInput}
            />
          )}
        </Field>
        <Field
          label="Sample output"
          name="lesson-sample-output"
          hint="Exactly what the example program prints on the sample input."
          error={errors.sampleOutput}
        >
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

      <Field
        label="Practice task"
        name="lesson-practice"
        hint="A concrete task with an expected answer the student can verify."
        error={errors.practiceTask}
      >
        {(aria) => (
          <Textarea
            id={aria.id}
            name="practiceTask"
            rows={3}
            required
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.practiceTask}
          />
        )}
      </Field>

      <Field
        label="Concept checks (optional)"
        name="lesson-checks"
        hint="Blocks separated by a blank line. Each block is 4 lines: question / options separated by commas / correct option index (0-based) / explanation."
        error={errors.checksText}
      >
        {(aria) => (
          <Textarea
            id={aria.id}
            name="checksText"
            rows={8}
            invalid={aria.invalid}
            aria-describedby={aria["aria-describedby"]}
            aria-invalid={aria["aria-invalid"]}
            defaultValue={initial.checksText}
          />
        )}
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending}>
          <Save className="size-4" aria-hidden="true" />
          {mode === "create" ? "Create lesson" : "Save changes"}
        </Button>
        <span aria-live="polite" className="text-sm text-muted">
          {pending ? "Saving..." : state.saved ? "Saved." : ""}
        </span>
      </div>
    </form>
  );
}
