import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CheckCircle2, Clock } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui";
import { TopicFilters } from "@/components/learn/TopicFilters";
import { getSessionUser } from "@/lib/auth/guards";
import { getStore } from "@/lib/db";
import { listTopics, filterTopics, LEVEL_LABELS } from "@/lib/curriculum/topics";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Curriculum",
  description:
    "Fifteen C programming topics for SSC and HSC ICT, from program structure to debugging - filter by level, audience and kind.",
};

const LEVEL_TONES = {
  beginner: "success",
  intermediate: "accent",
  advanced: "warning",
} as const;

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const level = firstParam(sp.level);
  const audience = firstParam(sp.audience);
  const kind = firstParam(sp.kind);

  const store = await getStore();
  const lessons = await store.listPublishedLessons();
  const lessonByTopic = new Map(lessons.map((l) => [l.topicSlug, l]));

  const user = await getSessionUser();
  const completedSlugs = user
    ? new Set((await store.listProgressByUser(user.id)).map((p) => p.lessonSlug))
    : new Set<string>();

  const allTopics = listTopics();
  const topics = filterTopics(allTopics, { level, audience, kind });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Curriculum Explorer
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Fifteen topics in teaching order, from your first program to
          debugging. Topics marked for both SSC and HSC appear in either view.
          Each topic with a published lesson opens a full lesson page with an
          annotated example, a dry-run trace and a practice task.
        </p>
      </header>

      <TopicFilters level={level} audience={audience} kind={kind} />

      <p className="text-sm text-muted" aria-live="polite">
        Showing {topics.length} of {allTopics.length} topics
      </p>

      {topics.length === 0 ? (
        <EmptyState
          title="No topics match these filters"
          description="Try removing a filter - for example, clear the level to see every topic."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => {
            const lesson = lessonByTopic.get(topic.slug);
            const completed = lesson
              ? completedSlugs.has(lesson.slug)
              : false;
            const card = (
              <div
                className={cn(
                  "flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors",
                  lesson ? "hover:border-accent/40" : "opacity-80",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-muted">
                    {String(topic.order).padStart(2, "0")}
                  </span>
                  {completed && (
                    <Badge tone="success">
                      <CheckCircle2 className="mr-1 size-3" aria-hidden="true" />
                      Completed
                    </Badge>
                  )}
                </div>
                <h2 className="text-base font-semibold leading-snug text-fg">
                  {topic.title}
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={LEVEL_TONES[topic.level]}>
                    {LEVEL_LABELS[topic.level]}
                  </Badge>
                  <Badge tone="neutral">
                    {topic.audience === "both" ? "SSC + HSC" : topic.audience}
                  </Badge>
                  <Badge tone="neutral">
                    {topic.kind === "both" ? "Practical + Theory" : topic.kind}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-muted">
                  {topic.description}
                </p>
                <div className="mt-auto flex items-center gap-2 pt-2 text-sm">
                  {lesson ? (
                    completed ? (
                      <span className="flex items-center gap-1.5 font-medium text-success">
                        <CheckCircle2 className="size-4" aria-hidden="true" />
                        Lesson completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-medium text-accent">
                        <BookOpen className="size-4" aria-hidden="true" />
                        Start the lesson
                      </span>
                    )
                  ) : (
                    <span className="flex items-center gap-1.5 text-muted">
                      <Clock className="size-4" aria-hidden="true" />
                      Lesson coming soon
                    </span>
                  )}
                </div>
              </div>
            );

            return (
              <li key={topic.slug}>
                <Link
                  href={`/learn/${topic.slug}`}
                  className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {card}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
