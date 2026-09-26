import { z } from "zod";

/**
 * Auth request schemas (login + register), shared by the server actions in
 * src/app/actions/auth.ts and unit-tested in tests/validators.test.ts.
 * Kept in this module - a "use server" file may only export async functions,
 * so the schemas must live outside it to be importable by tests.
 */

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Enter a valid email address.");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: emailSchema,
  password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
