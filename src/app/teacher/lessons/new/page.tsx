import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LessonForm, EMPTY_LESSON_VALUES } from "@/components/teacher/LessonForm";
import { createLessonAction } from "@/app/actions/teacher";
import { requireRole } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "New Lesson" };

export default async function NewLessonPage() {
  await requireRole(["TEACHER", "ADMIN"], "/teacher");

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
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Create a lesson
        </h1>
        <p className="text-sm text-muted">
          New lessons start as drafts - publish from the dashboard table when
          the content is ready for students.
        </p>
      </div>

      <LessonForm action={createLessonAction} initial={EMPTY_LESSON_VALUES} mode="create" />
    </div>
  );
}
