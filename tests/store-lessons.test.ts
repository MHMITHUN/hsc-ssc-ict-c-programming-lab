import { describe, it, expect, beforeAll } from "vitest";
import { DemoStore } from "@/lib/db/demo-store";

/**
 * Store business rules exercised directly against the DemoStore:
 * the publish rule, idempotent progress, server-side quiz grading and
 * the problem listing contract.
 */

const STUDENT_ID = "usr-student-01";

let store: DemoStore;

/** Fresh student with no seeded history, for count-sensitive assertions. */
async function freshStudent(id: string): Promise<string> {
  const user = await store.createUser({
    name: `Test Student ${id}`,
    email: `test-${id}@example.test`,
    passwordHash: "scrypt$salt$hash",
    role: "STUDENT",
  });
  return user.id;
}

beforeAll(async () => {
  store = await DemoStore.create();
});

describe("publish rule (spec 15.4)", () => {
  it("never returns draft lessons from listPublishedLessons", async () => {
    const published = await store.listPublishedLessons();
    const all = await store.listAllLessons();

    // 13 published (6 from lessons-1 + 7 from lessons-2) + 2 drafts.
    expect(all.length).toBe(15);
    expect(published.length).toBe(13);
    expect(published.every((l) => l.status === "published")).toBe(true);

    const publishedSlugs = new Set(published.map((l) => l.slug));
    expect(publishedSlugs.has("arithmetic-operators")).toBe(false); // draft
    expect(publishedSlugs.has("series-problems")).toBe(false); // draft
    expect(publishedSlugs.has("loops")).toBe(true);
    expect(publishedSlugs.has("strings")).toBe(true); // lessons-2 chunk
    expect(publishedSlugs.has("debugging")).toBe(true);
  });

  it("still exposes drafts to teacher flows via getLessonBySlug", async () => {
    const draft = await store.getLessonBySlug("arithmetic-operators");
    expect(draft?.status).toBe("draft");
  });

  it("hides draft problems from every public listing path", async () => {
    const problem = await store.getProblemBySlug("even-or-odd");
    expect(problem).not.toBeNull();
    // flip to draft, then confirm both listing paths hide it
    await store.setProblemStatus(problem!.id, "draft");
    try {
      const viaList = await store.listProblems({ status: "published" });
      expect(viaList.items.some((p) => p.slug === "even-or-odd")).toBe(false);
      const viaTopic = await store.listPublishedProblems("conditional-statements");
      expect(viaTopic.some((p) => p.slug === "even-or-odd")).toBe(false);
    } finally {
      await store.setProblemStatus(problem!.id, "published");
    }
  });
});

describe("idempotent lesson progress (spec 15.4)", () => {
  it("creates exactly one row when marked twice, keeping the first completion", async () => {
    const userId = await freshStudent("idem");
    const first = await store.markLessonComplete({
      userId,
      lessonSlug: "loops",
    });
    const second = await store.markLessonComplete({
      userId,
      lessonSlug: "loops",
    });

    const rows = (await store.listProgressByUser(userId)).filter(
      (p) => p.lessonSlug === "loops",
    );
    expect(rows.length).toBe(1);
    expect(second.completedAt).toBe(first.completedAt);
    expect(second.attempts).toBe(2); // counter grows, completion does not duplicate
    expect(rows[0].attempts).toBe(2);
  });

  it("keeps progress per user", async () => {
    const mineId = await freshStudent("mine");
    const theirsId = await freshStudent("theirs");
    await store.markLessonComplete({ userId: mineId, lessonSlug: "loops" });
    await store.markLessonComplete({ userId: theirsId, lessonSlug: "loops" });
    const mine = await store.listProgressByUser(mineId);
    const theirs = await store.listProgressByUser(theirsId);
    expect(mine.every((p) => p.userId === mineId)).toBe(true);
    expect(mine.length).toBe(1);
    expect(theirs.length).toBe(1);
    expect(mine[0].userId).not.toBe(theirs[0].userId);
  });
});

