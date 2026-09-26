import type { Lesson } from "../types";
import { part5Lessons } from "./lesson-content/part-5";
import { part6Lessons } from "./lesson-content/part-6";
import { part7Lessons } from "./lesson-content/part-7";
import { part8Lessons } from "./lesson-content/part-8";

/**
 * Seed lessons for topics 09-15 (chunk C of the curriculum).
 * All seven are published, which brings the curriculum to 13 published
 * lessons (plus the two drafts in lessons-1.ts that exercise the
 * publish rule).
 */
export const seedLessons2: Lesson[] = [
  ...part5Lessons,
  ...part6Lessons,
  ...part7Lessons,
  ...part8Lessons,
];
