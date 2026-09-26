import { cn } from "@/lib/utils";

/**
 * Read-only code / input / output block (server-safe).
 * Keeps whitespace exactly as written - C code and terminal samples
 * depend on it.
 */
export function CodeBlock({
  code,
  label,
  className,
}: {
  code: string;
  label?: string;
  className?: string;
}) {
  return (
    <figure className={cn("overflow-hidden rounded-lg border border-border", className)}>
      {label && (
        <figcaption className="border-b border-border bg-surface-2 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted">
          {label}
        </figcaption>
      )}
      <pre className="overflow-x-auto bg-surface-2 px-4 py-3 text-sm leading-relaxed text-fg">
        <code>{code}</code>
      </pre>
    </figure>
  );
}
