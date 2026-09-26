import { randomUUID } from "node:crypto";
import { MongoClient, type Collection, type Document } from "mongodb";
import type { ZodType } from "zod";
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
import {
  UserSchema,
  LessonSchema,
  ProblemSchema,
  QuizSchema,
  QuizAttemptSchema,
  SubmissionSchema,
  ProgressSchema,
} from "./types";
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
 * MongoDB-backed store (mongodb driver), used when MONGODB_URI is set.
 * Every document is zod-parsed at the boundary so pages get typed, trusted
 * objects. Content is created by teachers in-app or seeded with npm run seed.
 */

const globalForMongo = globalThis as unknown as {
  __cpLabMongoClient?: MongoClient;
};

function getMongoClient(): MongoClient {
  if (!globalForMongo.__cpLabMongoClient) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set.");
    globalForMongo.__cpLabMongoClient = new MongoClient(uri);
  }
  return globalForMongo.__cpLabMongoClient;
}

function getDbName(): string {
  return process.env.MONGODB_DB_NAME || "c_programming_lab";
}

function getCollection<T extends Document>(name: string): Collection<T> {
  return getMongoClient().db(getDbName()).collection<T>(name);
}

/** Mongo document shape: our typed fields plus the Mongo _id. */
interface UserDoc extends User, Document {
  _id?: unknown;
}
interface LessonDoc extends Lesson, Document {
  _id?: unknown;
}
interface ProblemDoc extends Problem, Document {
  _id?: unknown;
}
interface QuizDoc extends Quiz, Document {
  _id?: unknown;
}
interface QuizAttemptDoc extends QuizAttempt, Document {
  _id?: unknown;
}
interface ProgressDoc extends Progress, Document {
  _id?: unknown;
}
interface SubmissionDoc extends Submission, Document {
  _id?: unknown;
}

const nowIso = () => new Date().toISOString();

function parse<T>(
  schema: ZodType<T>,
  doc: (T & Document) | null,
): T | null {
  if (!doc) return null;
  const parsed = schema.safeParse({ ...doc, _id: undefined });
  return parsed.success ? parsed.data : null;
}

