import type { Lesson } from "../../types";

/** Seed lesson for topic 15 (Debugging). */

export const part8Lessons: Lesson[] = [
  {
    id: "les-015",
    slug: "debugging",
    title: "Debugging: Reading Errors Instead of Fearing Them",
    topicSlug: "debugging",
    level: "intermediate",
    audience: "both",
    summary:
      "A three-step method - read the first error, shrink the program, trace by hand - applied to a program with one syntax error, one warning and one logic bug.",
    objective:
      "Turn compiler messages into directions instead of noise by reading the first error first, fixing the smallest program that shows the bug, and tracing variables by hand before blaming the compiler.",
    conceptMd: `Beginners treat a compiler error as a verdict; experienced programmers treat it as a message with an address. Every debugging session at this level follows three moves.

Move 1: read the FIRST error, not the last. The compiler reports the first line it could not understand, and everything after that is guesswork built on a broken base. A missing semicolon on line 6 can produce errors on lines 6, 12 and 20 - fix line 6 and the rest evaporate. So: fix the first error, rebuild, repeat. One error at a time, always.

Move 2: read the error, then the line ABOVE it. "expected ';' before 'return'" almost always means the semicolon is missing on the previous statement. Warnings are the same skill: "format '%d' expects argument of type 'int *', but argument has type 'int'" is the compiler describing exactly the forgotten & in scanf - not an insult, a diagnosis. Never ignore warnings; a program that compiles with warnings is a program that has told you where it will misbehave.

Move 3: when it compiles but answers wrong, blame your logic and shrink the case. The example program computes 1 + 2 + ... + n. Suppose it printed 45 for n = 10 instead of 55 - the number 45 is 55 - 10, exactly the missing last term, and that points at the loop bound: i < n visits only 1..9. This is the general trick: compute the expected answer by hand for a tiny input, compare, and let the DIFFERENCE tell you what is missing. A wrong-by-one answer usually means an off-by-one bound (i <= n vs i < n). An answer of 0 usually means an accumulator was reset inside the loop or an input was never stored.

The hand trace is your microscope: a table of line, variable, value after each round. You have already used dry-run tables in earlier lessons - in debugging you build the same table yourself for the actual misbehaving input, and the round where the table stops matching reality is the round containing the bug.

Why does this work? The compiler checks syntax mechanically and its messages name real defects; logic errors are invisible to it, so the only detector left is a comparison between what you EXPECT and what you MEASURED. Small inputs make that comparison small enough to do in your head - which is why "shrink the program" comes before everything else.`,
    syntax: String.raw`// The debugging loop
1. Fix the FIRST reported error, rebuild.
2. Treat every warning as a future bug (e.g. a missing & in scanf).
3. Wrong answer? Compute the expected value for a tiny input by hand.
4. Trace the loop in a table; the first mismatching row holds the bug.`,
    example: {
      code: String.raw`#include <stdio.h>

int main(void) {
    int n, i, sum = 0;
    printf("Enter n: ");
    scanf("%d", &n);
    for (i = 1; i <= n; i = i + 1) {
        sum = sum + i;
    }
    printf("Sum: %d\n", sum);
    return 0;
}`,
      annotations: [
        { line: 7, note: "The corrected bound: i <= n visits every term 1..n. The buggy version had i < n." },
        { line: 8, note: "The accumulator: it must live OUTSIDE the loop body to survive across rounds." },
        { line: 6, note: "The corrected scanf: the warning about 'int *' was the missing & being reported." },
        { line: 10, note: "For n = 10 the hand-checked expectation is 55 - compare before guessing." },
      ],
    },
    mistakes: [
      "Fixing the last error first - later errors are usually debris from the first one. Fix: read the top of the output, fix one error, rebuild.",
      "Ignoring warnings because the program runs - a missing & in scanf stores nothing and every later calculation is garbage. Fix: compile with warnings treated as errors in your head.",
      "Changing random lines until the answer changes - you lose track of what you altered. Fix: one change per rebuild, each justified by a message or a trace row.",
      "Debugging with n = 100 - the trace table becomes uncheckable. Fix: shrink to n = 3 or n = 5, where the expected answer is obvious.",
    ],
    dryRun: [
      { step: 1, line: 6, variable: "n", value: "10", explanation: "Input stored (with the & fixed, scanf really stores it)." },
      { step: 2, line: 7, variable: "i / sum", value: "1 / 0", explanation: "First round: i starts at 1, sum still 0." },
      { step: 3, line: 8, variable: "sum", value: "1", explanation: "Adds i = 1." },
      { step: 4, line: 8, variable: "sum", value: "3", explanation: "Adds i = 2: 1 + 2." },
      { step: 5, line: 8, variable: "sum", value: "6", explanation: "Adds i = 3." },
      { step: 6, line: 8, variable: "sum", value: "45", explanation: "After i = 9: 1 + ... + 9 = 45 - the buggy i < n version would stop here." },
      { step: 7, line: 8, variable: "sum", value: "55", explanation: "Adds the final term i = 10 - the corrected bound earns these 10 points." },
      { step: 8, line: 10, variable: "output", value: "Sum: 55", explanation: "Printed sum matches the hand-computed expectation: bug confirmed fixed." },
    ],
    sampleInput: "10",
    sampleOutput: "Enter n: Sum: 55\n",
    checks: [
      {
        question: "The compiler prints six errors. Which one do you fix first?",
        options: [
          "The last one",
          "The first one",
          "The shortest one",
          "All at once",
        ],
        answerIndex: 1,
        explanation: "Later errors are often debris caused by the first; fix the top error and rebuild.",
      },
      {
        question: "A program sums 1..n but prints 45 for n = 10 (expected 55). What is the likeliest cause?",
        options: [
          "The computer is wrong",
          "printf is broken",
          "An off-by-one loop bound - i < n instead of i <= n skips the last term",
          "Too many variables",
        ],
        answerIndex: 2,
        explanation: "55 - 45 = 10, exactly the missing last term - the difference points at the bound.",
      },
      {
        question: "What does the warning about \"%d expects int *\" usually mean?",
        options: [
          "A missing & in scanf",
          "A missing #include",
          "A missing semicolon",
          "The file is too long",
        ],
        answerIndex: 0,
        explanation: "scanf needs addresses; passing int where int * is expected is the forgotten &.",
      },
    ],
    practiceTask:
      "Take this buggy line set: int n, sum; then for (i = 1; i < n; i++) sum = sum + i; with no initialization and a wrong bound. List every defect you can find (there are at least three: uninitialized sum, undeclared i, and the bound), fix them one per rebuild, and verify the corrected program prints Sum: 55 for n = 10.",
    status: "published",
    authorId: "usr-teacher-01",
    createdAt: "2026-04-20T09:00:00.000Z",
    updatedAt: "2026-04-20T09:00:00.000Z",
  },
];
