import type { Lesson } from "../../types";

/** Seed lessons for topics 09-10 (Strings, Functions). */

export const part5Lessons: Lesson[] = [
  {
    id: "les-009",
    slug: "strings",
    title: "Strings: Text as a Row of Characters",
    topicSlug: "strings",
    level: "intermediate",
    audience: "HSC",
    summary:
      "How C stores text as a character array ending in \\0, reading words with %s, and walking the array by hand instead of calling strlen.",
    objective:
      "Declare a character array, read a word into it with scanf and %s, understand the null terminator that marks the end, and compute the length of a string with your own loop.",
    conceptMd: `C has no separate "text" type. A string is an array of characters with a special marker at the end: the null character, written \\0. When you write char name[50]; and scanf("%s", name); stores "Dhaka" into it, the array actually holds six characters: 'D', 'h', 'a', 'k', 'a' and then \\0. That final marker is how every string function - printf with %s, strlen, your own loops - knows where to stop. Without it, a loop would run past the end of the array reading whatever garbage sits in memory.

Three rules surprise every new learner:

- scanf("%s", word) needs NO & before word. An array name already is an address - the address of its first seat. Writing &word is a classic exam mistake.
- %s with scanf stops at the first space, so it reads one word, not a sentence. "Dhaka College" would only read "Dhaka" - that behaviour is expected at this level.
- The number in char word[50] is the maximum capacity, not the current length. "Dhaka" in a 50-seat array still has length 5.

Finding the length yourself is the classic practical question, and it is just a while loop: start a counter at 0, walk forward seat by seat, and stop when the seat holds \\0. That is exactly what strlen does internally - and once you can write it yourself, string questions stop being magic.

Why does this work? Because characters sit side by side in memory and each seat is one char. word[i] is the i-th seat; comparing it to '\\0' is comparing one character. The loop cannot overshoot: a properly stored string always has a \\0 somewhere before the end of the array, and the loop stops exactly there.`,
    syntax: String.raw`char word[50];            // a string is a char array
scanf("%s", word);        // NO & - the array name is already an address
while (word[i] != '\0') { // walk until the null terminator
    i = i + 1;
}`,
    example: {
      code: String.raw`#include <stdio.h>

int main(void) {
    char word[50];
    int i = 0, length = 0;
    printf("Enter a word: ");
    scanf("%s", word);
    while (word[i] != '\0') {
        length = length + 1;
        i = i + 1;
    }
    printf("Length: %d\n", length);
    return 0;
}`,
      annotations: [
        { line: 3, note: "Fifty seats of one char each - capacity, not length." },
        { line: 6, note: "%s reads one word; notice there is no & before word." },
        { line: 7, note: "The loop condition compares the seat with the null character." },
        { line: 10, note: "One character counted per round." },
        { line: 13, note: "For \"Dhaka\" the loop runs 5 rounds and prints 5." },
      ],
    },
    mistakes: [
      "Writing scanf(\"%s\", &word) - an array name is already an address. Fix: drop the &, use word.",
      "Comparing with word[i] != \"\\0\" (double quotes). Double quotes make a string; a single character needs single quotes. Fix: word[i] != '\\0'.",
      "Assuming the length is 50 because the declaration says char word[50] - 50 is the capacity. Fix: count characters up to the null terminator.",
      "Trying to print a full name with one %s read - scanf stops at the first space. Fix: at this level read single words, or read first and last name into two arrays.",
    ],
    dryRun: [
      { step: 1, line: 6, variable: "word", value: "\"Dhaka\"", explanation: "scanf stores D h a k a and then \\0 in the first six seats." },
      { step: 2, line: 7, variable: "i / word[0]", value: "0 / 'D' != '\\0' true", explanation: "First round: seat 0 holds D, not the terminator." },
      { step: 3, line: 8, variable: "length", value: "1", explanation: "One character counted." },
      { step: 4, line: 7, variable: "word[1]", value: "'h' != '\\0' true", explanation: "Seat 1 holds h; loop continues." },
      { step: 5, line: 8, variable: "length", value: "2", explanation: "Two characters counted." },
      { step: 6, line: 7, variable: "word[2]", value: "'a' != '\\0' true", explanation: "Seat 2 holds a; loop continues." },
      { step: 7, line: 8, variable: "length", value: "3", explanation: "Three characters counted." },
      { step: 8, line: 7, variable: "word[3]", value: "'k' != '\\0' true", explanation: "Seat 3 holds k; loop continues." },
      { step: 9, line: 8, variable: "length", value: "4", explanation: "Four characters counted." },
      { step: 10, line: 7, variable: "word[4]", value: "'a' != '\\0' true", explanation: "Seat 4 holds a; loop continues." },
      { step: 11, line: 8, variable: "length", value: "5", explanation: "Five characters counted." },
      { step: 12, line: 7, variable: "word[5]", value: "'\\0' - loop stops", explanation: "Seat 5 holds the null terminator; the condition fails." },
      { step: 13, line: 13, variable: "output", value: "Length: 5", explanation: "The counter is printed." },
    ],
    sampleInput: "Dhaka",
    sampleOutput: "Enter a word: Length: 5\n",
    checks: [
      {
        question: "What does scanf(\"%s\", word) do when the user types \"Dhaka College\"?",
        options: [
          "Reads the whole sentence",
          "Reads only \"Dhaka\" and stops at the space",
          "Fails with an error",
          "Reads only \"College\"",
        ],
        answerIndex: 1,
        explanation: "%s reads up to the first whitespace character - one word.",
      },
      {
        question: "Why is there no & before word in scanf(\"%s\", word)?",
        options: [
          "& is optional everywhere",
          "An array name already is an address",
          "%s does not need a variable",
          "It is a typo that happens to work",
        ],
        answerIndex: 1,
        explanation: "The array name decays to the address of its first seat, which is exactly what scanf needs.",
      },
      {
        question: "How is the end of a C string marked?",
        options: [
          "A space character",
          "A newline character",
          "The null character \\0",
          "The length is stored before the array",
        ],
        answerIndex: 2,
        explanation: "Every C string ends with the null character - loops and library functions stop there.",
      },
    ],
    practiceTask:
      "Read one word and print it back letter by letter, one character per line, using a loop that stops at \\0. Then print the length the same way as the example. Test with \"Bangladesh\" - 10 letters, 10 lines, then \"Length: 10\".",
    status: "published",
    authorId: "usr-teacher-01",
    createdAt: "2026-03-09T09:00:00.000Z",
    updatedAt: "2026-03-09T09:00:00.000Z",
  },
  {
    id: "les-010",
    slug: "functions",
    title: "Functions: Name a Block, Reuse It Everywhere",
    topicSlug: "functions",
    level: "intermediate",
    audience: "HSC",
    summary:
      "Prototypes, parameters, return values and the define-once call-many habit that shrinks programs and matches HSC exam questions.",
    objective:
      "Write a function with a return type, parameters and a body; declare it with a prototype above main(); call it from main() and use its return value.",
    conceptMd: `A function packages logic under a name. float circleArea(float radius) says: give me a number, I will give you back a number. The word before the name is the return type - what comes back. The words inside the brackets are parameters - what goes in. The body between { } does the work, and return sends the answer back to whoever called the function.

Why bother? Two reasons you can already feel. First, repetition: printing five areas means five copies of the same formula - with a function it is five short calls and one formula. Second, naming: circleArea(7) reads like an explanation, while 3.14159 * 7 * 7 reads like arithmetic you must re-verify. Exams reward this too: "write a function to find the largest of three numbers" is a standard HSC question wording.

Two C rules matter most in practice:

- Define before use, or declare a prototype first. If circleArea's body sits below main(), the compiler has not seen it when main() calls it. The one-line prototype float circleArea(float radius); above main() fixes that. Parameter names in a prototype are optional - float circleArea(float); is also valid.
- Changes inside a function do not reach the caller. C copies each argument into the parameter (call by value). If the function sets radius = 0, the caller's variable is untouched. That is why functions communicate through the return value.

Why does this work? A call like circleArea(7) jumps to the function body with radius holding a copy of 7, runs the statements, and return hands the result back into the expression - area = circleArea(7); stores it. The compiler checks every call against the prototype, so a wrong number of arguments or a wrong type is caught before the program runs.`,
    syntax: String.raw`float circleArea(float radius);   // prototype: signature only

float circleArea(float radius) {  // definition
    return 3.14159 * radius * radius;
}

area = circleArea(7);             // call: argument 7 copied into radius`,
    example: {
      code: String.raw`#include <stdio.h>

float circleArea(float radius);

int main(void) {
    float r, area;
    printf("Enter radius: ");
    scanf("%f", &r);
    area = circleArea(r);
    printf("Area: %.2f\n", area);
    return 0;
}

float circleArea(float radius) {
    return 3.14159 * radius * radius;
}`,
      annotations: [
        { line: 3, note: "Prototype - tells the compiler the signature before main() uses it." },
        { line: 9, note: "The call: r's value is copied into the parameter radius." },
        { line: 10, note: "The returned value lands in area, ready to print." },
        { line: 14, note: "The definition can sit below main() because of the prototype." },
        { line: 15, note: "return sends the computed value back to the caller." },
      ],
    },
    mistakes: [
      "Calling a function that is defined below main() with no prototype - the compiler stops with \"conflicting types\" or an implicit declaration. Fix: add the one-line prototype above main().",
      "Forgetting return in a non-void function - the caller receives garbage. Fix: every path through the body must end in a return of the right type.",
      "Expecting the function to change the caller's variable - arguments are copied (call by value). Fix: return the new value and assign it at the call site.",
      "Mismatching types: passing an int where the parameter is float works but silently converts; passing nothing where a parameter is expected is an error. Fix: match the prototype exactly.",
    ],
    sampleInput: "7",
    sampleOutput: "Enter radius: Area: 153.94\n",
    checks: [
      {
        question: "What does a prototype like float circleArea(float radius); do?",
        options: [
          "Runs the function once",
          "Declares the signature so the function can be called before its definition",
          "Creates a second copy of the function",
          "Reserves memory for the return value",
        ],
        answerIndex: 1,
        explanation: "It is a promise to the compiler: a function with this shape exists somewhere in the file.",
      },
      {
        question: "If circleArea sets radius = 0 inside its body, what happens to the caller's r?",
        options: [
          "r becomes 0 too",
          "Nothing - the parameter holds a copy",
          "The program crashes",
          "r becomes 0 only after return",
        ],
        answerIndex: 1,
        explanation: "C copies arguments into parameters (call by value); the caller's variable is never touched.",
      },
      {
        question: "In int max(int a, int b), what does the leading int mean?",
        options: [
          "The parameters are ints",
          "The function returns an int",
          "The function is called max times",
          "Nothing - it is decoration",
        ],
        answerIndex: 1,
        explanation: "The type before the name is the return type; parameter types are listed inside the brackets.",
      },
    ],
    practiceTask:
      "Write int maximum(int a, int b, int c) that returns the largest of three integers, with a prototype above main(). Read three numbers in main(), print the result as \"Maximum: X\", and verify with 12 45 30 (expected Maximum: 45) and 7 7 2 (expected Maximum: 7).",
    status: "published",
    authorId: "usr-teacher-01",
    createdAt: "2026-03-16T09:00:00.000Z",
    updatedAt: "2026-03-16T09:00:00.000Z",
  },
];
