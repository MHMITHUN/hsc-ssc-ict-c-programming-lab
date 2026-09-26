import type { Lesson } from "../../types";

/** Seed lessons for topics 05-06, both with hand-authored dry-run traces. */

export const part3Lessons: Lesson[] = [
  {
    id: "les-005",
    slug: "conditional-statements",
    title: "Conditional Statements: Pass, Fail and Grades",
    topicSlug: "conditional-statements",
    level: "beginner",
    audience: "both",
    summary:
      "Making decisions with if, else if and else - turning the marks grading table into code.",
    objective:
      "Write decisions with if / else if / else, nest one decision inside another, and trace exactly which branch runs for a given input.",
    conceptMd: `Programs become useful when they choose. In C the choosing tool is the if statement: if (condition) { ... } runs the block only when the condition is true. Attach else { ... } for the remaining case, or else if (condition) for a middle case.

A condition is any expression that is either true or false: marks >= 33, age < 18, answer == 'y'. The comparison operators are == (equal), != (not equal), <, >, <= and >=. One = assigns; two == compare. That single extra character is the classic exam trap.

Conditions can be combined with three logical operators:

- && (AND) - both sides must be true: marks >= 80 && marks <= 100
- || (OR) - at least one side is true: section == 'A' || section == 'B'
- ! (NOT) - flips the result: !(marks < 33)

The pass mark in ICT is 33 and letter grades follow the familiar table - 80 and above is A+, 70-79 is A, and so on. The program below turns that table into code: first pass/fail, then the letter grade nested inside the pass branch. Notice how else if checks ranges in falling order; each condition is reached only when every condition above it was false.

Why does this work? The computer evaluates the condition to a single true or false, then jumps. Only one branch of an if / else if / ... / else chain ever runs - the first one whose condition holds. Everything else is skipped completely, which is what makes a grading table safe: as soon as marks >= 80 matches, the later checks are not even looked at.

Trace discipline for the exam:

- Write the input value at the top of the trace.
- Walk line by line, writing true or false beside each condition.
- Tick the single branch that runs and cross out the rest.
The dry-run table below does exactly this for marks = 85.`,
    syntax: String.raw`if (condition) {
    // runs when condition is true
} else if (other condition) {
    // runs when the first is false but this one is true
} else {
    // runs when every condition above was false
}`,
    example: {
      code: String.raw`#include <stdio.h>

int main(void) {
    int marks;
    printf("Enter your ICT marks: ");
    scanf("%d", &marks);
    if (marks >= 33) {
        printf("Pass\n");
        if (marks >= 80) {
            printf("Grade: A+\n");
        } else if (marks >= 70) {
            printf("Grade: A\n");
        } else {
            printf("Grade: below A\n");
        }
    } else {
        printf("Fail\n");
    }
    return 0;
}`,
      annotations: [
        { line: 6, note: "The decision hinge: true when marks is 33 or more." },
        { line: 7, note: "Runs only for passing marks." },
        { line: 8, note: "A second, nested decision - asked only after Pass was already printed." },
        { line: 9, note: "80 or above stops the chain here: A+." },
        { line: 11, note: "Checked only when marks < 80; the 70-79 range lands here." },
        { line: 13, note: "Every passing mark below 70." },
        { line: 16, note: "Marks 0-32 skip the whole pass block and land here." },
      ],
    },
    mistakes: [
      "Using = instead of ==: if (marks = 33) assigns 33 to marks and the condition is always true. Fix: comparison needs two equals signs.",
      "Putting a semicolon after if: if (marks >= 33); { ... } - the block then always runs. Fix: no semicolon until after the closing brace of the branch.",
      "Checking ranges in the wrong order: testing marks >= 33 before marks >= 80 makes 85 stop at the first branch. Fix: test the highest, narrowest range first.",
      "Writing the equals on the wrong side: 33 =< marks does not compile. Fix: the equals sign always comes second: >= or <=.",
    ],
    dryRun: [
      { step: 1, line: 5, variable: "marks", value: "85", explanation: "Input stored from the keyboard." },
      { step: 2, line: 6, variable: "marks >= 33", value: "true (85 >= 33)", explanation: "Condition evaluated; the pass branch is chosen." },
      { step: 3, line: 7, variable: "output", value: "Pass", explanation: "First line printed." },
      { step: 4, line: 8, variable: "marks >= 80", value: "true (85 >= 80)", explanation: "Nested condition checked next." },
      { step: 5, line: 9, variable: "output", value: "Grade: A+", explanation: "A+ printed; the else-if and else below are skipped." },
      { step: 6, line: 16, variable: "(else branch)", value: "skipped", explanation: "The fail branch never runs because the pass condition was true." },
    ],
    sampleInput: "85",
    sampleOutput: "Enter your ICT marks: Pass\nGrade: A+\n",
    checks: [
      {
        question: "In the example, which grade prints for marks = 70?",
        options: ["Grade: A+", "Grade: A", "Grade: below A", "Fail"],
        answerIndex: 1,
        explanation:
          "70 >= 80 is false, so control falls to marks >= 70, which is true - Grade: A.",
      },
      {
        question: "What does if (x = 5) actually do?",
        options: [
          "Compares x with 5",
          "Assigns 5 to x, and the condition is then true",
          "Causes a syntax error",
          "Runs the else branch",
        ],
        answerIndex: 1,
        explanation:
          "One equals sign is assignment. The condition becomes the value 5, which counts as true.",
      },
      {
        question: "Which operator means NOT equal?",
        options: ["=", "==", "!=", "!=="],
        answerIndex: 2,
        explanation: "!= is C's not-equal comparison; !== does not exist in C.",
      },
    ],
    practiceTask:
      "Read three subject marks and decide promotion: print Promoted when the average is 40 or more AND no single subject is below 33; otherwise print Not promoted. Use one if with &&. Test with 60, 30, 90 - the average passes but the single subject fails, so the result must be Not promoted.",
    status: "published",
    authorId: "usr-teacher-01",
    createdAt: "2026-02-09T09:00:00.000Z",
    updatedAt: "2026-02-09T09:00:00.000Z",
  },
  {
    id: "les-006",
    slug: "loops",
    title: "Loops: while, for and the Sum 1 to N",
    topicSlug: "loops",
    level: "intermediate",
    audience: "both",
    summary:
      "Repeating work with while and for - the three questions every loop must answer, and the accumulate pattern.",
    objective:
      "Write while and for loops that repeat a known number of times, trace how the loop variable changes at every step, and compute running totals such as the sum of 1 to N.",
    conceptMd: `A loop tells the computer: do this again, while the condition still holds. Instead of writing printf a hundred times, you write it once and let a counter decide how many rounds happen. C has three loops - while, for and do-while; this topic needs the first two.

Every loop answers three questions, and missing any one of them breaks the loop:

- Where do we start? (initialisation: int i = 1;)
- When do we stop? (condition: i <= n)
- What changes each round? (update: i = i + 1)

A while loop states the three answers in three places: the start before the loop, the condition in parentheses, the update as the last line of the body. A for loop gathers all three into one line: for (i = 1; i <= n; i = i + 1). Choose for when you know the count in advance; choose while when the number of rounds depends on something that happens while the program runs.

The example computes sum = 1 + 2 + ... + n with a running total: before the loop, sum is 0; each round adds i into sum, then i grows by 1; after the loop ends, sum holds the answer. This accumulate pattern - start at 0, add inside the loop - reappears as products (start at 1 and multiply), counters, and every series problem in the next topic.

Why does this work? The computer keeps no memory of rounds. It simply checks the condition again after every pass through the body: 1 <= 5 true, run the body; 2 <= 5 true, run the body; ... 6 <= 5 false, jump past the loop. The dry-run table below shows exactly this walk for n = 5, including the final failing check that ends the loop.

Loop reading rules:

- The body is the block between { }.
- i = i + 1 may also be written i++ - both mean increase by 1.
- Anything printed inside the body repeats every round; printing after the loop happens exactly once.`,
    syntax: String.raw`for (start; condition; update) {
    // repeated while the condition is true
}

start;
while (condition) {
    // repeated while the condition is true
    update;
}`,
    example: {
      code: String.raw`#include <stdio.h>

int main(void) {
    int n, i = 1, sum = 0;
    printf("Enter n: ");
    scanf("%d", &n);
    while (i <= n) {
        sum = sum + i;
        i = i + 1;
    }
    printf("Sum of 1 to %d = %d\n", n, sum);
    return 0;
}`,
      annotations: [
        { line: 4, note: "The loop's start values: i begins at 1, sum begins at 0." },
        { line: 7, note: "Checked before every round: continue while i is still n or less." },
        { line: 8, note: "The accumulate step: sum grows by the current i on every round." },
        { line: 9, note: "The update - without it i stays 1 forever and the loop never ends." },
        { line: 10, note: "Reached only after the condition fails; prints the finished total once." },
      ],
    },
    mistakes: [
      "Forgetting the update i = i + 1 inside a while body - i never changes and the loop runs forever. Fix: every while body must move the loop variable toward the exit.",
      "Starting the counter at the wrong value: for (i = 0; i < n; i++) runs n times starting from 0, not from 1. Fix: check start, condition and update together against a small sample before running.",
      "Writing a semicolon after for: for (i = 1; i <= n; i++); { ... } - the block then runs once, after the loop has already finished. Fix: no semicolon between the for line and the body.",
      "Off-by-one errors: i < n stops at n-1 while i <= n includes n. Fix: trace with n = 3 on paper and count the rounds with your finger.",
    ],
    dryRun: [
      { step: 1, line: 4, variable: "i", value: "1", explanation: "Loop counter initialised to 1." },
      { step: 2, line: 4, variable: "sum", value: "0", explanation: "Running total starts empty." },
      { step: 3, line: 6, variable: "n", value: "5", explanation: "Input stored from the keyboard." },
      { step: 4, line: 7, variable: "i <= n", value: "true (1 <= 5)", explanation: "Condition checked; enter the body." },
      { step: 5, line: 8, variable: "sum", value: "0 + 1 = 1", explanation: "First addition." },
      { step: 6, line: 9, variable: "i", value: "1 + 1 = 2", explanation: "Counter moves forward." },
      { step: 7, line: 7, variable: "i <= n", value: "true (2 <= 5)", explanation: "Second round begins." },
      { step: 8, line: 8, variable: "sum", value: "1 + 2 = 3", explanation: "Running total grows." },
      { step: 9, line: 9, variable: "i", value: "2 + 1 = 3", explanation: "Counter update." },
      { step: 10, line: 7, variable: "i <= n", value: "true (3 <= 5)", explanation: "Third round begins." },
      { step: 11, line: 8, variable: "sum", value: "3 + 3 = 6", explanation: "Running total grows." },
      { step: 12, line: 9, variable: "i", value: "3 + 1 = 4", explanation: "Counter update." },
      { step: 13, line: 7, variable: "i <= n", value: "true (4 <= 5)", explanation: "Fourth round begins." },
      { step: 14, line: 8, variable: "sum", value: "6 + 4 = 10", explanation: "Running total grows." },
      { step: 15, line: 9, variable: "i", value: "4 + 1 = 5", explanation: "Counter update." },
      { step: 16, line: 7, variable: "i <= n", value: "true (5 <= 5)", explanation: "Fifth and final round begins." },
      { step: 17, line: 8, variable: "sum", value: "10 + 5 = 15", explanation: "Last addition." },
      { step: 18, line: 9, variable: "i", value: "5 + 1 = 6", explanation: "Counter moves past n." },
      { step: 19, line: 7, variable: "i <= n", value: "false (6 <= 5)", explanation: "Condition fails - the loop ends." },
      { step: 20, line: 10, variable: "output", value: "Sum of 1 to 5 = 15", explanation: "Result printed once, after the loop." },
    ],
    sampleInput: "5",
    sampleOutput: "Enter n: Sum of 1 to 5 = 15\n",
    checks: [
      {
        question: "With i = 1 and condition i <= n for n = 5, how many rounds run?",
        options: ["4", "5", "6", "Forever"],
        answerIndex: 1,
        explanation: "i takes 1, 2, 3, 4, 5 - five passing checks - and the sixth fails.",
      },
      {
        question: "What happens if the update i = i + 1 is removed from the body?",
        options: [
          "The loop runs once",
          "The compiler reports an error",
          "The loop never ends",
          "The sum doubles",
        ],
        answerIndex: 2,
        explanation:
          "i stays 1 forever, the condition stays true forever - the classic infinite loop.",
      },
      {
        question: "For for (i = 0; i < 3; i++), which values of i appear inside the body?",
        options: ["1 2 3", "0 1 2", "0 1 2 3", "1 2"],
        answerIndex: 1,
        explanation: "It starts at 0 and stops when i becomes 3, so the body sees 0, 1, 2.",
      },
    ],
    practiceTask:
      "Print the multiplication table of a number n read from the keyboard: n x 1 = ... up to n x 10 = ..., one product per line. Then extend the program to also print the sum of those ten products. Check with n = 7 that the line 7 x 6 = 42 is correct.",
    status: "published",
    authorId: "usr-teacher-01",
    createdAt: "2026-02-16T09:00:00.000Z",
    updatedAt: "2026-02-16T09:00:00.000Z",
  },
];
