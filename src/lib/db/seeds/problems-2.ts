import type { Problem } from "../types";
import { problemsC, solutionsC } from "./problem-content/c";
import { problemsD, solutionsD } from "./problem-content/d";

/**
 * Second seed batch (chunk C): 15 problems on topics 09-15 plus fresh
 * practice for earlier topics, all published - bringing the bank to 30
 * problems. The reference solutions here feed the demo execution catalog
 * and the "View solution" reveal, exactly like problems-1.ts.
 */
export const seedProblems2: Problem[] = [...problemsC, ...problemsD];

/** Reference solution per new problem slug (exact, runnable C programs). */
export const problemSolutions2: Record<string, string> = {
  ...solutionsC,
  ...solutionsD,
};
