import { describe, it, expect } from "vitest";
import { TOPICS, listTopics } from "@/lib/curriculum/topics";
import { seedLessons } from "@/lib/db/seeds/lessons-1";
import { seedLessons2 } from "@/lib/db/seeds/lessons-2";
import { seedProblems } from "@/lib/db/seeds/problems-1";
import { seedProblems2 } from "@/lib/db/seeds/problems-2";
import { seedQuizzes } from "@/lib/db/seeds/quizzes";

/**
 * Curriculum integrity: the 15 topics are ordered, every seeded lesson and
 * problem maps onto a real topic, and every slug is unique (slugs are the
 * public URL keys and the store's upsert keys).
 */

const ALL_LESSONS = [...seedLessons, ...seedLessons2];
const ALL_PROBLEMS = [...seedProblems, ...seedProblems2];
const TOPIC_SLUGS = new Set(TOPICS.map((t) => t.slug));

describe("topic list", () => {
  it("has exactly 15 topics", () => {
    expect(TOPICS.length).toBe(15);
    expect(new Set(TOPIC_SLUGS).size).toBe(15); // topic slugs unique
  });

  it("is ordered 1..15 with no gaps or duplicates", () => {
    const orders = listTopics().map((t) => t.order);
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  });

  it("carries a title, description and audience on every topic", () => {
    for (const topic of TOPICS) {
      expect(topic.title.length).toBeGreaterThan(0);
      expect(topic.description.length).toBeGreaterThan(20);
      expect(["SSC", "HSC", "both"]).toContain(topic.audience);
    }
  });
});

describe("seeded lessons map onto the curriculum", () => {
  it("every lesson topicSlug is a real topic slug", () => {
    expect(ALL_LESSONS.length).toBe(15);
    for (const lesson of ALL_LESSONS) {
      expect(
        TOPIC_SLUGS.has(lesson.topicSlug),
        `lesson ${lesson.slug} references unknown topic ${lesson.topicSlug}`,
      ).toBe(true);
    }
  });

  it("has unique lesson slugs", () => {
    const slugs = ALL_LESSONS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keeps the expected publish split: 13 published + 2 drafts", () => {
    const published = ALL_LESSONS.filter((l) => l.status === "published");
    const drafts = ALL_LESSONS.filter((l) => l.status === "draft");
    expect(published.length).toBe(13);
    expect(drafts.map((d) => d.slug).sort()).toEqual([
      "arithmetic-operators",
      "series-problems",
    ]);
  });
});

describe("seeded problems map onto the curriculum", () => {
  it("every problem topicSlug is a real topic slug", () => {
    expect(ALL_PROBLEMS.length).toBe(30);
    for (const problem of ALL_PROBLEMS) {
      expect(
        TOPIC_SLUGS.has(problem.topicSlug),
        `problem ${problem.slug} references unknown topic ${problem.topicSlug}`,
      ).toBe(true);
    }
  });

  it("has unique problem slugs", () => {
    const slugs = ALL_PROBLEMS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("seeded quizzes map onto the curriculum", () => {
  it("every quiz topicSlug is a real topic slug and slugs are unique", () => {
    expect(seedQuizzes.length).toBeGreaterThanOrEqual(6);
    const slugs = seedQuizzes.map((q) => q.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const quiz of seedQuizzes) {
      expect(
        TOPIC_SLUGS.has(quiz.topicSlug),
        `quiz ${quiz.slug} references unknown topic ${quiz.topicSlug}`,
      ).toBe(true);
    }
  });
});