describe("quiz attempts: graded server-side, one row per submission", () => {
  it("scores from the stored correct answers, not the client", async () => {
    const quiz = await store.getQuizBySlug("quiz-variables");
    expect(quiz).not.toBeNull();

    // Answer 3 of 5 correctly (questions 1-3), miss one, skip one (-1).
    const answers = [1, 1, 2, 3, -1];
    const attempt = await store.recordQuizAttempt({
      quizId: quiz!.id,
      userId: STUDENT_ID,
      answers,
    });

    expect(attempt.score).toBe(3);
    expect(attempt.total).toBe(5);
    expect(attempt.answers).toEqual(answers);

    const mine = await store.listQuizAttemptsByUser(STUDENT_ID);
    expect(mine.some((a) => a.id === attempt.id)).toBe(true);
  });

  it("records one row per submission (retakes are separate rows)", async () => {
    const quiz = await store.getQuizBySlug("quiz-loops");
    const allCorrect = quiz!.questions.map((q) => q.answerIndex);
    await store.recordQuizAttempt({
      quizId: quiz!.id,
      userId: STUDENT_ID,
      answers: allCorrect,
    });
    const mine = (await store.listQuizAttemptsByUser(STUDENT_ID)).filter(
      (a) => a.quizId === quiz!.id,
    );
    const last = mine[0];
    expect(last.score).toBe(last.total);
    expect(mine.length).toBeGreaterThanOrEqual(1);
  });

  it("throws for an unknown quiz id", async () => {
    await expect(
      store.recordQuizAttempt({
        quizId: "qiz-does-not-exist",
        userId: STUDENT_ID,
        answers: [0],
      }),
    ).rejects.toThrow(/not found/i);
  });
});

describe("problem listing contract", () => {
  it("paginates and filters through listProblems", async () => {
    const page1 = await store.listProblems({ status: "published", page: 1, pageSize: 10 });
    expect(page1.items.length).toBe(10);
    expect(page1.total).toBe(30);
    expect(page1.page).toBe(1);

    const page2 = await store.listProblems({ status: "published", page: 2, pageSize: 10 });
    expect(page2.items.length).toBe(10);

    const page3 = await store.listProblems({ status: "published", page: 3, pageSize: 10 });
    expect(page3.items.length).toBe(10);

    const loopsOnly = await store.listProblems({
      status: "published",
      topicSlug: "loops",
    });
    expect(loopsOnly.total).toBe(6);
    expect(loopsOnly.items.every((p) => p.topicSlug === "loops")).toBe(true);

    const stringsOnly = await store.listProblems({
      status: "published",
      topicSlug: "strings",
    });
    expect(stringsOnly.total).toBe(5); // chunk C batch

    const search = await store.listProblems({ status: "published", q: "factorial" });
    expect(search.total).toBe(1);
    expect(search.items[0].slug).toBe("factorial");
  });

  it("records submissions and lists them newest first", async () => {
    const userId = await freshStudent("subs");
    const problem = await store.getProblemBySlug("sum-and-average-of-two-numbers");
    const accepted = await store.recordSubmission({
      problemId: problem!.id,
      userId,
      code: "int main(void) {}",
      status: "accepted",
    });
    const wrong = await store.recordSubmission({
      problemId: problem!.id,
      userId,
      code: "int main(void) {}",
      status: "wrong_answer",
    });
    expect(accepted.status).toBe("accepted");
    expect(wrong.status).toBe("wrong_answer");

    const mine = await store.listSubmissionsByUser(userId);
    expect(mine.length).toBe(2);
    expect(new Date(mine[0].createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(mine[1].createdAt).getTime(),
    );

    const everything = await store.listAllSubmissions();
    // Fresh user's rows are all present in the global list, which also
    // carries the seeded demo history of the ten demo students.
    expect(everything.length).toBeGreaterThan(mine.length);
    for (const row of mine) {
      expect(everything.some((s) => s.id === row.id)).toBe(true);
    }
  });
});
