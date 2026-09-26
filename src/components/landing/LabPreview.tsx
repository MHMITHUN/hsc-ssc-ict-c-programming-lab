import { Play, Terminal } from "lucide-react";

/**
 * Static, honestly-labelled preview of the interactive lab interface.
 * It is a mock-up of the editor + output panels - not a live widget - so
 * the landing page never implies more functionality than exists.
 */
export function LabPreview() {
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-2 px-4 py-2.5">
        <span className="flex items-center gap-2 text-xs font-medium text-muted">
          <Terminal className="size-3.5" aria-hidden="true" />
          Playground - sum_1_to_n.c
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Play className="size-3.5" aria-hidden="true" />
          Run
        </span>
      </div>
      <div className="grid gap-0 sm:grid-cols-2">
        <div className="border-b border-border sm:border-b-0 sm:border-r">
          <p className="border-b border-border bg-surface-2/60 px-4 py-1.5 text-xs font-medium text-muted">
            Editor
          </p>
          <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-fg">
            <code>{`#include <stdio.h>

int main(void) {
    int n, i, sum = 0;
    scanf("%d", &n);
    for (i = 1; i <= n; i = i + 1) {
        sum = sum + i;
    }
    printf("Sum: %d\\n", sum);
    return 0;
}`}</code>
          </pre>
        </div>
        <div>
          <p className="border-b border-border bg-surface-2/60 px-4 py-1.5 text-xs font-medium text-muted">
            Output (stdin: 10)
          </p>
          <pre className="p-4 text-xs leading-relaxed text-fg">
            <code>{`Sum: 55`}</code>
          </pre>
          <p className="px-4 pb-4 text-xs text-muted">
            Execution status: finished, exit code 0
          </p>
        </div>
      </div>
      <figcaption className="border-t border-border bg-surface-2/40 px-4 py-2 text-xs text-muted">
        Illustrative preview of the lab interface - the real playground runs
        your own code with your own input after you sign in.
      </figcaption>
    </figure>
  );
}
