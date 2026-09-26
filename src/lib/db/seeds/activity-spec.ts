/**
 * Raw activity specification for the 10 demo students: which lessons they
 * completed, which quizzes they attempted (as scoring patterns, so the
 * graded score is computed from the real answer keys, never hardcoded),
 * and which problems they submitted. Dates are fixed ISO strings spread
 * from February to September 2026. seeds/progress.ts turns this into
 * concrete rows.
 */

export type QuizPattern = "perfect" | "good" | "ok" | "poor";

export interface ProgressSpec {
  userId: string;
  lessonSlug: string;
  at: string;
  /** Re-marks grow this counter (the completion itself never duplicates). */
  attempts?: number;
}

export interface QuizAttemptSpec {
  userId: string;
  quizSlug: string;
  pattern: QuizPattern;
  at: string;
}

export interface SubmissionSpec {
  userId: string;
  problemSlug: string;
  status: "accepted" | "wrong_answer";
  at: string;
}

const s = (n: number) => `usr-student-${String(n).padStart(2, "0")}`;

export const progressSpecs: ProgressSpec[] = [
  // Rakib (student-01) - strong: everything completed by September.
  { userId: s(1), lessonSlug: "program-structure", at: "2026-02-10T10:00:00.000Z" },
  { userId: s(1), lessonSlug: "variables-and-data-types", at: "2026-02-17T10:00:00.000Z" },
  { userId: s(1), lessonSlug: "input-output", at: "2026-02-24T10:00:00.000Z" },
  { userId: s(1), lessonSlug: "conditional-statements", at: "2026-03-03T10:00:00.000Z" },
  { userId: s(1), lessonSlug: "loops", at: "2026-03-10T10:00:00.000Z", attempts: 2 },
  { userId: s(1), lessonSlug: "arrays", at: "2026-03-24T10:00:00.000Z" },
  { userId: s(1), lessonSlug: "strings", at: "2026-04-07T10:00:00.000Z" },
  { userId: s(1), lessonSlug: "functions", at: "2026-04-21T10:00:00.000Z" },
  { userId: s(1), lessonSlug: "recursion", at: "2026-05-12T10:00:00.000Z" },
  { userId: s(1), lessonSlug: "pointers", at: "2026-06-09T10:00:00.000Z" },
  { userId: s(1), lessonSlug: "structures", at: "2026-07-07T10:00:00.000Z" },
  { userId: s(1), lessonSlug: "file-handling", at: "2026-08-11T10:00:00.000Z" },
  { userId: s(1), lessonSlug: "debugging", at: "2026-09-15T10:00:00.000Z" },
  // Sumaiya (student-02) - strong, stopped one topic short of the end.
  { userId: s(2), lessonSlug: "program-structure", at: "2026-02-12T10:00:00.000Z" },
  { userId: s(2), lessonSlug: "variables-and-data-types", at: "2026-02-19T10:00:00.000Z" },
  { userId: s(2), lessonSlug: "input-output", at: "2026-02-26T10:00:00.000Z" },
  { userId: s(2), lessonSlug: "conditional-statements", at: "2026-03-05T10:00:00.000Z" },
  { userId: s(2), lessonSlug: "loops", at: "2026-03-12T10:00:00.000Z" },
  { userId: s(2), lessonSlug: "arrays", at: "2026-03-26T10:00:00.000Z" },
  { userId: s(2), lessonSlug: "strings", at: "2026-04-09T10:00:00.000Z" },
  { userId: s(2), lessonSlug: "functions", at: "2026-04-23T10:00:00.000Z" },
  { userId: s(2), lessonSlug: "recursion", at: "2026-05-14T10:00:00.000Z" },
  { userId: s(2), lessonSlug: "pointers", at: "2026-06-11T10:00:00.000Z" },
  { userId: s(2), lessonSlug: "structures", at: "2026-07-08T10:00:00.000Z" },
  // Arif (student-03) - middle: through functions, mixed results.
  { userId: s(3), lessonSlug: "program-structure", at: "2026-02-17T10:00:00.000Z" },
  { userId: s(3), lessonSlug: "variables-and-data-types", at: "2026-02-24T10:00:00.000Z" },
  { userId: s(3), lessonSlug: "input-output", at: "2026-03-04T10:00:00.000Z" },
  { userId: s(3), lessonSlug: "conditional-statements", at: "2026-03-13T10:00:00.000Z" },
  { userId: s(3), lessonSlug: "loops", at: "2026-03-20T10:00:00.000Z" },
  { userId: s(3), lessonSlug: "arrays", at: "2026-04-01T10:00:00.000Z" },
  { userId: s(3), lessonSlug: "strings", at: "2026-04-15T10:00:00.000Z" },
  { userId: s(3), lessonSlug: "functions", at: "2026-05-06T10:00:00.000Z" },
  // Mehjabin (student-04) - middle-strong: through recursion.
  { userId: s(4), lessonSlug: "program-structure", at: "2026-02-18T10:00:00.000Z" },
  { userId: s(4), lessonSlug: "variables-and-data-types", at: "2026-02-25T10:00:00.000Z" },
  { userId: s(4), lessonSlug: "input-output", at: "2026-03-06T10:00:00.000Z" },
  { userId: s(4), lessonSlug: "conditional-statements", at: "2026-03-14T10:00:00.000Z" },
  { userId: s(4), lessonSlug: "loops", at: "2026-03-21T10:00:00.000Z" },
  { userId: s(4), lessonSlug: "arrays", at: "2026-04-02T10:00:00.000Z" },
  { userId: s(4), lessonSlug: "strings", at: "2026-04-16T10:00:00.000Z" },
  { userId: s(4), lessonSlug: "functions", at: "2026-04-30T10:00:00.000Z" },
  { userId: s(4), lessonSlug: "recursion", at: "2026-05-20T10:00:00.000Z" },
  // Sabbir (student-05) - weak: four lessons, long gaps between them.
  { userId: s(5), lessonSlug: "program-structure", at: "2026-03-02T10:00:00.000Z" },
  { userId: s(5), lessonSlug: "variables-and-data-types", at: "2026-03-18T10:00:00.000Z" },
  { userId: s(5), lessonSlug: "input-output", at: "2026-04-08T10:00:00.000Z" },
  { userId: s(5), lessonSlug: "conditional-statements", at: "2026-05-12T10:00:00.000Z" },
  // Farhana (student-06) - middle-strong: through pointers.
  { userId: s(6), lessonSlug: "program-structure", at: "2026-02-14T10:00:00.000Z" },
  { userId: s(6), lessonSlug: "variables-and-data-types", at: "2026-02-21T10:00:00.000Z" },
  { userId: s(6), lessonSlug: "input-output", at: "2026-02-28T10:00:00.000Z" },
  { userId: s(6), lessonSlug: "conditional-statements", at: "2026-03-07T10:00:00.000Z" },
  { userId: s(6), lessonSlug: "loops", at: "2026-03-14T10:00:00.000Z" },
  { userId: s(6), lessonSlug: "arrays", at: "2026-03-28T10:00:00.000Z" },
  { userId: s(6), lessonSlug: "strings", at: "2026-04-10T10:00:00.000Z" },
  { userId: s(6), lessonSlug: "functions", at: "2026-04-24T10:00:00.000Z" },
  { userId: s(6), lessonSlug: "recursion", at: "2026-05-15T10:00:00.000Z" },
  { userId: s(6), lessonSlug: "pointers", at: "2026-06-12T10:00:00.000Z" },
  // Imran (student-07) - weak: three lessons, several wrong submissions.
  { userId: s(7), lessonSlug: "program-structure", at: "2026-03-05T10:00:00.000Z" },
  { userId: s(7), lessonSlug: "variables-and-data-types", at: "2026-04-02T10:00:00.000Z" },
  { userId: s(7), lessonSlug: "input-output", at: "2026-05-20T10:00:00.000Z" },
  // Tasnim (student-08) - strong: everything except debugging.
  { userId: s(8), lessonSlug: "program-structure", at: "2026-02-11T10:00:00.000Z" },
  { userId: s(8), lessonSlug: "variables-and-data-types", at: "2026-02-18T10:00:00.000Z" },
  { userId: s(8), lessonSlug: "input-output", at: "2026-02-25T10:00:00.000Z" },
  { userId: s(8), lessonSlug: "conditional-statements", at: "2026-03-04T10:00:00.000Z" },
  { userId: s(8), lessonSlug: "loops", at: "2026-03-11T10:00:00.000Z" },
  { userId: s(8), lessonSlug: "arrays", at: "2026-03-25T10:00:00.000Z", attempts: 2 },
  { userId: s(8), lessonSlug: "strings", at: "2026-04-08T10:00:00.000Z" },
  { userId: s(8), lessonSlug: "functions", at: "2026-04-22T10:00:00.000Z" },
  { userId: s(8), lessonSlug: "recursion", at: "2026-05-13T10:00:00.000Z" },
  { userId: s(8), lessonSlug: "pointers", at: "2026-06-10T10:00:00.000Z" },
  { userId: s(8), lessonSlug: "structures", at: "2026-07-08T10:00:00.000Z" },
  { userId: s(8), lessonSlug: "file-handling", at: "2026-08-12T10:00:00.000Z" },
  // Jubayer (student-09) - middle: through strings.
  { userId: s(9), lessonSlug: "program-structure", at: "2026-02-20T10:00:00.000Z" },
  { userId: s(9), lessonSlug: "variables-and-data-types", at: "2026-02-27T10:00:00.000Z" },
  { userId: s(9), lessonSlug: "input-output", at: "2026-03-09T10:00:00.000Z" },
  { userId: s(9), lessonSlug: "conditional-statements", at: "2026-03-16T10:00:00.000Z" },
  { userId: s(9), lessonSlug: "loops", at: "2026-03-23T10:00:00.000Z" },
  { userId: s(9), lessonSlug: "arrays", at: "2026-04-06T10:00:00.000Z" },
  { userId: s(9), lessonSlug: "strings", at: "2026-04-20T10:00:00.000Z" },
  // Nabila (student-10) - beginner: the first five lessons.
  { userId: s(10), lessonSlug: "program-structure", at: "2026-03-03T10:00:00.000Z" },
  { userId: s(10), lessonSlug: "variables-and-data-types", at: "2026-03-17T10:00:00.000Z" },
  { userId: s(10), lessonSlug: "input-output", at: "2026-04-07T10:00:00.000Z" },
  { userId: s(10), lessonSlug: "conditional-statements", at: "2026-05-05T10:00:00.000Z" },
  { userId: s(10), lessonSlug: "loops", at: "2026-06-16T10:00:00.000Z" },
];

