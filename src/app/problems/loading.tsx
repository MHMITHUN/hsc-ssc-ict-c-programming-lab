import { Skeleton } from "@/components/ui";

/** Problem library loading skeleton. */
export default function ProblemsLoading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading the problem library…</span>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
