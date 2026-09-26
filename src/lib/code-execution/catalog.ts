import { seedLessons } from "@/lib/db/seeds/lessons-1";
import { seedLessons2 } from "@/lib/db/seeds/lessons-2";
import { seedProblems, problemSolutions } from "@/lib/db/seeds/problems-1";
import { seedProblems2, problemSolutions2 } from "@/lib/db/seeds/problems-2";

/**
 * Demo execution catalog.
 *
 * Maps the normalized source text of known programs (every lesson example,
 * every problem reference solution, plus playground classics) to the
 * recorded stdout for the recorded stdin. In demo mode there is NO live
 * compiler: a catalog hit replays the recorded output, a miss returns an
 * honest failure. Output is NEVER fabricated (spec section 36).
 */

export interface CatalogEntry {
  stdin: string;
  stdout: string;
}

/** Collapse all whitespace so indentation and blank lines do not matter. */
export function normalizeSource(code: string): string {
  return code.replace(/\s+/g, " ").trim();
}

const catalog = new Map<string, CatalogEntry>();

function register(code: string, stdin: string, stdout: string): void {
  const key = normalizeSource(code);
  if (key.length === 0) return;
  catalog.set(key, { stdin, stdout });
}

// Every lesson example: run it on the lesson's sample input.
for (const lesson of [...seedLessons, ...seedLessons2]) {
  register(lesson.example.code, lesson.sampleInput, lesson.sampleOutput);
}

// Every problem: its reference solution on the problem's sample input.
const allSolutions: Record<string, string> = {
  ...problemSolutions,
  ...problemSolutions2,
};
for (const problem of [...seedProblems, ...seedProblems2]) {
  const solution = allSolutions[problem.slug];
  if (solution) {
    register(solution, problem.sampleInput, problem.expectedOutput);
  }
}

export interface PlaygroundSample {
  name: string;
  description: string;
  code: string;
  stdin: string;
}

/** The six classic playground programs, available from the samples dropdown. */
export const PLAYGROUND_SAMPLES: PlaygroundSample[] = [
  {
    name: "Hello, World!",
    description: "The traditional first program - one printf line.",
    code: String.raw`#include <stdio.h>

int main(void) {
    printf("Hello, World!\n");
    return 0;
}`,
    stdin: "",
  },
  {
    name: "Sum of two numbers",
    description: "Reads two integers with scanf and prints their sum.",
    code: String.raw`#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("Sum: %d\n", a + b);
    return 0;
}`,
    stdin: "12 11",
  },
  {
    name: "Area of a circle",
    description: "Reads the radius and prints the area with two decimals.",
    code: String.raw`#include <stdio.h>

int main(void) {
    float radius, area;
    scanf("%f", &radius);
    area = 3.14159 * radius * radius;
    printf("Area: %.2f\n", area);
    return 0;
}`,
    stdin: "5",
  },
  {
    name: "Print 1 to 5 with a loop",
    description: "A for loop replaces five separate printf statements.",
    code: String.raw`#include <stdio.h>

int main(void) {
    int i;
    for (i = 1; i <= 5; i = i + 1) {
        printf("%d ", i);
    }
    printf("\n");
    return 0;
}`,
    stdin: "",
  },
  {
    name: "Largest of two (if-else)",
    description: "Reads two integers and prints the larger one.",
    code: String.raw`#include <stdio.h>

int main(void) {
    int a, b;
    scanf("%d %d", &a, &b);
    if (a > b) {
        printf("Largest: %d\n", a);
    } else {
        printf("Largest: %d\n", b);
    }
    return 0;
}`,
    stdin: "14 9",
  },
  {
    name: "Average of three numbers",
    description: "Reads three integers and prints the average, keeping decimals.",
    code: String.raw`#include <stdio.h>

int main(void) {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    float average = (a + b + c) / 3.0;
    printf("Average: %.2f\n", average);
    return 0;
}`,
    stdin: "70 85 90",
  },
];

// Every playground classic is also a catalog entry.
for (const sample of PLAYGROUND_SAMPLES) {
  register(sample.code, sample.stdin, expectedForSample(sample.name));
}

/** Recorded outputs for the six classics (verified by hand). */
function expectedForSample(name: string): string {
  switch (name) {
    case "Hello, World!":
      return "Hello, World!\n";
    case "Sum of two numbers":
      return "Sum: 23\n";
    case "Area of a circle":
      return "Area: 78.54\n";
    case "Print 1 to 5 with a loop":
      return "1 2 3 4 5 \n";
    case "Largest of two (if-else)":
      return "Largest: 14\n";
    case "Average of three numbers":
      return "Average: 81.67\n";
    default:
      return "";
  }
}

/** Look up a program in the catalog; null means an honest miss. */
export function lookupCatalog(code: string): CatalogEntry | null {
  return catalog.get(normalizeSource(code)) ?? null;
}

/** Number of registered programs (used in tests). */
export function catalogSize(): number {
  return catalog.size;
}
