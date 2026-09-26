"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/guards";
import { getStore } from "@/lib/db";
import type { SubmissionStatus } from "@/lib/db/types";

/**
 * Learning server actions: lesson completion (idempotent), quiz attempts
 * (graded server-side from stored correct answers, spec 15.4), and problem
 * submissions (auto-checked against the sample output).
 */

export async function markLessonCompleteAction(
  formData: FormData,
): Promise<void> {
  const user = await getSessionUser();
  if (!user) return; // the page only shows the button to signed-in users

  const lessonSlug = formData.get("lessonSlug");
  if (typeof lessonSlug !== "string" || lessonSlug.length === 0) return;

  const store = await getStore();
  const lesson = await store.getLessonBySlug(lessonSlug);
  // Draft lessons are never completable through the public flow.
  if (!lesson || lesson.status !== "published") return;

  await store.markLessonComplete({ userId: user.id, lessonSlug: lesson.slug });
  revalidatePath(`/learn/${lesson.topicSlug}`);
  revalidatePath("/learn");
}

export interface QuizResultItem {
  correct: boolean;
  answerIndex: number;
  explanation: string;
}

export interface QuizFormState {
  error?: string;
  result?: {
    attemptId: string;
    score: number;
    total: number;
    items: QuizResultItem[];
  };
}

export async function submitQuizAction(
  _prev: QuizFormState,
  formData: FormData,
): Promise<QuizFormState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Please sign in to attempt a quiz and save your score." };
  }

  const quizSlug = formData.get("quizSlug");
  if (typeof quizSlug !== "string" || quizSlug.length === 0) {
    return { error: "Quiz not found." };
  }

  const store = await getStore();
  const quiz = await store.getQuizBySlug(quizSlug);
  if (!quiz) return { error: "Quiz not found." };

  const answers: number[] = quiz.questions.map((question, i) => {
    const raw = formData.get(`answer-${i}`);
    const value = typeof raw === "string" ? Number.parseInt(raw, 10) : NaN;
    if (Number.isNaN(value) || value < -1 || value >= question.options.length) {
      return -1; // skipped or invalid -> recorded as skipped, never trusted
    }
    return value;
  });

  const attempt = await store.recordQuizAttempt({
    quizId: quiz.id,
    userId: user.id,
    answers,
  });

  return {
    result: {
      attemptId: attempt.id,
      score: attempt.score,
      total: attempt.total,
      items: quiz.questions.map((question, i) => ({
        correct: answers[i] === question.answerIndex,
        answerIndex: question.answerIndex,
        explanation: question.explanation,
      })),
    },
  };
}

export interface SubmissionRecordResult {
  recorded: boolean;
  status?: SubmissionStatus;
  error?: string;
}

/**
 * Records a problem submission after a run. The pass/fail decision is made
 * HERE, server-side, by comparing the produced stdout with the problem's
 * expected output (trimmed) - the client never decides its own grade.
 */
export async function recordSubmissionAction(
  problemSlug: string,
  code: string,
  stdout: string,
): Promise<SubmissionRecordResult> {
  const user = await getSessionUser();
  if (!user) return { recorded: false, error: "Not signed in." };

  const store = await getStore();
  const problem = await store.getProblemBySlug(problemSlug);
  if (!problem || problem.status !== "published") {
    return { recorded: false, error: "Problem not found." };
  }

  const status: SubmissionStatus =
    stdout.trim() === problem.expectedOutput.trim()
      ? "accepted"
      : "wrong_answer";

  const submission = await store.recordSubmission({
    problemId: problem.id,
    userId: user.id,
    code,
    status,
    note: "Auto-checked against the sample test case (run from the problem page).",
  });
  revalidatePath("/problems");

  return { recorded: true, status: submission.status };
}
