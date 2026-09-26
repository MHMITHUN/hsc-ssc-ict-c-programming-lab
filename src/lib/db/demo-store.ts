import { randomUUID } from "node:crypto";
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
  SubmissionStatus,
} from "./types";
import { hashPassword } from "@/lib/auth/password";
import { DEMO_PASSWORD, seedUsers } from "./seeds/users";
import { seedLessons } from "./seeds/lessons-1";
import { seedLessons2 } from "./seeds/lessons-2";
import { seedProblems } from "./seeds/problems-1";
import { seedProblems2 } from "./seeds/problems-2";
import { seedQuizzes } from "./seeds/quizzes";
import { buildSeedActivity } from "./seeds/progress";
import type {
  Store,
  CreateLessonInput,
  UpdateLessonInput,
  CreateProblemInput,
  UpdateProblemInput,
  Paged,
  ListProblemsOptions,
} from "./index";

/**
 * In-memory store used when MONGODB_URI is absent. Seeded lazily on first
 * access; data resets when the server restarts. All mutations are real —
 * they write to the in-memory Maps, and reads see them (spec section 36:
 * never fake functionality).
 */

const nowIso = () => new Date().toISOString();

export class DemoStore implements Store {
  private usersByEmail = new Map<string, User>();
  private usersById = new Map<string, User>();
  private lessonsById = new Map<string, Lesson>();
  private lessonsBySlug = new Map<string, Lesson>();
  private problemsById = new Map<string, Problem>();
  private problemsBySlug = new Map<string, Problem>();
  private quizzesById = new Map<string, Quiz>();
  private quizzesBySlug = new Map<string, Quiz>();
  private quizzesByTopic = new Map<string, Quiz>();
  private quizAttempts: QuizAttempt[] = [];
  /** progress key: `${userId}::${lessonSlug}` */
  private progressByKey = new Map<string, Progress>();
  private submissions: Submission[] = [];
  private seeded = false;

  static async create(): Promise<DemoStore> {
    const store = new DemoStore();
    await store.ensureSeeded();
    return store;
  }

  /** Idempotent: seed exactly once per process. */
  async ensureSeeded(): Promise<void> {
    if (this.seeded) return;
    for (const seed of seedUsers) {
      const user: User = { ...seed, passwordHash: hashPassword(DEMO_PASSWORD) };
      this.usersByEmail.set(user.email, user);
      this.usersById.set(user.id, user);
    }
    for (const lesson of [...seedLessons, ...seedLessons2]) {
      this.lessonsById.set(lesson.id, lesson);
      this.lessonsBySlug.set(lesson.slug, lesson);
    }
    for (const problem of [...seedProblems, ...seedProblems2]) {
      this.problemsById.set(problem.id, problem);
      this.problemsBySlug.set(problem.slug, problem);
    }
    for (const quiz of seedQuizzes) {
      this.quizzesById.set(quiz.id, quiz);
      this.quizzesBySlug.set(quiz.slug, quiz);
      this.quizzesByTopic.set(quiz.topicSlug, quiz);
    }
    // Demo students' history: graded quiz attempts, progress rows and
    // submissions with fixed 2026 dates (seeds/progress.ts builds them).
    const activity = buildSeedActivity();
    for (const row of activity.progress) {
      this.progressByKey.set(`${row.userId}::${row.lessonSlug}`, row);
    }
    this.quizAttempts.push(...activity.quizAttempts);
    this.submissions.push(...activity.submissions);
    this.seeded = true;
  }

  // ---- users ------------------------------------------------------------

  async getUserByEmail(email: string): Promise<User | null> {
    await this.ensureSeeded();
    return this.usersByEmail.get(email.toLowerCase()) ?? null;
  }

  async getUserById(id: string): Promise<User | null> {
    await this.ensureSeeded();
    return this.usersById.get(id) ?? null;
  }

