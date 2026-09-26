import type { Problem } from "../../types";

/**
 * Problems 1-8 on topics 01-08. Each problem also has a reference solution
 * (exported separately) that is registered in the demo execution catalog
 * and revealed on the problem page's "View solution" section.
 */

export const problemsA: Problem[] = [
  {
    id: "prb-001",
    slug: "sum-and-average-of-two-numbers",
    title: "Sum and Average of Two Numbers",
    statement:
      "Read two integers from the keyboard. Print their sum on one line and their average on the next line with exactly two decimal places. This is the shape of the very first question in most ICT practical exams: read, compute, print with labels.",
    difficulty: "easy",
    topicSlug: "input-output",
    constraints: "Both numbers are integers between -100000 and 100000. Print the average with exactly two digits after the decimal point.",
    sampleInput: "12 15",
    sampleOutput: "Sum: 27\nAverage: 13.50",
    hint: "Sum uses int arithmetic. For the average, divide by 2.0 (not 2) so the fraction survives, and print it with %.2f.",
    solutionExplanation:
      "The sum of two ints is an int, so %d is correct for it. The average needs a decimal, so we divide by 2.0 - a float - which forces fraction-preserving division; total / 2 would print 13.00 for 27 because int division truncates first. %.2f shows exactly two decimal places.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    // TODO 1: print the sum with the label "Sum: "
    // TODO 2: print the average with the label "Average: " using %.2f
    return 0;
}`,
    expectedOutput: "Sum: 27\nAverage: 13.50",
    status: "published",
    createdAt: "2026-02-05T09:00:00.000Z",
  },
  {
    id: "prb-002",
    slug: "area-of-rectangle",
    title: "Area of a Rectangle",
    statement:
      "A rectangular field is L metres long and W metres wide. Read L and W as integers and print the area in square metres. This practices declaring variables, reading two values with one scanf, and multiplying them.",
    difficulty: "easy",
    topicSlug: "variables-and-data-types",
    constraints: "1 <= L, W <= 10000. The area fits in an int.",
    sampleInput: "8 5",
    sampleOutput: "Area: 40",
    hint: "Area = length x width. Store it in a variable first - do not do the multiplication inside printf.",
    solutionExplanation:
      "We read both sides into int variables, multiply into a third variable named area, and print it. Keeping the result in a named variable makes the program readable and lets you reuse the value later.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int length, width;
    scanf("%d %d", &length, &width);
    // TODO: compute area and print it with the label "Area: "
    return 0;
}`,
    expectedOutput: "Area: 40",
    status: "published",
    createdAt: "2026-02-05T09:10:00.000Z",
  },
  {
    id: "prb-003",
    slug: "even-or-odd",
    title: "Even or Odd",
    statement:
      "Read one integer and print Even if it is divisible by 2, otherwise print Odd. Divisibility is tested with the modulus operator %, not by looking at the last digit.",
    difficulty: "easy",
    topicSlug: "conditional-statements",
    constraints: "-1000000 <= n <= 1000000. Print exactly Even or Odd - nothing else.",
    sampleInput: "7",
    sampleOutput: "Odd",
    hint: "n % 2 gives the remainder after dividing by 2. It is 0 exactly when n is even.",
    solutionExplanation:
      "The remainder n % 2 is 0 for even numbers and 1 for odd numbers, so the condition n % 2 == 0 picks the even branch. Comparing the remainder with == is the standard divisibility test for any divisor, not just 2.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    // TODO: print "Even" when n is divisible by 2, otherwise "Odd"
    return 0;
}`,
    expectedOutput: "Odd",
    status: "published",
    createdAt: "2026-02-12T09:00:00.000Z",
  },
  {
    id: "prb-004",
    slug: "largest-of-three",
    title: "Largest of Three Numbers",
    statement:
      "Read three integers and print the largest of them with its label. Solve it with if / else if / else - no arrays and no library functions - because the examiner wants to see the comparisons.",
    difficulty: "easy",
    topicSlug: "conditional-statements",
    constraints: "-100000 <= a, b, c <= 100000. The three numbers may be equal; then print that shared value.",
    sampleInput: "12 45 23",
    sampleOutput: "Largest: 45",
    hint: "First test a against both b and c with &&. If that fails, b has only c left to beat; otherwise c is the champion.",
    solutionExplanation:
      "Each number is champion only if it is greater than or equal to both others, so three if / else-if branches suffice: a wins when a >= b && a >= c; otherwise b wins when b >= c; otherwise c wins. Using >= (not >) keeps the answer correct when two numbers tie at the top.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    // TODO: print the largest with the label "Largest: "
    return 0;
}`,
    expectedOutput: "Largest: 45",
    status: "published",
    createdAt: "2026-02-12T09:10:00.000Z",
  },
  {
    id: "prb-005",
    slug: "pass-or-fail",
    title: "Pass or Fail",
    statement:
      "Read a student's ICT marks and print Pass if the marks are 33 or more, otherwise Fail. In the Bangladesh curriculum 33 is the pass line for a single subject - this one-line decision appears in some form almost every year.",
    difficulty: "easy",
    topicSlug: "conditional-statements",
    constraints: "0 <= marks <= 100. Print exactly Pass or Fail.",
    sampleInput: "29",
    sampleOutput: "Fail",
    hint: "One if / else is enough. The pass condition is marks >= 33.",
    solutionExplanation:
      "A single condition marks >= 33 splits all inputs into two groups, so one if and one else cover everything. Resist writing two separate ifs for the two cases - the else already means 'every other case', which is exactly what Fail is.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int marks;
    scanf("%d", &marks);
    // TODO: print "Pass" when marks >= 33, otherwise "Fail"
    return 0;
}`,
    expectedOutput: "Fail",
    status: "published",
    createdAt: "2026-02-12T09:20:00.000Z",
  },
  {
    id: "prb-006",
    slug: "simple-interest",
    title: "Simple Interest",
    statement:
      "A cooperative lends P taka for T years at R percent annual simple interest. Read P, T and R and print the interest amount with two decimal places. The formula from your textbook: SI = (P x T x R) / 100.",
    difficulty: "easy",
    topicSlug: "arithmetic-operators",
    constraints: "1 <= P <= 10000000, 1 <= T <= 50, 0 <= R <= 100. Print with exactly two decimal places.",
    sampleInput: "1000 5 12",
    sampleOutput: "Simple interest: 600.00",
    hint: "Multiply first, divide by 100 last. Make the division a float division (divide by 100.0) so taka-poisha are not lost.",
    solutionExplanation:
      "The product P * T * R is computed first and can be large but still fits a float comfortably for these constraints. Dividing by 100.0 instead of 100 keeps the fractional taka: with ints only, 125 / 100 would become 1 and lose 25 poisha. %.2f prints the monetary two-decimal form.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int p, t, r;
    scanf("%d %d %d", &p, &t, &r);
    // TODO: compute SI = p * t * r / 100.0 and print "Simple interest: %.2f"
    return 0;
}`,
    expectedOutput: "Simple interest: 600.00",
    status: "published",
    createdAt: "2026-02-19T09:00:00.000Z",
  },
  {
    id: "prb-007",
    slug: "celsius-to-fahrenheit",
    title: "Celsius to Fahrenheit",
    statement:
      "Read a temperature in Celsius and print it in Fahrenheit with two decimal places, using the conversion F = (C x 9/5) + 32. Careful: in C, 9/5 as integer division is 1, which silently ruins the answer - this problem is an integer-division trap on purpose.",
    difficulty: "easy",
    topicSlug: "arithmetic-operators",
    constraints: "-1000 <= C <= 1000. Print with exactly two decimal places.",
    sampleInput: "37",
    sampleOutput: "Fahrenheit: 98.60",
    hint: "Write the fraction with at least one float: c * 9.0 / 5.0. Store the result in a float and print with %.2f.",
    solutionExplanation:
      "The classic mistake is c * 9 / 5 + 32 with int c: 9/5 evaluates to 1, so 37 becomes 37 + 32 = 69 instead of 98.60. Writing 9.0 / 5.0 (or multiplying by 1.8) forces float division at every step, and the result must live in a float variable to keep the decimals.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    float c;
    scanf("%f", &c);
    // TODO: compute f = c * 9.0 / 5.0 + 32 and print "Fahrenheit: %.2f"
    return 0;
}`,
    expectedOutput: "Fahrenheit: 98.60",
    status: "published",
    createdAt: "2026-02-19T09:10:00.000Z",
  },
  {
    id: "prb-008",
    slug: "leap-year",
    title: "Leap Year",
    statement:
      "Read a year and print Leap Year if it is a leap year, otherwise Not a Leap Year. The full rule: a year is a leap year when it is divisible by 4 but not by 100, or divisible by 400. The century cases (1900, 2000, 2100) are where most answers break.",
    difficulty: "medium",
    topicSlug: "conditional-statements",
    constraints: "1600 <= year <= 3000. Print exactly Leap Year or Not a Leap Year.",
    sampleInput: "2024",
    sampleOutput: "Leap Year",
    hint: "Combine the two allowed cases with ||: (y % 4 == 0 && y % 100 != 0) || y % 400 == 0. Test your code on 1900, 2000 and 2023 before submitting.",
    solutionExplanation:
      "The rule has two ways to be a leap year: ordinary years divisible by 4 (y % 4 == 0) except century years (y % 100 != 0), plus century years divisible by 400. Joining the two cases with || and the pair inside the first case with && translates the sentence directly into C. Checking only y % 4 == 0 wrongly calls 1900 a leap year.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int year;
    scanf("%d", &year);
    // TODO: print "Leap Year" or "Not a Leap Year" using the full rule
    return 0;
}`,
    expectedOutput: "Leap Year",
    status: "published",
    createdAt: "2026-02-26T09:00:00.000Z",
  },
];

