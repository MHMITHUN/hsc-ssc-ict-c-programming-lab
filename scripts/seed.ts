/**
 * Seed script (npm run seed).
 *
 * With MONGODB_URI set: connects to MongoDB, ensures the same indexes the
 * app creates (mirrors MongoStore.ensureIndexes in src/lib/db/mongo.ts) and
 * writes ALL seed collections idempotently - users (by email), lessons and
 * problems and quizzes (by slug), plus the demo students' history: progress
 * (by userId+lessonSlug), quiz attempts and submissions (by id). Everything
 * uses $setOnInsert, so re-running never overwrites teacher edits or real
 * user activity - it only fills what is missing.
 *
 * Without MONGODB_URI: the app runs on the in-memory DemoStore, which seeds
 * itself lazily on first access - so there is nothing to persist here.
 * Exits 0 both ways.
 */

import type { Collection, Document } from "mongodb";

interface SeedReport {
  inserted: number;
  alreadyPresent: number;
}

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log(
      "Demo mode: no MONGODB_URI. The in-app demo store seeds itself automatically - nothing to do.",
    );
    return;
  }

  const { MongoClient } = await import("mongodb");
  const { hashPassword } = await import("../src/lib/auth/password");
  const { seedUsers, DEMO_PASSWORD } = await import("../src/lib/db/seeds/users");
  const { seedLessons } = await import("../src/lib/db/seeds/lessons-1");
  const { seedLessons2 } = await import("../src/lib/db/seeds/lessons-2");
  const { seedProblems } = await import("../src/lib/db/seeds/problems-1");
  const { seedProblems2 } = await import("../src/lib/db/seeds/problems-2");
  const { seedQuizzes } = await import("../src/lib/db/seeds/quizzes");
  const { buildSeedActivity } = await import("../src/lib/db/seeds/progress");

  const allLessons = [...seedLessons, ...seedLessons2];
  const allProblems = [...seedProblems, ...seedProblems2];
  const activity = buildSeedActivity();

  const dbName = process.env.MONGODB_DB_NAME || "c_programming_lab";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`Connected to MongoDB (database: ${dbName}).`);

    // ---- indexes (mirrors MongoStore.ensureIndexes in src/lib/db/mongo.ts;
    // MongoStore.create() creates the same ones when the app boots) --------
    const users = db.collection("users");
    const lessons = db.collection("lessons");
    const problems = db.collection("problems");
    const quizzes = db.collection("quizzes");
    const quizAttempts = db.collection("quizAttempts");
    const progress = db.collection("progress");
    const submissions = db.collection("submissions");

    await users.createIndex({ email: 1 }, { unique: true });
    await lessons.createIndex({ slug: 1 }, { unique: true });
    await problems.createIndex({ slug: 1 }, { unique: true });
    await quizzes.createIndex({ slug: 1 }, { unique: true });
    await quizAttempts.createIndex({ userId: 1, createdAt: -1 });
    await progress.createIndex({ userId: 1, lessonSlug: 1 }, { unique: true });
    await submissions.createIndex({ createdAt: -1 });
    console.log("Indexes ensured.");

    /** Insert-if-missing counter; never touches existing documents. */
    async function seedAll<T extends object>(
      collection: Collection<Document>,
      rows: T[],
      keyOf: (row: T) => Record<string, unknown>,
      label: string,
    ): Promise<SeedReport> {
      let inserted = 0;
      for (const row of rows) {
        const result = await collection.updateOne(
          keyOf(row) as Document,
          { $setOnInsert: row as Document },
          { upsert: true },
        );
        if (result.upsertedCount > 0) inserted += 1;
      }
      const report = { inserted, alreadyPresent: rows.length - inserted };
      console.log(
        `${label}: ${rows.length} seed rows -> ${report.inserted} inserted, ${report.alreadyPresent} already present (collection total: ${await collection.countDocuments()}).`,
      );
      return report;
    }

    // ---- users (password is scrypt-hashed here, never stored in seeds) ---
    await seedAll(
      users,
      seedUsers.map((seed) => ({ ...seed, passwordHash: hashPassword(DEMO_PASSWORD) })),
      (row) => ({ email: row.email }),
      "Users",
    );

    // ---- curriculum content -----------------------------------------------
    await seedAll(lessons, allLessons, (row) => ({ slug: row.slug }), "Lessons");
    await seedAll(problems, allProblems, (row) => ({ slug: row.slug }), "Problems");
    await seedAll(quizzes, seedQuizzes, (row) => ({ slug: row.slug }), "Quizzes");

    // ---- demo students' history (graded from the real answer keys by
    // buildSeedActivity; fixed 2026 dates) ----------------------------------
    await seedAll(
      progress,
      activity.progress,
      (row) => ({ userId: row.userId, lessonSlug: row.lessonSlug }),
      "Progress",
    );
    await seedAll(
      quizAttempts,
      activity.quizAttempts,
      (row) => ({ id: row.id }),
      "Quiz attempts",
    );
    await seedAll(
      submissions,
      activity.submissions,
      (row) => ({ id: row.id }),
      "Submissions",
    );

    console.log("Seed complete. Tip: teachers log in with teacher@demo.local / Demo@12345.");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