export const quizAttemptSpecs: QuizAttemptSpec[] = [
  // Rakib - consistently high, two retakes to polish loops and arrays.
  { userId: s(1), quizSlug: "quiz-variables", pattern: "perfect", at: "2026-02-18T10:00:00.000Z" },
  { userId: s(1), quizSlug: "quiz-io", pattern: "perfect", at: "2026-02-25T10:00:00.000Z" },
  { userId: s(1), quizSlug: "quiz-conditionals", pattern: "good", at: "2026-03-04T10:00:00.000Z" },
  { userId: s(1), quizSlug: "quiz-loops", pattern: "perfect", at: "2026-03-11T10:00:00.000Z" },
  { userId: s(1), quizSlug: "quiz-arrays", pattern: "good", at: "2026-03-25T10:00:00.000Z" },
  { userId: s(1), quizSlug: "quiz-functions-basics", pattern: "perfect", at: "2026-04-22T10:00:00.000Z" },
  { userId: s(1), quizSlug: "quiz-arrays", pattern: "perfect", at: "2026-09-02T10:00:00.000Z" },
  { userId: s(1), quizSlug: "quiz-loops", pattern: "perfect", at: "2026-09-16T10:00:00.000Z" },
  // Sumaiya - high with occasional slips.
  { userId: s(2), quizSlug: "quiz-variables", pattern: "perfect", at: "2026-02-20T10:00:00.000Z" },
  { userId: s(2), quizSlug: "quiz-io", pattern: "good", at: "2026-02-27T10:00:00.000Z" },
  { userId: s(2), quizSlug: "quiz-conditionals", pattern: "perfect", at: "2026-03-06T10:00:00.000Z" },
  { userId: s(2), quizSlug: "quiz-loops", pattern: "good", at: "2026-03-13T10:00:00.000Z" },
  { userId: s(2), quizSlug: "quiz-arrays", pattern: "ok", at: "2026-03-27T10:00:00.000Z" },
  { userId: s(2), quizSlug: "quiz-functions-basics", pattern: "good", at: "2026-04-24T10:00:00.000Z" },
  // Arif - hovering around half.
  { userId: s(3), quizSlug: "quiz-variables", pattern: "ok", at: "2026-02-25T10:00:00.000Z" },
  { userId: s(3), quizSlug: "quiz-io", pattern: "ok", at: "2026-03-05T10:00:00.000Z" },
  { userId: s(3), quizSlug: "quiz-conditionals", pattern: "poor", at: "2026-03-14T10:00:00.000Z" },
  { userId: s(3), quizSlug: "quiz-loops", pattern: "ok", at: "2026-03-21T10:00:00.000Z" },
  { userId: s(3), quizSlug: "quiz-arrays", pattern: "poor", at: "2026-04-02T10:00:00.000Z" },
  { userId: s(3), quizSlug: "quiz-functions-basics", pattern: "ok", at: "2026-05-07T10:00:00.000Z" },
  // Mehjabin - solid.
  { userId: s(4), quizSlug: "quiz-variables", pattern: "good", at: "2026-02-26T10:00:00.000Z" },
  { userId: s(4), quizSlug: "quiz-io", pattern: "perfect", at: "2026-03-07T10:00:00.000Z" },
  { userId: s(4), quizSlug: "quiz-conditionals", pattern: "good", at: "2026-03-15T10:00:00.000Z" },
  { userId: s(4), quizSlug: "quiz-loops", pattern: "perfect", at: "2026-03-22T10:00:00.000Z" },
  { userId: s(4), quizSlug: "quiz-arrays", pattern: "good", at: "2026-04-03T10:00:00.000Z" },
  { userId: s(4), quizSlug: "quiz-functions-basics", pattern: "ok", at: "2026-05-01T10:00:00.000Z" },
  // Sabbir - struggling.
  { userId: s(5), quizSlug: "quiz-variables", pattern: "poor", at: "2026-03-19T10:00:00.000Z" },
  { userId: s(5), quizSlug: "quiz-io", pattern: "poor", at: "2026-04-09T10:00:00.000Z" },
  { userId: s(5), quizSlug: "quiz-conditionals", pattern: "poor", at: "2026-05-13T10:00:00.000Z" },
  // Farhana - high, one mid topic.
  { userId: s(6), quizSlug: "quiz-variables", pattern: "perfect", at: "2026-02-22T10:00:00.000Z" },
  { userId: s(6), quizSlug: "quiz-io", pattern: "good", at: "2026-03-01T10:00:00.000Z" },
  { userId: s(6), quizSlug: "quiz-conditionals", pattern: "good", at: "2026-03-08T10:00:00.000Z" },
  { userId: s(6), quizSlug: "quiz-loops", pattern: "good", at: "2026-03-15T10:00:00.000Z" },
  { userId: s(6), quizSlug: "quiz-arrays", pattern: "perfect", at: "2026-03-29T10:00:00.000Z" },
  { userId: s(6), quizSlug: "quiz-functions-basics", pattern: "ok", at: "2026-04-25T10:00:00.000Z" },
  // Imran - low scores.
  { userId: s(7), quizSlug: "quiz-variables", pattern: "poor", at: "2026-04-03T10:00:00.000Z" },
  { userId: s(7), quizSlug: "quiz-io", pattern: "poor", at: "2026-05-21T10:00:00.000Z" },
  // Tasnim - high across the board.
  { userId: s(8), quizSlug: "quiz-variables", pattern: "perfect", at: "2026-02-19T10:00:00.000Z" },
  { userId: s(8), quizSlug: "quiz-io", pattern: "perfect", at: "2026-02-26T10:00:00.000Z" },
  { userId: s(8), quizSlug: "quiz-conditionals", pattern: "good", at: "2026-03-05T10:00:00.000Z" },
  { userId: s(8), quizSlug: "quiz-loops", pattern: "perfect", at: "2026-03-12T10:00:00.000Z" },
  { userId: s(8), quizSlug: "quiz-arrays", pattern: "good", at: "2026-03-26T10:00:00.000Z" },
  { userId: s(8), quizSlug: "quiz-functions-basics", pattern: "good", at: "2026-04-23T10:00:00.000Z" },
  // Jubayer - around half.
  { userId: s(9), quizSlug: "quiz-variables", pattern: "ok", at: "2026-02-28T10:00:00.000Z" },
  { userId: s(9), quizSlug: "quiz-io", pattern: "good", at: "2026-03-10T10:00:00.000Z" },
  { userId: s(9), quizSlug: "quiz-conditionals", pattern: "ok", at: "2026-03-17T10:00:00.000Z" },
  { userId: s(9), quizSlug: "quiz-loops", pattern: "poor", at: "2026-03-24T10:00:00.000Z" },
  { userId: s(9), quizSlug: "quiz-arrays", pattern: "ok", at: "2026-04-07T10:00:00.000Z" },
  // Nabila - low, early topics only.
  { userId: s(10), quizSlug: "quiz-variables", pattern: "poor", at: "2026-03-18T10:00:00.000Z" },
  { userId: s(10), quizSlug: "quiz-io", pattern: "ok", at: "2026-04-08T10:00:00.000Z" },
  { userId: s(10), quizSlug: "quiz-conditionals", pattern: "poor", at: "2026-05-06T10:00:00.000Z" },
  { userId: s(10), quizSlug: "quiz-loops", pattern: "poor", at: "2026-06-17T10:00:00.000Z" },
];

