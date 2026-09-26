import type { Problem } from "../../types";

/** Problems 24-30: arrays (search/sort/matrix), pointers, conditionals,
 * variables and loops. Solutions are exact runnable C programs. */

export const problemsD: Problem[] = [
  {
    id: "prb-024",
    slug: "bubble-sort",
    title: "Bubble Sort an Array",
    statement:
      "Read n, then n integers, and print them in ascending order using bubble sort: repeatedly pass over the array, swapping neighbours that are out of order, so the largest remaining value bubbles to the end of each pass. Print one line: \"Sorted:\" followed by the values separated by single spaces.",
    difficulty: "medium",
    topicSlug: "arrays",
    constraints: "1 <= n <= 100. Values fit in an int. Print exactly one space between values.",
    sampleInput: "5\n5 2 9 1 7",
    sampleOutput: "Sorted: 1 2 5 7 9",
    hint: "Nested loops: for i from 0 to n-2, for j from 0 to n-2-i, if (a[j] > a[j+1]) swap the neighbours with a temp variable.",
    solutionExplanation:
      "Each pass of the inner loop compares neighbours and swaps them when the left one is bigger, so after pass i the i largest values sit correctly at the end - which is why the inner bound shrinks by i every pass (n - 1 - i). For 5 2 9 1 7 the passes gradually lift 9, then 7, then 5 into place, ending at 1 2 5 7 9. The temp variable in the swap is the three-line exchange you first met in the pointers topic - here applied to array seats.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int n, i, j, temp, a[100];
    scanf("%d", &n);
    for (i = 0; i < n; i = i + 1) {
        scanf("%d", &a[i]);
    }
    // TODO: bubble sort with nested loops and neighbour swaps
    // TODO: print "Sorted:" then the values separated by single spaces
    return 0;
}`,
    expectedOutput: "Sorted: 1 2 5 7 9",
    status: "published",
    createdAt: "2026-05-04T09:10:00.000Z",
  },
  {
    id: "prb-025",
    slug: "linear-search",
    title: "Linear Search in an Array",
    statement:
      "Read n, then n integers into an array, then one more integer - the key. Search the array from seat 0 and report the index of the LAST occurrence of the key using 0-based indexing. Print \"Found at index: x\" or \"Not found\".",
    difficulty: "easy",
    topicSlug: "arrays",
    constraints: "1 <= n <= 100. Values fit in an int. Indexes start at 0.",
    sampleInput: "6\n4 9 2 11 7 3\n11",
    sampleOutput: "Found at index: 3",
    hint: "found = -1 before the loop; for each i, if (a[i] == key) found = i; - keeping every match (not breaking) finds the last one.",
    solutionExplanation:
      "The scan compares every seat with the key and records the index of each match, overwriting earlier ones, so when the loop ends found holds the last occurrence - -1 means no match at all. For 4 9 2 11 7 3 the key 11 sits at seat 3 (the fourth seat, because counting starts at 0), so the program prints \"Found at index: 3\".",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int n, i, key, a[100], found = -1;
    scanf("%d", &n);
    for (i = 0; i < n; i = i + 1) {
        scanf("%d", &a[i]);
    }
    scanf("%d", &key);
    // TODO: scan the seats, remember the last index holding the key
    // TODO: print "Found at index: %d" or "Not found"
    return 0;
}`,
    expectedOutput: "Found at index: 3",
    status: "published",
    createdAt: "2026-05-11T09:00:00.000Z",
  },
  {
    id: "prb-026",
    slug: "matrix-addition",
    title: "Add Two Square Matrices",
    statement:
      "Read r (the row and column count of both matrices), then the r x r integers of matrix A, then the r x r integers of matrix B. Print the sum matrix: one row per line, values separated by single spaces. Two-dimensional arrays combine the nested fill loop you know with the fact that a[i][j] is one int seat.",
    difficulty: "medium",
    topicSlug: "arrays",
    constraints: "1 <= r <= 10. Values fit in an int.",
    sampleInput: "2\n1 2\n3 4\n5 6\n7 8",
    sampleOutput: "6 8\n10 12",
    hint: "Three nested-loop blocks: fill A, fill B, then print a[i][j] + b[i][j] with a space between columns and a newline after each row.",
    solutionExplanation:
      "A 2-D array is an array of arrays: a[i][j] names the seat in row i, column j, and each fill block is just the fill loop from the arrays lesson executed once per row. Addition is seat-wise: 1+5=6 and 2+6=8 form the first row; 3+7=10 and 4+8=12 the second. The printing detail is the space: print it before every value except the last column (test j < c - 1), so no trailing space appears.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int r, i, j;
    int a[10][10], b[10][10];
    scanf("%d", &r);
    // TODO: fill a, then fill b (nested loops)
    // TODO: print the sum matrix, one row per line, single spaces
    return 0;
}`,
    expectedOutput: "6 8\n10 12",
    status: "published",
    createdAt: "2026-05-11T09:10:00.000Z",
  },
  {
    id: "prb-027",
    slug: "swap-two-numbers",
    title: "Swap Two Numbers with Pointers",
    statement:
      "Read two integers x and y, swap them using a function void swap(int *a, int *b), and print them after the swap as \"x = A, y = B\". Passing plain ints cannot work - the function would only swap its own copies. Pass addresses and exchange the values through the pointers.",
    difficulty: "easy",
    topicSlug: "pointers",
    constraints: "Values fit in an int.",
    sampleInput: "4 9",
    sampleOutput: "x = 9, y = 4",
    hint: "Call swap(&x, &y). Inside: temp = *a; *a = *b; *b = temp; - three lines through the pointers.",
    solutionExplanation:
      "The call passes copies of the two addresses, and *a / *b reach through them to x's and y's actual seats: temp saves 4, *a = *b writes 9 into x, *b = temp writes 4 into y. main then prints its own variables and sees them genuinely exchanged. Changing the parameters to plain ints is the classic counter-experiment - the printout stays 4 9 because only the copies swapped.",
    starterCode: String.raw`#include <stdio.h>

