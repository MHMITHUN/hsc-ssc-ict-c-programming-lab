import { Skeleton } from "@/components/ui";

/** Student dashboard loading skeleton. */
export default function DashboardLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your dashboard…</span>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-80 w-full" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