export const submissionSpecs: SubmissionSpec[] = [
  // Rakib - solves widely, one retry on fibonacci.
  { userId: s(1), problemSlug: "sum-and-average-of-two-numbers", status: "accepted", at: "2026-03-11T11:00:00.000Z" },
  { userId: s(1), problemSlug: "even-or-odd", status: "accepted", at: "2026-03-12T11:00:00.000Z" },
  { userId: s(1), problemSlug: "multiplication-table", status: "accepted", at: "2026-03-15T11:00:00.000Z" },
  { userId: s(1), problemSlug: "sum-1-to-n", status: "accepted", at: "2026-03-16T11:00:00.000Z" },
  { userId: s(1), problemSlug: "factorial", status: "accepted", at: "2026-03-28T11:00:00.000Z" },
  { userId: s(1), problemSlug: "max-in-array", status: "accepted", at: "2026-03-30T11:00:00.000Z" },
  { userId: s(1), problemSlug: "count-vowels", status: "accepted", at: "2026-04-10T11:00:00.000Z" },
  { userId: s(1), problemSlug: "palindrome-check", status: "accepted", at: "2026-04-09T11:00:00.000Z" },
  { userId: s(1), problemSlug: "prime-check", status: "accepted", at: "2026-04-24T11:00:00.000Z" },
  { userId: s(1), problemSlug: "gcd", status: "accepted", at: "2026-04-25T11:00:00.000Z" },
  { userId: s(1), problemSlug: "fibonacci-term", status: "wrong_answer", at: "2026-05-13T11:00:00.000Z" },
  { userId: s(1), problemSlug: "fibonacci-term", status: "accepted", at: "2026-07-08T11:00:00.000Z" },
  { userId: s(1), problemSlug: "bubble-sort", status: "accepted", at: "2026-06-10T11:00:00.000Z" },
  { userId: s(1), problemSlug: "pattern-pyramid", status: "accepted", at: "2026-09-16T11:00:00.000Z" },
  // Sumaiya - steady solver, stuck on matrix addition.
  { userId: s(2), problemSlug: "sum-and-average-of-two-numbers", status: "accepted", at: "2026-03-13T11:00:00.000Z" },
  { userId: s(2), problemSlug: "area-of-rectangle", status: "accepted", at: "2026-03-14T11:00:00.000Z" },
  { userId: s(2), problemSlug: "pass-or-fail", status: "accepted", at: "2026-03-15T11:00:00.000Z" },
  { userId: s(2), problemSlug: "leap-year", status: "accepted", at: "2026-03-16T11:00:00.000Z" },
  { userId: s(2), problemSlug: "count-evens-in-array", status: "accepted", at: "2026-03-28T11:00:00.000Z" },
  { userId: s(2), problemSlug: "string-length-manual", status: "accepted", at: "2026-04-10T11:00:00.000Z" },
  { userId: s(2), problemSlug: "reverse-string", status: "accepted", at: "2026-04-11T11:00:00.000Z" },
  { userId: s(2), problemSlug: "electricity-bill", status: "accepted", at: "2026-06-12T11:00:00.000Z" },
  { userId: s(2), problemSlug: "matrix-addition", status: "wrong_answer", at: "2026-06-13T11:00:00.000Z" },
  // Arif - basics accepted, harder topics wrong.
  { userId: s(3), problemSlug: "sum-and-average-of-two-numbers", status: "accepted", at: "2026-03-22T11:00:00.000Z" },
  { userId: s(3), problemSlug: "even-or-odd", status: "accepted", at: "2026-03-23T11:00:00.000Z" },
  { userId: s(3), problemSlug: "sum-1-to-n", status: "accepted", at: "2026-03-25T11:00:00.000Z" },
  { userId: s(3), problemSlug: "digit-sum", status: "accepted", at: "2026-03-26T11:00:00.000Z" },
  { userId: s(3), problemSlug: "factorial", status: "wrong_answer", at: "2026-04-03T11:00:00.000Z" },
  { userId: s(3), problemSlug: "palindrome-check", status: "wrong_answer", at: "2026-04-16T11:00:00.000Z" },
  { userId: s(3), problemSlug: "gcd", status: "wrong_answer", at: "2026-05-08T11:00:00.000Z" },
  // Mehjabin - good run, one wrong on bubble sort.
  { userId: s(4), problemSlug: "area-of-rectangle", status: "accepted", at: "2026-03-23T11:00:00.000Z" },
  { userId: s(4), problemSlug: "pass-or-fail", status: "accepted", at: "2026-03-24T11:00:00.000Z" },
  { userId: s(4), problemSlug: "multiplication-table", status: "accepted", at: "2026-03-25T11:00:00.000Z" },
  { userId: s(4), problemSlug: "linear-search", status: "accepted", at: "2026-04-05T11:00:00.000Z" },
  { userId: s(4), problemSlug: "count-vowels", status: "accepted", at: "2026-04-17T11:00:00.000Z" },
  { userId: s(4), problemSlug: "ascii-value", status: "accepted", at: "2026-04-18T11:00:00.000Z" },
  { userId: s(4), problemSlug: "bubble-sort", status: "wrong_answer", at: "2026-05-21T11:00:00.000Z" },
  // Sabbir - one accepted, several unfinished attempts.
  { userId: s(5), problemSlug: "sum-and-average-of-two-numbers", status: "accepted", at: "2026-03-20T11:00:00.000Z" },
  { userId: s(5), problemSlug: "even-or-odd", status: "wrong_answer", at: "2026-05-14T11:00:00.000Z" },
  { userId: s(5), problemSlug: "pass-or-fail", status: "wrong_answer", at: "2026-05-15T11:00:00.000Z" },
  { userId: s(5), problemSlug: "count-vowels", status: "wrong_answer", at: "2026-06-10T11:00:00.000Z" },
  // Farhana - broad solver, wrong on prime check and the pointer swap.
  { userId: s(6), problemSlug: "sum-and-average-of-two-numbers", status: "accepted", at: "2026-03-16T11:00:00.000Z" },
  { userId: s(6), problemSlug: "even-or-odd", status: "accepted", at: "2026-03-17T11:00:00.000Z" },
  { userId: s(6), problemSlug: "simple-interest", status: "accepted", at: "2026-03-18T11:00:00.000Z" },
  { userId: s(6), problemSlug: "sum-1-to-n", status: "accepted", at: "2026-03-19T11:00:00.000Z" },
  { userId: s(6), problemSlug: "max-in-array", status: "accepted", at: "2026-03-31T11:00:00.000Z" },
  { userId: s(6), problemSlug: "reverse-string", status: "accepted", at: "2026-04-11T11:00:00.000Z" },
  { userId: s(6), problemSlug: "prime-check", status: "wrong_answer", at: "2026-04-26T11:00:00.000Z" },
  { userId: s(6), problemSlug: "linear-search", status: "accepted", at: "2026-06-13T11:00:00.000Z" },
  { userId: s(6), problemSlug: "swap-two-numbers", status: "wrong_answer", at: "2026-06-14T11:00:00.000Z" },
  // Imran - failed, retried a day in May, then stuck again.
  { userId: s(7), problemSlug: "sum-and-average-of-two-numbers", status: "wrong_answer", at: "2026-03-06T11:00:00.000Z" },
  { userId: s(7), problemSlug: "sum-and-average-of-two-numbers", status: "accepted", at: "2026-05-22T11:00:00.000Z" },
  { userId: s(7), problemSlug: "even-or-odd", status: "wrong_answer", at: "2026-05-25T11:00:00.000Z" },
  // Tasnim - strong, one wrong on matrix addition.
  { userId: s(8), problemSlug: "sum-and-average-of-two-numbers", status: "accepted", at: "2026-03-13T11:00:00.000Z" },
  { userId: s(8), problemSlug: "even-or-odd", status: "accepted", at: "2026-03-14T11:00:00.000Z" },
  { userId: s(8), problemSlug: "largest-of-three", status: "accepted", at: "2026-03-15T11:00:00.000Z" },
  { userId: s(8), problemSlug: "sum-1-to-n", status: "accepted", at: "2026-03-16T11:00:00.000Z" },
  { userId: s(8), problemSlug: "factorial", status: "accepted", at: "2026-03-27T11:00:00.000Z" },
  { userId: s(8), problemSlug: "count-evens-in-array", status: "accepted", at: "2026-03-29T11:00:00.000Z" },
  { userId: s(8), problemSlug: "count-vowels", status: "accepted", at: "2026-04-09T11:00:00.000Z" },
  { userId: s(8), problemSlug: "reverse-string", status: "accepted", at: "2026-04-12T11:00:00.000Z" },
  { userId: s(8), problemSlug: "matrix-addition", status: "wrong_answer", at: "2026-07-09T11:00:00.000Z" },
  { userId: s(8), problemSlug: "pattern-pyramid", status: "accepted", at: "2026-08-13T11:00:00.000Z" },
  // Jubayer - basics accepted, strings still shaky.
  { userId: s(9), problemSlug: "sum-and-average-of-two-numbers", status: "accepted", at: "2026-03-25T11:00:00.000Z" },
  { userId: s(9), problemSlug: "pass-or-fail", status: "accepted", at: "2026-03-26T11:00:00.000Z" },
  { userId: s(9), problemSlug: "sum-1-to-n", status: "accepted", at: "2026-03-27T11:00:00.000Z" },
  { userId: s(9), problemSlug: "digit-sum", status: "accepted", at: "2026-03-28T11:00:00.000Z" },
  { userId: s(9), problemSlug: "factorial", status: "wrong_answer", at: "2026-04-08T11:00:00.000Z" },
  { userId: s(9), problemSlug: "palindrome-check", status: "wrong_answer", at: "2026-04-21T11:00:00.000Z" },
  // Nabila - just starting out.
  { userId: s(10), problemSlug: "sum-and-average-of-two-numbers", status: "accepted", at: "2026-06-17T11:00:00.000Z" },
  { userId: s(10), problemSlug: "area-of-rectangle", status: "accepted", at: "2026-06-18T11:00:00.000Z" },
  { userId: s(10), problemSlug: "even-or-odd", status: "wrong_answer", at: "2026-06-19T11:00:00.000Z" },
  { userId: s(10), problemSlug: "electricity-bill", status: "wrong_answer", at: "2026-07-10T11:00:00.000Z" },
];
