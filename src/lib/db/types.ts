import { z } from "zod";

/**
 * Zod schemas + inferred TypeScript types for every collection.
 * MongoStore parses documents at the boundary with these schemas;
 * DemoStore produces values that already satisfy them.
 */

export const RoleSchema = z.enum(["ADMIN", "TEACHER", "STUDENT"]);
export type Role = z.infer<typeof RoleSchema>;

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  /** scrypt$<salt-hex>$<hash-hex> — see src/lib/auth/password.ts */
  passwordHash: z.string().min(1),
  role: RoleSchema,
  createdAt: z.string(), // ISO date, e.g. "2026-01-05T09:00:00.000Z"
});
export type User = z.infer<typeof UserSchema>;
/** User shape safe to send to the client. */
export type PublicUser = Omit<User, "passwordHash">;

export const LessonLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);
export type LessonLevel = z.infer<typeof LessonLevelSchema>;

export const LessonAudienceSchema = z.enum(["SSC", "HSC", "both"]);
export type LessonAudience = z.infer<typeof LessonAudienceSchema>;

export const ContentStatusSchema = z.enum(["draft", "published"]);
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

export const DryRunStepSchema = z.object({
  step: z.number().int().positive(),
  line: z.number().int().positive(),
  variable: z.string(),
  value: z.string(),
  explanation: z.string(),
});
export type DryRunStep = z.infer<typeof DryRunStepSchema>;

export const ExampleAnnotationSchema = z.object({
  line: z.number().int().positive(),
  note: z.string(),
});
export type ExampleAnnotation = z.infer<typeof ExampleAnnotationSchema>;

export const LessonCheckSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).min(2),
  answerIndex: z.number().int().min(0),
  explanation: z.string(),
});
export type LessonCheck = z.infer<typeof LessonCheckSchema>;

export const LessonSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  topicSlug: z.string().min(1),
  level: LessonLevelSchema,
  audience: LessonAudienceSchema,
  summary: z.string(),
  objective: z.string(),
  conceptMd: z.string(),
  syntax: z.string(),
  example: z.object({
    code: z.string(),
    annotations: z.array(ExampleAnnotationSchema),
  }),
  mistakes: z.array(z.string()),
  dryRun: z.array(DryRunStepSchema).optional(),
  sampleInput: z.string(),
  sampleOutput: z.string(),
  practiceTask: z.string(),
  /** 2-3 inline concept-check questions (instant feedback, not persisted). */
  checks: z.array(LessonCheckSchema).optional(),
  status: ContentStatusSchema,
  authorId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Lesson = z.infer<typeof LessonSchema>;

export const DifficultySchema = z.enum(["easy", "medium", "hard"]);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const ProblemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  statement: z.string(),
  difficulty: DifficultySchema,
  topicSlug: z.string().min(1),
  constraints: z.string(),
  sampleInput: z.string(),
  sampleOutput: z.string(),
  hint: z.string(),
  solutionExplanation: z.string(),
  starterCode: z.string(),
  expectedOutput: z.string(),
  status: ContentStatusSchema,
  createdAt: z.string(),
});
export type Problem = z.infer<typeof ProblemSchema>;

export const QuizQuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string(),
  options: z.array(z.string()).min(2),
  answerIndex: z.number().int().min(0),
  explanation: z.string(),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  topicSlug: z.string().min(1),
  title: z.string().min(1),
  questions: z.array(QuizQuestionSchema).min(1),
});
export type Quiz = z.infer<typeof QuizSchema>;

export const QuizAttemptSchema = z.object({
  id: z.string().min(1),
  quizId: z.string().min(1),
  userId: z.string().min(1),
  /** One entry per question: the chosen option index (or -1 for skipped). */
  answers: z.array(z.number().int()),
  score: z.number().int().min(0),
  total: z.number().int().min(1),
  createdAt: z.string(),
});
export type QuizAttempt = z.infer<typeof QuizAttemptSchema>;

export const SubmissionStatusSchema = z.enum([
  "pending",
  "accepted",
  "wrong_answer",
  "error",
  "reviewed",
]);
export type SubmissionStatus = z.infer<typeof SubmissionStatusSchema>;

export const SubmissionSchema = z.object({
  id: z.string().min(1),
  problemId: z.string().min(1),
  userId: z.string().min(1),
  code: z.string(),
  status: SubmissionStatusSchema,
  /** Teacher feedback or auto-grader note. */
  note: z.string().optional(),
  createdAt: z.string(),
});
export type Submission = z.infer<typeof SubmissionSchema>;

export const ProgressSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  lessonSlug: z.string().min(1),
  completedAt: z.string(),
  /** Aggregate counters, maintained by the store for cheap dashboard reads. */
  attempts: z.number().int().min(0).default(0),
});
export type Progress = z.infer<typeof ProgressSchema>;
