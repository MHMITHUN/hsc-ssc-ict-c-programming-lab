import { z } from "zod";
import {
  LessonLevelSchema,
  LessonAudienceSchema,
  ContentStatusSchema,
  DifficultySchema,
  type LessonLevel,
  type LessonAudience,
  type ContentStatus,
  type Difficulty,
  type ExampleAnnotation,
  type DryRunStep,
  type LessonCheck,
} from "@/lib/db/types";
import type { CreateLessonInput, CreateProblemInput } from "@/lib/db";
import { TOPICS } from "@/lib/curriculum/topics";

/**
 * Parsing + zod validation for the teacher lesson/problem editor forms.
 * The multi-line textareas use simple line formats:
 *   annotations: "lineNumber|note" per line
 *   dry run:     "step|line|variable|value|explanation" per line
 *   mistakes:    one mistake per line
 *   checks:      blocks separated by a blank line, each block four lines:
 *                question / options (comma-separated) / answer index / explanation
 * Everything is validated server-side; the client never decides validity.
 */

export interface ContentFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  saved?: boolean;
}

export interface RawFormValues {
  [key: string]: string;
}

const topicSlugs = TOPICS.map((t) => t.slug) as [string, ...string[]];
const TopicSchema = z.enum(topicSlugs);

const text = (min: number, max: number) =>
  z.string().trim().min(min, `Must be at least ${min} characters`).max(max);

function nonEmptyLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function parseAnnotations(value: string): { data?: ExampleAnnotation[]; error?: string } {
  const annotations: ExampleAnnotation[] = [];
  for (const line of nonEmptyLines(value)) {
    const match = /^(\d+)\s*\|\s*(.+)$/.exec(line);
    if (!match) {
      return { error: `Each annotation line must be "lineNumber|note" - got: ${line.slice(0, 60)}` };
    }
    annotations.push({ line: Number.parseInt(match[1], 10), note: match[2].trim() });
  }
  return { data: annotations };
}

function parseDryRun(value: string): { data?: DryRunStep[]; error?: string } {
  if (value.trim().length === 0) return { data: undefined };
  const steps: DryRunStep[] = [];
  for (const line of nonEmptyLines(value)) {
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length !== 5 || parts.some((p) => p.length === 0)) {
      return {
        error: `Each dry-run line needs 5 pipe-separated parts "step|line|variable|value|explanation" - got: ${line.slice(0, 60)}`,
      };
    }
    const step = Number.parseInt(parts[0], 10);
    const codeLine = Number.parseInt(parts[1], 10);
    if (!Number.isInteger(step) || step < 1 || !Number.isInteger(codeLine) || codeLine < 1) {
      return { error: `Dry-run step and line numbers must be positive integers - got: ${line.slice(0, 60)}` };
    }
    steps.push({
      step,
      line: codeLine,
      variable: parts[2],
      value: parts[3],
      explanation: parts[4],
    });
  }
  return { data: steps };
}

function parseChecks(value: string): { data?: LessonCheck[]; error?: string } {
  if (value.trim().length === 0) return { data: undefined };
  const checks: LessonCheck[] = [];
  const blocks = value
    .split(/\n\s*\n/)
    .map((block) => block.split("\n").map((l) => l.trim()).filter((l) => l.length > 0))
    .filter((block) => block.length > 0);
  for (const block of blocks) {
    if (block.length !== 4) {
      return {
        error: `Each check block needs exactly 4 lines (question / options / answer index / explanation) - a block starts: ${block[0]?.slice(0, 50)}`,
      };
    }
    const options = block[1]
      .split(",")
      .map((o) => o.trim())
      .filter((o) => o.length > 0);
    const answerIndex = Number.parseInt(block[2], 10);
    if (options.length < 2) {
      return { error: `A check needs at least 2 comma-separated options - block starts: ${block[0].slice(0, 50)}` };
    }
    if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= options.length) {
      return {
        error: `Answer index must be a whole number from 0 to ${options.length - 1} - block starts: ${block[0].slice(0, 50)}`,
      };
    }
    checks.push({ question: block[0], options, answerIndex, explanation: block[3] });
  }
  return { data: checks };
}

