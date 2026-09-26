import type { Lesson } from "../types";
import { part1Lessons } from "./lesson-content/part-1";
import { part2Lessons } from "./lesson-content/part-2";
import { part3Lessons } from "./lesson-content/part-3";
import { part4Lessons } from "./lesson-content/part-4";

/**
 * Seed lessons for topics 01-08 (chunk B of the curriculum).
 * Six published, two drafts (arithmetic-operators, series-problems) to
 * exercise the publish rule. Chunk C adds lessons-2.ts for topics 09-15.
 */
export const seedLessons: Lesson[] = [
  ...part1Lessons,
  ...part2Lessons,
  ...part3Lessons,
  ...part4Lessons,
];
