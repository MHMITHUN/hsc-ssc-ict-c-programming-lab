import type {
  Role,
  User,
  Lesson,
  Problem,
  Quiz,
  QuizAttempt,
  Submission,
  Progress,
  ContentStatus,
  Difficulty,
  LessonLevel,
  LessonAudience,
  DryRunStep,
  LessonCheck,
  SubmissionStatus,
} from "./types";
import { DemoStore } from "./demo-store";
import { MongoStore } from "./mongo";

/**
 * Dual-mode data layer.
 *
 * - MONGODB_URI unset  -> DemoStore (in-memory, lazily seeded, resets on
 *   server restart). Good for local demos; every UI honestly labels it.
 * - MONGODB_URI set    -> MongoStore (mongodb driver) backed by the
 *   database named by MONGODB_DB_NAME (default "c_programming_lab").
 *
 * EXTENDING THIS INTERFACE (for later chunks): add the method signature
 * here first, then implement it in BOTH DemoStore and MongoStore. Keep the
 * methods domain-level (e.g. listLessons({ status }) rather than raw
 * collection access) so both stores stay swappable and Mongo documents are
 * always zod-parsed at the boundary.
 */
/** Input shape for creating a lesson (ids and timestamps are store-made). */
export interface CreateLessonInput {
  slug: string;
  title: string;
  topicSlug: string;
  level: LessonLevel;
  audience: LessonAudience;
  summary: string;
  objective: string;
  conceptMd: string;
  syntax: string;
  example: Lesson["example"];
  mistakes: string[];
  dryRun?: DryRunStep[];
  sampleInput: string;
  sampleOutput: string;
  practiceTask: string;
  checks?: LessonCheck[];
  status: ContentStatus;
  authorId: string;
}

export type UpdateLessonInput = Partial<Omit<CreateLessonInput, "slug">>;

/** Input shape for creating a problem. */
export interface CreateProblemInput {
  slug: string;
  title: string;
  statement: string;
  difficulty: Difficulty;
  topicSlug: string;
  constraints: string;
  sampleInput: string;
  sampleOutput: string;
  hint: string;
  solutionExplanation: string;
  starterCode: string;
  expectedOutput: string;
  status: ContentStatus;
}

export type UpdateProblemInput = Partial<Omit<CreateProblemInput, "slug">>;

/** Paged result shape used by the problem list page and public API. */
export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListProblemsOptions {
  status?: ContentStatus;
  topicSlug?: string;
  difficulty?: Difficulty;
  /** Case-insensitive search over titles. */
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface Store {
  // ---- users -------------------------------------------------------------
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  createUser(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
  }): Promise<User>;
  listUsers(role?: Role): Promise<User[]>;

  // ---- lessons -------------------------------------------------------------
  /** Published lessons only (spec 15.4: drafts never reach students). */
  listPublishedLessons(topicSlug?: string): Promise<Lesson[]>;
  /** Every lesson, drafts included - teacher/admin views only. */
  listAllLessons(): Promise<Lesson[]>;
  getLessonBySlug(slug: string): Promise<Lesson | null>;
  getLessonById(id: string): Promise<Lesson | null>;
  createLesson(input: CreateLessonInput): Promise<Lesson>;
  updateLesson(id: string, patch: UpdateLessonInput): Promise<Lesson | null>;
  setLessonStatus(id: string, status: ContentStatus): Promise<Lesson | null>;

  // ---- problems ------------------------------------------------------------
  listPublishedProblems(topicSlug?: string): Promise<Problem[]>;
  listAllProblems(): Promise<Problem[]>;
  getProblemBySlug(slug: string): Promise<Problem | null>;
  getProblemById(id: string): Promise<Problem | null>;
  /** Filtered + paged listing; drafts only appear when status is "draft". */
  listProblems(options: ListProblemsOptions): Promise<Paged<Problem>>;
  createProblem(input: CreateProblemInput): Promise<Problem>;
  updateProblem(id: string, patch: UpdateProblemInput): Promise<Problem | null>;
  setProblemStatus(id: string, status: ContentStatus): Promise<Problem | null>;

  // ---- quizzes -------------------------------------------------------------
  listQuizzes(): Promise<Quiz[]>;
  getQuizBySlug(slug: string): Promise<Quiz | null>;
  getQuizByTopic(topicSlug: string): Promise<Quiz | null>;

  // ---- quiz attempts (one row per submission, graded server-side) ---------
  recordQuizAttempt(input: {
    quizId: string;
    userId: string;
    answers: number[];
  }): Promise<QuizAttempt>;
  listQuizAttemptsByUser(userId: string): Promise<QuizAttempt[]>;

  // ---- progress (idempotent completion) -------------------------------------
  markLessonComplete(input: {
    userId: string;
    lessonSlug: string;
  }): Promise<Progress>;
  listProgressByUser(userId: string): Promise<Progress[]>;

  // ---- submissions ----------------------------------------------------------
  recordSubmission(input: {
    problemId: string;
    userId: string;
    code: string;
    status: SubmissionStatus;
    note?: string;
  }): Promise<Submission>;
  listSubmissionsByUser(userId: string): Promise<Submission[]>;
  /** All submissions, newest first - teacher review views. */
  listAllSubmissions(): Promise<Submission[]>;
}

const globalForStore = globalThis as unknown as {
  __cpLabStore?: Store;
};

/** Get the process-wide store singleton (DemoStore or MongoStore). */
export async function getStore(): Promise<Store> {
  if (!globalForStore.__cpLabStore) {
    if (process.env.MONGODB_URI) {
      globalForStore.__cpLabStore = await MongoStore.create();
    } else {
      globalForStore.__cpLabStore = await DemoStore.create();
    }
  }
  return globalForStore.__cpLabStore;
}

/** Test helper: forget the singleton so the next getStore() re-initializes. */
export function resetStoreForTests(): void {
  delete globalForStore.__cpLabStore;
}

export type { DemoStore, MongoStore };
