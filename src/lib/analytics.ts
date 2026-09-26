import type {
  Lesson,
  Problem,
  Progress,
  Quiz,
  QuizAttempt,
  Submission,
} from "./db/types";
import type { Topic } from "./curriculum/topics";

/**
 * Pure progress/aggregation logic shared by the student dashboard, the
 * teacher dashboard and the CSV export. No store access here - callers
 * pass plain rows - so every function is directly unit-testable.
 */

// ---------------------------------------------------------------------------
// Student overview
// ---------------------------------------------------------------------------

export interface StudentOverviewInput {
  progress: Progress[];
  publishedLessons: Lesson[];
  submissions: Submission[];
  quizAttempts: QuizAttempt[];
  now?: Date;
}

export interface StudentOverview {
  lessonsCompleted: number;
  lessonsTotal: number;
  problemsAttempted: number;
  problemsSolved: number;
  /** Mean percent over all quiz attempts, rounded; null when none yet. */
  avgQuizPercent: number | null;
  /** Distinct days with any recorded activity in the last 30 days. */
  activeDays30: number;
}

export function computeStudentOverview({
  progress,
  publishedLessons,
  submissions,
  quizAttempts,
  now = new Date(),
}: StudentOverviewInput): StudentOverview {
  const publishedSlugs = new Set(publishedLessons.map((l) => l.slug));
  const lessonsCompleted = progress.filter((p) => publishedSlugs.has(p.lessonSlug)).length;

  const attemptedProblems = new Set(submissions.map((s) => s.problemId));
  const solvedProblems = new Set(
    submissions.filter((s) => s.status === "accepted").map((s) => s.problemId),
  );

  const avgQuizPercent =
    quizAttempts.length === 0
      ? null
      : Math.round(
          (quizAttempts.reduce(
            (sum, a) => sum + (a.total === 0 ? 0 : (a.score / a.total) * 100),
            0,
          ) /
            quizAttempts.length),
        );

  const cutoff = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  const dayStamps = new Set<string>();
  for (const iso of [
    ...progress.map((p) => p.completedAt),
    ...quizAttempts.map((a) => a.createdAt),
    ...submissions.map((s) => s.createdAt),
  ]) {
    const time = new Date(iso).getTime();
    if (!Number.isNaN(time) && time >= cutoff && time <= now.getTime() + 24 * 60 * 60 * 1000) {
      dayStamps.add(iso.slice(0, 10));
    }
  }

  return {
    lessonsCompleted,
    lessonsTotal: publishedLessons.length,
    problemsAttempted: attemptedProblems.size,
    problemsSolved: solvedProblems.size,
    avgQuizPercent,
    activeDays30: dayStamps.size,
  };
}

// ---------------------------------------------------------------------------
// Topic mastery
// ---------------------------------------------------------------------------

export interface TopicMastery {
  topicSlug: string;
  topicTitle: string;
  /** 0-100. Lesson completion alone, or a 50/50 blend with the best quiz
   * score when the student attempted the topic's quiz. */
  percent: number;
  completedLessons: number;
  totalLessons: number;
  bestQuizPercent: number | null;
}

export interface TopicMasteryInput {
  topics: Topic[];
  publishedLessons: Lesson[];
  progress: Progress[];
  quizAttempts: QuizAttempt[];
  quizzes: Quiz[];
}

export function computeTopicMastery({
  topics,
  publishedLessons,
  progress,
  quizAttempts,
  quizzes,
}: TopicMasteryInput): TopicMastery[] {
  const completedSlugs = new Set(progress.map((p) => p.lessonSlug));
  const topicByQuizId = new Map(quizzes.map((q) => [q.id, q.topicSlug]));

  const bestQuizByTopic = new Map<string, number>();
  for (const attempt of quizAttempts) {
    const topicSlug = topicByQuizId.get(attempt.quizId);
    if (!topicSlug || attempt.total === 0) continue;
    const percent = Math.round((attempt.score / attempt.total) * 100);
    const best = bestQuizByTopic.get(topicSlug);
    if (best === undefined || percent > best) {
      bestQuizByTopic.set(topicSlug, percent);
    }
  }

  return topics
    .map((topic) => {
      const lessons = publishedLessons.filter((l) => l.topicSlug === topic.slug);
      const completed = lessons.filter((l) => completedSlugs.has(l.slug)).length;
      const lessonPct = lessons.length === 0 ? 0 : (completed / lessons.length) * 100;
      const bestQuizPercent = bestQuizByTopic.get(topic.slug) ?? null;
      const percent =
        bestQuizPercent === null
          ? Math.round(lessonPct)
          : Math.round(0.5 * lessonPct + 0.5 * bestQuizPercent);
      return {
        topicSlug: topic.slug,
        topicTitle: topic.title,
        percent,
        completedLessons: completed,
        totalLessons: lessons.length,
        bestQuizPercent,
      };
    })
    .filter((m) => m.totalLessons > 0); // chart only topics that teach something
}

