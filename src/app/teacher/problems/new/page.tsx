import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProblemForm, EMPTY_PROBLEM_VALUES } from "@/components/teacher/ProblemForm";
import { createProblemAction } from "@/app/actions/teacher";
import { requireRole } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "New Problem" };

export default async function NewProblemPage() {
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
          Create a problem
        </h1>
        <p className="text-sm text-muted">
          New problems start as drafts. The expected output is what student
          submissions are auto-checked against, so verify it by running the
          sample input through your own solution first.
        </p>
      </div>

      <ProblemForm action={createProblemAction} initial={EMPTY_PROBLEM_VALUES} mode="create" />
    </div>
  );
}
