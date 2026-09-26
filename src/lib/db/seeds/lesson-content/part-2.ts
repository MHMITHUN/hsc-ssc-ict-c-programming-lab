import type { Lesson } from "../../types";

/** Seed lessons for topics 03-04. Lesson 04 is a DRAFT to prove the publish rule. */

export const part2Lessons: Lesson[] = [
  {
    id: "les-003",
    slug: "input-output",
    title: "Input / Output: scanf, printf and Labels",
    topicSlug: "input-output",
    level: "beginner",
    audience: "both",
    summary:
      "Reading one or more keyboard values with scanf (and the & operator) and printing labelled results with printf.",
    objective:
      "Read values from the keyboard with scanf using the & address operator, and print clearly labelled results with printf so the output explains itself.",
    conceptMd: `Printing with printf you already know. The other half of every practical program is scanf, which reads what the user types. Together they are the program's mouth and ears, and the ICT practical exam uses them in almost every question.

scanf("%d", &ict); reads one whole number from the keyboard and stores it in the variable ict. Notice the & before the name - it means the address of ict. scanf needs the address because it must know *where* to put the value, not what is already there. Forgetting the & is the most common scanf mistake and can crash the program.

One scanf can read several values when the specifiers match the variables in order: scanf("%d %d", &ict, &bangla); waits for two numbers. The user may separate them with spaces or put each on its own line - both work the same way.

Printing text together with values uses placeholders inside the message: printf("Total: %d\\n", total);. Everything except the placeholders is printed exactly as typed, so the \\n is what ends the line. A program that prints bare numbers teaches nobody anything - always print labels like Total: or Average:.

Why does this work? The operating system connects the keyboard to a stream called stdin and the screen to a stream called stdout. printf writes characters to stdout; scanf reads characters from stdin, converts them into a number, and stores the bits into the variable's box. The format specifier is the translation rule in both directions.

Specifier cheat sheet for this lesson:

- %d - read or print an int
- %f - read or print a float (printf can refine it as %.2f)
- %c - read or print a single char`,
    syntax: String.raw`printf("label: %d\n", value);   // output with a label
scanf("%d", &value);              // read one integer
scanf("%d %f", &whole, &decimal); // read two values in order`,
    example: {
      code: String.raw`#include <stdio.h>

int main(void) {
    int ict, bangla;
    printf("Enter ICT and Bangla marks: ");
    scanf("%d %d", &ict, &bangla);
    int total = ict + bangla;
    float average = total / 2.0;
    printf("Total: %d\n", total);
    printf("Average: %.2f\n", average);
    return 0;
}`,
      annotations: [
        { line: 4, note: "Two int boxes reserved; nothing inside them yet." },
        { line: 5, note: "A friendly prompt so the user knows what to type. No \\n - the cursor stays on the same line waiting." },
        { line: 6, note: "Reads two integers. The & passes each variable's address so scanf can fill it." },
        { line: 7, note: "Computes and stores; total is an int because marks are whole numbers." },
        { line: 8, note: "Dividing by 2.0 (a float) keeps the fraction. total / 2 would throw it away." },
        { line: 9, note: "Prints the stored integer next to its label." },
        { line: 10, note: "The average printed with two decimals, for example 81.50." },
      ],
    },
    mistakes: [
      "Forgetting the & in scanf - scanf(\"%d\", ict) passes the variable's value, not its address, and usually crashes the program. Fix: always write &variable inside scanf.",
      "Putting \\n inside scanf: scanf(\"%d\\n\", &n) - scanf cannot print anything and the program seems to wait forever. Fix: prompts belong in printf, never in scanf.",
      "Dividing two ints when a decimal is expected: total / 2 gives 81 even when the true average is 81.5. Fix: divide by 2.0, or by (float) total / 2.",
      "Using & in printf: printf(\"%d\", &total) prints a strange address number. Fix: & belongs to scanf only; printf reads the value directly.",
    ],
    sampleInput: "78 85",
    sampleOutput:
      "Enter ICT and Bangla marks: Total: 163\nAverage: 81.50\n",
    checks: [
      {
        question: "Why does scanf need & before the variable name?",
        options: [
          "It makes the variable global",
          "It passes the variable's address so scanf knows where to store the input",
          "It makes the program faster",
          "It is only a style rule",
        ],
        answerIndex: 1,
        explanation:
          "scanf must write into the variable's memory box, so it needs the box's address, which & provides.",
      },
      {
        question: "What does printf(\"Sum = %d\\n\", 7 + 8); print?",
        options: ["Sum = %d", "Sum = 15", "15", "Sum = 78"],
        answerIndex: 1,
        explanation:
          "The label text prints as typed; the expression is computed first and printed at the placeholder.",
      },
      {
        question: "Who should show the message asking the user to type?",
        options: ["scanf", "printf", "return 0", "The #include line"],
        answerIndex: 1,
        explanation:
          "printf writes to the screen; scanf only reads. Prompts are ordinary printf statements.",
      },
    ],
    practiceTask:
      "Extend the example: read marks in ICT, Bangla and English, then print the total and the average of the three. Run it twice - once with your own marks, once with a friend's - and verify the average by hand.",
    status: "published",
    authorId: "usr-teacher-01",
    createdAt: "2026-01-26T09:00:00.000Z",
    updatedAt: "2026-01-26T09:00:00.000Z",
  },
  {
    id: "les-004",
    slug: "arithmetic-operators",
    title: "Arithmetic Operators: / and % Deserve Respect",
    topicSlug: "arithmetic-operators",
    level: "beginner",
    audience: "SSC",
    summary:
      "The five operators + - * / %, the integer-division surprise, and the modulus tricks examiners love.",
    objective:
      "Use +, -, *, / and % correctly, explain why 7 / 2 gives 3 in C, and choose which operator solves remainder-style questions such as even/odd or unit conversion.",
    conceptMd: `C has five arithmetic operators you must know for both SSC and HSC: + - * / and %. Four behave exactly like a pocket calculator. The fifth, %, is called the modulus operator and it gives the remainder after division - it is the secret weapon for even/odd questions, splitting seconds into minutes, and pulling digits out of a number.

Here is the surprise that costs marks every year: when BOTH numbers are int, the / operator throws away the fraction. 7 / 2 is 3, not 3.5. The machine computes three-and-a-half and keeps only the whole part. But 7 / 2.0 is 3.50, because one side is a float, so fraction-preserving division is used.

% is the partner of integer division: 7 % 2 is 1, because 7 divided by 2 is 3 remainder 1. Two facts to memorise:

- n % 2 is 0 when n is even and 1 when n is odd.
- n % 10 gives the last digit of n, and n / 10 removes the last digit.

Operator precedence follows mathematics: * / % are resolved before + -. Parentheses override everything. In an exam answer, when in doubt, add parentheses - the compiler never complains about clear brackets.

Why does this work? An int is stored as a plain binary whole number with no room for a fraction, so int division must discard it - and the remainder is exactly what was thrown away. That is why / and % always pair up: (a / b) * b + (a % b) rebuilds a exactly.

A daily-life example: 3675 seconds is 61 minutes 15 seconds. 3675 / 60 = 61 whole minutes, and 3675 % 60 = 15 seconds left over. Examiners love this pattern - the annotated program below does exactly this conversion.`,
    syntax: String.raw`sum      = a + b;
product  = a * b;
quotient = a / b;    // int / int drops the fraction
remain   = a % b;    // remainder after integer division`,
    example: {
      code: String.raw`#include <stdio.h>

int main(void) {
    int seconds = 3675;
    int minutes = seconds / 60;
    int remaining = seconds % 60;
    printf("Total seconds: %d\n", seconds);
    printf("Whole minutes: %d\n", minutes);
    printf("Seconds left: %d\n", remaining);
    return 0;
}`,
      annotations: [
        { line: 3, note: "The value to convert: 3675 seconds, a little over an hour." },
        { line: 4, note: "Integer division: 3675 / 60 is 61 - the fraction is thrown away." },
        { line: 5, note: "Modulus gives exactly what division threw away: 15 seconds." },
        { line: 6, note: "Prints the original value so the reader can check the conversion." },
        { line: 7, note: "61 whole minutes." },
        { line: 8, note: "61 minutes and 15 seconds rebuild the original: 61*60 + 15 = 3675." },
      ],
    },
    mistakes: [
      "Expecting 5 / 2 to print 2.5 with int variables - it prints 2. Fix: make at least one side a float: 5 / 2.0 or 5.0 / 2.",
      "Using % on floats: 7.5 % 2 does not compile. Fix: % is defined for integers only.",
      "Writing 1/2 in the middle of a formula and expecting 0.5 - 1/2 is 0, so the whole expression collapses. Fix: write 1.0 / 2.",
      "Confusing = with == in comparisons after doing arithmetic - a single = assigns. Fix: assign with =, compare with ==.",
    ],
    sampleInput: "",
    sampleOutput:
      "Total seconds: 3675\nWhole minutes: 61\nSeconds left: 15\n",
    checks: [
      {
        question: "What is 9 / 2 in C when both values are int?",
        options: ["4.5", "4", "5", "1"],
        answerIndex: 1,
        explanation:
          "Integer division truncates: the .5 is thrown away, leaving 4.",
      },
      {
        question: "What is 9 % 2?",
        options: ["4.5", "4", "1", "0"],
        answerIndex: 2,
        explanation: "9 divided by 2 is 4 remainder 1, and % returns that remainder.",
      },
      {
        question: "How do you get the last digit of an int n?",
        options: ["n / 10", "n % 10", "n * 10", "n % 2"],
        answerIndex: 1,
        explanation:
          "The remainder after dividing by 10 is exactly the last digit; n / 10 removes it instead.",
      },
    ],
    practiceTask:
      "A shopkeeper gives change: read a taka amount (int) and print how many 100-taka notes and how many taka remain. Example: 575 gives 5 notes and 75 taka left. Hint: / 100 and % 100. Check with 1200 (12 notes, 0 taka left).",
    status: "draft",
    authorId: "usr-teacher-01",
    createdAt: "2026-02-02T09:00:00.000Z",
    updatedAt: "2026-02-02T09:00:00.000Z",
  },
];
