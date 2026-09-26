import { describe, it, expect, beforeAll } from "vitest";
import { DemoStore } from "@/lib/db/demo-store";
import { seedQuizzes } from "@/lib/db/seeds/quizzes";
import type { Lesson, Quiz, Problem } from "@/lib/db/types";
import { listTopics } from "@/lib/curriculum/topics";
import {
  buildRecentActivity,
  computeStudentOverview,
  computeTopicMastery,
  escapeCsvField,
  lastActiveDate,
  recommendedNextLesson,
  toClassProgressCsv,
  type ClassProgressRow,
} from "@/lib/analytics";

/**
 * Dashboard aggregation logic (src/lib/analytics.ts) plus the seeded demo
 * history that feeds it: progress aggregation, topic mastery, the
 * recommended-next-lesson rule and the CSV export shape.
 */

const FIXED_NOW = new Date("2026-09-27T12:00:00.000Z");

function makeLesson(overrides: Pick<Lesson, "id" | "slug" | "topicSlug">): Lesson {
  return {
    title: `Lesson ${overrides.slug}`,
    level: "beginner",
    audience: "both",
    summary: "A fixture lesson used only by dashboard unit tests.",
    objective: "Fixture objective.",
    conceptMd: "Fixture concept.",
    syntax: "int main(void) {}",
    example: { code: "int main(void) {}", annotations: [] },
    mistakes: [],
    sampleInput: "",
    sampleOutput: "ok\n",
    practiceTask: "Fixture task.",
    status: "published",
    authorId: "usr-teacher-01",
    createdAt: "2026-01-01T09:00:00.000Z",
    updatedAt: "2026-01-01T09:00:00.000Z",
    ...overrides,
  };
}

describe("computeStudentOverview", () => {
  const lessons = [
    makeLesson({ id: "l1", slug: "program-structure", topicSlug: "program-structure" }),
    makeLesson({ id: "l2", slug: "loops", topicSlug: "loops" }),
    makeLesson({ id: "l3", slug: "arrays", topicSlug: "arrays" }),
  ];

  it("counts completed lessons only for published lessons", () => {
    const overview = computeStudentOverview({
      publishedLessons: [...lessons],
      progress: [
        { id: "p1", userId: "u", lessonSlug: "program-structure", completedAt: "2026-05-01T09:00:00.000Z", attempts: 1 },
        { id: "p2", userId: "u", lessonSlug: "loops", completedAt: "2026-05-02T09:00:00.000Z", attempts: 1 },
        { id: "p3", userId: "u", lessonSlug: "series-problems", completedAt: "2026-05-03T09:00:00.000Z", attempts: 1 }, // draft topic -> not counted
      ],
      submissions: [],
      quizAttempts: [],
      now: FIXED_NOW,
    });
    expect(overview.lessonsCompleted).toBe(2);
    expect(overview.lessonsTotal).toBe(3);
  });

  it("distinct-problems attempted/solved and rounded quiz average", () => {
    const overview = computeStudentOverview({
      publishedLessons: [...lessons],
      progress: [],
      // Two submissions on the same problem, one accepted one wrong.
      submissions: [
        { id: "s1", problemId: "prb-1", userId: "u", code: "", status: "wrong_answer", createdAt: "2026-05-01T09:00:00.000Z" },
        { id: "s2", problemId: "prb-1", userId: "u", code: "", status: "accepted", createdAt: "2026-05-02T09:00:00.000Z" },
        { id: "s3", problemId: "prb-2", userId: "u", code: "", status: "accepted", createdAt: "2026-05-03T09:00:00.000Z" },
      ],
      quizAttempts: [
        { id: "a1", quizId: "q1", userId: "u", answers: [], score: 4, total: 5, createdAt: "2026-05-01T09:00:00.000Z" },
        { id: "a2", quizId: "q2", userId: "u", answers: [], score: 5, total: 5, createdAt: "2026-05-02T09:00:00.000Z" },
      ],
      now: FIXED_NOW,
    });
    expect(overview.problemsAttempted).toBe(2); // distinct problem ids
    expect(overview.problemsSolved).toBe(2);
    expect(overview.avgQuizPercent).toBe(90); // (80 + 100) / 2
  });

  it("returns null average with no attempts and counts active days in a 30 day window", () => {
    const overview = computeStudentOverview({
      publishedLessons: [],
      progress: [
        { id: "p1", userId: "u", lessonSlug: "loops", completedAt: "2026-09-20T10:00:00.000Z", attempts: 1 },
        { id: "p2", userId: "u", lessonSlug: "arrays", completedAt: "2026-09-20T18:00:00.000Z", attempts: 1 }, // same day counts once
        { id: "p3", userId: "u", lessonSlug: "strings", completedAt: "2026-09-01T10:00:00.000Z", attempts: 1 },
        { id: "p4", userId: "u", lessonSlug: "functions", completedAt: "2026-08-01T10:00:00.000Z", attempts: 1 }, // outside window
      ],
      submissions: [],
      quizAttempts: [],
      now: FIXED_NOW,
    });
    expect(overview.avgQuizPercent).toBeNull();
    expect(overview.activeDays30).toBe(2);
  });
});

