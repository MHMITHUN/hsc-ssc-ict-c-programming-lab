import { describe, it, expect, beforeAll } from "vitest";
import { DemoStore } from "@/lib/db/demo-store";
import { seedQuizzes } from "@/lib/db/seeds/quizzes";
import { buildSeedActivity } from "@/lib/db/seeds/progress";

/**
 * Quiz grading (spec 15.4: "a completed quiz must be recorded once per
 * attempt" and scores are calculated server-side from the stored answer
 * keys). The same rule lives in DemoStore.recordQuizAttempt,
 * MongoStore.recordQuizAttempt and the seed history builder - these tests
 * pin the rule and prove the seeded history follows it.
 */

const STUDENT_ID = "usr-student-10"; // seeded demo student, used for new attempts

let store: DemoStore;

beforeAll(async () => {
  store = await DemoStore.create();
});

describe("DemoStore.recordQuizAttempt grading", () => {
  it("scores a perfect answer sheet as full marks", async () => {
    const quiz = await store.getQuizBySlug("quiz-loops");
    expect(quiz).not.toBeNull();

    const allCorrect = quiz!.questions.map((q) => q.answerIndex);
    const attempt = await store.recordQuizAttempt({
      quizId: quiz!.id,
      userId: STUDENT_ID,
      answers: allCorrect,
    });

    expect(attempt.score).toBe(attempt.total);
    expect(attempt.total).toBe(quiz!.questions.length);
    expect(attempt.answers).toEqual(allCorrect);
  });

  it("scores an all-wrong answer sheet as zero", async () => {
    const quiz = await store.getQuizBySlug("quiz-conditionals");
    expect(quiz).not.toBeNull();

    // Shift every answer off the correct index (never collides by accident).
    const allWrong = quiz!.questions.map(
      (q) => (q.answerIndex + 1) % q.options.length,
    );
    const attempt = await store.recordQuizAttempt({
      quizId: quiz!.id,
      userId: STUDENT_ID,
      answers: allWrong,
    });

    expect(attempt.score).toBe(0);
    expect(attempt.total).toBe(quiz!.questions.length);
  });

  it("scores a partial sheet: 3 of 5 correct, one wrong, one skipped", async () => {
    const quiz = await store.getQuizBySlug("quiz-variables");
    expect(quiz).not.toBeNull();
    expect(quiz!.questions.length).toBeGreaterThanOrEqual(5);

    const answers = [
      quiz!.questions[0].answerIndex, // correct
      quiz!.questions[1].answerIndex, // correct
      quiz!.questions[2].answerIndex, // correct
      (quiz!.questions[3].answerIndex + 1) % quiz!.questions[3].options.length, // wrong
      -1, // skipped - must count as wrong, never crash
    ];
    const attempt = await store.recordQuizAttempt({
      quizId: quiz!.id,
      userId: STUDENT_ID,
      answers,
    });

    expect(attempt.score).toBe(3);
    expect(attempt.total).toBe(5);
    expect(attempt.answers).toEqual(answers);
  });

  it("records every attempt as its own row (retakes are never overwritten)", async () => {
    const quiz = await store.getQuizBySlug("quiz-arrays");
    const correct = quiz!.questions.map((q) => q.answerIndex);
    const wrong = quiz!.questions.map((q) => (q.answerIndex + 1) % q.options.length);

    const first = await store.recordQuizAttempt({
      quizId: quiz!.id,
      userId: STUDENT_ID,
      answers: wrong,
    });
    const second = await store.recordQuizAttempt({
      quizId: quiz!.id,
      userId: STUDENT_ID,
      answers: correct,
    });

    expect(first.id).not.toBe(second.id);
    const mine = (await store.listQuizAttemptsByUser(STUDENT_ID)).filter(
      (a) => a.quizId === quiz!.id,
    );
    expect(mine.some((a) => a.id === first.id)).toBe(true);
    expect(mine.some((a) => a.id === second.id)).toBe(true);
  });

  it("throws for an unknown quiz instead of recording a bogus attempt", async () => {
    await expect(
      store.recordQuizAttempt({
        quizId: "qiz-does-not-exist",
        userId: STUDENT_ID,
        answers: [0, 1],
      }),
    ).rejects.toThrow(/not found/i);
  });
});

describe("seeded demo history follows the same grading rule", () => {
  it("every seeded attempt's score matches the stored answer keys", () => {
    const { quizAttempts } = buildSeedActivity();
    expect(quizAttempts.length).toBeGreaterThan(0);

    const quizById = new Map(seedQuizzes.map((q) => [q.id, q]));
    for (const attempt of quizAttempts) {
      const quiz = quizById.get(attempt.quizId);
      expect(quiz, `attempt references a seeded quiz (${attempt.quizId})`).toBeDefined();
      const expected = quiz!.questions.reduce(
        (score, question, i) =>
          attempt.answers[i] === question.answerIndex ? score + 1 : score,
        0,
      );
      expect(attempt.score).toBe(expected); // never a hardcoded score
      expect(attempt.total).toBe(quiz!.questions.length);
    }
  });
});