// ---------------------------------------------------------------------------
// Recommended next lesson
// ---------------------------------------------------------------------------

export interface Recommendation {
  topic: Topic;
  lesson: Lesson;
}

export interface RecommendationInput {
  topics: Topic[];
  publishedLessons: Lesson[];
  progress: Progress[];
}

/**
 * The first topic in curriculum order whose published lesson exists and is
 * not yet completed by this student. Returns null when everything published
 * is done (the dashboard then celebrates instead of recommending).
 */
export function recommendedNextLesson({
  topics,
  publishedLessons,
  progress,
}: RecommendationInput): Recommendation | null {
  const completedSlugs = new Set(progress.map((p) => p.lessonSlug));
  const lessonByTopic = new Map(publishedLessons.map((l) => [l.topicSlug, l]));
  for (const topic of [...topics].sort((a, b) => a.order - b.order)) {
    const lesson = lessonByTopic.get(topic.slug);
    if (lesson && !completedSlugs.has(lesson.slug)) {
      return { topic, lesson };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Recent activity
// ---------------------------------------------------------------------------

export type ActivityKind = "lesson" | "quiz" | "problem";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  /** ISO timestamp. */
  at: string;
  title: string;
  detail: string;
}

export interface RecentActivityInput {
  progress: Progress[];
  quizAttempts: QuizAttempt[];
  submissions: Submission[];
  lessonsBySlug: Map<string, Lesson>;
  quizzesById: Map<string, Quiz>;
  problemsById: Map<string, Problem>;
  limit?: number;
}

export function buildRecentActivity({
  progress,
  quizAttempts,
  submissions,
  lessonsBySlug,
  quizzesById,
  problemsById,
  limit = 8,
}: RecentActivityInput): ActivityItem[] {
  const lessonItems: ActivityItem[] = progress.map((p) => ({
    id: p.id,
    kind: "lesson",
    at: p.completedAt,
    title: lessonsBySlug.get(p.lessonSlug)?.title ?? p.lessonSlug,
    detail: "Lesson completed",
  }));
  const quizItems: ActivityItem[] = quizAttempts.map((a) => ({
    id: a.id,
    kind: "quiz",
    at: a.createdAt,
    title: quizzesById.get(a.quizId)?.title ?? "Topic quiz",
    detail: `Quiz scored ${a.score}/${a.total}`,
  }));
  const problemItems: ActivityItem[] = submissions.map((s) => ({
    id: s.id,
    kind: "problem",
    at: s.createdAt,
    title: problemsById.get(s.problemId)?.title ?? "Practice problem",
    detail:
      s.status === "accepted" ? "Problem solved (accepted)" : "Attempt recorded (not accepted yet)",
  }));

  return [...lessonItems, ...quizItems, ...problemItems]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Class progress + CSV export
// ---------------------------------------------------------------------------

export interface ClassProgressRow {
  name: string;
  email: string;
  lessonsCompleted: number;
  lessonsTotal: number;
  /** Mean percent over all attempts, rounded; null when the student has none. */
  quizAvgPercent: number | null;
  problemsSolved: number;
  problemsAttempted: number;
  /** ISO timestamp of the newest activity row, null when inactive. */
  lastActiveAt: string | null;
}

/** Quote a CSV field when it contains a comma, quote or newline; escape quotes by doubling. */
export function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const CSV_COLUMNS = [
  "name",
  "email",
  "lessons completed",
  "quiz average %",
  "problems solved",
  "problems attempted",
  "last active",
] as const;

/** Build the teacher CSV export from class rows: header + one line per student. */
export function toClassProgressCsv(rows: ClassProgressRow[]): string {
  const lines = [CSV_COLUMNS.join(",")];
  for (const row of rows) {
    lines.push(
      [
        escapeCsvField(row.name),
        escapeCsvField(row.email),
        `${row.lessonsCompleted}/${row.lessonsTotal}`,
        row.quizAvgPercent === null ? "" : String(row.quizAvgPercent),
        String(row.problemsSolved),
        String(row.problemsAttempted),
        row.lastActiveAt ?? "",
      ].join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

/** Newest activity timestamp across the three activity sources, or null. */
export function lastActiveDate(
  progress: Progress[],
  quizAttempts: QuizAttempt[],
  submissions: Submission[],
): string | null {
  const stamps = [
    ...progress.map((p) => p.completedAt),
    ...quizAttempts.map((a) => a.createdAt),
    ...submissions.map((s) => s.createdAt),
  ].sort((a, b) => b.localeCompare(a));
  return stamps[0] ?? null;
}
