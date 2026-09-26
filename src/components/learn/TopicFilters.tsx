"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Filter chips for the curriculum explorer (spec 15.2B). Chips toggle URL
 * params - the server re-filters topics, so the URL stays shareable.
 */

const GROUPS = [
  {
    key: "level",
    label: "Level",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
  },
  {
    key: "audience",
    label: "Audience",
    options: [
      { value: "SSC", label: "SSC" },
      { value: "HSC", label: "HSC" },
    ],
  },
  {
    key: "kind",
    label: "Kind",
    options: [
      { value: "practical", label: "Practical" },
      { value: "theory", label: "Theory" },
    ],
  },
] as const;

export function TopicFilters({
  level,
  audience,
  kind,
}: {
  level?: string;
  audience?: string;
  kind?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const active: Record<string, string | undefined> = { level, audience, kind };
  const anyActive = GROUPS.some((g) => active[g.key]);

  function setParam(key: string, value?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/learn?${qs}` : "/learn", { scroll: false });
    });
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-surface p-4",
        pending && "opacity-70",
      )}
      aria-busy={pending || undefined}
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {GROUPS.map((group) => (
          <div key={group.key} className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              {group.label}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {group.options.map((option) => {
                const isActive = active[group.key] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setParam(group.key, option.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                      isActive
                        ? "border-accent bg-accent text-accent-fg"
                        : "border-border bg-surface text-fg hover:bg-surface-2",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {anyActive && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              GROUPS.forEach((g) => params.delete(g.key));
              const qs = params.toString();
              startTransition(() => {
                router.push(qs ? `/learn?${qs}` : "/learn", { scroll: false });
              });
            }}
          >
            <X className="size-4" aria-hidden="true" />
            Clear filters
          </Button>
        )}
      </div>
      <p className="text-xs text-muted">
        Topics marked for both levels or both kinds appear in every matching
        view.
      </p>
    </div>
  );
}
