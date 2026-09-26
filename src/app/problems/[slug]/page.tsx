import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui";
import { CodeBlock } from "@/components/learn/CodeBlock";
import { ProblemRunPanel } from "@/components/problems/ProblemRunPanel";
import { getSessionUser } from "@/lib/auth/guards";
import { getStore } from "@/lib/db";
import { problemSolutions } from "@/lib/db/seeds/problems-1";
import { getTopicBySlug } from "@/lib/curriculum/topics";
import type { Difficulty } from "@/lib/db/types";

export const dynamic = "force-dynamic";

const DIFFICULTY_TONES: Record<Difficulty, "success" | "warning" | "danger"> = {
  easy: "success",
  medium: "warning",
  hard: "danger",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStore();
  const problem = await store.getProblemBySlug(slug);
  return { title: problem?.title ?? "Problem" };
}

export default async function ProblemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStore();
  const problem = await store.getProblemBySlug(slug);
  // Spec 15.4: unpublished problems must never appear on public pages.
  if (!problem || problem.status !== "published") notFound();

  const topic = getTopicBySlug(problem.topicSlug);
  const user = await getSessionUser();
  const solutionCode = problemSolutions[problem.slug];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <Link
        href="/problems"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Problem Library
      </Link>

      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-fg">
          {problem.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={DIFFICULTY_TONES[problem.difficulty]}>
            {problem.difficulty}
          </Badge>
          {topic && (
            <Link href={`/learn/${topic.slug}`}>
              <Badge tone="accent">{topic.title}</Badge>
            </Link>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="statement-heading">
            <h2 id="statement-heading" className="text-lg font-semibold text-fg">
              Statement
            </h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-fg">
              {problem.statement}
            </p>
          </section>

          <section aria-labelledby="constraints-heading">
            <h2 id="constraints-heading" className="text-lg font-semibold text-fg">
              Constraints
            </h2>
            <p className="mt-2 rounded-lg border border-border bg-surface-2 p-4 text-sm leading-relaxed text-muted">
              {problem.constraints}
            </p>
          </section>

          <section aria-labelledby="samples-heading">
            <h2 id="samples-heading" className="text-lg font-semibold text-fg">
              Sample
            </h2>
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <CodeBlock code={problem.sampleInput} label="Sample input" />
              <CodeBlock code={problem.sampleOutput} label="Expected output" />
            </div>
          </section>

          <section aria-labelledby="hint-heading">
            <h2 id="hint-heading" className="text-lg font-semibold text-fg">
              Hint
            </h2>
            <details className="group mt-2 rounded-lg border border-border bg-surface">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                <span className="inline-flex items-center gap-1.5">
                  <ChevronRight
                    className="size-4 transition-transform group-open:rotate-90"
                    aria-hidden="true"
                  />
                  Reveal hint
                </span>
              </summary>
              <p className="border-t border-border px-4 py-3 text-sm leading-relaxed text-fg">
                {problem.hint}
              </p>
            </details>
          </section>

          <section aria-labelledby="solution-heading">
            <h2 id="solution-heading" className="text-lg font-semibold text-fg">
              Solution
            </h2>
            <details className="group mt-2 rounded-lg border border-border bg-surface">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                <span className="inline-flex items-center gap-1.5">
                  <ChevronRight
                    className="size-4 transition-transform group-open:rotate-90"
                    aria-hidden="true"
                  />
                  View solution and explanation
                </span>
              </summary>
              <div className="flex flex-col gap-4 border-t border-border px-4 py-4">
                <p className="text-sm leading-relaxed text-fg">
                  {problem.solutionExplanation}
                </p>
                {solutionCode && <CodeBlock code={solutionCode} label="Reference solution" />}
                <p className="text-xs text-muted">
                  Study it, then hide it and rewrite the program from memory -
                  that is how the pattern sticks. Copy-pasting it into the
                  editor will run, but teaches nothing.
                </p>
              </div>
            </details>
          </section>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <section aria-labelledby="solve-heading">
            <h2 id="solve-heading" className="mb-3 text-lg font-semibold text-fg">
              Solve it
            </h2>
            <ProblemRunPanel
              slug={problem.slug}
              starterCode={problem.starterCode}
              sampleInput={problem.sampleInput}
              expectedOutput={problem.expectedOutput}
              canRecord={!!user}
            />
            {!user && (
              <p className="mt-3 text-sm text-muted">
                <Link
                  href={`/login?next=/problems/${problem.slug}`}
                  className="font-medium text-accent hover:underline"
                >
                  Sign in
                </Link>{" "}
                to record your attempts and track solved problems.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
