import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui";
import { ProblemForm } from "@/components/teacher/ProblemForm";
import { updateProblemAction } from "@/app/actions/teacher";
import { requireRole } from "@/lib/auth/guards";
import { getStore } from "@/lib/db";
import type { Problem } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Edit Problem" };

/** Serialize a stored problem into the editor form's plain string fields. */
function problemToFormValues(problem: Problem) {
  return {
    title: problem.title,
    topicSlug: problem.topicSlug,
    difficulty: problem.difficulty,
    status: problem.status,
    statement: problem.statement,
    constraints: problem.constraints,
    sampleInput: problem.sampleInput,
    sampleOutput: problem.sampleOutput,
    hint: problem.hint,
    solutionExplanation: problem.solutionExplanation,
    starterCode: problem.starterCode,
    expectedOutput: problem.expectedOutput,
  };
}

export default async function EditProblemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["TEACHER", "ADMIN"], "/teacher");
  const { id } = await params;

  const store = await getStore();
  const problem = await store.getProblemById(id);
  if (!problem) notFound();

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
            Edit problem
          </h1>
          <Badge tone={problem.status === "published" ? "success" : "warning"}>
            {problem.status}
          </Badge>
        </div>
        <p className="text-sm text-muted">
          Slug <code className="font-mono">{problem.slug}</code> - fixed after
          creation. Changing the expected output changes what future
          submissions must match.
        </p>
      </div>

      <ProblemForm
        action={updateProblemAction}
        initial={problemToFormValues(problem)}
        mode="edit"
        problemId={problem.id}
      />
    </div>
  );
}
