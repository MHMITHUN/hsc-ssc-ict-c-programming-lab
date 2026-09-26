import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Terminal,
} from "lucide-react";
import { Alert, Badge, Button, Card, CardContent, CardHeader, CardTitle, EmptyState } from "@/components/ui";
import { ConceptText } from "@/components/learn/ConceptText";
import { CodeBlock } from "@/components/learn/CodeBlock";
import { AnnotatedCode } from "@/components/learn/AnnotatedCode";
import { DryRunTable } from "@/components/learn/DryRunTable";
import { ConceptCheck } from "@/components/learn/ConceptCheck";
import { QuizPanel } from "@/components/learn/QuizPanel";
import { getSessionUser } from "@/lib/auth/guards";
import { getStore } from "@/lib/db";
import { getTopicBySlug } from "@/lib/curriculum/topics";
import { markLessonCompleteAction } from "@/app/actions/learning";

export const dynamic = "force-dynamic";

const LEVEL_TONES = {
  beginner: "success",
  intermediate: "accent",
  advanced: "warning",
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  return { title: topic ? topic.title : "Lesson" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const store = await getStore();
  const lesson = (await store.listPublishedLessons(topic.slug))[0] ?? null;

  const user = await getSessionUser();
  const completed = lesson
    ? user &&
      (await store.listProgressByUser(user.id)).some(
        (p) => p.lessonSlug === lesson.slug,
      )
    : false;

  const quiz = await store.getQuizByTopic(topic.slug);
  const relatedProblems = await store.listPublishedProblems(topic.slug);

  if (!lesson) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All topics
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {String(topic.order).padStart(2, "0")}. {topic.title}
        </h1>
        <EmptyState
          title="The lesson for this topic is coming soon"
          description="A teacher is preparing it. Meanwhile you can practise related problems or explore the topics that already have lessons."
          action={
            <Link
              href="/learn"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover"
            >
              Browse published lessons
            </Link>
          }
        />
        {relatedProblems.length > 0 && (
          <section className="flex flex-col gap-3" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-lg font-semibold text-fg">
              Related problems you can try now
            </h2>
            <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
              {relatedProblems.map((problem) => (
                <li key={problem.slug}>
                  <Link
                    href={`/problems/${problem.slug}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-surface-2"
                  >
                    <span className="font-medium text-fg">{problem.title}</span>
                    <Badge tone="neutral">{problem.difficulty}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    );
  }

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-4">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All topics
        </Link>
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-fg">
            {lesson.title}
          </h1>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={LEVEL_TONES[lesson.level]}>{lesson.level}</Badge>
            <Badge tone="neutral">
              {lesson.audience === "both" ? "SSC + HSC" : lesson.audience}
            </Badge>
            {completed && (
              <Badge tone="success">
                <CheckCircle2 className="mr-1 size-3" aria-hidden="true" />
                Completed
              </Badge>
            )}
          </div>
        </div>
      </header>

      <section aria-labelledby="objective-heading">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-5 text-accent" aria-hidden="true" />
          <h2 id="objective-heading" className="text-lg font-semibold text-fg">
            Learning objective
          </h2>
        </div>
        <p className="mt-3 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm leading-relaxed text-fg">
          {lesson.objective}
        </p>
      </section>

      <section aria-labelledby="concept-heading">
        <h2 id="concept-heading" className="text-lg font-semibold text-fg">
          Concept
        </h2>
        <div className="mt-3">
          <ConceptText markdown={lesson.conceptMd} />
        </div>
      </section>

      <section aria-labelledby="syntax-heading">
        <h2 id="syntax-heading" className="text-lg font-semibold text-fg">
          Syntax
        </h2>
        <CodeBlock code={lesson.syntax} label="Syntax" className="mt-3" />
      </section>

      <section aria-labelledby="example-heading">
        <h2 id="example-heading" className="text-lg font-semibold text-fg">
          Annotated example
        </h2>
        <p className="mt-1 text-sm text-muted">
          Click any line with an indigo number to read what it does.
        </p>
        <div className="mt-3">
          <AnnotatedCode code={lesson.example.code} annotations={lesson.example.annotations} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <CodeBlock
            code={lesson.sampleInput || "(no input - the program runs on its own)"}
            label="Sample input"
          />
          <CodeBlock code={lesson.sampleOutput} label="Sample output" />
        </div>
      </section>

      <section aria-labelledby="mistakes-heading">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-warning" aria-hidden="true" />
          <h2 id="mistakes-heading" className="text-lg font-semibold text-fg">
            Common mistakes (and how to fix them)
          </h2>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {lesson.mistakes.map((mistake, i) => (
            <li
              key={i}
              className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm leading-relaxed text-fg"
            >
              {mistake}
            </li>
          ))}
        </ul>
      </section>

      {lesson.dryRun && lesson.dryRun.length > 0 && (
        <section aria-labelledby="dryrun-heading">
          <div className="flex items-center gap-2">
            <ListChecks className="size-5 text-accent" aria-hidden="true" />
            <h2 id="dryrun-heading" className="text-lg font-semibold text-fg">
              Dry run: watch it happen step by step
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted">
            Step through the trace with the buttons - or press Play - to see
            how variables change for the sample input.
          </p>
          <div className="mt-3">
            <DryRunTable
              steps={lesson.dryRun}
              caption="Hand-authored trace for this lesson's sample input - written by a teacher, not a live debugger."
            />
          </div>
        </section>
      )}

      {lesson.checks && lesson.checks.length > 0 && (
        <section aria-labelledby="checks-heading">
          <h2 id="checks-heading" className="text-lg font-semibold text-fg">
            Check your understanding
          </h2>
          <p className="mt-1 text-sm text-muted">
            Instant feedback - these quick checks are for you alone and are not
            saved anywhere.
          </p>
          <div className="mt-3 flex flex-col gap-4">
            {lesson.checks.map((check, i) => (
              <ConceptCheck key={i} check={check} index={i} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="practice-heading">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="size-4 text-accent" aria-hidden="true" />
              Practice task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-fg">{lesson.practiceTask}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/playground"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
              >
                <Terminal className="size-4" aria-hidden="true" />
                Open the playground
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="progress-heading" className="rounded-xl border border-border bg-surface p-5">
        <h2 id="progress-heading" className="text-base font-semibold text-fg">
          Your progress
        </h2>
        {user ? (
          completed ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              You marked this lesson complete. Review any time - the record
              stays in your progress.
            </p>
          ) : (
            <form action={markLessonCompleteAction} className="mt-3">
              <input type="hidden" name="lessonSlug" value={lesson.slug} />
              <Button type="submit">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                Mark this lesson complete
              </Button>
              <p className="mt-2 text-xs text-muted">
                Saving is idempotent - pressing it twice never double-counts.
              </p>
            </form>
          )
        ) : (
          <p className="mt-2 text-sm text-muted">
            <Link href={`/login?next=/learn/${topic.slug}`} className="font-medium text-accent hover:underline">
              Sign in
            </Link>{" "}
            to track which lessons you have completed.
          </p>
        )}
      </section>

      {relatedProblems.length > 0 && (
        <section aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-lg font-semibold text-fg">
            Practise this topic
          </h2>
          <ul className="mt-3 flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
            {relatedProblems.map((problem) => (
              <li key={problem.slug}>
                <Link
                  href={`/problems/${problem.slug}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-surface-2"
                >
                  <span className="font-medium text-fg">{problem.title}</span>
                  <span className="flex items-center gap-2">
                    <Badge tone="neutral">{problem.difficulty}</Badge>
                    <ChevronRight className="size-4 text-muted" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {quiz && (
        <section aria-labelledby="quiz-heading">
          <h2 id="quiz-heading" className="text-lg font-semibold text-fg">
            Topic quiz: {quiz.title.replace(/^Quiz: /, "")}
          </h2>
          <p className="mt-1 text-sm text-muted">
            Five multiple-choice questions. Your score is graded on the server
            and recorded in your progress.
          </p>
          <div className="mt-4">
            {user ? (
              <QuizPanel
                quiz={{
                  slug: quiz.slug,
                  title: quiz.title,
                  questions: quiz.questions.map((q) => ({
                    id: q.id,
                    prompt: q.prompt,
                    options: q.options,
                  })),
                }}
              />
            ) : (
              <Alert tone="info" title="Sign in to take the quiz">
                Quiz attempts are graded and saved per student account, so the
                quiz needs a signed-in user.{" "}
                <Link
                  href={`/login?next=/learn/${topic.slug}`}
                  className="font-medium text-accent hover:underline"
                >
                  Sign in
                </Link>{" "}
                to attempt it.
              </Alert>
            )}
          </div>
        </section>
      )}
    </article>
  );
}