export interface LessonFormInput {
  slug?: string;
  title: string;
  topicSlug: string;
  level: LessonLevel;
  audience: LessonAudience;
  status: ContentStatus;
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

const LESSON_TEXT_FIELDS = [
  "slug",
  "title",
  "topicSlug",
  "level",
  "audience",
  "status",
  "summary",
  "objective",
  "conceptMd",
  "syntax",
  "exampleCode",
  "annotationsText",
  "mistakesText",
  "dryRunText",
  "sampleInput",
  "sampleOutput",
  "practiceTask",
  "checksText",
] as const;

export function extractLessonForm(formData: FormData): LessonFormInput {
  const raw: RawFormValues = {};
  for (const field of LESSON_TEXT_FIELDS) {
    const value = formData.get(field);
    raw[field] = typeof value === "string" ? value : "";
  }
  return raw as unknown as LessonFormInput;
}

const SlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase words separated by single hyphens, e.g. strings-intro",
  );

/** Validated lesson payload: slug present on create, absent on update. */
export type LessonContentInput = Omit<CreateLessonInput, "authorId" | "slug"> & {
  slug?: string;
};

/** Validated problem payload: slug present on create, absent on update. */
export type ProblemContentInput = Omit<CreateProblemInput, "slug"> & {
  slug?: string;
};

export function validateLessonForm(
  input: LessonFormInput,
): { ok: true; value: LessonContentInput } | { ok: false; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};

  const title = text(3, 150).safeParse(input.title);
  if (!title.success) fieldErrors.title = title.error.issues[0].message;

  const summary = text(10, 400).safeParse(input.summary);
  if (!summary.success) fieldErrors.summary = summary.error.issues[0].message;

  const objective = text(10, 2000).safeParse(input.objective);
  if (!objective.success) fieldErrors.objective = objective.error.issues[0].message;

  const conceptMd = text(20, 20000).safeParse(input.conceptMd);
  if (!conceptMd.success) fieldErrors.conceptMd = conceptMd.error.issues[0].message;

  const syntax = text(3, 5000).safeParse(input.syntax);
  if (!syntax.success) fieldErrors.syntax = syntax.error.issues[0].message;

  const exampleCode = text(5, 20000).safeParse(input.exampleCode);
  if (!exampleCode.success) fieldErrors.exampleCode = exampleCode.error.issues[0].message;

  const sampleOutput = text(1, 10000).safeParse(input.sampleOutput);
  if (!sampleOutput.success) fieldErrors.sampleOutput = "The sample output cannot be empty";

  const practiceTask = text(10, 4000).safeParse(input.practiceTask);
  if (!practiceTask.success) fieldErrors.practiceTask = practiceTask.error.issues[0].message;

  const level = LessonLevelSchema.safeParse(input.level);
  if (!level.success) fieldErrors.level = "Pick a level";

  const audience = LessonAudienceSchema.safeParse(input.audience);
  if (!audience.success) fieldErrors.audience = "Pick an audience";

  const status = ContentStatusSchema.safeParse(input.status);
  if (!status.success) fieldErrors.status = "Pick a status";

  const topicSlug = TopicSchema.safeParse(input.topicSlug);
  if (!topicSlug.success) fieldErrors.topicSlug = "Pick a curriculum topic";

  let slug: string | undefined;
  if (input.slug !== undefined) {
    const parsed = SlugSchema.safeParse(input.slug);
    if (!parsed.success) fieldErrors.slug = parsed.error.issues[0].message;
    else slug = parsed.data;
  }

  const annotations = parseAnnotations(input.annotationsText);
  if (annotations.error) fieldErrors.annotationsText = annotations.error;

  const dryRun = parseDryRun(input.dryRunText);
  if (dryRun.error) fieldErrors.dryRunText = dryRun.error;

  const checks = parseChecks(input.checksText);
  if (checks.error) fieldErrors.checksText = checks.error;

  const mistakes = nonEmptyLines(input.mistakesText);
  if (mistakes.some((m) => m.length < 10)) {
    fieldErrors.mistakesText = 'Each mistake line should be a full sentence (e.g. "Forgetting & in scanf - ...")';
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    value: {
      ...(slug !== undefined ? { slug } : {}),
      title: title.data!,
      topicSlug: topicSlug.data!,
      level: level.data!,
      audience: audience.data!,
      status: status.data!,
      summary: summary.data!,
      objective: objective.data!,
      conceptMd: conceptMd.data!,
      syntax: syntax.data!,
      example: { code: exampleCode.data!, annotations: annotations.data ?? [] },
      mistakes,
      ...(dryRun.data !== undefined && dryRun.data.length > 0 ? { dryRun: dryRun.data } : {}),
      sampleInput: input.sampleInput.trim(),
      sampleOutput: sampleOutput.data!,
      practiceTask: practiceTask.data!,
      ...(checks.data !== undefined && checks.data.length > 0 ? { checks: checks.data } : {}),
    },
  };
}