void swap(int *a, int *b);

int main(void) {
    int x, y;
    scanf("%d %d", &x, &y);
    // TODO: call swap with addresses, then print "x = %d, y = %d"
    return 0;
}

// TODO: implement the three-line pointer swap
`,
    expectedOutput: "x = 9, y = 4",
    status: "published",
    createdAt: "2026-05-18T09:00:00.000Z",
  },
  {
    id: "prb-028",
    slug: "electricity-bill",
    title: "Electricity Bill by Slab",
    statement:
      "Read the monthly electricity usage in units and compute the bill with a slab tariff, the way Bangladeshi utility bills work: the first 100 units cost 5 taka each, and every unit above 100 costs 7 taka each. Print \"Bill: X taka\" with the amount rounded to a whole number.",
    difficulty: "medium",
    topicSlug: "conditional-statements",
    constraints: "0 <= units <= 10000.",
    sampleInput: "120",
    sampleOutput: "Bill: 640 taka",
    hint: "if (units <= 100) bill = units * 5.0; else bill = 100 * 5.0 + (units - 100) * 7.0; - the else branch already includes the full first slab.",
    solutionExplanation:
      "The common mistake is charging the WHOLE amount at the higher rate once it crosses 100. The else branch must always include the full first slab: 100 units x 5 = 500 taka, plus the extra 20 units x 7 = 140 taka, giving 640. The %.0f format prints the double rounded to a whole number, and the multiplication by 5.0 (a double) keeps the arithmetic out of integer truncation.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int units;
    double bill;
    scanf("%d", &units);
    // TODO: slab calculation - first 100 units at 5, rest at 7
    // TODO: print "Bill: %.0f taka"
    return 0;
}`,
    expectedOutput: "Bill: 640 taka",
    status: "published",
    createdAt: "2026-05-25T09:00:00.000Z",
  },
  {
    id: "prb-029",
    slug: "cgpa-calc",
    title: "CGPA of Four Courses",
    statement:
      "Read the GPA (grade point) of four courses - each a decimal between 0.00 and 5.00 on the Bangladeshi scale - and print their average as the CGPA with exactly two decimals: \"CGPA: X.XX\". Note the double type and the %lf specifier for reading decimals.",
    difficulty: "medium",
    topicSlug: "variables-and-data-types",
    constraints: "Each GPA is between 0.00 and 5.00.",
    sampleInput: "5.00 4.50 4.25 5.00",
    sampleOutput: "CGPA: 4.69",
    hint: "double g1, g2, g3, g4; scanf(\"%lf %lf %lf %lf\", ...); then printf(\"CGPA: %.2f\\n\", (g1 + g2 + g3 + g4) / 4.0);",
    solutionExplanation:
      "GPAs carry decimals, so int would silently truncate them - double (read with %lf, printed with %f) is the right box. The average of 5.00, 4.50, 4.25 and 5.00 is 18.75 / 4 = 4.6875, and %.2f rounds it to 4.69. Dividing by 4.0 rather than 4 makes the intent explicit, and the two-decimal format is what mark sheets actually show.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    double g1, g2, g3, g4;
    scanf("%lf %lf %lf %lf", &g1, &g2, &g3, &g4);
    // TODO: print "CGPA: %.2f" with the average
    return 0;
}`,
    expectedOutput: "CGPA: 4.69",
    status: "published",
    createdAt: "2026-06-01T09:00:00.000Z",
  },
  {
    id: "prb-030",
    slug: "pattern-pyramid",
    title: "Print a Star Pyramid",
    statement:
      "Read n and print n rows of stars: row 1 has one star, row 2 has two, and so on to row n. Each row ends with a newline and there are no spaces. Nested loops make this a three-line body - the outer loop picks the row, the inner loop prints that row's stars.",
    difficulty: "medium",
    topicSlug: "loops",
    constraints: "1 <= n <= 20.",
    sampleInput: "4",
    sampleOutput: "*\n**\n***\n****",
    hint: "for (i = 1; i <= n; i++) { for (j = 1; j <= i; j++) printf(\"*\"); printf(\"\\n\"); } - the inner bound is the outer variable.",
    solutionExplanation:
      "The inner loop's condition uses the OUTER loop's variable (j <= i), which is what makes each row one star longer than the previous one. The newline is printed by the outer loop after the inner loop finishes - putting it inside the inner loop would put every star on its own line. For n = 4 the rows carry 1, 2, 3 and 4 stars; centring the stars with leading spaces is the natural follow-up practice.",
    starterCode: String.raw`#include <stdio.h>

