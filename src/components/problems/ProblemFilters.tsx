"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, X } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Filters for the problem library: title search, topic, difficulty and
 * (signed-in users) solved status. All state lives in the URL.
 */
export function ProblemFilters({
  topics,
  current,
  showStatus,
}: {
  topics: Array<{ slug: string; title: string }>;
  current: { topic?: string; difficulty?: string; status?: string; q?: string };
  showStatus: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function pushFrom(formData: FormData) {
    const params = new URLSearchParams(searchParams.toString());
    const q = String(formData.get("q") ?? "").trim();
    const topic = String(formData.get("topic") ?? "");
    const difficulty = String(formData.get("difficulty") ?? "");
    const status = String(formData.get("status") ?? "");
    if (q) params.set("q", q);
    else params.delete("q");
    if (topic) params.set("topic", topic);
    else params.delete("topic");
    if (difficulty) params.set("difficulty", difficulty);
    else params.delete("difficulty");
    if (status) params.set("status", status);
    else params.delete("status");
    params.delete("page"); // a new filter always restarts pagination
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/problems?${qs}` : "/problems", { scroll: false });
    });
  }

  const anyActive =
    current.q || current.topic || current.difficulty || current.status;

  return (
    <form
      ref={formRef}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-surface p-4",
        pending && "opacity-70",
      )}
      aria-busy={pending || undefined}
      data-testid="problem-filters"
      onSubmit={(e) => {
        e.preventDefault();
        pushFrom(new FormData(e.currentTarget));
      }}
      onChange={(e) => {
        if ((e.target as HTMLElement).tagName === "SELECT") {
          pushFrom(new FormData(e.currentTarget));
        }
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label htmlFor="problem-search" className="sr-only">
            Search problems by title
          </label>
          <Input
            id="problem-search"
            name="q"
            defaultValue={current.q ?? ""}
            placeholder="Search by title, e.g. factorial"
            maxLength={100}
          />
        </div>
        <div>
          <label htmlFor="problem-topic" className="sr-only">
            Filter by topic
          </label>
          <Select id="problem-topic" name="topic" defaultValue={current.topic ?? ""}>
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.title}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label htmlFor="problem-difficulty" className="sr-only">
            Filter by difficulty
          </label>
          <Select id="problem-difficulty" name="difficulty" defaultValue={current.difficulty ?? ""}>
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {showStatus && (
          <div className="w-44">
            <label htmlFor="problem-status" className="sr-only">
              Filter by solved status
            </label>
            <Select id="problem-status" name="status" defaultValue={current.status ?? ""}>
              <option value="">Any status</option>
              <option value="solved">Solved by me</option>
              <option value="unsolved">Not solved yet</option>
            </Select>
          </div>
        )}
        <Button type="submit" variant="outline" size="sm">
          <Search className="size-4" aria-hidden="true" />
          Search
        </Button>
        {anyActive && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              ["q", "topic", "difficulty", "status", "page"].forEach((k) =>
                params.delete(k),
              );
              const qs = params.toString();
              startTransition(() => {
                router.push(qs ? `/problems?${qs}` : "/problems");
              });
            }}
          >
            <X className="size-4" aria-hidden="true" />
            Clear
          </Button>
        )}
      </div>
    </form>
  );
}
