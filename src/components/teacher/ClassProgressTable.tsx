import { Download } from "lucide-react";
import { ProgressBar, Table, TableBody, TD, TH, TableHead, TableRow, TableEmpty } from "@/components/ui";
import type { ClassProgressRow } from "@/lib/analytics";
import { formatDate } from "@/lib/utils";

/**
 * Per-student class progress with the CSV export link. The export is a GET
 * route handler that builds the same rows live from the store and returns
 * a real text/csv download (server actions cannot start downloads).
 */
export function ClassProgressTable({ rows }: { rows: ClassProgressRow[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-muted">
          {rows.length} student{rows.length === 1 ? "" : "s"} - computed live from
          progress, quiz attempts and submissions.
        </p>
        <a
          href="/api/teacher/export"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
        >
          <Download className="size-4" aria-hidden="true" />
          Export CSV
        </a>
      </div>
      <Table>
        <caption className="sr-only">
          Class progress per student: lessons completed, quiz average, problems
          solved and last active date.
        </caption>
        <TableHead>
          <TableRow>
            <TH scope="col">Student</TH>
            <TH scope="col">Lessons</TH>
            <TH scope="col">Quiz avg</TH>
            <TH scope="col">Problems solved</TH>
            <TH scope="col">Last active</TH>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableEmpty colSpan={5}>No students registered yet.</TableEmpty>
          )}
          {rows.map((row) => (
            <TableRow key={row.email}>
              <th scope="row" className="px-4 py-3 text-left">
                <span className="block text-sm font-medium text-fg">{row.name}</span>
                <span className="block text-xs text-muted">{row.email}</span>
              </th>
              <TD>
                <ProgressBar
                  value={row.lessonsTotal === 0 ? 0 : (row.lessonsCompleted / row.lessonsTotal) * 100}
                  label={`${row.name} lessons completed`}
                  showValue={false}
                  className="min-w-24"
                />
                <span className="text-xs text-muted">
                  {row.lessonsCompleted}/{row.lessonsTotal}
                </span>
              </TD>
              <TD>{row.quizAvgPercent === null ? "-" : `${row.quizAvgPercent}%`}</TD>
              <TD>
                {row.problemsSolved}
                <span className="text-muted"> / {row.problemsAttempted} attempted</span>
              </TD>
              <TD>
                {row.lastActiveAt ? (
                  <time dateTime={row.lastActiveAt} className="text-muted">
                    {formatDate(row.lastActiveAt)}
                  </time>
                ) : (
                  <span className="text-muted">Never</span>
                )}
              </TD>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