int main(void) {
    int n, i, j;
    scanf("%d", &n);
    // TODO: outer loop for rows, inner loop printing i stars, then a newline
    return 0;
}`,
    expectedOutput: "*\n**\n***\n****",
    status: "published",
    createdAt: "2026-06-08T09:00:00.000Z",
  },
];

/** Reference solutions for problems 24-30. */
export const solutionsD: Record<string, string> = {
  "bubble-sort": String.raw`#include <stdio.h>

int main(void) {
    int n, i, j, temp, a[100];
    scanf("%d", &n);
    for (i = 0; i < n; i = i + 1) {
        scanf("%d", &a[i]);
    }
    for (i = 0; i < n - 1; i = i + 1) {
        for (j = 0; j < n - 1 - i; j = j + 1) {
            if (a[j] > a[j + 1]) {
                temp = a[j];
                a[j] = a[j + 1];
                a[j + 1] = temp;
            }
        }
    }
    printf("Sorted:");
    for (i = 0; i < n; i = i + 1) {
        printf(" %d", a[i]);
    }
    printf("\n");
    return 0;
}`,
  "linear-search": String.raw`#include <stdio.h>

int main(void) {
    int n, i, key, a[100], found = -1;
    scanf("%d", &n);
    for (i = 0; i < n; i = i + 1) {
        scanf("%d", &a[i]);
    }
    scanf("%d", &key);
    for (i = 0; i < n; i = i + 1) {
        if (a[i] == key) {
            found = i;
        }
    }
    if (found >= 0) {
        printf("Found at index: %d\n", found);
    } else {
        printf("Not found\n");
    }
    return 0;
}`,
  "matrix-addition": String.raw`#include <stdio.h>

int main(void) {
    int r, c, i, j;
    int a[10][10], b[10][10];
    scanf("%d", &r);
    c = r;
    for (i = 0; i < r; i = i + 1) {
        for (j = 0; j < c; j = j + 1) {
            scanf("%d", &a[i][j]);
        }
    }
    for (i = 0; i < r; i = i + 1) {
        for (j = 0; j < c; j = j + 1) {
            scanf("%d", &b[i][j]);
        }
    }
    for (i = 0; i < r; i = i + 1) {
        for (j = 0; j < c; j = j + 1) {
            printf("%d", a[i][j] + b[i][j]);
            if (j < c - 1) {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}`,
  "swap-two-numbers": String.raw`#include <stdio.h>

void swap(int *a, int *b);

int main(void) {
    int x, y;
    scanf("%d %d", &x, &y);
    swap(&x, &y);
    printf("x = %d, y = %d\n", x, y);
    return 0;
}

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}`,
  "electricity-bill": String.raw`#include <stdio.h>

int main(void) {
    int units;
    double bill;
    scanf("%d", &units);
    if (units <= 100) {
        bill = units * 5.0;
    } else {
        bill = 100 * 5.0 + (units - 100) * 7.0;
    }
    printf("Bill: %.0f taka\n", bill);
    return 0;
}`,
  "cgpa-calc": String.raw`#include <stdio.h>

int main(void) {
    double g1, g2, g3, g4, cgpa;
    scanf("%lf %lf %lf %lf", &g1, &g2, &g3, &g4);
    cgpa = (g1 + g2 + g3 + g4) / 4.0;
    printf("CGPA: %.2f\n", cgpa);
    return 0;
}`,
  "pattern-pyramid": String.raw`#include <stdio.h>

int main(void) {
    int n, i, j;
    scanf("%d", &n);
    for (i = 1; i <= n; i = i + 1) {
        for (j = 1; j <= i; j = j + 1) {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}`,
};
