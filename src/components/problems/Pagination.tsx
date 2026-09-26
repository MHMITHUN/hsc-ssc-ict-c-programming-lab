import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Prev/next pagination for server-rendered lists. The current filters ride
 * along in the query string; only `page` changes.
 */
export function Pagination({
  page,
  pageSize,
  total,
  params,
  basePath,
}: {
  page: number;
  pageSize: number;
  total: number;
  params: Record<string, string | undefined>;
  basePath: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  function hrefFor(target: number): string {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value);
    }
    if (target > 1) query.set("page", String(target));
    const qs = query.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const linkClass = cn(
    "inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-surface px-3 text-sm text-fg",
    "transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  );

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass} rel="prev">
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Link>
      ) : (
        <span className="inline-flex h-8 cursor-not-allowed items-center gap-1 rounded-lg border border-border bg-surface px-3 text-sm text-muted opacity-60">
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </span>
      )}
      <p className="text-sm text-muted" aria-live="polite">
        Page <span className="font-medium text-fg">{page}</span> of{" "}
        <span className="font-medium text-fg">{totalPages}</span>
        <span className="sr-only">, {total} problems in total</span>
      </p>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={linkClass} rel="next">
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className="inline-flex h-8 cursor-not-allowed items-center gap-1 rounded-lg border border-border bg-surface px-3 text-sm text-muted opacity-60">
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      )}
    </nav>
  );
}