describe("computeTopicMastery", () => {
  const topics = listTopics();
  const lessons = [
    makeLesson({ id: "l1", slug: "variables-and-data-types", topicSlug: "variables-and-data-types" }),
    makeLesson({ id: "l2", slug: "loops", topicSlug: "loops" }),
  ];
  const quizzes = seedQuizzes.filter(
    (q) => q.topicSlug === "variables-and-data-types" || q.topicSlug === "loops",
  );

  it("blends 50/50 lesson completion with the BEST quiz attempt", () => {
    const loopsQuiz = quizzes.find((q) => q.topicSlug === "loops")!;
    const mastery = computeTopicMastery({
      topics,
      publishedLessons: [...lessons],
      progress: [
        { id: "p1", userId: "u", lessonSlug: "variables-and-data-types", completedAt: "2026-05-01T09:00:00.000Z", attempts: 1 },
      ],
      quizAttempts: [
        // Two attempts on the loops quiz: 20% then 80% - best wins.
        { id: "a1", quizId: loopsQuiz.id, userId: "u", answers: [], score: 1, total: 5, createdAt: "2026-05-01T09:00:00.000Z" },
        { id: "a2", quizId: loopsQuiz.id, userId: "u", answers: [], score: 4, total: 5, createdAt: "2026-05-02T09:00:00.000Z" },
      ],
      quizzes,
    });

    const byTopic = new Map(mastery.map((m) => [m.topicSlug, m]));
    // variables: lesson completed and no quiz attempted -> lesson
    // completion alone -> 100.
    expect(byTopic.get("variables-and-data-types")!.percent).toBe(100);
    // loops: lesson not done (0) + best quiz 80% -> 40.
    expect(byTopic.get("loops")!.percent).toBe(40);
    expect(byTopic.get("loops")!.bestQuizPercent).toBe(80);
    // Topics without published lessons are filtered from the chart.
    expect(mastery.every((m) => m.totalLessons > 0)).toBe(true);
    expect(mastery.length).toBe(2);
  });
});

describe("recommendedNextLesson", () => {
  const topics = listTopics();
  const lessons = [
    makeLesson({ id: "l1", slug: "program-structure", topicSlug: "program-structure" }),
    makeLesson({ id: "l2", slug: "loops", topicSlug: "loops" }),
    makeLesson({ id: "l3", slug: "arrays", topicSlug: "arrays" }),
  ];

  it("returns the first incomplete topic in curriculum order, skipping draft topics", () => {
    const next = recommendedNextLesson({
      topics,
      publishedLessons: [...lessons],
      progress: [
        { id: "p1", userId: "u", lessonSlug: "program-structure", completedAt: "2026-05-01T09:00:00.000Z", attempts: 1 },
        // conditional-statements (order 05) is also incomplete but has no
        // published lesson in this fixture -> skipped by design.
      ],
    });
    expect(next?.topic.slug).toBe("loops");
    expect(next?.lesson.slug).toBe("loops");
  });

  it("returns null when every published lesson is complete", () => {
    const next = recommendedNextLesson({
      topics,
      publishedLessons: [...lessons],
      progress: [
        { id: "p1", userId: "u", lessonSlug: "program-structure", completedAt: "2026-05-01T09:00:00.000Z", attempts: 1 },
        { id: "p2", userId: "u", lessonSlug: "loops", completedAt: "2026-05-02T09:00:00.000Z", attempts: 1 },
        { id: "p3", userId: "u", lessonSlug: "arrays", completedAt: "2026-05-03T09:00:00.000Z", attempts: 1 },
      ],
    });
    expect(next).toBeNull();
  });
});

