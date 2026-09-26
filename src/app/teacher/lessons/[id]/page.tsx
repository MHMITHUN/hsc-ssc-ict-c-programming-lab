import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui";
import { LessonForm } from "@/components/teacher/LessonForm";
import { updateLessonAction } from "@/app/actions/teacher";
import { requireRole } from "@/lib/auth/guards";
import { getStore } from "@/lib/db";
import type { Lesson } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit Lesson" };

/** Serialize a stored lesson into the editor form's text formats. */
function lessonToFormValues(lesson: Lesson) {
  return {
    title: lesson.title,
    topicSlug: lesson.topicSlug,
    level: lesson.level,
    audience: lesson.audience,
    status: lesson.status,
    summary: lesson.summary,
    objective: lesson.objective,
    conceptMd: lesson.conceptMd,
    syntax: lesson.syntax,
    exampleCode: lesson.example.code,
    annotationsText: lesson.example.annotations
      .map((a) => `${a.line}|${a.note}`)
      .join("\n"),
    mistakesText: lesson.mistakes.join("\n"),
    dryRunText: (lesson.dryRun ?? [])
      .map((s) => `${s.step}|${s.line}|${s.variable}|${s.value}|${s.explanation}`)
      .join("\n"),
    sampleInput: lesson.sampleInput,
    sampleOutput: lesson.sampleOutput,
    practiceTask: lesson.practiceTask,
    checksText: (lesson.checks ?? [])
      .map((c) => `${c.question}\n${c.options.join(", ")}\n${c.answerIndex}\n${c.explanation}`)
      .join("\n\n"),
  };
}

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["TEACHER", "ADMIN"], "/teacher");
  const { id } = await params;

  const store = await getStore();
  const lesson = await store.getLessonById(id);
  if (!lesson) notFound();

  const initial = lessonToFormValues(lesson);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/teacher"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Teacher dashboard
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Edit lesson
          </h1>
          <Badge tone={lesson.status === "published" ? "success" : "warning"}>
            {lesson.status}
          </Badge>
        </div>
        <p className="text-sm text-muted">
          Slug <code className="font-mono">{lesson.slug}</code> - fixed after
          creation. Unpublish from the dashboard table or switch the status
          field below; drafts are hidden from students.
        </p>
      </div>

      <LessonForm
        action={updateLessonAction}
        initial={initial}
        mode="edit"
        lessonId={lesson.id}
      />
    </div>
  );
}
