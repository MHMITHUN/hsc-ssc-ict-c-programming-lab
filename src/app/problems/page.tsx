import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Badge, EmptyState } from "@/components/ui";
import { ProblemFilters } from "@/components/problems/ProblemFilters";
import { Pagination } from "@/components/problems/Pagination";
import { getSessionUser } from "@/lib/auth/guards";
import { getStore } from "@/lib/db";
import type { Problem, Difficulty } from "@/lib/db/types";
import { listTopics } from "@/lib/curriculum/topics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Problem Library",
  description:
    "Practice C programming problems for SSC and HSC ICT - filter by topic and difficulty, search by title, run your solution and compare with the expected output.",
};

const PAGE_SIZE = 10;

const DIFFICULTY_TONES: Record<Difficulty, "success" | "warning" | "danger"> = {
  easy: "success",
  medium: "warning",
  hard: "danger",
};

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q)?.slice(0, 100);
  const difficultyParam = firstParam(sp.difficulty);
  const difficulty =
    difficultyParam === "easy" || difficultyParam === "medium" || difficultyParam === "hard"
      ? difficultyParam
      : undefined;
  const statusParam = firstParam(sp.status);
  const status = statusParam === "solved" || statusParam === "unsolved" ? statusParam : undefined;
  const page = Math.max(1, Number.parseInt(firstParam(sp.page) ?? "1", 10) || 1);

  const topicSlugs = new Set(listTopics().map((t) => t.slug));
  const topicParam = firstParam(sp.topic);
  const topic = topicParam && topicSlugs.has(topicParam) ? topicParam : undefined;

  const store = await getStore();
  const user = await getSessionUser();
  const solvedIds = user
    ? new Set(
        (await store.listSubmissionsByUser(user.id))
          .filter((s) => s.status === "accepted")
          .map((s) => s.problemId),
      )
    : new Set<string>();

  let items: Problem[];
  let total: number;
  if (status && user) {
    // Solved status is per-user, so this filter is applied over the full
    // published list and paginated here (the store cannot know "solved").
    const all = await store.listPublishedProblems(topic);
    const filtered = all.filter((p) => {
      if (difficulty && p.difficulty !== difficulty) return false;
      if (q && !p.title.toLowerCase().includes(q.toLowerCase())) return false;
      const solved = solvedIds.has(p.id);
      return status === "solved" ? solved : !solved;
    });
    total = filtered.length;
    items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  } else {
    const result = await store.listProblems({
      status: "published",
      topicSlug: topic,
      difficulty,
      q,
      page,
      pageSize: PAGE_SIZE,
    });
    items = result.items;
    total = result.total;
  }

  const topicTitles = new Map(listTopics().map((t) => [t.slug, t.title]));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Problem Library
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          {total} published practice problem{total === 1 ? "" : "s"}. Write your
          solution in the editor on each problem page, run it against the
          sample input and compare your output with the expected one.
        </p>
      </header>

      <ProblemFilters
        topics={listTopics().map((t) => ({ slug: t.slug, title: t.title }))}
        current={{ topic, difficulty, status, q }}
        showStatus={!!user}
      />

      {items.length === 0 ? (
        <EmptyState
          title="No problems match"
          description="Try clearing the search box or picking a different topic or difficulty."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-surface">
          {items.map((problem) => {
            const solved = solvedIds.has(problem.id);
            return (
              <li key={problem.slug}>
                <Link
                  href={`/problems/${problem.slug}`}
                  className="flex items-center gap-4 px-4 py-4 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-fg">{problem.title}</span>
                      {solved && (
                        <Badge tone="success">
                          <CheckCircle2 className="mr-1 size-3" aria-hidden="true" />
                          Solved
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">
                      {problem.statement}
                    </p>
                  </div>
                  <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
                    <Badge tone={DIFFICULTY_TONES[problem.difficulty]}>
                      {problem.difficulty}
                    </Badge>
                    <span className="text-xs text-muted">
                      {topicTitles.get(problem.topicSlug) ?? problem.topicSlug}
                    </span>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        params={{ topic, difficulty, status, q }}
        basePath="/problems"
      />
    </div>
  );
}
