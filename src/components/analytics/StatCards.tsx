import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";

/** One labelled number for a dashboard overview grid. */
export interface StatCardItem {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
}

/**
 * Grid of overview stat cards shared by the student and teacher dashboards.
 * Server component - pure presentation.
 */
export function StatCards({
  items,
  className,
}: {
  items: StatCardItem[];
  className?: string;
}) {
  return (
    <dl className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label}>
            <Card className="h-full">
              <CardContent className="flex h-full flex-col gap-2 p-5">
                <dt className="flex items-center gap-2 text-sm font-medium text-muted">
                  {Icon && <Icon className="size-4 text-accent" aria-hidden="true" />}
                  {item.label}
                </dt>
                <dd className="text-2xl font-semibold tracking-tight text-fg">
                  {item.value}
                </dd>
                {item.hint && <p className="text-xs text-muted">{item.hint}</p>}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </dl>
  );
}