/** Escape user text before using it inside a Mongo $regex. */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class MongoStore implements Store {
  static async create(): Promise<MongoStore> {
    const store = new MongoStore();
    await store.ensureIndexes();
    return store;
  }

  /** Create indexes once per process. Extend as collections are added. */
  private indexesEnsured = false;
  private async ensureIndexes(): Promise<void> {
    if (this.indexesEnsured) return;
    await getCollection<UserDoc>("users").createIndex(
      { email: 1 },
      { unique: true },
    );
    await getCollection<LessonDoc>("lessons").createIndex(
      { slug: 1 },
      { unique: true },
    );
    await getCollection<ProblemDoc>("problems").createIndex(
      { slug: 1 },
      { unique: true },
    );
    await getCollection<QuizDoc>("quizzes").createIndex(
      { slug: 1 },
      { unique: true },
    );
    await getCollection<QuizAttemptDoc>("quizAttempts").createIndex({
      userId: 1,
      createdAt: -1,
    });
    await getCollection<ProgressDoc>("progress").createIndex(
      { userId: 1, lessonSlug: 1 },
      { unique: true },
    );
    await getCollection<SubmissionDoc>("submissions").createIndex({
      createdAt: -1,
    });
    this.indexesEnsured = true;
  }

  // ---- users ------------------------------------------------------------

  async getUserByEmail(email: string): Promise<User | null> {
    const doc = await getCollection<UserDoc>("users").findOne({
      email: email.toLowerCase(),
    });
    return parse(UserSchema, doc);
  }

  async getUserById(id: string): Promise<User | null> {
    const doc = await getCollection<UserDoc>("users").findOne({ id });
    return parse(UserSchema, doc);
  }

  async createUser(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
  }): Promise<User> {
    const user: User = {
      id: `usr-${randomUUID()}`,
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role,
      createdAt: nowIso(),
    };
    try {
      await getCollection<UserDoc>("users").insertOne({ ...user });
    } catch (error) {
      if (
        error instanceof Error &&
        /duplicate key/.test(error.message)
      ) {
        throw new Error(
          `A user with email ${user.email} already exists.`,
        );
      }
      throw error;
    }
    return user;
  }

  async listUsers(role?: Role): Promise<User[]> {
    const cursor = getCollection<UserDoc>("users")
      .find(role ? { role } : {})
      .sort({ createdAt: 1 });
    const docs = await cursor.toArray();
    return docs
      .map((doc) => parse(UserSchema, doc))
      .filter((u): u is User => u !== null);
  }

  // ---- lessons ------------------------------------------------------------

  async listPublishedLessons(topicSlug?: string): Promise<Lesson[]> {
    const filter: Record<string, string> = { status: "published" };
    if (topicSlug) filter.topicSlug = topicSlug;
    const docs = await getCollection<LessonDoc>("lessons")
      .find(filter)
      .sort({ createdAt: 1 })
      .toArray();
    return docs
      .map((doc) => parse(LessonSchema, doc))
      .filter((l): l is Lesson => l !== null);
  }

  async listAllLessons(): Promise<Lesson[]> {
    const docs = await getCollection<LessonDoc>("lessons")
      .find({})
      .sort({ createdAt: 1 })
      .toArray();
    return docs
      .map((doc) => parse(LessonSchema, doc))
      .filter((l): l is Lesson => l !== null);
  }

  async getLessonBySlug(slug: string): Promise<Lesson | null> {
    const doc = await getCollection<LessonDoc>("lessons").findOne({ slug });
    return parse(LessonSchema, doc);
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    const doc = await getCollection<LessonDoc>("lessons").findOne({ id });
    return parse(LessonSchema, doc);
  }

  async createLesson(input: CreateLessonInput): Promise<Lesson> {
    const lesson: Lesson = {
      ...input,
      id: `les-${randomUUID()}`,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    try {
      await getCollection<LessonDoc>("lessons").insertOne({ ...lesson });
    } catch (error) {
      if (error instanceof Error && /duplicate key/.test(error.message)) {
        throw new Error(`A lesson with slug ${input.slug} already exists.`);
      }
      throw error;
    }
    return lesson;
  }

  async updateLesson(
    id: string,
    patch: UpdateLessonInput,
  ): Promise<Lesson | null> {
    const doc = await getCollection<LessonDoc>("lessons").findOneAndUpdate(
      { id },
      { $set: { ...patch, updatedAt: nowIso() } },
      { returnDocument: "after" },
    );
    return parse(LessonSchema, doc);
  }

  async setLessonStatus(id: string, status: ContentStatus): Promise<Lesson | null> {
    return this.updateLesson(id, { status });
  }

  // ---- problems -------------------------------------------------------------

  async listPublishedProblems(topicSlug?: string): Promise<Problem[]> {
    const filter: Record<string, string> = { status: "published" };
    if (topicSlug) filter.topicSlug = topicSlug;
    const docs = await getCollection<ProblemDoc>("problems")
      .find(filter)
      .sort({ createdAt: 1 })
      .toArray();
    return docs
      .map((doc) => parse(ProblemSchema, doc))
      .filter((p): p is Problem => p !== null);
  }

  async listAllProblems(): Promise<Problem[]> {
    const docs = await getCollection<ProblemDoc>("problems")
      .find({})
      .sort({ createdAt: 1 })
      .toArray();
    return docs
      .map((doc) => parse(ProblemSchema, doc))
      .filter((p): p is Problem => p !== null);
  }

  async getProblemBySlug(slug: string): Promise<Problem | null> {
    const doc = await getCollection<ProblemDoc>("problems").findOne({ slug });
    return parse(ProblemSchema, doc);
  }

  async getProblemById(id: string): Promise<Problem | null> {
    const doc = await getCollection<ProblemDoc>("problems").findOne({ id });
    return parse(ProblemSchema, doc);
  }

  async listProblems(options: ListProblemsOptions): Promise<Paged<Problem>> {
    const page = Math.max(1, options.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 10));

    const filter: Record<string, unknown> = {};
    if (options.status) filter.status = options.status;
    if (options.topicSlug) filter.topicSlug = options.topicSlug;
    if (options.difficulty) filter.difficulty = options.difficulty;
    const q = options.q?.trim();
    if (q) filter.title = { $regex: escapeRegex(q), $options: "i" };

    const collection = getCollection<ProblemDoc>("problems");
    const total = await collection.countDocuments(filter);
    const docs = await collection
      .find(filter)
      .sort({ createdAt: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    return {
      items: docs
        .map((doc) => parse(ProblemSchema, doc))
        .filter((p): p is Problem => p !== null),
      total,
      page,
      pageSize,
    };
  }

  async createProblem(input: CreateProblemInput): Promise<Problem> {
    const problem: Problem = {
      ...input,
      id: `prb-${randomUUID()}`,
      createdAt: nowIso(),
    };
    try {
      await getCollection<ProblemDoc>("problems").insertOne({ ...problem });
    } catch (error) {
      if (error instanceof Error && /duplicate key/.test(error.message)) {
        throw new Error(`A problem with slug ${input.slug} already exists.`);
      }
      throw error;
    }
    return problem;
  }

  async updateProblem(
    id: string,
    patch: UpdateProblemInput,
  ): Promise<Problem | null> {
    const doc = await getCollection<ProblemDoc>("problems").findOneAndUpdate(
      { id },
      { $set: patch },
      { returnDocument: "after" },
    );
    return parse(ProblemSchema, doc);
  }

  async setProblemStatus(id: string, status: ContentStatus): Promise<Problem | null> {
    return this.updateProblem(id, { status });
  }

  // ---- quizzes ---------------------------------------------------------------

  async listQuizzes(): Promise<Quiz[]> {
    const docs = await getCollection<QuizDoc>("quizzes")
      .find({})
      .sort({ id: 1 })
      .toArray();
    return docs
      .map((doc) => parse(QuizSchema, doc))
      .filter((q): q is Quiz => q !== null);
  }

  async getQuizBySlug(slug: string): Promise<Quiz | null> {
    const doc = await getCollection<QuizDoc>("quizzes").findOne({ slug });
    return parse(QuizSchema, doc);
  }

  async getQuizByTopic(topicSlug: string): Promise<Quiz | null> {
    const doc = await getCollection<QuizDoc>("quizzes").findOne({ topicSlug });
    return parse(QuizSchema, doc);
  }

  // ---- quiz attempts -----------------------------------------------------

  async recordQuizAttempt(input: {
    quizId: string;
    userId: string;
    answers: number[];
  }): Promise<QuizAttempt> {
    const quizDoc = await getCollection<QuizDoc>("quizzes").findOne({
      id: input.quizId,
    });
    const quiz = parse(QuizSchema, quizDoc);
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
    await getCollection<QuizAttemptDoc>("quizAttempts").insertOne({ ...attempt });
    return attempt;
  }

  async listQuizAttemptsByUser(userId: string): Promise<QuizAttempt[]> {
    const docs = await getCollection<QuizAttemptDoc>("quizAttempts")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    return docs
      .map((doc) => parse(QuizAttemptSchema, doc))
      .filter((a): a is QuizAttempt => a !== null);
  }

  // ---- progress -------------------------------------------------------------

  async markLessonComplete(input: {
    userId: string;
    lessonSlug: string;
  }): Promise<Progress> {
    const collection = getCollection<ProgressDoc>("progress");
    const filter = { userId: input.userId, lessonSlug: input.lessonSlug };
    const existing = await collection.findOne(filter);
    if (existing) {
      // Idempotent upsert: never a second row; completedAt keeps the FIRST
      // completion, only the attempts counter grows.
      const doc = await collection.findOneAndUpdate(
        filter,
        { $inc: { attempts: 1 } },
        { returnDocument: "after" },
      );
      const updated = parse(ProgressSchema, doc);
      if (updated) return updated;
      throw new Error("Failed to update progress.");
    }
    const progress: Progress = {
      id: `prg-${randomUUID()}`,
      userId: input.userId,
      lessonSlug: input.lessonSlug,
      completedAt: nowIso(),
      attempts: 1,
    };
    try {
      await collection.insertOne({ ...progress });
    } catch (error) {
      if (error instanceof Error && /duplicate key/.test(error.message)) {
        // Raced with another request - read and return the existing row.
        const raced = await collection.findOne(filter);
        const existingRow = parse(ProgressSchema, raced);
        if (existingRow) return existingRow;
      }
      throw error;
    }
    return progress;
  }

  async listProgressByUser(userId: string): Promise<Progress[]> {
    const docs = await getCollection<ProgressDoc>("progress")
      .find({ userId })
      .sort({ completedAt: 1 })
      .toArray();
    return docs
      .map((doc) => parse(ProgressSchema, doc))
      .filter((p): p is Progress => p !== null);
  }

  // ---- submissions ------------------------------------------------------------

  async recordSubmission(input: {
    problemId: string;
    userId: string;
    code: string;
    status: SubmissionStatus;
    note?: string;
  }): Promise<Submission> {
    const submission: Submission = {
      id: `sub-${randomUUID()}`,
      problemId: input.problemId,
      userId: input.userId,
      code: input.code,
      status: input.status,
      ...(input.note !== undefined ? { note: input.note } : {}),
      createdAt: nowIso(),
    };
    await getCollection<SubmissionDoc>("submissions").insertOne({
      ...submission,
    });
    return submission;
  }

  async listSubmissionsByUser(userId: string): Promise<Submission[]> {
    const docs = await getCollection<SubmissionDoc>("submissions")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    return docs
      .map((doc) => parse(SubmissionSchema, doc))
      .filter((s): s is Submission => s !== null);
  }

  async listAllSubmissions(): Promise<Submission[]> {
    const docs = await getCollection<SubmissionDoc>("submissions")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return docs
      .map((doc) => parse(SubmissionSchema, doc))
      .filter((s): s is Submission => s !== null);
  }
}
