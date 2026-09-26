import type { Problem } from "../types";
import { problemsA, solutionsA } from "./problem-content/a";
import { problemsB, solutionsB } from "./problem-content/b";

/**
 * Seed problem bank (15 problems on topics 01-08, all published) plus the
 * reference solutions that feed the demo execution catalog and the
 * "View solution" reveal on each problem page.
 */
export const seedProblems: Problem[] = [...problemsA, ...problemsB];

/** Reference solution per problem slug (exact, runnable C programs). */
export const problemSolutions: Record<string, string> = {
  ...solutionsA,
  ...solutionsB,
};
