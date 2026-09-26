import type { Problem } from "../../types";

/** Problems 9-15: loops and arrays. */

export const problemsB: Problem[] = [
  {
    id: "prb-009",
    slug: "multiplication-table",
    title: "Multiplication Table",
    statement:
      "Read a number n and print its multiplication table from n x 1 up to n x 10, one product per line, exactly in the format shown below. A single loop of ten rounds replaces ten handwritten printf lines - that is the whole point of loops.",
    difficulty: "easy",
    topicSlug: "loops",
    constraints: "1 <= n <= 99. Print exactly 10 lines in the format: n x k = product.",
    sampleInput: "7",
    sampleOutput: "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70",
    hint: "for (i = 1; i <= 10; i++) and one printf inside the body using all three values: n, i and n * i.",
    solutionExplanation:
      "The loop variable i plays the role of the multiplier, running 1..10. One printf with three placeholders prints n, i and the product n * i - the compiler computes the product during printing, so no extra variable is strictly needed. Keeping i <= 10 (not i < 10) is what includes the tenth line.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int n, i;
    scanf("%d", &n);
    // TODO: loop i from 1 to 10 and print "n x i = product" each round
    return 0;
}`,
    expectedOutput:
      "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70",
    status: "published",
    createdAt: "2026-03-05T09:00:00.000Z",
  },
  {
    id: "prb-010",
    slug: "sum-1-to-n",
    title: "Sum of 1 to N",
    statement:
      "Read n and print the sum 1 + 2 + 3 + ... + n. Solve it with a loop and a running total (start sum at 0 and add inside the loop) - the accumulate pattern that every later series question reuses. Checking against the formula n(n+1)/2 is allowed and encouraged.",
    difficulty: "easy",
    topicSlug: "loops",
    constraints: "1 <= n <= 60000 so the sum fits in an int (60000 x 60001 / 2 < 2000000000).",
    sampleInput: "100",
    sampleOutput: "Sum: 5050",
    hint: "sum = 0 before the loop; inside the body: sum = sum + i; with i running from 1 to n.",
    solutionExplanation:
      "The accumulator starts at 0 and absorbs i on every round: after the loop it holds 1 + 2 + ... + n. For n = 100 the answer 5050 matches the famous Gauss formula n(n+1)/2, which is a quick way to verify any loop-run sum by hand.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int n, i, sum = 0;
    scanf("%d", &n);
    // TODO: loop i from 1 to n, adding i into sum each round
    // TODO: after the loop, print "Sum: %d"
    return 0;
}`,
    expectedOutput: "Sum: 5050",
    status: "published",
    createdAt: "2026-03-05T09:10:00.000Z",
  },
  {
    id: "prb-011",
    slug: "factorial",
    title: "Factorial of N",
    statement:
      "Read n and print n factorial (written n!), the product 1 x 2 x 3 x ... x n. By definition 0! = 1. Products accumulate like sums, except the accumulator must start at 1, because starting at 0 would multiply everything into 0.",
    difficulty: "medium",
    topicSlug: "loops",
    constraints: "0 <= n <= 12 (13! overflows a 32-bit int; that limit is part of the lesson).",
    sampleInput: "5",
    sampleOutput: "Factorial: 120",
    hint: "fact = 1 before the loop; inside: fact = fact * i; for i from 2 to n. Starting i at 2 is safe because multiplying by 1 changes nothing.",
    solutionExplanation:
      "The product accumulator starts at 1 and multiplies i on every round, giving 1 x 2 x 3 x 4 x 5 = 120 for n = 5. When n is 0 the loop body never runs and fact keeps its initial 1 - which is exactly the mathematical definition of 0!. The constraint n <= 12 exists because 13! = 6227020800 exceeds what a 32-bit int can hold.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int n, i;
    long long fact = 1;
    scanf("%d", &n);
    // TODO: loop i from 2 to n, multiplying fact by i each round
    // TODO: print "Factorial: %lld"
    return 0;
}`,
    expectedOutput: "Factorial: 120",
    status: "published",
    createdAt: "2026-03-12T09:00:00.000Z",
  },
  {
    id: "prb-012",
    slug: "count-evens-in-array",
    title: "Count Even Numbers in an Array",
    statement:
      "First read n, the count of numbers. Then read n integers into an array and print how many of them are even. This combines the three classic array passes into two: a fill loop and a counting scan.",
    difficulty: "easy",
    topicSlug: "arrays",
    constraints: "1 <= n <= 100. Each value fits in an int. Declare the array with a fixed size such as 100.",
    sampleInput: "5\n1 2 3 4 5",
    sampleOutput: "Even numbers: 2",
    hint: "count = 0 before the scan; inside the loop, if (a[i] % 2 == 0) count = count + 1;.",
    solutionExplanation:
      "The array is declared with a fixed size 100 - the maximum n the problem allows - and only the first n seats are used. The counting pass tests each seat with the even test from the conditionals topic and grows a counter. For 1 2 3 4 5 the seats 2 and 4 pass the test, so the count is 2.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int n, i, a[100], count = 0;
    scanf("%d", &n);
    for (i = 0; i < n; i = i + 1) {
        scanf("%d", &a[i]);
    }
    // TODO: loop over the seats and count the even ones
    // TODO: print "Even numbers: %d"
    return 0;
}`,
    expectedOutput: "Even numbers: 2",
    status: "published",
    createdAt: "2026-03-19T09:00:00.000Z",
  },
  {
    id: "prb-013",
    slug: "max-in-array",
    title: "Maximum in an Array",
    statement:
      "First read n, then read n integers into an array and print the maximum. Assume the first seat is the champion, then walk the rest and replace the champion whenever a bigger value appears - starting from the first real value is what keeps the method correct for every input.",
    difficulty: "easy",
    topicSlug: "arrays",
    constraints: "1 <= n <= 100. Values may repeat; the maximum still fits in an int.",
    sampleInput: "6\n4 9 2 11 7 3",
    sampleOutput: "Maximum: 11",
    hint: "max = a[0]; then for i from 1 to n-1: if (a[i] > max) max = a[i];.",
    solutionExplanation:
      "Declaring max = a[0] means the champion is always a value that actually exists in the array, so the method works even for all-negative inputs (where starting from 0 would be wrong). The scan from seat 1 compares every remaining seat and promotes any bigger value; after n-1 comparisons max holds the largest, here 11.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int n, i, a[100];
    scanf("%d", &n);
    for (i = 0; i < n; i = i + 1) {
        scanf("%d", &a[i]);
    }
    // TODO: start max at a[0], scan the rest, print "Maximum: %d"
    return 0;
}`,
    expectedOutput: "Maximum: 11",
    status: "published",
    createdAt: "2026-03-19T09:10:00.000Z",
  },
  {
    id: "prb-014",
    slug: "reverse-number",
    title: "Reverse a Number",
    statement:
      "Read a positive integer and print its digits in reverse order. The engine is the digit pair from the operators topic: n % 10 extracts the last digit and n / 10 removes it. Repeat while n is still greater than 0.",
    difficulty: "medium",
    topicSlug: "loops",
    constraints: "1 <= n <= 2000000000. Leading zeros of the reversed form disappear: 100 becomes 1, because the reversed value is built as a number, not printed digit by digit.",
    sampleInput: "1234",
    sampleOutput: "Reversed: 4321",
    hint: "rev = 0; while (n > 0) { rev = rev * 10 + n % 10; n = n / 10; }.",
    solutionExplanation:
      "Each round peels the last digit off n and pushes it onto rev: rev = rev * 10 + n % 10 shifts the old digits left and appends the new one, while n = n / 10 drops that digit from the source. For 1234 the rounds build 4, 43, 432, 4321. This loop shape - while (n > 0) with a shrinking n - is the standard digit-processing pattern.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int n, rev = 0;
    scanf("%d", &n);
    // TODO: while n > 0: rev = rev * 10 + n % 10; then n = n / 10;
    // TODO: print "Reversed: %d"
    return 0;
}`,
    expectedOutput: "Reversed: 4321",
    status: "published",
    createdAt: "2026-03-26T09:00:00.000Z",
  },
  {
    id: "prb-015",
    slug: "digit-sum",
    title: "Sum of Digits",
    statement:
      "Read a positive integer and print the sum of its digits. It uses the same digit engine as reversing a number - % 10 to read the last digit, / 10 to remove it - but adds digits into a total instead of building a new number.",
    difficulty: "easy",
    topicSlug: "loops",
    constraints: "1 <= n <= 2000000000, so the digit sum is at most 82 and fits easily in an int.",
    sampleInput: "4371",
    sampleOutput: "Digit sum: 15",
    hint: "sum = 0; while (n > 0) { sum = sum + n % 10; n = n / 10; }.",
    solutionExplanation:
      "Round by round for 4371: take 1 (sum 1), take 7 (sum 8), take 3 (sum 11), take 4 (sum 15), then n becomes 0 and the loop ends. The loop condition n > 0 naturally runs once per digit, and both digit operations work for any positive int.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int n, sum = 0;
    scanf("%d", &n);
    // TODO: while n > 0: add n % 10 into sum, then n = n / 10;
    // TODO: print "Digit sum: %d"
    return 0;
}`,
    expectedOutput: "Digit sum: 15",
    status: "published",
    createdAt: "2026-03-26T09:10:00.000Z",
  },
];

export const solutionsB: Record<string, string> = {
  "multiplication-table": String.raw`#include <stdio.h>

