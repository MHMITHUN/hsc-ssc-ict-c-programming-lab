import { describe, it, expect } from "vitest";
import { DemoExecutor, DEMO_HIT_NOTE, DEMO_MISS_NOTE } from "@/lib/code-execution/demo";
import {
  PLAYGROUND_SAMPLES,
  catalogSize,
  lookupCatalog,
} from "@/lib/code-execution/catalog";
import { seedLessons } from "@/lib/db/seeds/lessons-1";

describe("DemoExecutor (demo execution catalog)", () => {
  const executor = new DemoExecutor();

  it("replays the recorded output for an exact catalog program", async () => {
    const hello = PLAYGROUND_SAMPLES[0];
    const result = await executor.run(hello.code, hello.stdin);
    expect(result.ok).toBe(true);
    expect(result.mode).toBe("demo");
    expect(result.stdout).toBe("Hello, World!\n");
    expect(result.exitCode).toBe(0);
    expect(result.note).toBe(DEMO_HIT_NOTE);
  });

  it("matches a program typed with different whitespace and indentation", async () => {
    const sum = PLAYGROUND_SAMPLES.find(
      (s) => s.name === "Sum of two numbers",
    )!;
    // Same program, mangled whitespace: extra blank lines + odd indentation.
    const mangled = sum.code
      .split("\n")
      .map((line, i) => (line.trim() === "" ? "" : " ".repeat(i % 5) + line.trim()))
      .join("\n\n");

    const result = await executor.run(mangled, sum.stdin);
    expect(result.ok).toBe(true);
    expect(result.stdout).toBe("Sum: 23\n");
  });

  it("returns an honest miss - and no stdout - for an unknown program", async () => {
    const result = await executor.run(
      `#include <stdio.h>\nint main(void) { printf("something new\\n"); return 0; }`,
      "",
    );
    expect(result.ok).toBe(false);
    expect(result.stdout).toBeUndefined();
    expect(result.note).toBe(DEMO_MISS_NOTE);
    expect(result.note).toContain("JUDGE0_API_URL");
  });

  it("does not replay a recording when the stdin differs from the recorded one", async () => {
    const sum = PLAYGROUND_SAMPLES.find(
      (s) => s.name === "Sum of two numbers",
    )!;
    const result = await executor.run(sum.code, "999 1"); // different input
    expect(result.ok).toBe(false);
    expect(result.stdout).toBeUndefined();
    expect(result.note).toContain("different standard input");
  });

  it("registers every lesson example and every playground classic", () => {
    for (const sample of PLAYGROUND_SAMPLES) {
      expect(lookupCatalog(sample.code)).not.toBeNull();
    }
    for (const lesson of seedLessons) {
      expect(lookupCatalog(lesson.example.code)).not.toBeNull();
    }
    // 15 lesson examples (lessons-1 + lessons-2) + 30 reference
    // solutions + 6 playground classics = 51 registrations.
    expect(catalogSize()).toBeGreaterThanOrEqual(51);
  });
});
