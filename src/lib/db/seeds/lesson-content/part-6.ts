import type { Lesson } from "../../types";

/** Seed lessons for topics 11-12 (Recursion, Pointers intro). */

export const part6Lessons: Lesson[] = [
  {
    id: "les-011",
    slug: "recursion",
    title: "Recursion: A Function That Calls Itself",
    topicSlug: "recursion",
    level: "advanced",
    audience: "HSC",
    summary:
      "Base case and recursive case, traced line by line with factorial - the pattern behind every HSC recursion question.",
    objective:
      "Explain the two parts of every recursive function (a base case that stops and a recursive case that shrinks the problem), and trace a factorial call by hand.",
    conceptMd: `A recursive function is a function that calls itself on a smaller version of the same problem. That sounds circular until you see the two-part contract every recursive function must honour:

- A base case: the smallest version of the problem, answered directly with no further call. For factorial: 1! = 1 and 0! = 1, so when n <= 1 the function returns 1 and the chain stops.
- A recursive case: the call with a strictly smaller input. For factorial: n * factorial(n - 1). Each call is one step closer to the base case - n drops by 1 every time.

Trace factorial(5) to see the machine at work. The calls pile up while n > 1: factorial(5) needs factorial(4), which needs factorial(3), and so on down to factorial(1), which finally answers 1 without calling anything. Then the pile unwinds backwards: factorial(2) returns 2 * 1 = 2, factorial(3) returns 3 * 2 = 6, factorial(4) returns 4 * 6 = 24, and factorial(5) returns 5 * 24 = 120. Each waiting call resumes exactly where it paused - at its own multiplication.

Two questions decide whether your recursion is correct. Does every path reach the base case? And does the base case answer the smallest input correctly? Miss the first and the calls never stop - the program crashes when the call stack runs out (stack overflow). Miss the second and every answer built on top of it is wrong.

Why does this work? Each call gets its own copy of the parameter n and its own place to pause. The runtime keeps a stack of unfinished calls; returning pops the top call and hands its value to the one below. Recursion is not a loop in disguise here - it is the stack doing the bookkeeping loops do with a counter. Factorial and Fibonacci are the two traces every HSC student must be able to write by hand.`,
    syntax: String.raw`int factorial(int n) {
    if (n <= 1) {              // base case: stop calling
        return 1;
    }
    return n * factorial(n - 1); // recursive case: smaller n
}`,
    example: {
      code: String.raw`#include <stdio.h>

int factorial(int n);

int main(void) {
    int n;
    printf("Enter n: ");
    scanf("%d", &n);
    printf("Factorial of %d = %d\n", n, factorial(n));
    return 0;
}

int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}`,
      annotations: [
        { line: 11, note: "The call chain starts here - main waits while factorial(5) runs." },
        { line: 14, note: "Base case: n is 1 (or 0), answer 1, no further call." },
        { line: 16, note: "Recursive case: multiply by the answer for n - 1." },
        { line: 10, note: "The returned value flows straight into printf." },
      ],
    },
    mistakes: [
      "No base case (or a base case that is never reached) - the calls never stop and the program dies with a stack overflow. Fix: make the recursive call shrink n toward a tested stopping value.",
      "Recursing with the same n, as in return n * factorial(n); - infinite descent. Fix: the argument must move toward the base case, usually n - 1.",
      "Returning the call alone (return factorial(n - 1);) and forgetting the multiplication - factorial(5) would answer 1. Fix: the recursive case combines n with the sub-answer.",
      "Testing only with large n like 20 - 20! overflows int and looks like a wrong answer. Fix: verify with 5 (expected 120) first; overflow limits come later.",
    ],
    dryRun: [
      { step: 1, line: 11, variable: "call", value: "factorial(5)", explanation: "main calls factorial with n = 5." },
      { step: 2, line: 16, variable: "call", value: "5 * factorial(4)", explanation: "5 > 1: recursive case, waits for factorial(4)." },
      { step: 3, line: 16, variable: "call", value: "4 * factorial(3)", explanation: "4 > 1: waits for factorial(3)." },
      { step: 4, line: 16, variable: "call", value: "3 * factorial(2)", explanation: "3 > 1: waits for factorial(2)." },
      { step: 5, line: 16, variable: "call", value: "2 * factorial(1)", explanation: "2 > 1: waits for factorial(1)." },
      { step: 6, line: 14, variable: "return", value: "1", explanation: "Base case: n = 1 returns 1 without calling again." },
      { step: 7, line: 16, variable: "return", value: "2 * 1 = 2", explanation: "factorial(2) finishes and returns 2." },
      { step: 8, line: 16, variable: "return", value: "3 * 2 = 6", explanation: "factorial(3) finishes and returns 6." },
      { step: 9, line: 16, variable: "return", value: "4 * 6 = 24", explanation: "factorial(4) finishes and returns 24." },
      { step: 10, line: 16, variable: "return", value: "5 * 24 = 120", explanation: "factorial(5) finishes and returns 120 to main." },
      { step: 11, line: 10, variable: "output", value: "Factorial of 5 = 120", explanation: "printf prints the returned value." },
    ],
    sampleInput: "5",
    sampleOutput: "Enter n: Factorial of 5 = 120\n",
    checks: [
      {
        question: "What happens if a recursive function has no base case?",
        options: [
          "It returns 0",
          "The calls never stop until the stack overflows",
          "The compiler removes the recursion",
          "It runs exactly once",
        ],
        answerIndex: 1,
        explanation: "Every call makes another call; the runtime's call stack is finite and the program crashes.",
      },
      {
        question: "In factorial, which line answers factorial(1) directly?",
        options: [
          "return n * factorial(n - 1);",
          "if (n <= 1) return 1;",
          "scanf(\"%d\", &n);",
          "The prototype",
        ],
        answerIndex: 1,
        explanation: "The guard that returns 1 without recursing is the base case.",
      },
      {
        question: "In what order do the pending factorial calls finish?",
        options: [
          "factorial(5) first",
          "From the base case back up: factorial(2), then 3, 4, 5",
          "All at once",
          "In random order",
        ],
        answerIndex: 1,
        explanation: "The deepest call (nearest the base case) finishes first; each waiting call then resumes.",
      },
    ],
    practiceTask:
      "Write a recursive function int sumUpTo(int n) that returns 1 + 2 + ... + n. Identify its base case and recursive case in a comment. Test with n = 10 (expected 55) and n = 1 (expected 1). Then trace sumUpTo(4) on paper the way the dry-run table does.",
    status: "published",
    authorId: "usr-teacher-01",
    createdAt: "2026-03-23T09:00:00.000Z",
    updatedAt: "2026-03-23T09:00:00.000Z",
  },
  {
    id: "les-012",
    slug: "pointers",
    title: "Pointers: Variables That Store Addresses",
    topicSlug: "pointers",
    level: "advanced",
    audience: "HSC",
    summary:
      "The & and * pair, why scanf needs addresses, and the swap-by-pointer example that proves call by value is real.",
    objective:
      "Declare a pointer, take a variable's address with &, reach the value at an address with *, and use a pointer parameter to let a function change the caller's variables.",
    conceptMd: `Every variable lives at a numbered seat in memory - an address. A pointer is a variable whose stored value is such an address. Two operators do all the work:

- &x reads "the address of x". You have used it since your first scanf: scanf("%d", &n); works because scanf needs the address of the seat to fill.
- *p, when p is a pointer, reads "the value at the address in p". int *p = &n; makes p point at n; afterwards *p and n name the same seat.

The declaration int *p means "p is a pointer to an int". The type matters: a pointer to int must hold the address of an int, and *p behaves like an int.

Why do pointers exist? Because of a rule you met in the functions topic: C copies arguments into parameters. A function that receives a copy cannot change the caller's original. Pointers break that wall. Instead of sending the value, send the address: swap(&x, &y) passes two addresses; inside, *a and *b reach through those addresses and touch x and y directly. That is how scanf "returns" many inputs without a return value, and it is why the classic swap example proves call by value is real: a swap(int a, int b) version that swaps the copies changes nothing outside.

Read the swap trace carefully. temp = *a; saves the value at the first address (x's value). *a = *b; copies y's value into x's seat. *b = temp; puts the saved value into y's seat. The pointer itself never changes - it keeps pointing where it was pointed; the values at those addresses move.

Why does this work? Because an address is unambiguous: it names exactly one seat in memory. Dereferencing it with * is the compiler's promise that a value of the pointed-to type lives there. One rule of safety: never dereference a pointer that was never given an address - int *p; *p = 5; writes through a garbage address and crashes unpredictably.`,
    syntax: String.raw`int x = 4;
int *p = &x;      // p holds the address of x
*p = 9;           // writes through p - x is now 9

void swap(int *a, int *b);  // parameters are addresses
swap(&x, &y);     // pass addresses, not copies`,
    example: {
      code: String.raw`#include <stdio.h>

void swap(int *a, int *b);

int main(void) {
    int x, y;
    printf("Enter two numbers: ");
    scanf("%d %d", &x, &y);
    swap(&x, &y);
    printf("After swap: x = %d, y = %d\n", x, y);
    return 0;
}

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}`,
      annotations: [
        { line: 8, note: "scanf has used & all along - it needs addresses to fill seats." },
        { line: 9, note: "The addresses of x and y are passed, not their values." },
        { line: 14, note: "a and b are pointers: they hold copies of those addresses." },
        { line: 15, note: "temp saves the value at the first address (x's value)." },
        { line: 16, note: "y's value is written into x's seat through the pointer." },
        { line: 17, note: "The saved value lands in y's seat - the swap is done for real." },
      ],
    },
    mistakes: [
      "Declaring int *p; and immediately writing *p = 5; - p holds a garbage address. Fix: point it first, int *p = &x;.",
      "Confusing the two stars: int *p = &x; in a declaration vs *p = 9; as a statement. Fix: in a declaration the star is part of the type; in a statement it means \"value at\".",
      "Passing values to a pointer parameter: swap(x, y); - the compiler warns about int vs int *. Fix: pass addresses, swap(&x, &y);.",
      "Writing swap(int a, int b) { ... } and expecting x and y to change - only the copies swapped. Fix: pointer parameters plus * to reach the caller's seats.",
    ],
    dryRun: [
      { step: 1, line: 8, variable: "x, y", value: "4, 9", explanation: "scanf stores 4 and 9 through the addresses &x and &y." },
      { step: 2, line: 9, variable: "a, b", value: "&x, &y", explanation: "swap receives copies of the two addresses." },
      { step: 3, line: 15, variable: "temp", value: "4", explanation: "*a reads the value at x's seat: 4." },
      { step: 4, line: 16, variable: "*a (x)", value: "9", explanation: "*b (y's value) is written into x's seat." },
      { step: 5, line: 17, variable: "*b (y)", value: "4", explanation: "temp is written into y's seat - both seats exchanged." },
      { step: 6, line: 10, variable: "output", value: "After swap: x = 9, y = 4", explanation: "main prints its own variables - genuinely swapped." },
    ],
    sampleInput: "4 9",
    sampleOutput: "Enter two numbers: After swap: x = 9, y = 4\n",
    checks: [
      {
        question: "What does &x give you?",
        options: [
          "The value of x",
          "The address of x",
          "A copy of x",
          "Twice the value of x",
        ],
        answerIndex: 1,
        explanation: "& is the address-of operator - exactly what scanf needs to store input.",
      },
      {
        question: "After int *p = &x;, what does *p = 9; do?",
        options: [
          "Changes p to 9",
          "Changes the address stored in p",
          "Changes x to 9",
          "Nothing - it is illegal",
        ],
        answerIndex: 2,
        explanation: "*p reaches the seat p points at, which is x's seat, so x becomes 9.",
      },
      {
        question: "Why must swap take pointers instead of plain ints?",
        options: [
          "Pointers are faster",
          "Plain int parameters receive copies, so the caller's variables never change",
          "Pointers are required by printf",
          "It is just a convention",
        ],
        answerIndex: 1,
        explanation: "Call by value copies arguments; addresses are the way a function reaches the caller's seats.",
      },
    ],
    practiceTask:
      "Write void sortTwo(int *a, int *b) that puts the smaller value in *a and the larger in *b. Read two numbers in main(), call it, and print both. Test with 9 4 (expected 4 9) and with 1 8 (expected 1 8 - already sorted). Then change it to plain int parameters and confirm it stops working - that failure is the lesson.",
    status: "published",
    authorId: "usr-teacher-01",
    createdAt: "2026-03-30T09:00:00.000Z",
    updatedAt: "2026-03-30T09:00:00.000Z",
  },
];