describe("recent activity", () => {
  it("merges lessons, quizzes and submissions newest first with a limit", () => {
    const lessonsBySlug = new Map<string, Lesson>([
      ["loops", makeLesson({ id: "l2", slug: "loops", topicSlug: "loops" })],
    ]);
    const quizzesById = new Map<string, Quiz>([
      ["q1", { title: "Quiz: Loops", id: "q1" } as unknown as Quiz],
    ]);
    const problemsById = new Map<string, Problem>([
      ["prb-1", { title: "Factorial", id: "prb-1" } as unknown as Problem],
    ]);

    const items = buildRecentActivity({
      progress: [
        { id: "p1", userId: "u", lessonSlug: "loops", completedAt: "2026-05-01T09:00:00.000Z", attempts: 1 },
      ],
      quizAttempts: [
        { id: "a1", quizId: "q1", userId: "u", answers: [], score: 5, total: 5, createdAt: "2026-09-01T09:00:00.000Z" },
      ],
      submissions: [
        { id: "s1", problemId: "prb-1", userId: "u", code: "", status: "accepted", createdAt: "2026-07-01T09:00:00.000Z" },
        { id: "s2", problemId: "prb-1", userId: "u", code: "", status: "wrong_answer", createdAt: "2026-03-01T09:00:00.000Z" },
      ],
      lessonsBySlug,
      quizzesById,
      problemsById,
      limit: 3,
    });

    expect(items.map((i) => i.kind)).toEqual(["quiz", "problem", "lesson"]);
    expect(items[0].title).toBe("Quiz: Loops");
    expect(items[0].detail).toBe("Quiz scored 5/5");
  });

  it("lastActiveDate returns the newest stamp or null", () => {
    const stamps = [
      { id: "p1", userId: "u", lessonSlug: "a", completedAt: "2026-05-01T09:00:00.000Z", attempts: 1 },
    ];
    expect(lastActiveDate(stamps, [], [])).toBe("2026-05-01T09:00:00.000Z");
    expect(lastActiveDate([], [], [])).toBeNull();
  });
});

describe("CSV export", () => {
  it("escapes fields with commas, quotes and newlines", () => {
    expect(escapeCsvField("plain")).toBe("plain");
    expect(escapeCsvField("Hasan, Rakib")).toBe('"Hasan, Rakib"');
    expect(escapeCsvField('He said "hi"')).toBe('"He said ""hi"""');
    expect(escapeCsvField("two\nlines")).toBe('"two\nlines"');
  });

  it("renders a header plus one line per student with the expected shape", () => {
    const rows: ClassProgressRow[] = [
      {
        name: "Rakib Hasan",
        email: "student@demo.local",
        lessonsCompleted: 13,
        lessonsTotal: 13,
        quizAvgPercent: 96,
        problemsSolved: 13,
        problemsAttempted: 14,
        lastActiveAt: "2026-09-16T11:00:00.000Z",
      },
      {
        name: "New, Student",
        email: "new@demo.local",
        lessonsCompleted: 0,
        lessonsTotal: 13,
        quizAvgPercent: null,
        problemsSolved: 0,
        problemsAttempted: 0,
        lastActiveAt: null,
      },
    ];
    const csv = toClassProgressCsv(rows);
    const lines = csv.split("\n");

    expect(csv.endsWith("\n")).toBe(true);
    expect(lines[0]).toBe(
      "name,email,lessons completed,quiz average %,problems solved,problems attempted,last active",
    );
    expect(lines[1]).toBe(
      'Rakib Hasan,student@demo.local,13/13,96,13,14,2026-09-16T11:00:00.000Z',
    );
    // Nulls render as empty cells; the comma-containing name is quoted.
    expect(lines[2]).toBe('"New, Student",new@demo.local,0/13,,0,0,');
    expect(lines).toHaveLength(4); // header + 2 rows + trailing empty from \n
  });
});

