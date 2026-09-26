import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Flame,
  Trophy,
} from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ProgressBar,
  Table,
  TableBody,
  TD,
  TH,
  TableHead,
  TableRow,
} from "@/components/ui";
import { StatCards } from "@/components/analytics/StatCards";
import { TopicMasteryChart } from "@/components/dashboard/TopicMasteryChart";
import { requireRole } from "@/lib/auth/guards";
import { getStore } from "@/lib/db";
import { listTopics } from "@/lib/curriculum/topics";
import {
  buildRecentActivity,
  computeStudentOverview,
  computeTopicMastery,
  recommendedNextLesson,
} from "@/lib/analytics";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Dashboard",
  description: "Your lessons, problem practice, quiz scores and topic mastery.",
};

const SUBMISSION_TONES = {
  accepted: "success",
  wrong_answer: "danger",
  error: "warning",
  pending: "neutral",
  reviewed: "accent",
} as const;

const SUBMISSION_LABELS = {
  accepted: "Accepted",
  wrong_answer: "Wrong answer",
  error: "Runtime error",
  pending: "Pending",
  reviewed: "Reviewed",
} as const;

const ACTIVITY_ICONS = {
  lesson: BookOpenCheck,
  quiz: ClipboardCheck,
  problem: Code2,
} as const;

