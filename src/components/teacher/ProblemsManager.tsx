import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { Badge, Table, TableBody, TD, TH, TableHead, TableRow, TableEmpty } from "@/components/ui";
import { setProblemStatusAction } from "@/app/actions/teacher";
import type { Problem } from "@/lib/db/types";
import { getTopicBySlug } from "@/lib/curriculum/topics";
import { formatDate } from "@/lib/utils";

const DIFFICULTY_TONES = {
  easy: "success",
  medium: "warning",
  hard: "danger",
} as const;

/** Problems manager table for the teacher dashboard (server component). */
export function ProblemsManager({ problems }: { problems: Problem[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-muted">
          {problems.length} problem{problems.length === 1 ? "" : "s"} in the bank.
        </p>
        <Link
          href="/teacher/problems/new"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          <Plus className="size-4" aria-hidden="true" />
          New problem
        </Link>
      </div>
      <Table>
        <caption className="sr-only">
          All problems with topic, difficulty, status and actions.
        </caption>
        <TableHead>
          <TableRow>
            <TH scope="col">Title</TH>
            <TH scope="col">Topic</TH>
            <TH scope="col">Difficulty</TH>
            <TH scope="col">Status</TH>
            <TH scope="col">Created</TH>
            <TH scope="col">Actions</TH>
          </TableRow>
        </TableHead>
        <TableBody>
          {problems.length === 0 && (
            <TableEmpty colSpan={6}>No problems yet - create the first one.</TableEmpty>
          )}
          {problems.map((problem) => (
            <TableRow key={problem.id}>
              <th scope="row" className="px-4 py-3 text-left text-sm font-medium text-fg">
                <Link
                  href={`/teacher/problems/${problem.id}`}
                  className="rounded-sm hover:text-accent hover:underline"
                >
                  {problem.title}
                </Link>
              </th>
              <TD>{getTopicBySlug(problem.topicSlug)?.title ?? problem.topicSlug}</TD>
              <TD>
                <Badge tone={DIFFICULTY_TONES[problem.difficulty]}>{problem.difficulty}</Badge>
              </TD>
              <TD>
                <Badge tone={problem.status === "published" ? "success" : "warning"}>
                  {problem.status}
                </Badge>
              </TD>
              <TD>
                <time dateTime={problem.createdAt} className="text-muted">
                  {formatDate(problem.createdAt)}
                </time>
              </TD>
              <TD>
                <div className="flex items-center gap-2">
                  <form action={setProblemStatusAction}>
                    <input type="hidden" name="problemId" value={problem.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={problem.status === "published" ? "draft" : "published"}
                    />
                    <button
                      type="submit"
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {problem.status === "published" ? (
                        <>
                          <EyeOff className="size-3.5" aria-hidden="true" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="size-3.5" aria-hidden="true" />
                          Publish
                        </>
                      )}
                    </button>
                  </form>
                  <Link
                    href={`/teacher/problems/${problem.id}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2"
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit
                  </Link>
                </div>
              </TD>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
