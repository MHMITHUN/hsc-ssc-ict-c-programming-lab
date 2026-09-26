"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/guards";
import { getStore } from "@/lib/db";
import {
  extractLessonForm,
  extractProblemForm,
  validateLessonForm,
  validateProblemForm,
  type ContentFormState,
} from "@/lib/validation/content-forms";

/**
 * Teacher/admin content actions. Every action re-checks the session role
 * server-side (guards live here, not in the client) and every mutation is
 * real - it writes through the store.
 */

async function staffUser() {
  const user = await getSessionUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    return null;
  }
  return user;
}

function revalidateTeacherSurfaces() {
  revalidatePath("/teacher");
  revalidatePath("/learn");
  revalidatePath("/problems");
}

// ---- lessons ----------------------------------------------------------------

export async function createLessonAction(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  const user = await staffUser();
  if (!user) return { error: "Only teachers and admins can create lessons." };

  const parsed = validateLessonForm(extractLessonForm(formData));
  if (!parsed.ok) return { error: "Please fix the highlighted fields.", fieldErrors: parsed.fieldErrors };
  if (!parsed.value.slug) {
    return { error: "A slug is required.", fieldErrors: { slug: "Choose a URL slug" } };
  }

  const store = await getStore();
  try {
    const lesson = await store.createLesson({
      ...parsed.value,
      slug: parsed.value.slug,
      authorId: user.id,
    });
    revalidateTeacherSurfaces();
    redirect(`/teacher/lessons/${lesson.id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      return { error: error.message, fieldErrors: { slug: "This slug is already in use" } };
    }
    throw error;
  }
}

export async function updateLessonAction(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  const user = await staffUser();
  if (!user) return { error: "Only teachers and admins can edit lessons." };

  const lessonId = formData.get("lessonId");
  if (typeof lessonId !== "string" || lessonId.length === 0) {
    return { error: "Missing lesson id." };
  }

  const parsed = validateLessonForm(extractLessonForm(formData));
  if (!parsed.ok) return { error: "Please fix the highlighted fields.", fieldErrors: parsed.fieldErrors };

  const store = await getStore();
  const updated = await store.updateLesson(lessonId, parsed.value);
  if (!updated) return { error: "That lesson no longer exists." };

  revalidateTeacherSurfaces();
  revalidatePath(`/teacher/lessons/${lessonId}`);
  revalidatePath(`/learn/${updated.topicSlug}`);
  return { saved: true };
}

export async function setLessonStatusAction(formData: FormData): Promise<void> {
  const user = await staffUser();
  if (!user) return;

  const lessonId = formData.get("lessonId");
  const status = formData.get("status");
  if (typeof lessonId !== "string" || typeof status !== "string") return;
  if (status !== "published" && status !== "draft") return;

  const store = await getStore();
  const updated = await store.setLessonStatus(lessonId, status);
  if (updated) {
    revalidateTeacherSurfaces();
    revalidatePath(`/learn/${updated.topicSlug}`);
  }
}

// ---- problems -----------------------------------------------------------------

export async function createProblemAction(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  const user = await staffUser();
  if (!user) return { error: "Only teachers and admins can create problems." };

  const parsed = validateProblemForm(extractProblemForm(formData));
  if (!parsed.ok) return { error: "Please fix the highlighted fields.", fieldErrors: parsed.fieldErrors };
  if (!parsed.value.slug) {
    return { error: "A slug is required.", fieldErrors: { slug: "Choose a URL slug" } };
  }

  const store = await getStore();
  try {
    const problem = await store.createProblem({ ...parsed.value, slug: parsed.value.slug });
    revalidateTeacherSurfaces();
    redirect(`/teacher/problems/${problem.id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      return { error: error.message, fieldErrors: { slug: "This slug is already in use" } };
    }
    throw error;
  }
}

export async function updateProblemAction(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  const user = await staffUser();
  if (!user) return { error: "Only teachers and admins can edit problems." };

  const problemId = formData.get("problemId");
  if (typeof problemId !== "string" || problemId.length === 0) {
    return { error: "Missing problem id." };
  }

  const parsed = validateProblemForm(extractProblemForm(formData));
  if (!parsed.ok) return { error: "Please fix the highlighted fields.", fieldErrors: parsed.fieldErrors };

  const store = await getStore();
  const updated = await store.updateProblem(problemId, parsed.value);
  if (!updated) return { error: "That problem no longer exists." };

  revalidateTeacherSurfaces();
  revalidatePath(`/teacher/problems/${problemId}`);
  revalidatePath(`/problems/${updated.slug}`);
  return { saved: true };
}

export async function setProblemStatusAction(formData: FormData): Promise<void> {
  const user = await staffUser();
  if (!user) return;

  const problemId = formData.get("problemId");
  const status = formData.get("status");
  if (typeof problemId !== "string" || typeof status !== "string") return;
  if (status !== "published" && status !== "draft") return;

  const store = await getStore();
  const updated = await store.setProblemStatus(problemId, status);
  if (updated) {
    revalidateTeacherSurfaces();
    revalidatePath(`/problems/${updated.slug}`);
  }
}
