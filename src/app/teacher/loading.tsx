import { Skeleton } from "@/components/ui";

/** Teacher dashboard loading skeleton. */
export default function TeacherLoading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading the teacher dashboard…</span>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-8 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-48 w-full" />
        </div>
      ))}
    </div>
  );
}
