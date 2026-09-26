import type { Lesson } from "../../types";

/**
 * Seed lessons for topics 01-02. Code blocks use String.raw so C escape
 * sequences like \n stay literal; sample outputs are real strings with real
 * newlines, exactly as the program would print them.
 */

export const part1Lessons: Lesson[] = [
  {
    id: "les-001",
    slug: "program-structure",
    title: "Program Structure: Your First C Program",
    topicSlug: "program-structure",
    level: "beginner",
    audience: "SSC",
    summary:
      "What the three parts of every C program do: the #include line, main() and return.",
    objective:
      "By the end of this lesson you will be able to type and explain the skeleton of a C program - the #include line, the main() function and the return statement - and print your first lines of output.",
    conceptMd: `A C program is built from three parts that you will write at the top of almost every practical answer: the header line, the main function, and the return statement. The compiler reads your file from top to bottom, but it starts *running* from main(). If main() is missing or misspelled, the compiler refuses to build the program at all.

#include <stdio.h> is not decoration. It tells the compiler to bring in the declarations for the input and output functions like printf and scanf. stdio is short for standard input/output. Forgetting this line is the most common first-day error, because printf suddenly becomes an unknown function.

The three parts, in the order they appear:

- #include <stdio.h> - gives the program the input/output toolbox.
- int main(void) { ... } - the entry point; the body between the braces is what actually runs.
- return 0; - tells the operating system the program finished successfully. Zero means success; any other number signals a problem.

The braces { } mark where main() starts and ends, and every statement inside them ends with a semicolon ;. In the SSC ICT practical exam, marks are given for writing this structure correctly even before the logic is checked - examiners look for it first.

Why does this work? Because C is a compiled language: the compiler translates your whole file into machine code before anything runs, and the operating system then starts it at main. That is also why structure mistakes are caught before the program ever starts.`,
    syntax: String.raw`#include <stdio.h>

int main(void) {
    // statements go here, one per line, each ending with ;
    return 0;
}`,
    example: {
      code: String.raw`#include <stdio.h>

int main(void) {
    printf("Hello, C Programming Lab!\n");
    printf("I am learning ICT.\n");
    return 0;
}`,
      annotations: [
        {
          line: 1,
          note: "Brings in printf. Without it the compiler does not know what printf is.",
        },
        {
          line: 3,
          note: "Every program starts running here. int means main will hand back a whole number.",
        },
        {
          line: 4,
          note: "Prints text. The \\n moves the cursor to the next line. The semicolon ends the statement.",
        },
        {
          line: 5,
          note: "A second statement - it lands on its own line because the previous printf ended with \\n.",
        },
        {
          line: 6,
          note: "Tells the operating system: the program finished and everything was fine.",
        },
        {
          line: 7,
          note: "The closing brace ends main. Nothing of our program comes after it.",
        },
      ],
    },
    mistakes: [
      "Writing printf without #include <stdio.h> - the compiler reports an implicit declaration of printf. Fix: keep the #include line at the top of every program.",
      "Spelling main() as Main() or mian - C is case-sensitive and checks names exactly. Fix: type main in small letters and read it back slowly before compiling.",
      "Forgetting the semicolon after printf(...) - the error message points at the *next* line, which confuses beginners. Fix: when a semicolon error appears, check the line just above it.",
      "Leaving out the closing brace } - the compiler says expected '}' at end of input. Fix: type both braces { } first, then fill in the middle.",
    ],
    sampleInput: "",
    sampleOutput: "Hello, C Programming Lab!\nI am learning ICT.\n",
    checks: [
      {
        question: "Which part does the computer start executing first?",
        options: [
          "#include <stdio.h>",
          "int main(void)",
          "return 0;",
          "The first printf",
        ],
        answerIndex: 1,
        explanation:
          "main() is the entry point. The #include line only declares functions; it runs nothing by itself.",
      },
      {
        question: "What does return 0; tell the operating system?",
        options: [
          "The program failed",
          "The program printed the number 0",
          "The program finished successfully",
          "Return to the previous line",
        ],
        answerIndex: 2,
        explanation:
          "By convention, zero is the success code; any other value means something went wrong.",
      },
      {
        question: "Why is #include <stdio.h> needed in this program?",
        options: [
          "To make the program run faster",
          "To declare printf so the compiler knows it",
          "It is only a comment for readers",
          "To reserve memory for variables",
        ],
        answerIndex: 1,
        explanation:
          "The header file lists the standard input/output functions, including printf.",
      },
    ],
    practiceTask:
      "Write a program that prints three lines: your college name, your class, and the word ICT. Use one printf per line. Then remove the \\n from the first two printf calls, predict what changes, and check your prediction.",
    status: "published",
    authorId: "usr-teacher-01",
    createdAt: "2026-01-12T09:00:00.000Z",
    updatedAt: "2026-01-12T09:00:00.000Z",
  },
  {
    id: "les-002",
    slug: "variables-and-data-types",
    title: "Variables and Data Types: Marks, GPA and Grades",
    topicSlug: "variables-and-data-types",
    level: "beginner",
    audience: "both",
    summary:
      "Storing integer marks, decimal GPAs and single-character grades in int, float and char boxes.",
    objective:
      "Declare variables of the right type for whole marks, decimal values and single characters, assign values to them, and print each with the matching format specifier.",
    conceptMd: `A variable is a named box in the computer's memory. You choose the size of the box by choosing a type, you stick a label on it with a name, and you put a value inside. In C the type must be decided at the moment the box is created - that is what teachers mean when they say C is statically typed.

The three types you need for almost every SSC and HSC program:

- int - whole numbers: 87 marks, 40 students, roll 17.
- float - decimal numbers: GPA 4.85, average 81.5, price 12.50 taka.
- char - exactly one character: a grade like 'A' or a section like 'B'. Written in single quotes.

Every type has a matching format specifier for printf and scanf: %d prints an int, %f prints a float, %c prints a char. Mixing them is dangerous because the compiler does not always warn you - printing a float with %d shows a meaningless number, so build the habit now: the specifier must match the type.

A line like int ictMarks = 87; does three jobs at once: it creates the box (int), labels it (ictMarks), and puts the first value inside (87). You may also declare first and assign later: int ictMarks; then ictMarks = 87; - both styles appear in exam solutions.

Naming rules that examiners check:

- Start with a letter or underscore, never a digit.
- No spaces inside a name - write ictMarks or ict_marks.
- Keywords of C itself (int, float, return, char...) cannot be used as names.

Why does this work? Memory is a long row of numbered cells. The type tells the compiler how many cells to reserve and how to read the bits inside them; the name is your human-friendly handle for that address. When you print ictMarks, the compiler knows those bits must be read as a whole number.`,
    syntax: String.raw`type name = value;

int   marks = 87;     // whole number
float gpa   = 4.85;   // decimal number
char  grade = 'A';    // one character, single quotes`,
    example: {
      code: String.raw`#include <stdio.h>

int main(void) {
    int ictMarks = 87;
    float gpa = 4.85;
    char grade = 'A';
    printf("ICT marks: %d\n", ictMarks);
    printf("GPA: %.2f\n", gpa);
    printf("Grade: %c\n", grade);
    return 0;
}`,
      annotations: [
        { line: 3, note: "Creates an int box labelled ictMarks and puts 87 into it." },
        { line: 4, note: "A float can hold decimals - necessary for a GPA." },
        { line: 5, note: "A char holds one character; single quotes are required." },
        { line: 6, note: "%d is the placeholder where the value of ictMarks will appear." },
        { line: 7, note: "%.2f prints the float with exactly two digits after the point: 4.85." },
        { line: 8, note: "%c prints the single character stored in grade." },
      ],
    },
    mistakes: [
      "Printing a float with %d - the output is a strange number like 539539840. Fix: match the specifier to the type; use %f (or %.2f) for float values.",
      "Writing char grade = A; without quotes - the compiler thinks A is an undeclared variable. Fix: single quotes are part of the char syntax: grade = 'A';.",
      "Assigning inside printf: printf(\"%d\", marks = 50); silently changes marks. Fix: printf should only read the variable - printf(\"%d\", marks);.",
      "Declaring int total, average; and expecting average to hold 81.5 - both became int. Fix: declare float average; as its own statement.",
    ],
    dryRun: [
      { step: 1, line: 3, variable: "ictMarks", value: "87", explanation: "Variable created; 87 stored in it." },
      { step: 2, line: 4, variable: "gpa", value: "4.85", explanation: "Variable created with a decimal value." },
      { step: 3, line: 5, variable: "grade", value: "'A'", explanation: "One character stored, in single quotes." },
      { step: 4, line: 6, variable: "ictMarks", value: "87", explanation: "Value printed at the place of %d." },
      { step: 5, line: 7, variable: "gpa", value: "4.85", explanation: "Printed with exactly two decimal places." },
      { step: 6, line: 8, variable: "grade", value: "A", explanation: "Character printed at the place of %c." },
    ],
    sampleInput: "",
    sampleOutput: "ICT marks: 87\nGPA: 4.85\nGrade: A\n",
    checks: [
      {
        question: "Which type should store a GPA like 4.85?",
        options: ["int", "float", "char", "double quotes"],
        answerIndex: 1,
        explanation:
          "A GPA has a fractional part, and float is the type for decimal numbers.",
      },
      {
        question: "What does %.2f do in printf?",
        options: [
          "Reads two floats",
          "Prints a float rounded to 2 decimal places",
          "Permanently rounds the variable",
          "Prints the number two times",
        ],
        answerIndex: 1,
        explanation:
          "%.2f controls only the printing: the value is shown with two digits after the point.",
      },
      {
        question: "Which of these is a valid variable name?",
        options: ["2marks", "ict marks", "ictMarks", "float"],
        answerIndex: 2,
        explanation:
          "Names cannot start with a digit, cannot contain a space, and cannot reuse a C keyword.",
      },
    ],
    practiceTask:
      "Declare variables for a student's roll (int), ICT marks (int), GPA (float) and section (char). Assign your own values and print each on one labelled line, for example: Roll: 17. Make the GPA print with exactly two decimal places.",
    status: "published",
    authorId: "usr-teacher-01",
    createdAt: "2026-01-19T09:00:00.000Z",
    updatedAt: "2026-01-19T09:00:00.000Z",
  },
];
