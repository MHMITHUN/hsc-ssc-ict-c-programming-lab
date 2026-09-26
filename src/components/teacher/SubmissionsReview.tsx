import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  Badge,
  EmptyState,
  ProgressBar,
  Table,
  TableBody,
  TD,
  TH,
  TableHead,
  TableRow,
} from "@/components/ui";
import type { Problem, Submission, User } from "@/lib/db/types";
import { formatDate } from "@/lib/utils";

const STATUS_TONES = {
  accepted: "success",
  wrong_answer: "danger",
  error: "warning",
  pending: "neutral",
  reviewed: "accent",
} as const;

/**
 * Submissions review: the newest submissions plus a per-problem accepted
 * ratio, so a teacher can spot which problems the class is stuck on.
 */
export function SubmissionsReview({
  submissions,
  problems,
  students,
}: {
  submissions: Submission[];
  problems: Problem[];
  students: User[];
}) {
  const studentsById = new Map(students.map((u) => [u.id, u]));
  const problemsById = new Map(problems.map((p) => [p.id, p]));

  const recent = submissions.slice(0, 10);

  // Per-problem breakdown over ALL submissions, worst acceptance first.
  const stats = new Map<string, { total: number; accepted: number }>();
  for (const s of submissions) {
    const entry = stats.get(s.problemId) ?? { total: 0, accepted: 0 };
    entry.total += 1;
    if (s.status === "accepted") entry.accepted += 1;
    stats.set(s.problemId, entry);
  }
  const breakdown = [...stats.entries()]
    .map(([problemId, { total, accepted }]) => ({ problem: problemsById.get(problemId), total, accepted }))
    .filter((row): row is { problem: Problem; total: number; accepted: number } => Boolean(row.problem))
    .sort((a, b) => a.accepted / a.total - b.accepted / b.total);

  if (submissions.length === 0) {
    return (
      <EmptyState
        title="No submissions yet"
        description="When students run their solutions on problem pages, the auto-checked results appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Table>
        <caption className="sr-only">
          The ten most recent submissions with student, problem, status and date.
        </caption>
        <TableHead>
          <TableRow>
            <TH scope="col">Student</TH>
            <TH scope="col">Problem</TH>
            <TH scope="col">Status</TH>
            <TH scope="col">Date</TH>
          </TableRow>
        </TableHead>
        <TableBody>
          {recent.map((s) => {
            const student = studentsById.get(s.userId);
            const problem = problemsById.get(s.problemId);
            return (
              <TableRow key={s.id}>
                <th scope="row" className="px-4 py-3 text-left text-sm font-medium text-fg">
                  {student ? student.name : "Unknown student"}
                </th>
                <TD>
                  {problem ? (
                    <Link
                      href={`/problems/${problem.slug}`}
                      className="rounded-sm hover:text-accent hover:underline"
                    >
                      {problem.title}
                    </Link>
                  ) : (
                    "Removed problem"
                  )}
                </TD>
                <TD>
                  <Badge tone={STATUS_TONES[s.status]}>
                    {s.status === "accepted" ? (
                      <CheckCircle2 className="mr-1 size-3" aria-hidden="true" />
                    ) : (
                      <XCircle className="mr-1 size-3" aria-hidden="true" />
                    )}
                    {s.status.replace("_", " ")}
                  </Badge>
                </TD>
                <TD>
                  <time dateTime={s.createdAt} className="text-muted">
                    {formatDate(s.createdAt)}
                  </time>
                </TD>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3">
        <h3 className="text-base font-semibold text-fg">
          Per-problem breakdown (lowest acceptance first)
        </h3>
        <ul className="flex flex-col gap-3">
          {breakdown.map(({ problem, total, accepted }) => (
            <li key={problem.id} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3">
                <Link
                  href={`/problems/${problem.slug}`}
                  className="text-sm font-medium text-fg rounded-sm hover:text-accent hover:underline"
                >
                  {problem.title}
                </Link>
                <span className="shrink-0 text-xs text-muted">
                  {accepted}/{total} accepted ({Math.round((accepted / total) * 100)}%)
                </span>
              </div>
              <ProgressBar
                value={(accepted / total) * 100}
                label={`${problem.title} acceptance rate`}
                showValue={false}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
