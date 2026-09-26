import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validation/auth";
import { runRequestSchema } from "@/lib/validation/run-request";

/**
 * Request validation schemas for auth and the run endpoint: every schema is
 * exercised with valid and invalid payloads. These are the exact schemas the
 * server actions and route handlers parse with - clients never decide
 * validity on their own.
 */

describe("loginSchema", () => {
  it("accepts a valid email + password pair", () => {
    const parsed = loginSchema.safeParse({
      email: "student@demo.local",
      password: "Demo@12345",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe("student@demo.local");
    }
  });

  it("trims surrounding whitespace from the email", () => {
    const parsed = loginSchema.safeParse({
      email: "  student@demo.local  ",
      password: "Demo@12345",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe("student@demo.local");
    }
  });

  it("rejects a malformed email", () => {
    const parsed = loginSchema.safeParse({
      email: "not-an-email",
      password: "Demo@12345",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((i) => i.path[0] === "email")).toBe(true);
    }
  });

  it("rejects an empty email or empty password", () => {
    expect(
      loginSchema.safeParse({ email: "", password: "Demo@12345" }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({ email: "a@b.co", password: "" }).success,
    ).toBe(false);
  });

  it("reports a field-level message per invalid field", () => {
    const parsed = loginSchema.safeParse({ email: "nope", password: "" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fields = new Set(parsed.error.issues.map((i) => i.path[0]));
      expect(fields).toContain("email");
      expect(fields).toContain("password");
    }
  });
});

describe("registerSchema", () => {
  const valid = {
    name: "Rakib Hasan",
    email: "rakib@example.com",
    password: "Demo@12345",
  };

  it("accepts a valid registration payload", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a one-character name", () => {
    const parsed = registerSchema.safeParse({ ...valid, name: "R" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((i) => i.path[0] === "name")).toBe(true);
    }
  });

  it("rejects a password shorter than 8 characters", () => {
    const parsed = registerSchema.safeParse({ ...valid, password: "short" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some(
          (i) => i.path[0] === "password" && /at least 8/.test(i.message),
        ),
      ).toBe(true);
    }
  });

  it("rejects an invalid email with the email message", () => {
    const parsed = registerSchema.safeParse({ ...valid, email: "rakib@" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(
        parsed.error.issues.some(
          (i) => i.path[0] === "email" && /valid email/.test(i.message),
        ),
      ).toBe(true);
    }
  });
});

describe("runRequestSchema", () => {
  it("accepts code with no stdin and defaults stdin to an empty string", () => {
    const parsed = runRequestSchema.safeParse({ code: "#include <stdio.h>" });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.stdin).toBe("");
    }
  });

  it("accepts code together with stdin", () => {
    const parsed = runRequestSchema.safeParse({ code: "int main(void){}", stdin: "12 11\n" });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.stdin).toBe("12 11\n");
    }
  });

  it("rejects empty code", () => {
    const parsed = runRequestSchema.safeParse({ code: "" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toBe("Code is required.");
    }
  });

  it("rejects code over 20000 characters", () => {
    const parsed = runRequestSchema.safeParse({ code: "x".repeat(20_001) });
    expect(parsed.success).toBe(false);
  });

  it("accepts code at exactly the 20000-character limit", () => {
    expect(runRequestSchema.safeParse({ code: "x".repeat(20_000) }).success).toBe(true);
  });

  it("rejects stdin over 10000 characters", () => {
    const parsed = runRequestSchema.safeParse({ code: "int main(void){}", stdin: "y".repeat(10_001) });
    expect(parsed.success).toBe(false);
  });
});
