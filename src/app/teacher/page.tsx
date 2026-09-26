import type { Metadata } from "next";
import { BookOpen, Code2, FileText, Users } from "lucide-react";
import { StatCards } from "@/components/analytics/StatCards";
import { LessonsManager } from "@/components/teacher/LessonsManager";
import { ProblemsManager } from "@/components/teacher/ProblemsManager";
import { ClassProgressTable } from "@/components/teacher/ClassProgressTable";
import { SubmissionsReview } from "@/components/teacher/SubmissionsReview";
import { requireRole } from "@/lib/auth/guards";
import { getStore } from "@/lib/db";
import {
  computeStudentOverview,
  lastActiveDate,
  type ClassProgressRow,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Teacher Dashboard",
  description:
    "Manage lessons and problems, review submissions and see class progress.",
};

export default async function TeacherDashboardPage() {
  const user = await requireRole(["TEACHER", "ADMIN"], "/teacher");

  const store = await getStore();
  const [lessons, problems, students, allSubmissions] = await Promise.all([
    store.listAllLessons(),
    store.listAllProblems(),
    store.listUsers("STUDENT"),
    store.listAllSubmissions(),
  ]);

  const publishedLessons = await store.listPublishedLessons();

  // Per-student activity for the class progress table.
  const classRows: ClassProgressRow[] = [];
  for (const student of students) {
    const [progress, attempts, submissions] = await Promise.all([
      store.listProgressByUser(student.id),
      store.listQuizAttemptsByUser(student.id),
      store.listSubmissionsByUser(student.id),
    ]);
    const overview = computeStudentOverview({
      progress,
      publishedLessons,
      submissions,
      quizAttempts: attempts,
    });
    classRows.push({
      name: student.name,
      email: student.email,
      lessonsCompleted: overview.lessonsCompleted,
      lessonsTotal: overview.lessonsTotal,
      quizAvgPercent: overview.avgQuizPercent,
      problemsSolved: overview.problemsSolved,
      problemsAttempted: overview.problemsAttempted,
      lastActiveAt: lastActiveDate(progress, attempts, submissions),
    });
  }
  classRows.sort((a, b) => a.name.localeCompare(b.name));

  const publishedLessonsCount = lessons.filter((l) => l.status === "published").length;
  const publishedProblemsCount = problems.filter((p) => p.status === "published").length;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted">
          Signed in as {user.email} ({user.role.toLowerCase()})
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Teacher dashboard
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Create and publish content, review auto-checked submissions and
          follow each student&apos;s progress through the curriculum. Drafts are
          hidden from students until you publish them.
        </p>
      </header>

      <StatCards
        items={[
          {
            label: "Students",
            value: String(students.length),
            hint: "Registered student accounts",
            icon: Users,
          },
          {
            label: "Lessons",
            value: `${publishedLessonsCount} published`,
            hint: `${lessons.length - publishedLessonsCount} draft${lessons.length - publishedLessonsCount === 1 ? "" : "s"}`,
            icon: BookOpen,
          },
          {
            label: "Problems",
            value: `${publishedProblemsCount} published`,
            hint: `${problems.length - publishedProblemsCount} draft${problems.length - publishedProblemsCount === 1 ? "" : "s"}`,
            icon: Code2,
          },
          {
            label: "Submissions",
            value: String(allSubmissions.length),
            hint: "Auto-checked runs from problem pages",
            icon: FileText,
          },
        ]}
      />

      <section aria-labelledby="lessons-manager-heading" className="flex flex-col gap-3">
        <h2 id="lessons-manager-heading" className="text-lg font-semibold text-fg">
          Lessons
        </h2>
        <LessonsManager lessons={lessons} />
      </section>

      <section aria-labelledby="problems-manager-heading" className="flex flex-col gap-3">
        <h2 id="problems-manager-heading" className="text-lg font-semibold text-fg">
          Problems
        </h2>
        <ProblemsManager problems={problems} />
      </section>

      <section aria-labelledby="class-progress-heading" className="flex flex-col gap-3">
        <h2 id="class-progress-heading" className="text-lg font-semibold text-fg">
          Class progress
        </h2>
        <ClassProgressTable rows={classRows} />
      </section>

      <section aria-labelledby="submissions-heading" className="flex flex-col gap-3">
        <h2 id="submissions-heading" className="text-lg font-semibold text-fg">
          Submissions review
        </h2>
        <SubmissionsReview
          submissions={allSubmissions}
          problems={problems}
          students={students}
        />
      </section>
    </div>
  );
}