describe("seeded demo history feeds the dashboards (DemoStore)", () => {
  let store: DemoStore;

  beforeAll(async () => {
    store = await DemoStore.create();
  });

  it("seeds progress, quiz attempts and submissions for the ten demo students", async () => {
    for (let i = 1; i <= 10; i += 1) {
      const userId = `usr-student-${String(i).padStart(2, "0")}`;
      const progress = await store.listProgressByUser(userId);
      const attempts = await store.listQuizAttemptsByUser(userId);
      const submissions = await store.listSubmissionsByUser(userId);
      expect(progress.length).toBeGreaterThan(0);
      expect(attempts.length).toBeGreaterThan(0);
      expect(submissions.length).toBeGreaterThan(0);
      // Fixed 2026 dates, spread across the year.
      expect(progress.every((p) => p.completedAt.startsWith("2026-"))).toBe(true);
    }
  });

  it("grades seeded attempts consistently with the stored answer keys", async () => {
    // A perfect-pattern attempt must be a full-score row (grading happened
    // against the real key, not a hardcoded score).
    const rakibAttempts = await store.listQuizAttemptsByUser("usr-student-01");
    const quizzes = new Map(seedQuizzes.map((q) => [q.id, q]));
    const perfectish = rakibAttempts.find((a) => a.score === a.total);
    expect(perfectish).toBeDefined();
    for (const attempt of rakibAttempts) {
      const quiz = quizzes.get(attempt.quizId)!;
      expect(attempt.total).toBe(quiz.questions.length);
      const recomputed = attempt.answers.reduce(
        (sum, answer, i) => (answer === quiz.questions[i].answerIndex ? sum + 1 : sum),
        0,
      );
      expect(attempt.score).toBe(recomputed);
    }
  });

  it("recommends the next incomplete lesson from the seeded records", async () => {
    const publishedLessons = await store.listPublishedLessons();
    expect(publishedLessons.length).toBe(13);

    // Rakib completed all 13 -> no recommendation.
    const rakibProgress = await store.listProgressByUser("usr-student-01");
    expect(rakibProgress.length).toBe(13);
    expect(
      recommendedNextLesson({ topics: listTopics(), publishedLessons, progress: rakibProgress }),
    ).toBeNull();

    // Sabbir (student-05) stopped after conditional-statements (order 05);
    // the arithmetic-operators draft topic is skipped -> next is loops (06).
    const sabbirProgress = await store.listProgressByUser("usr-student-05");
    const next = recommendedNextLesson({
      topics: listTopics(),
      publishedLessons,
      progress: sabbirProgress,
    });
    expect(next?.topic.slug).toBe("loops");
  });

  it("computes a realistic class overview for a strong and a weak student", async () => {
    const publishedLessons = await store.listPublishedLessons();

    const rakibOverview = computeStudentOverview({
      publishedLessons,
      progress: await store.listProgressByUser("usr-student-01"),
      submissions: await store.listSubmissionsByUser("usr-student-01"),
      quizAttempts: await store.listQuizAttemptsByUser("usr-student-01"),
      now: FIXED_NOW,
    });
    expect(rakibOverview.lessonsCompleted).toBe(13);
    expect(rakibOverview.problemsAttempted).toBe(13); // 13 distinct problems
    expect(rakibOverview.problemsSolved).toBe(13); // fibonacci solved on retry
    expect(rakibOverview.avgQuizPercent).toBeGreaterThanOrEqual(90);

    const sabbirOverview = computeStudentOverview({
      publishedLessons,
      progress: await store.listProgressByUser("usr-student-05"),
      submissions: await store.listSubmissionsByUser("usr-student-05"),
      quizAttempts: await store.listQuizAttemptsByUser("usr-student-05"),
      now: FIXED_NOW,
    });
    expect(sabbirOverview.lessonsCompleted).toBe(4);
    expect(sabbirOverview.problemsAttempted).toBe(4);
    expect(sabbirOverview.problemsSolved).toBe(1);
    expect(sabbirOverview.avgQuizPercent).toBeLessThanOrEqual(20);
  });
});
