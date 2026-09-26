import type { Progress, QuizAttempt, Submission, Quiz, Problem } from "../types";
import { seedQuizzes } from "./quizzes";
import { seedProblems, problemSolutions } from "./problems-1";
import { seedProblems2, problemSolutions2 } from "./problems-2";
import {
  progressSpecs,
  quizAttemptSpecs,
  submissionSpecs,
  type QuizPattern,
} from "./activity-spec";

/**
 * Builds the demo students' activity history (progress rows, quiz attempts,
 * submissions) from the specs in activity-spec.ts.
 *
 * Honesty rules (spec section 36):
 * - Quiz attempt scores are GRADED here from the real answer keys, using
 *   the same rule as DemoStore.recordQuizAttempt - never hardcoded.
 * - Accepted submissions carry the problem's reference solution as the
 *   submitted code; wrong submissions carry the starter code (an honest
 *   "unfinished attempt" that cannot match the expected output).
 * - All dates are the fixed ISO dates from the spec, spread Feb-Sep 2026.
 */

export interface SeedActivity {
  progress: Progress[];
  quizAttempts: QuizAttempt[];
  submissions: Submission[];
}

const ALL_SOLUTIONS: Record<string, string> = {
  ...problemSolutions,
  ...problemSolutions2,
};
const ALL_PROBLEMS: Problem[] = [...seedProblems, ...seedProblems2];
const PROBLEM_BY_SLUG = new Map(ALL_PROBLEMS.map((p) => [p.slug, p]));

/**
 * Expand a scoring pattern into a concrete answer sheet for one quiz.
 * perfect: every answer correct. good: all but the last question.
 * ok: first 3 correct, rest missed. poor: every answer wrong (each real
 * answer index shifted by one within its options, so it can never collide).
 */
function answersForPattern(quiz: Quiz, pattern: QuizPattern): number[] {
  const wrong = (i: number) =>
    (quiz.questions[i].answerIndex + 1) % quiz.questions[i].options.length;
  return quiz.questions.map((question, i) => {
    switch (pattern) {
      case "perfect":
        return question.answerIndex;
      case "good":
        return i === quiz.questions.length - 1 ? wrong(i) : question.answerIndex;
      case "ok":
        return i < 3 ? question.answerIndex : wrong(i);
      case "poor":
        return wrong(i);
    }
  });
}

export function buildSeedActivity(): SeedActivity {
  const progress: Progress[] = progressSpecs.map((spec, i) => ({
    id: `prg-seed-${String(i + 1).padStart(3, "0")}`,
    userId: spec.userId,
    lessonSlug: spec.lessonSlug,
    completedAt: spec.at,
    attempts: spec.attempts ?? 1,
  }));

  const quizBySlug = new Map(seedQuizzes.map((q) => [q.slug, q]));
  const quizAttempts: QuizAttempt[] = quizAttemptSpecs.map((spec, i) => {
    const quiz = quizBySlug.get(spec.quizSlug);
    if (!quiz) {
      throw new Error(`Seed activity references unknown quiz ${spec.quizSlug}`);
    }
    const answers = answersForPattern(quiz, spec.pattern);
    // Same grading rule as DemoStore.recordQuizAttempt.
    const score = answers.reduce(
      (sum, answer, qi) => (answer === quiz.questions[qi].answerIndex ? sum + 1 : sum),
      0,
    );
    return {
      id: `qat-seed-${String(i + 1).padStart(3, "0")}`,
      quizId: quiz.id,
      userId: spec.userId,
      answers,
      score,
      total: quiz.questions.length,
      createdAt: spec.at,
    };
  });

  const submissions: Submission[] = submissionSpecs.map((spec, i) => {
    const problem = PROBLEM_BY_SLUG.get(spec.problemSlug);
    if (!problem) {
      throw new Error(`Seed activity references unknown problem ${spec.problemSlug}`);
    }
    const accepted = spec.status === "accepted";
    return {
      id: `sub-seed-${String(i + 1).padStart(3, "0")}`,
      problemId: problem.id,
      userId: spec.userId,
      code: accepted ? (ALL_SOLUTIONS[spec.problemSlug] ?? problem.starterCode) : problem.starterCode,
      status: spec.status,
      note: accepted
        ? "Auto-checked against the sample test case (seeded demo history)."
        : "Output did not match the sample output (seeded demo history).",
      createdAt: spec.at,
    };
  });

  return { progress, quizAttempts, submissions };
}
