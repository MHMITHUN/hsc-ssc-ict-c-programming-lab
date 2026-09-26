import { describe, it, expect, beforeAll } from "vitest";
import { DemoStore } from "@/lib/db/demo-store";
import type { CreateLessonInput } from "@/lib/db";

/**
 * The store business-rule matrix from spec 15.4, exercised as one realistic
 * teacher/student flow against a fresh DemoStore: draft content never leaks
 * to public listings, teacher views see drafts, quiz attempts are recorded
 * with a server-side score, progress upserts are idempotent and submissions
 * are recorded.
 */

const TEACHER_ID = "usr-teacher-01";
const STUDENT_EMAIL = "rules-student@example.test";

let store: DemoStore;
let studentId: string;

/** A minimal but complete lesson payload, used for the publish-flow tests. */
function lessonInput(slug: string): CreateLessonInput {
  return {
    slug,
    title: "Test lesson: store rules",
    topicSlug: "loops",
    level: "beginner",
    audience: "both",
    summary: "Fixture lesson created by the store-rules test suite.",
    objective: "Verify the publish rule end to end.",
    conceptMd: "Concept text.",
    syntax: "int main(void) { return 0; }",
    example: { code: "int main(void) { return 0; }", annotations: [] },
    mistakes: ["None - this is a fixture."],
    sampleInput: "",
    sampleOutput: "ok\n",
    practiceTask: "Nothing to practise.",
    status: "draft",
    authorId: TEACHER_ID,
  };
}

beforeAll(async () => {
  store = await DemoStore.create();
  const student = await store.createUser({
    name: "Rules Student",
    email: STUDENT_EMAIL,
    passwordHash: "scrypt$salt$hash",
    role: "STUDENT",
  });
  studentId = student.id;
});

describe("publish rule: drafts are invisible publicly, visible to teachers", () => {
  it("keeps a newly created draft out of every public listing", async () => {
    const before = await store.listPublishedLessons();
    const created = await store.createLesson(lessonInput("store-rules-draft"));
    expect(created.status).toBe("draft");

    const after = await store.listPublishedLessons();
    expect(after.length).toBe(before.length); // nothing new became public
    expect(after.some((l) => l.slug === "store-rules-draft")).toBe(false);

    // Topic-filtered listing follows the same rule.
    const loopsPublic = await store.listPublishedLessons("loops");
    expect(loopsPublic.some((l) => l.slug === "store-rules-draft")).toBe(false);

    // getLessonBySlug still resolves it (teacher editor + grading flows).
    const fetched = await store.getLessonBySlug("store-rules-draft");
    expect(fetched?.id).toBe(created.id);
  });

  it("shows the draft to teacher views via listAllLessons", async () => {
    const all = await store.listAllLessons();
    const draft = all.find((l) => l.slug === "store-rules-draft");
    expect(draft).toBeDefined();
    expect(draft!.status).toBe("draft");
  });

  it("publishing makes the lesson public; unpublishing hides it again", async () => {
    const draft = await store.getLessonBySlug("store-rules-draft");
    const published = await store.setLessonStatus(draft!.id, "published");
    expect(published?.status).toBe("published");

    let publicList = await store.listPublishedLessons();
    expect(publicList.some((l) => l.slug === "store-rules-draft")).toBe(true);

    const retracted = await store.setLessonStatus(draft!.id, "draft");
    expect(retracted?.status).toBe("draft");
    publicList = await store.listPublishedLessons();
    expect(publicList.some((l) => l.slug === "store-rules-draft")).toBe(false);
  });
});

describe("quiz attempts are recorded with a server-calculated score", () => {
  it("persists the attempt row with score and total from the answer key", async () => {
    const quiz = await store.getQuizBySlug("quiz-io");
    expect(quiz).not.toBeNull();

    const answers = quiz!.questions.map((q) => q.answerIndex);
    const attempt = await store.recordQuizAttempt({
      quizId: quiz!.id,
      userId: studentId,
      answers,
    });

    expect(attempt.userId).toBe(studentId);
    expect(attempt.score).toBe(answers.length);
    expect(attempt.total).toBe(quiz!.questions.length);

    const mine = await store.listQuizAttemptsByUser(studentId);
    expect(mine.filter((a) => a.quizId === quiz!.id)).toHaveLength(1);
  });
});

describe("progress upsert is idempotent", () => {
  it("marks the same lesson complete twice without duplicating the row", async () => {
    const first = await store.markLessonComplete({
      userId: studentId,
      lessonSlug: "loops",
    });
    const second = await store.markLessonComplete({
      userId: studentId,
      lessonSlug: "loops",
    });

    const rows = (await store.listProgressByUser(studentId)).filter(
      (p) => p.lessonSlug === "loops",
    );
    expect(rows).toHaveLength(1);
    expect(second.id).toBe(first.id);
    expect(second.completedAt).toBe(first.completedAt); // first completion wins
    expect(second.attempts).toBe(first.attempts + 1); // counter grows
  });
});

describe("submissions are recorded and stay queryable", () => {
  it("stores the code, status and note, and lists the row for the student", async () => {
    const problem = await store.getProblemBySlug("sum-1-to-n");
    expect(problem).not.toBeNull();

    const submission = await store.recordSubmission({
      problemId: problem!.id,
      userId: studentId,
      code: "#include <stdio.h>\nint main(void) { return 0; }",
      status: "accepted",
      note: "Auto-checked against the sample test case.",
    });

    expect(submission.problemId).toBe(problem!.id);
    expect(submission.status).toBe("accepted");
    expect(submission.note).toBe("Auto-checked against the sample test case.");

    const mine = await store.listSubmissionsByUser(studentId);
    expect(mine.some((s) => s.id === submission.id)).toBe(true);

    const everything = await store.listAllSubmissions();
    expect(everything.some((s) => s.id === submission.id)).toBe(true); // teacher view
  });
});