  async createUser(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
  }): Promise<User> {
    await this.ensureSeeded();
    const email = input.email.toLowerCase();
    if (this.usersByEmail.has(email)) {
      throw new Error(`A user with email ${email} already exists.`);
    }
    const user: User = {
      id: `usr-${randomUUID()}`,
      name: input.name,
      email,
      passwordHash: input.passwordHash,
      role: input.role,
      createdAt: nowIso(),
    };
    this.usersByEmail.set(user.email, user);
    this.usersById.set(user.id, user);
    return user;
  }

  async listUsers(role?: Role): Promise<User[]> {
    await this.ensureSeeded();
    const all = [...this.usersById.values()];
    const sorted = all.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return role ? sorted.filter((u) => u.role === role) : sorted;
  }

  // ---- lessons ------------------------------------------------------------

  async listPublishedLessons(topicSlug?: string): Promise<Lesson[]> {
    await this.ensureSeeded();
    return this.sortedLessons(
      (l) => l.status === "published" && (!topicSlug || l.topicSlug === topicSlug),
    );
  }

  async listAllLessons(): Promise<Lesson[]> {
    await this.ensureSeeded();
    return this.sortedLessons(() => true);
  }

  private sortedLessons(predicate: (l: Lesson) => boolean): Lesson[] {
    return [...this.lessonsById.values()]
      .filter(predicate)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async getLessonBySlug(slug: string): Promise<Lesson | null> {
    await this.ensureSeeded();
    return this.lessonsBySlug.get(slug) ?? null;
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    await this.ensureSeeded();
    return this.lessonsById.get(id) ?? null;
  }

  async createLesson(input: CreateLessonInput): Promise<Lesson> {
    await this.ensureSeeded();
    if (this.lessonsBySlug.has(input.slug)) {
      throw new Error(`A lesson with slug ${input.slug} already exists.`);
    }
    const lesson: Lesson = {
      ...input,
      id: `les-${randomUUID()}`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    this.lessonsById.set(lesson.id, lesson);
    this.lessonsBySlug.set(lesson.slug, lesson);
    return lesson;
  }

  async updateLesson(
    id: string,
    patch: UpdateLessonInput,
  ): Promise<Lesson | null> {
    await this.ensureSeeded();
    const current = this.lessonsById.get(id);
    if (!current) return null;
    const updated: Lesson = { ...current, ...patch, updatedAt: nowIso() };
    this.lessonsById.set(id, updated);
    this.lessonsBySlug.set(updated.slug, updated);
    return updated;
  }

  async setLessonStatus(id: string, status: ContentStatus): Promise<Lesson | null> {
    return this.updateLesson(id, { status });
  }

  // ---- problems -------------------------------------------------------------

  async listPublishedProblems(topicSlug?: string): Promise<Problem[]> {
    await this.ensureSeeded();
    return this.sortedProblems(
      (p) => p.status === "published" && (!topicSlug || p.topicSlug === topicSlug),
    );
  }

  async listAllProblems(): Promise<Problem[]> {
    await this.ensureSeeded();
    return this.sortedProblems(() => true);
  }

  private sortedProblems(predicate: (p: Problem) => boolean): Problem[] {
    return [...this.problemsById.values()]
      .filter(predicate)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async getProblemBySlug(slug: string): Promise<Problem | null> {
    await this.ensureSeeded();
    return this.problemsBySlug.get(slug) ?? null;
  }

  async getProblemById(id: string): Promise<Problem | null> {
    await this.ensureSeeded();
    return this.problemsById.get(id) ?? null;
  }

  async listProblems(options: ListProblemsOptions): Promise<Paged<Problem>> {
    await this.ensureSeeded();
    const page = Math.max(1, options.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 10));
    const q = options.q?.trim().toLowerCase();

    const filtered = this.sortedProblems((p) => {
      if (options.status && p.status !== options.status) return false;
      if (options.topicSlug && p.topicSlug !== options.topicSlug) return false;
      if (options.difficulty && p.difficulty !== options.difficulty) return false;
      if (q && !p.title.toLowerCase().includes(q)) return false;
      return true;
    });

    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  }

  async createProblem(input: CreateProblemInput): Promise<Problem> {
    await this.ensureSeeded();
    if (this.problemsBySlug.has(input.slug)) {
      throw new Error(`A problem with slug ${input.slug} already exists.`);
    }
    const problem: Problem = { ...input, id: `prb-${randomUUID()}`, createdAt: nowIso() };
    this.problemsById.set(problem.id, problem);
    this.problemsBySlug.set(problem.slug, problem);
    return problem;
  }

  async updateProblem(
    id: string,
    patch: UpdateProblemInput,
  ): Promise<Problem | null> {
    await this.ensureSeeded();
    const current = this.problemsById.get(id);
    if (!current) return null;
    const updated: Problem = { ...current, ...patch };
    this.problemsById.set(id, updated);
    this.problemsBySlug.set(updated.slug, updated);
    return updated;
  }

  async setProblemStatus(id: string, status: ContentStatus): Promise<Problem | null> {
    return this.updateProblem(id, { status });
  }

  // ---- quizzes ---------------------------------------------------------------

  async listQuizzes(): Promise<Quiz[]> {
    await this.ensureSeeded();
    return [...this.quizzesById.values()];
  }

  async getQuizBySlug(slug: string): Promise<Quiz | null> {
    await this.ensureSeeded();
    return this.quizzesBySlug.get(slug) ?? null;
  }

  async getQuizByTopic(topicSlug: string): Promise<Quiz | null> {
    await this.ensureSeeded();
    return this.quizzesByTopic.get(topicSlug) ?? null;
  }

  // ---- quiz attempts -----------------------------------------------------

  async recordQuizAttempt(input: {
    quizId: string;
    userId: string;
    answers: number[];
  }): Promise<QuizAttempt> {
    await this.ensureSeeded();
    const quiz = this.quizzesById.get(input.quizId);
    if (!quiz) throw new Error(`Quiz ${input.quizId} not found.`);

    // Grade server-side from the stored correct answers (spec 15.4).
    let score = 0;
    quiz.questions.forEach((question, i) => {
      if (input.answers[i] === question.answerIndex) score += 1;
    });

    const attempt: QuizAttempt = {
      id: `qat-${randomUUID()}`,
      quizId: quiz.id,
      userId: input.userId,
      answers: input.answers,
      score,
      total: quiz.questions.length,
      createdAt: nowIso(),
    };
    this.quizAttempts.push(attempt);
    return attempt;
  }

  async listQuizAttemptsByUser(userId: string): Promise<QuizAttempt[]> {
    await this.ensureSeeded();
    return this.quizAttempts
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  // ---- progress -------------------------------------------------------------

  async markLessonComplete(input: {
    userId: string;
    lessonSlug: string;
  }): Promise<Progress> {
    await this.ensureSeeded();
    const key = `${input.userId}::${input.lessonSlug}`;
    const existing = this.progressByKey.get(key);
    if (existing) {
      // Idempotent: the completion row is never duplicated and completedAt
      // keeps the FIRST completion; only the attempts counter grows.
      const updated: Progress = { ...existing, attempts: existing.attempts + 1 };
      this.progressByKey.set(key, updated);
      return updated;
    }
    const progress: Progress = {
      id: `prg-${randomUUID()}`,
      userId: input.userId,
      lessonSlug: input.lessonSlug,
      completedAt: nowIso(),
      attempts: 1,
    };
    this.progressByKey.set(key, progress);
    return progress;
  }

  async listProgressByUser(userId: string): Promise<Progress[]> {
    await this.ensureSeeded();
    return [...this.progressByKey.values()]
      .filter((p) => p.userId === userId)
      .sort((a, b) => a.completedAt.localeCompare(b.completedAt));
  }

  // ---- submissions ------------------------------------------------------------

  async recordSubmission(input: {
    problemId: string;
    userId: string;
    code: string;
    status: SubmissionStatus;
    note?: string;
  }): Promise<Submission> {
    await this.ensureSeeded();
    const submission: Submission = {
      id: `sub-${randomUUID()}`,
      problemId: input.problemId,
      userId: input.userId,
      code: input.code,
      status: input.status,
      ...(input.note !== undefined ? { note: input.note } : {}),
      createdAt: nowIso(),
    };
    this.submissions.push(submission);
    return submission;
  }

  async listSubmissionsByUser(userId: string): Promise<Submission[]> {
    await this.ensureSeeded();
    return this.submissions
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listAllSubmissions(): Promise<Submission[]> {
    await this.ensureSeeded();
    return [...this.submissions].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  }
}
