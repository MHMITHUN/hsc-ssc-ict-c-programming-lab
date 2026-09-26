"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { DryRunStep } from "@/lib/db/types";

/**
 * Dry-run visualizer (spec 15.2E): steps through a hand-authored trace with
 * prev/next controls, play/pause auto-advance and a highlighted current row.
 * This is a teaching trace, NOT a live debugger - pages label it as such.
 */

const PLAY_INTERVAL_MS = 1300;

export function DryRunTable({
  steps,
  caption,
}: {
  steps: DryRunStep[];
  caption?: string;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);

  const atEnd = index >= steps.length - 1;

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (index >= steps.length - 1) {
        setPlaying(false); // auto-stop after the final step
      } else {
        setIndex(index + 1);
      }
    }, PLAY_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [playing, index, steps.length]);

  useEffect(() => {
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    rowRefs.current[index]?.scrollIntoView({
      block: "nearest",
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, [index]);

  if (steps.length === 0) return null;
  const current = steps[index];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIndex(0);
            setPlaying(false);
          }}
          aria-label="Reset to step 1"
        >
          <SkipBack className="size-4" aria-hidden="true" />
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIndex((i) => Math.max(0, i - 1));
            setPlaying(false);
          }}
          disabled={index === 0}
          aria-label="Previous step"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Prev
        </Button>
        <Button
          size="sm"
          onClick={() => {
            if (atEnd) setIndex(0);
            setPlaying((p) => !p);
          }}
          aria-label={playing ? "Pause auto-play" : "Play steps automatically"}
        >
          {playing ? (
            <Pause className="size-4" aria-hidden="true" />
          ) : (
            <Play className="size-4" aria-hidden="true" />
          )}
          {playing ? "Pause" : atEnd ? "Replay" : "Play"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIndex((i) => Math.min(steps.length - 1, i + 1));
            setPlaying(false);
          }}
          disabled={atEnd}
          aria-label="Next step"
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
        <span className="ml-auto text-xs font-medium text-muted">
          Step {index + 1} of {steps.length}
        </span>
      </div>

      <p aria-live="polite" className="sr-only">
        {`Step ${index + 1} of ${steps.length}: line ${current.line}, ${current.variable} = ${current.value}. ${current.explanation}`}
      </p>

      <div className="w-full overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2 text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                Step
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                Line
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                Variable
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                Value
              </th>
              <th scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                Explanation
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {steps.map((step, i) => {
              const isCurrent = i === index;
              return (
                <tr
                  key={step.step}
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  aria-current={isCurrent ? "step" : undefined}
                  onClick={() => {
                    setIndex(i);
                    setPlaying(false);
                  }}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isCurrent ? "bg-accent/10" : "hover:bg-surface-2/60",
                  )}
                >
                  <td className={cn("px-4 py-2.5 tabular-nums", isCurrent ? "font-semibold text-accent" : "text-muted")}>
                    {step.step}
                  </td>
                  <td className={cn("px-4 py-2.5 tabular-nums", isCurrent ? "font-semibold text-fg" : "text-fg")}>
                    {step.line}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-fg">{step.variable}</td>
                  <td className="px-4 py-2.5 font-mono text-fg">{step.value}</td>
                  <td className={cn("px-4 py-2.5", isCurrent ? "text-fg" : "text-muted")}>
                    {step.explanation}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {caption && (
        <p className="flex items-start gap-2 text-xs text-muted">
          <ListOrdered className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {caption}
        </p>
      )}
    </div>
  );
}