int main(void) {
    int n, i;
    scanf("%d", &n);
    for (i = 1; i <= 10; i = i + 1) {
        printf("%d x %d = %d\n", n, i, n * i);
    }
    return 0;
}`,
  "sum-1-to-n": String.raw`#include <stdio.h>

int main(void) {
    int n, i, sum = 0;
    scanf("%d", &n);
    for (i = 1; i <= n; i = i + 1) {
        sum = sum + i;
    }
    printf("Sum: %d\n", sum);
    return 0;
}`,
  factorial: String.raw`#include <stdio.h>

int main(void) {
    int n, i;
    long long fact = 1;
    scanf("%d", &n);
    for (i = 2; i <= n; i = i + 1) {
        fact = fact * i;
    }
    printf("Factorial: %lld\n", fact);
    return 0;
}`,
  "count-evens-in-array": String.raw`#include <stdio.h>

int main(void) {
    int n, i, a[100], count = 0;
    scanf("%d", &n);
    for (i = 0; i < n; i = i + 1) {
        scanf("%d", &a[i]);
    }
    for (i = 0; i < n; i = i + 1) {
        if (a[i] % 2 == 0) {
            count = count + 1;
        }
    }
    printf("Even numbers: %d\n", count);
    return 0;
}`,
  "max-in-array": String.raw`#include <stdio.h>

int main(void) {
    int n, i, a[100], max;
    scanf("%d", &n);
    for (i = 0; i < n; i = i + 1) {
        scanf("%d", &a[i]);
    }
    max = a[0];
    for (i = 1; i < n; i = i + 1) {
        if (a[i] > max) {
            max = a[i];
        }
    }
    printf("Maximum: %d\n", max);
    return 0;
}`,
  "reverse-number": String.raw`#include <stdio.h>

int main(void) {
    int n, rev = 0;
    scanf("%d", &n);
    while (n > 0) {
        rev = rev * 10 + n % 10;
        n = n / 10;
    }
    printf("Reversed: %d\n", rev);
    return 0;
}`,
  "digit-sum": String.raw`#include <stdio.h>

int main(void) {
    int n, sum = 0;
    scanf("%d", &n);
    while (n > 0) {
        sum = sum + n % 10;
        n = n / 10;
    }
    printf("Digit sum: %d\n", sum);
    return 0;
}`,
};