export interface ProblemFormInput {
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

const PROBLEM_TEXT_FIELDS = [
  "slug",
  "title",
  "topicSlug",
  "difficulty",
  "status",
  "statement",
  "constraints",
  "sampleInput",
  "sampleOutput",
  "hint",
  "solutionExplanation",
  "starterCode",
  "expectedOutput",
] as const;

export function extractProblemForm(formData: FormData): ProblemFormInput {
  const raw: RawFormValues = {};
  for (const field of PROBLEM_TEXT_FIELDS) {
    const value = formData.get(field);
    raw[field] = typeof value === "string" ? value : "";
  }
  return raw as unknown as ProblemFormInput;
}

export function validateProblemForm(
  input: ProblemFormInput,
): { ok: true; value: ProblemContentInput } | { ok: false; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};

  const title = text(3, 150).safeParse(input.title);
  if (!title.success) fieldErrors.title = title.error.issues[0].message;

  const statement = text(20, 8000).safeParse(input.statement);
  if (!statement.success) fieldErrors.statement = statement.error.issues[0].message;

  const constraints = text(3, 2000).safeParse(input.constraints);
  if (!constraints.success) fieldErrors.constraints = constraints.error.issues[0].message;

  const sampleInput = z.string().trim().max(2000).safeParse(input.sampleInput);
  if (!sampleInput.success) fieldErrors.sampleInput = sampleInput.error.issues[0].message;

  const sampleOutput = text(1, 4000).safeParse(input.sampleOutput);
  if (!sampleOutput.success) fieldErrors.sampleOutput = "The sample output cannot be empty";

  const hint = text(5, 2000).safeParse(input.hint);
  if (!hint.success) fieldErrors.hint = hint.error.issues[0].message;

  const solutionExplanation = text(10, 8000).safeParse(input.solutionExplanation);
  if (!solutionExplanation.success) {
    fieldErrors.solutionExplanation = solutionExplanation.error.issues[0].message;
  }

  const starterCode = text(10, 20000).safeParse(input.starterCode);
  if (!starterCode.success) fieldErrors.starterCode = starterCode.error.issues[0].message;

  const expectedOutput = text(1, 4000).safeParse(input.expectedOutput);
  if (!expectedOutput.success) fieldErrors.expectedOutput = "The expected output cannot be empty";

  const difficulty = DifficultySchema.safeParse(input.difficulty);
  if (!difficulty.success) fieldErrors.difficulty = "Pick a difficulty";

  const status = ContentStatusSchema.safeParse(input.status);
  if (!status.success) fieldErrors.status = "Pick a status";

  const topicSlug = TopicSchema.safeParse(input.topicSlug);
  if (!topicSlug.success) fieldErrors.topicSlug = "Pick a curriculum topic";

  let slug: string | undefined;
  if (input.slug !== undefined) {
    const parsed = SlugSchema.safeParse(input.slug);
    if (!parsed.success) fieldErrors.slug = parsed.error.issues[0].message;
    else slug = parsed.data;
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    value: {
      ...(slug !== undefined ? { slug } : {}),
      title: title.data!,
      topicSlug: topicSlug.data!,
      difficulty: difficulty.data as Difficulty,
      status: status.data as ContentStatus,
      statement: statement.data!,
      constraints: constraints.data!,
      sampleInput: sampleInput.data!,
      sampleOutput: sampleOutput.data!,
      hint: hint.data!,
      solutionExplanation: solutionExplanation.data!,
      starterCode: starterCode.data!,
      expectedOutput: expectedOutput.data!,
    },
  };
}
