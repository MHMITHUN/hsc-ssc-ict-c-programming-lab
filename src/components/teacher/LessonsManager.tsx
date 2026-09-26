import Link from "next/link";
import { Eye, EyeOff, Pencil, Plus } from "lucide-react";
import { Badge, Table, TableBody, TD, TH, TableHead, TableRow, TableEmpty } from "@/components/ui";
import { setLessonStatusAction } from "@/app/actions/teacher";
import type { Lesson } from "@/lib/db/types";
import { getTopicBySlug } from "@/lib/curriculum/topics";
import { formatDate } from "@/lib/utils";

/** Lessons manager table for the teacher dashboard (server component). */
export function LessonsManager({ lessons }: { lessons: Lesson[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-muted">
          {lessons.length} lesson{lessons.length === 1 ? "" : "s"} in the store.
          Drafts are hidden from every student view.
        </p>
        <Link
          href="/teacher/lessons/new"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-medium text-accent-fg hover:bg-accent-hover"
        >
          <Plus className="size-4" aria-hidden="true" />
          New lesson
        </Link>
      </div>
      <Table>
        <caption className="sr-only">
          All lessons with topic, level, status, last update and actions.
        </caption>
        <TableHead>
          <TableRow>
            <TH scope="col">Title</TH>
            <TH scope="col">Topic</TH>
            <TH scope="col">Level</TH>
            <TH scope="col">Status</TH>
            <TH scope="col">Updated</TH>
            <TH scope="col">Actions</TH>
          </TableRow>
        </TableHead>
        <TableBody>
          {lessons.length === 0 && (
            <TableEmpty colSpan={6}>No lessons yet - create the first one.</TableEmpty>
          )}
          {lessons.map((lesson) => (
            <TableRow key={lesson.id}>
              <th scope="row" className="px-4 py-3 text-left text-sm font-medium text-fg">
                <Link
                  href={`/teacher/lessons/${lesson.id}`}
                  className="rounded-sm hover:text-accent hover:underline"
                >
                  {lesson.title}
                </Link>
              </th>
              <TD>{getTopicBySlug(lesson.topicSlug)?.title ?? lesson.topicSlug}</TD>
              <TD>
                <Badge tone="neutral">{lesson.level}</Badge>
              </TD>
              <TD>
                <Badge tone={lesson.status === "published" ? "success" : "warning"}>
                  {lesson.status}
                </Badge>
              </TD>
              <TD>
                <time dateTime={lesson.updatedAt} className="text-muted">
                  {formatDate(lesson.updatedAt)}
                </time>
              </TD>
              <TD>
                <div className="flex items-center gap-2">
                  <form action={setLessonStatusAction}>
                    <input type="hidden" name="lessonId" value={lesson.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={lesson.status === "published" ? "draft" : "published"}
                    />
                    <button
                      type="submit"
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {lesson.status === "published" ? (
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
                    href={`/teacher/lessons/${lesson.id}`}
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
