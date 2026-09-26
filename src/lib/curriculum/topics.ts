import type { LessonAudience, LessonLevel } from "@/lib/db/types";

/**
 * The 15 curriculum topics (spec 15.2B), in teaching order.
 * Topics without a published lesson yet render as "coming soon" on /learn.
 */

export interface Topic {
  slug: string;
  /** 1-15, drives ordering everywhere. */
  order: number;
  title: string;
  level: LessonLevel;
  audience: LessonAudience;
  kind: "practical" | "theory" | "both";
  description: string;
}

export const TOPICS: Topic[] = [
  {
    slug: "program-structure",
    order: 1,
    title: "Program Structure",
    level: "beginner",
    audience: "SSC",
    kind: "practical",
    description:
      "Every C program starts with the same skeleton: headers, main(), and return. Learn what each piece does before writing any logic of your own.",
  },
  {
    slug: "variables-and-data-types",
    order: 2,
    title: "Variables and Data Types",
    level: "beginner",
    audience: "both",
    kind: "both",
    description:
      "A variable is a labelled box in memory. This topic covers int, float, char and how to pick the right box for marks, GPA or a grade letter.",
  },
  {
    slug: "input-output",
    order: 3,
    title: "Input / Output",
    level: "beginner",
    audience: "both",
    kind: "practical",
    description:
      "printf shows results, scanf reads from the keyboard. Almost every ICT practical exam question begins with these two functions.",
  },
  {
    slug: "arithmetic-operators",
    order: 4,
    title: "Arithmetic Operators",
    level: "beginner",
    audience: "SSC",
    kind: "both",
    description:
      "Add, subtract, multiply, divide and take remainders with +, -, *, / and %. The surprise for most students is integer division and the modulus operator.",
  },
  {
    slug: "conditional-statements",
    order: 5,
    title: "Conditional Statements",
    level: "beginner",
    audience: "both",
    kind: "practical",
    description:
      "Programs make decisions with if, else if and else. This is how you turn marks into pass/fail or a letter grade, just like the grading table in your exam syllabus.",
  },
  {
    slug: "loops",
    order: 6,
    title: "Loops",
    level: "intermediate",
    audience: "both",
    kind: "practical",
    description:
      "Loops repeat work while a condition stays true. Summing 1 to 100 or printing a multiplication table without loops would mean typing a hundred lines.",
  },
  {
    slug: "series-problems",
    order: 7,
    title: "Series Problems",
    level: "intermediate",
    audience: "HSC",
    kind: "practical",
    description:
      "Classic HSC series such as 1 + 2 + 3 + ... + N or 1 - 2 + 3 - 4 + ... are just loops with a small twist in how each term is produced.",
  },
  {
    slug: "arrays",
    order: 8,
    title: "Arrays",
    level: "intermediate",
    audience: "HSC",
    kind: "practical",
    description:
      "An array stores many values under one name with numbered seats, starting at 0. Perfect for holding the marks of a whole class and finding the highest.",
  },
  {
    slug: "strings",
    order: 9,
    title: "Strings",
    level: "intermediate",
    audience: "HSC",
    kind: "practical",
    description:
      "A string in C is an array of characters ending with the null character. Learn how names, sentences and library functions like strlen actually work.",
  },
  {
    slug: "functions",
    order: 10,
    title: "Functions",
    level: "intermediate",
    audience: "HSC",
    kind: "both",
    description:
      "Functions package a block of logic with a name, inputs and a return value. They keep programs short, testable and ready for the board exam's common questions.",
  },
  {
    slug: "recursion",
    order: 11,
    title: "Recursion",
    level: "advanced",
    audience: "HSC",
    kind: "both",
    description:
      "A recursive function calls itself on a smaller piece of the problem. Factorial and Fibonacci are the two examples every HSC student must trace by hand.",
  },
  {
    slug: "pointers",
    order: 12,
    title: "Pointers",
    level: "advanced",
    audience: "HSC",
    kind: "both",
    description:
      "A pointer stores an address instead of a value. This is the topic that separates remembering syntax from truly understanding memory.",
  },
  {
    slug: "structures",
    order: 13,
    title: "Structures",
    level: "intermediate",
    audience: "HSC",
    kind: "both",
    description:
      "A structure groups related fields — roll, name, marks — into one custom type, the C foundation of the records you study in your database chapter.",
  },
  {
    slug: "file-handling",
    order: 14,
    title: "File Handling",
    level: "advanced",
    audience: "HSC",
    kind: "both",
    description:
      "Variables vanish when a program ends; files persist. fopen, fprintf and fclose let a program remember results between runs.",
  },
  {
    slug: "debugging",
    order: 15,
    title: "Debugging",
    level: "intermediate",
    audience: "both",
    kind: "practical",
    description:
      "Reading compiler messages, tracing variables by hand and shrinking a broken program until the bug shows itself — the skill that saves exam time.",
  },
];

export function getTopicBySlug(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

/** Topics sorted by curriculum order (they are already stored in order). */
export function listTopics(): Topic[] {
  return [...TOPICS].sort((a, b) => a.order - b.order);
}

/**
 * Filter topics for /learn. Each active filter keeps topics that directly
 * match OR are marked "both" (a topic for "both" levels/audiences/kinds
 * belongs in every one of those views).
 */
export function filterTopics(
  topics: Topic[],
  filters: { level?: string; audience?: string; kind?: string },
): Topic[] {
  return topics.filter((t) => {
    if (
      filters.level &&
      t.level !== filters.level
    ) {
      return false;
    }
    if (
      filters.audience &&
      t.audience !== filters.audience &&
      t.audience !== "both"
    ) {
      return false;
    }
    if (filters.kind && t.kind !== filters.kind && t.kind !== "both") {
      return false;
    }
    return true;
  });
}

export const LEVEL_LABELS: Record<LessonLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