export const solutionsA: Record<string, string> = {
  "sum-and-average-of-two-numbers": String.raw`#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    int sum = a + b;
    float average = sum / 2.0;
    printf("Sum: %d\n", sum);
    printf("Average: %.2f\n", average);
    return 0;
}`,
  "area-of-rectangle": String.raw`#include <stdio.h>

int main(void) {
    int length, width;
    scanf("%d %d", &length, &width);
    int area = length * width;
    printf("Area: %d\n", area);
    return 0;
}`,
  "even-or-odd": String.raw`#include <stdio.h>

int main(void) {
    int n;
    scanf("%d", &n);
    if (n % 2 == 0) {
        printf("Even\n");
    } else {
        printf("Odd\n");
    }
    return 0;
}`,
  "largest-of-three": String.raw`#include <stdio.h>

int main(void) {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    if (a >= b && a >= c) {
        printf("Largest: %d\n", a);
    } else if (b >= c) {
        printf("Largest: %d\n", b);
    } else {
        printf("Largest: %d\n", c);
    }
    return 0;
}`,
  "pass-or-fail": String.raw`#include <stdio.h>

int main(void) {
    int marks;
    scanf("%d", &marks);
    if (marks >= 33) {
        printf("Pass\n");
    } else {
        printf("Fail\n");
    }
    return 0;
}`,
  "simple-interest": String.raw`#include <stdio.h>

int main(void) {
    int p, t, r;
    scanf("%d %d %d", &p, &t, &r);
    float si = p * t * r / 100.0;
    printf("Simple interest: %.2f\n", si);
    return 0;
}`,
  "celsius-to-fahrenheit": String.raw`#include <stdio.h>

int main(void) {
    float c;
    scanf("%f", &c);
    float f = c * 9.0 / 5.0 + 32;
    printf("Fahrenheit: %.2f\n", f);
    return 0;
}`,
  "leap-year": String.raw`#include <stdio.h>

int main(void) {
    int year;
    scanf("%d", &year);
    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
        printf("Leap Year\n");
    } else {
        printf("Not a Leap Year\n");
    }
    return 0;
}`,
};
