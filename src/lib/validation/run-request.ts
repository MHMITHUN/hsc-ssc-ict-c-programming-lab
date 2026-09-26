import { z } from "zod";

/**
 * Request schema for POST /api/run, shared by the route handler and
 * unit-tested in tests/validators.test.ts. Extracted so the schema is
 * importable without loading Next.js server machinery.
 */
export const runRequestSchema = z.object({
  code: z.string().min(1, "Code is required.").max(20_000),
  stdin: z.string().max(10_000).default(""),
});

export type RunRequestInput = z.infer<typeof runRequestSchema>;
