// Capture the documentation screenshots referenced by README.md.
// Usage: start the dev server (npm run dev), then run `node scripts/screenshots.mjs`.
// Requires the demo accounts from the seed (student@demo.local / teacher@demo.local).
//
// Produces two sets (same pages, both naming schemes live in different docs):
//   01-home / 02-main-feature / 03-dashboard / 04-mobile / 05-admin  (chunk brief)
//   home / learn / lesson-dry-run / playground / problem / dashboard / teacher (README table)
import { chromium } from "@playwright/test";
import { mkdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = path.join(ROOT, "docs", "screenshots");
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

const DEMO_PASSWORD = "Demo@12345";

/** Sign in through the real login form and wait for the role home. */
async function signIn(page, email) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
}

/** Save a screenshot and refuse to continue if the file looks empty. */
async function shoot(page, name, { fullPage = true } = {}) {
  const file = path.join(OUT_DIR, name);
  await page.screenshot({ path: file, fullPage });
  const kb = statSync(file).size / 1024;
  if (kb < 20) {
    throw new Error(`${name} is only ${kb.toFixed(1)} KB - the page probably failed to render`);
  }
  console.log(`captured ${name} (${kb.toFixed(0)} KB)`);
}

mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();

try {
  // 01 - landing page (desktop, anonymous visitor).
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await desktop.newPage();
  await page.goto(`${BASE_URL}/`, { waitUntil: "load" });
  await page.getByRole("heading", { level: 1 }).waitFor();
  await shoot(page, "01-home.png");
  await shoot(page, "home.png");

  // Curriculum Explorer (README: learn.png).
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Learn" }).click();
  await page.waitForURL("**/learn");
  await page.getByRole("heading", { name: "Curriculum Explorer" }).waitFor();
  await shoot(page, "learn.png");

  // 02 - main feature: the Loops lesson with its dry-run table (public page).
  await page.goto(`${BASE_URL}/learn/loops`, { waitUntil: "load" });
  await page.getByRole("heading", { level: 1, name: /Loops/i }).waitFor();
  await page.getByRole("table").waitFor();
  await page.getByText(/^Step 1 of \d+$/).waitFor();
  // Advance one step so the controls look alive in the shot.
  await page.getByRole("button", { name: "Next step" }).click();
  await page.getByText(/^Step 2 of \d+$/).waitFor();
  await page.getByRole("heading", { name: /dry run/i }).scrollIntoViewIfNeeded();
  await shoot(page, "02-main-feature.png");
  await shoot(page, "lesson-dry-run.png");
  await desktop.close();

  // Student-context shots: playground, problem page and dashboard.
  const studentCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const student = await studentCtx.newPage();
  await signIn(student, "student@demo.local");
  await student.waitForURL("**/dashboard");

  // Playground with a program actually run (README: playground.png).
  await student.goto(`${BASE_URL}/playground`, { waitUntil: "load" });
  await student.getByRole("heading", { name: "Code Playground" }).waitFor();
  await student.getByRole("combobox", { name: "Sample program" }).selectOption({ index: 1 });
  await student.getByRole("button", { name: "Run" }).click();
  await student
    .getByText("Demo execution: pre-recorded output for this exact program.")
    .waitFor({ timeout: 15_000 });
  await shoot(student, "playground.png");

  // Problem page (README: problem.png).
  await student.goto(`${BASE_URL}/problems/sum-and-average-of-two-numbers`, {
    waitUntil: "load",
  });
  await student.getByRole("heading", { level: 1 }).waitFor();
  await shoot(student, "problem.png");

  // 03 - student dashboard (real seeded progress).
  await student.goto(`${BASE_URL}/dashboard`, { waitUntil: "load" });
  await student.getByRole("heading", { name: /Hello, Rakib/i }).waitFor();
  await student.getByRole("heading", { name: "Topic mastery" }).waitFor();
  await shoot(student, "03-dashboard.png");
  await shoot(student, "dashboard.png");
  await studentCtx.close();

  // 04 - mobile landing page (390x844, iPhone-ish).
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobile = await mobileCtx.newPage();
  await mobile.goto(`${BASE_URL}/`, { waitUntil: "load" });
  await mobile.getByRole("heading", { level: 1 }).waitFor();
  await shoot(mobile, "04-mobile.png");
  await mobileCtx.close();

  // 05 - teacher dashboard overview.
  const teacherCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const teacher = await teacherCtx.newPage();
  await signIn(teacher, "teacher@demo.local");
  await teacher.waitForURL("**/teacher");
  await teacher.getByRole("heading", { name: "Teacher dashboard" }).waitFor();
  await teacher.getByRole("heading", { name: "Class progress" }).waitFor();
  await shoot(teacher, "05-admin.png");
  await shoot(teacher, "teacher.png");
  await teacherCtx.close();

  console.log("all screenshots captured");
} finally {
  await browser.close();
}
