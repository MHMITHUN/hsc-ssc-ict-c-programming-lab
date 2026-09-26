import type { Lesson } from "../../types";

/** Seed lessons for topics 07-08. Lesson 07 is a DRAFT (publish rule); lesson 08 has a hand-authored trace. */

export const part4Lessons: Lesson[] = [
  {
    id: "les-007",
    slug: "series-problems",
    title: "Series Problems: 1 - 2 + 3 - 4 + ... + n",
    topicSlug: "series-problems",
    level: "intermediate",
    audience: "HSC",
    summary:
      "HSC-favourite series as loops with a twist - alternating signs, even terms and squares.",
    objective:
      "Recognise the pattern rule of a series, express each term using the loop index, and accumulate the sum - using the alternating series 1 - 2 + 3 - 4 + ... as the worked case.",
    conceptMd: `A series problem gives you a pattern and a number n, and asks for the sum of the first n terms. HSC questions use a small zoo of patterns, but every one of them becomes a plain loop once you can answer a single question: how is term i related to the position i?

The classic patterns:

- 1 + 2 + 3 + ... + n - the term is i itself.
- 2 + 4 + 6 + ... - the term is 2 * i (or keep only even i).
- 1 + 3 + 5 + ... - the term is 2 * i - 1.
- 1 - 2 + 3 - 4 + ... - the term is i with the sign flipped on even positions.
- 1 + 4 + 9 + 16 + ... - the term is i * i.

The alternating series shows the general trick: decide the sign from the position. Position 1 is positive, position 2 is negative, and so on - exactly what i % 2 tests. Odd positions (i % 2 == 1) keep the plus sign, even positions take a minus. Multiply the whole term, not just part of it.

The skeleton never changes: set sum = 0 before the loop; inside the body compute the term, add it to sum, and let the for loop advance i. Only the term line differs from series to series. Learn the skeleton once and every series question becomes a one-line difference.

Why does this work? The loop visits the positions in order 1, 2, 3, ..., and at each position the term is a pure function of i - a sign, a multiplier or a square. The running total carries the partial sum forward, so after n rounds it holds exactly the sum of the first n terms. Always verify a small case by hand: for n = 6, 1 - 2 + 3 - 4 + 5 - 6 = -3, which the program below confirms.`,
    syntax: String.raw`sum = 0;
for (i = 1; i <= n; i = i + 1) {
    term = /* the pattern rule, written using i */;
    sum = sum + term;
}`,
    example: {
      code: String.raw`#include <stdio.h>

int main(void) {
    int n, i, term, sum = 0;
    printf("Enter n: ");
    scanf("%d", &n);
    for (i = 1; i <= n; i = i + 1) {
        if (i % 2 == 1) {
            term = i;
        } else {
            term = -i;
        }
        sum = sum + term;
    }
    printf("Series sum = %d\n", sum);
    return 0;
}`,
      annotations: [
        { line: 4, note: "sum starts at 0 - the accumulator rule from the loops topic." },
        { line: 7, note: "Positions run 1..n; the position IS the loop variable." },
        { line: 8, note: "Odd positions keep the plus sign." },
        { line: 10, note: "Even positions take the minus - the whole term flips." },
        { line: 12, note: "The single accumulate line shared by every series problem." },
        { line: 14, note: "For n = 6 the total is 1-2+3-4+5-6 = -3." },
      ],
    },
    mistakes: [
      "Flipping only part of the term: term = -1 * i + 1 is not the same as -(i + 1). Fix: build the whole term first, then apply the sign: term = -i.",
      "Testing i % 2 == 0 for the positive side - in this series the even positions are negative. Fix: trace position 1 by hand and confirm it is positive.",
      "Re-initialising sum inside the loop - every round resets the total to 0. Fix: sum = 0 belongs just before the loop, never inside it.",
      "Guessing the loop bound: i < n visits only n-1 terms. Fix: the first n positions are 1..n, so the condition is i <= n.",
    ],
    sampleInput: "6",
    sampleOutput: "Enter n: Series sum = -3\n",
    checks: [
      {
        question: "What is the 4th term of the series 1 - 2 + 3 - 4 + ...?",
        options: ["4", "-4", "-2", "3"],
        answerIndex: 1,
        explanation: "Even positions flip the sign, so position 4 contributes -4.",
      },
      {
        question: "Which expression gives each term of 1 + 4 + 9 + 16 + ...?",
        options: ["i + 1", "2 * i", "i * i", "i % 2"],
        answerIndex: 2,
        explanation: "1, 4, 9, 16 are the squares of the positions 1, 2, 3, 4.",
      },
      {
        question: "Where must the line sum = 0 be written?",
        options: [
          "Inside the loop body",
          "Just before the loop",
          "After the loop",
          "Inside printf",
        ],
        answerIndex: 1,
        explanation:
          "The accumulator must start empty once; resetting it inside the body erases every round.",
      },
    ],
    practiceTask:
      "Compute 2 + 4 + 6 + ... + 2n for n read from the keyboard, twice: once with term = 2 * i, and once with an if that adds only when i % 2 == 0. Both versions must print the same answer - test with n = 4 (expected 20).",
    status: "draft",
    authorId: "usr-teacher-01",
    createdAt: "2026-02-23T09:00:00.000Z",
    updatedAt: "2026-02-23T09:00:00.000Z",
  },
  {
    id: "les-008",
    slug: "arrays",
    title: "Arrays: One Name, Many Seats",
    topicSlug: "arrays",
    level: "intermediate",
    audience: "HSC",
    summary:
      "Filling an array from the keyboard with a loop, then computing total, average and highest in separate passes.",
    objective:
      "Declare an array, fill it from the keyboard using a loop, and compute the total, the average and the highest value with further passes over the same seats.",
    conceptMd: `Storing 60 students' marks in 60 separate variables is impossible to manage. An array gives one name to a whole row of boxes: int marks[5]; creates five int seats numbered 0 to 4. The number in brackets is called the index, and in C counting always starts from 0 - the first seat is marks[0], not marks[1].

A single box marks[i] behaves exactly like a normal int variable: you can read it, print it with %d, and assign into it. The power comes from making the index a loop variable - one scanf inside a loop fills the whole array, and one printf inside a loop prints all of it.

Three passes over the array cover almost every exam question:

- Fill: for (i = 0; i < 5; i++) scanf("%d", &marks[i]);
- Total: start total = 0, then add every marks[i] in a loop.
- Highest: start highest = marks[0], and whenever marks[i] > highest, update highest.

The highest-value scan deserves attention: we assume the first student is the topper, then walk the rest of the row, replacing the assumption whenever a bigger value appears. After the pass, highest holds the maximum of the whole array. Starting from marks[0] rather than from 0 matters whenever all values could be small - the first real value is always a safe champion.

Why does this work? The five seats sit side by side in memory, and marks[i] compiles into the address of the row's start plus i boxes. The loop merely changes i, so the same line of code touches a different seat each round - that is why one scanf statement can read five numbers.

Array laws to remember:

- int marks[5]; has valid indexes 0, 1, 2, 3, 4 - marks[5] does not exist.
- The size in the declaration must be a constant number.
- A loop over the whole array runs i < size, not i <= size.`,
    syntax: String.raw`int marks[5];               // five seats, indexes 0..4
marks[0] = 62;              // one seat used like any variable
scanf("%d", &marks[i]);     // fill seat i from the keyboard`,
    example: {
      code: String.raw`#include <stdio.h>

int main(void) {
    int marks[5];
    int i, total = 0, highest;
    printf("Enter marks of 5 students: ");
    for (i = 0; i < 5; i = i + 1) {
        scanf("%d", &marks[i]);
    }
    highest = marks[0];
    for (i = 1; i < 5; i = i + 1) {
        if (marks[i] > highest) {
            highest = marks[i];
        }
    }
    for (i = 0; i < 5; i = i + 1) {
        total = total + marks[i];
    }
    printf("Total: %d\n", total);
    printf("Average: %.2f\n", total / 5.0);
    printf("Highest: %d\n", highest);
    return 0;
}`,
      annotations: [
        { line: 3, note: "One name, five seats: marks[0] up to marks[4]." },
        { line: 7, note: "The fill loop - i walks 0..4 so each scanf fills a different seat." },
        { line: 8, note: "&marks[i] passes the address of seat i, the same & rule as any scanf." },
        { line: 10, note: "Assume the first student is the topper before scanning the rest." },
        { line: 12, note: "Replace the champion whenever a bigger mark appears." },
        { line: 15, note: "Second pass: accumulate every seat into total." },
        { line: 19, note: "total / 5.0 keeps the decimal part in the average." },
      ],
    },
    mistakes: [
      "Reading marks[5] in a five-seat array - the last valid seat is marks[4]. Fix: loop with i < 5, never i <= 5.",
      "Starting the highest scan from 0 instead of marks[0] - it gives a wrong answer when every value could be below the starting guess. Fix: the first real value is the only safe first champion.",
      "Forgetting & in scanf(\"%d\", marks[i]) - the address is required for each seat. Fix: &marks[i], exactly like an ordinary variable.",
      "Declaring int marks[n]; with n read at runtime - plain C requires a constant size in the declaration. Fix: declare a fixed size such as marks[100] and use only the first n seats.",
    ],
    dryRun: [
      { step: 1, line: 7, variable: "i", value: "0", explanation: "Fill loop starts at seat 0." },
      { step: 2, line: 8, variable: "marks[0]", value: "62", explanation: "First number stored in seat 0." },
      { step: 3, line: 8, variable: "marks[1]", value: "71", explanation: "Second number stored in seat 1." },
      { step: 4, line: 8, variable: "marks[2]", value: "58", explanation: "Third number stored in seat 2." },
      { step: 5, line: 8, variable: "marks[3]", value: "90", explanation: "Fourth number stored in seat 3." },
      { step: 6, line: 8, variable: "marks[4]", value: "66", explanation: "Fifth number stored in seat 4; fill loop ends when i reaches 5." },
      { step: 7, line: 10, variable: "highest", value: "62", explanation: "Champion assumed: the first seat." },
      { step: 8, line: 12, variable: "marks[1] > highest", value: "71 > 62 true", explanation: "Seat 1 beats the champion." },
      { step: 9, line: 13, variable: "highest", value: "71", explanation: "New champion stored." },
      { step: 10, line: 12, variable: "marks[2] > highest", value: "58 > 71 false", explanation: "Seat 2 loses; champion unchanged." },
      { step: 11, line: 12, variable: "marks[3] > highest", value: "90 > 71 true", explanation: "Seat 3 beats the champion." },
      { step: 12, line: 13, variable: "highest", value: "90", explanation: "New champion stored." },
      { step: 13, line: 12, variable: "marks[4] > highest", value: "66 > 90 false", explanation: "Seat 4 loses; the scan ends." },
      { step: 14, line: 15, variable: "total", value: "0", explanation: "Total pass starts at 0." },
      { step: 15, line: 16, variable: "total", value: "62", explanation: "Adds marks[0]." },
      { step: 16, line: 16, variable: "total", value: "133", explanation: "Adds marks[1]: 62 + 71." },
      { step: 17, line: 16, variable: "total", value: "191", explanation: "Adds marks[2]." },
      { step: 18, line: 16, variable: "total", value: "281", explanation: "Adds marks[3]." },
      { step: 19, line: 16, variable: "total", value: "347", explanation: "Adds marks[4]; the total pass ends." },
      { step: 20, line: 18, variable: "output", value: "Total: 347", explanation: "Total printed." },
      { step: 21, line: 19, variable: "output", value: "Average: 69.40", explanation: "347 / 5.0 = 69.4, printed with two decimals." },
      { step: 22, line: 20, variable: "output", value: "Highest: 90", explanation: "The champion from the scan." },
    ],
    sampleInput: "62 71 58 90 66",
    sampleOutput:
      "Enter marks of 5 students: Total: 347\nAverage: 69.40\nHighest: 90\n",
    checks: [
      {
        question: "For int a[4];, which is NOT a valid seat?",
        options: ["a[0]", "a[1]", "a[3]", "a[4]"],
        answerIndex: 3,
        explanation: "Four seats are indexed 0, 1, 2, 3 - a[4] is one past the end.",
      },
      {
        question: "Why start highest at marks[0] instead of 0?",
        options: [
          "It is faster",
          "0 is not a valid mark",
          "It stays correct even when all values could be below any fixed guess",
          "marks[0] is always the largest",
        ],
        answerIndex: 2,
        explanation:
          "The first real value is always a safe champion; a made-up starting number can be wrong.",
      },
      {
        question: "How many rounds does for (i = 0; i < 5; i++) run?",
        options: ["4", "5", "6", "Depends on the input"],
        answerIndex: 1,
        explanation: "i takes 0, 1, 2, 3, 4 - five rounds; the check fails when i reaches 5.",
      },
    ],
    practiceTask:
      "Read the marks of 10 students into an array. Print (a) how many passed with 33 or more, (b) the class highest, and (c) the average with two decimals. Check with 62 71 58 90 66 44 39 28 81 55: passed 9, highest 90, average 59.40.",
    status: "published",
    authorId: "usr-teacher-01",
    createdAt: "2026-03-02T09:00:00.000Z",
    updatedAt: "2026-03-02T09:00:00.000Z",
  },
];