export default async function DashboardPage() {
  const user = await requireRole(["STUDENT"], "/dashboard");

  const store = await getStore();
  const [publishedLessons, progress, quizAttempts, submissions, quizzes, problems] =
    await Promise.all([
      store.listPublishedLessons(),
      store.listProgressByUser(user.id),
      store.listQuizAttemptsByUser(user.id),
      store.listSubmissionsByUser(user.id),
      store.listQuizzes(),
      store.listAllProblems(),
    ]);

  const overview = computeStudentOverview({
    progress,
    publishedLessons,
    submissions,
    quizAttempts,
  });

  const topics = listTopics();
  const mastery = computeTopicMastery({
    topics,
    publishedLessons,
    progress,
    quizAttempts,
    quizzes,
  });

  const recommendation = recommendedNextLesson({
    topics,
    publishedLessons,
    progress,
  });

  const lessonsBySlug = new Map(publishedLessons.map((l) => [l.slug, l]));
  const quizzesById = new Map(quizzes.map((q) => [q.id, q]));
  const problemsById = new Map(problems.map((p) => [p.id, p]));

  const activity = buildRecentActivity({
    progress,
    quizAttempts,
    submissions,
    lessonsBySlug,
    quizzesById,
    problemsById,
  });

  const recentSubmissions = submissions.slice(0, 6);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted">Signed in as {user.email}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Hello, {user.name.split(" ")[0]}
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Everything below is computed from your real records in this lab -
          lessons you marked complete, quizzes you submitted and problems you
          ran. Nothing here is a sample.
        </p>
      </header>

      <StatCards
        items={[
          {
            label: "Lessons completed",
            value: `${overview.lessonsCompleted}/${overview.lessonsTotal}`,
            hint: `${overview.lessonsTotal} published lessons in the curriculum`,
            icon: BookOpenCheck,
          },
          {
            label: "Problems attempted",
            value: String(overview.problemsAttempted),
            hint: `${overview.problemsSolved} solved (accepted)`,
            icon: Code2,
          },
          {
            label: "Average quiz score",
            value:
              overview.avgQuizPercent === null ? "-" : `${overview.avgQuizPercent}%`,
            hint:
              overview.avgQuizPercent === null
                ? "Take a topic quiz to start scoring"
                : `Across ${quizAttempts.length} attempt${quizAttempts.length === 1 ? "" : "s"}`,
            icon: ClipboardCheck,
          },
          {
            label: "Active in last 30 days",
            value: `${overview.activeDays30} ${overview.activeDays30 === 1 ? "day" : "days"}`,
            hint: "Days with a lesson, quiz or submission",
            icon: Flame,
          },
        ]}
      />

      <section aria-labelledby="next-lesson-heading">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-4 text-accent" aria-hidden="true" />
              <span id="next-lesson-heading">Recommended next</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendation ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-fg">
                    {String(recommendation.topic.order).padStart(2, "0")}.{" "}
                    {recommendation.lesson.title}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {recommendation.lesson.summary}
                  </p>
                </div>
                <Link href={`/learn/${recommendation.topic.slug}`} className="shrink-0">
                  <Button>
                    Continue learning
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            ) : (
              <Alert tone="success" title="Curriculum complete">
                You have completed every published lesson. Keep the streak
                alive in the{" "}
                <Link
                  href="/problems"
                  className="font-medium text-accent hover:underline"
                >
                  problem library
                </Link>{" "}
                - new lessons appear here as teachers publish them.
              </Alert>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="mastery-heading" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="mastery-heading" className="text-lg font-semibold text-fg">
            Topic mastery
          </h2>
          <p className="text-xs text-muted">
            50% lesson completion + 50% best quiz score for topics with a quiz
            you attempted; lesson completion alone otherwise.
          </p>
        </div>
        {mastery.length === 0 ? (
          <EmptyState
            title="No published lessons yet"
            description="Topic mastery appears once lessons are published and you start completing them."
          />
        ) : (
          <>
            <div className="rounded-xl border border-border bg-surface p-4">
              <TopicMasteryChart data={mastery} />
            </div>
            <Table>
              <caption className="px-4 pb-2 pt-3 text-left text-xs text-muted">
                Topic mastery data - the same numbers the chart above shows,
                listed for keyboard and screen-reader access.
              </caption>
              <TableHead>
                <TableRow>
                  <TH scope="col">Topic</TH>
                  <TH scope="col">Mastery</TH>
                  <TH scope="col">Lessons</TH>
                  <TH scope="col">Best quiz</TH>
                </TableRow>
              </TableHead>
              <TableBody>
                {mastery.map((m) => (
                  <TableRow key={m.topicSlug}>
                    <th
                      scope="row"
                      className="px-4 py-3 text-left text-sm font-medium text-fg"
                    >
                      {m.topicTitle}
                    </th>
                    <TD>
                      <ProgressBar
                        value={m.percent}
                        label={`${m.topicTitle} mastery`}
                        className="min-w-32"
                      />
                    </TD>
                    <TD>
                      {m.completedLessons}/{m.totalLessons}
                    </TD>
                    <TD>
                      {m.bestQuizPercent === null ? (
                        <span className="text-muted">No quiz yet</span>
                      ) : (
                        `${m.bestQuizPercent}%`
                      )}
                    </TD>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="activity-heading" className="flex flex-col gap-3">
          <h2 id="activity-heading" className="text-lg font-semibold text-fg">
            Recent activity
          </h2>
          {activity.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Complete a lesson, take a quiz or solve a problem and it will appear here."
              action={
                <Link
                  href="/learn"
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
                >
                  Start the first lesson
                </Link>
              }
            />
          ) : (
            <ol className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
              {activity.map((item) => {
                const Icon = ACTIVITY_ICONS[item.kind];
                return (
                  <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                      <Icon className="size-4 text-accent" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted">{item.detail}</p>
                    </div>
                    <time
                      dateTime={item.at}
                      className="shrink-0 text-xs text-muted"
                    >
                      {formatDate(item.at)}
                    </time>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section aria-labelledby="submissions-heading" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 id="submissions-heading" className="text-lg font-semibold text-fg">
              Recent submissions
            </h2>
            <Link
              href="/problems"
              className="text-sm font-medium text-accent hover:underline"
            >
              Practice more
            </Link>
          </div>
          {recentSubmissions.length === 0 ? (
            <EmptyState
              title="No submissions yet"
              description="Run your solution on any problem page and it will be recorded here."
            />
          ) : (
            <Table>
              <caption className="sr-only">
                Your recent problem submissions with status and date.
              </caption>
              <TableHead>
                <TableRow>
                  <TH scope="col">Problem</TH>
                  <TH scope="col">Status</TH>
                  <TH scope="col">Date</TH>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentSubmissions.map((s) => {
                  const problem = problemsById.get(s.problemId);
                  return (
                    <TableRow key={s.id}>
                      <th
                        scope="row"
                        className="px-4 py-3 text-left text-sm font-medium text-fg"
                      >
                        {problem ? (
                          <Link
                            href={`/problems/${problem.slug}`}
                            className="rounded-sm hover:text-accent hover:underline"
                          >
                            {problem.title}
                          </Link>
                        ) : (
                          "Removed problem"
                        )}
                      </th>
                      <TD>
                        <Badge tone={SUBMISSION_TONES[s.status]}>
                          {s.status === "accepted" && (
                            <CheckCircle2 className="mr-1 size-3" aria-hidden="true" />
                          )}
                          {SUBMISSION_LABELS[s.status]}
                        </Badge>
                      </TD>
                      <TD>
                        <time dateTime={s.createdAt} className="text-muted">
                          {formatDate(s.createdAt)}
                        </time>
                      </TD>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </section>
      </div>
    </div>
  );
}
