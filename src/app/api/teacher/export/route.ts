import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { apiGuard } from "@/lib/auth/guards";
import { getStore } from "@/lib/db";
import {
  computeStudentOverview,
  lastActiveDate,
  toClassProgressCsv,
  type ClassProgressRow,
} from "@/lib/analytics";

export const dynamic = "force-dynamic";

/**
 * Class progress CSV export (GET so the browser can download it directly -
 * a server action cannot start a download). Teacher/admin only; the rows
 * are computed live from the store, identical to the on-screen table.
 */
export async function GET(req: NextRequest) {
  const guard = await apiGuard(req, ["TEACHER", "ADMIN"]);
  if ("response" in guard) return guard.response;

  const store = await getStore();
  const [students, publishedLessons] = await Promise.all([
    store.listUsers("STUDENT"),
    store.listPublishedLessons(),
  ]);

  const rows: ClassProgressRow[] = [];
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
    rows.push({
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
  rows.sort((a, b) => a.name.localeCompare(b.name));

  const csv = toClassProgressCsv(rows);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="class-progress.csv"',
      "Cache-Control": "no-store",
    },
  });
}
