import { test, expect, type Page } from "@playwright/test";

/**
 * Smoke tests (spec section 13): home page, the Loops lesson with its
 * dry-run visualizer, the playground run flow, the student dashboard and
 * logout. Every test collects page errors and console.error messages and
 * FAILS if any appeared during the flow.
 */

const STUDENT_EMAIL = "student@demo.local";
const STUDENT_PASSWORD = "Demo@12345";

/** Collect uncaught errors + console.error output for the whole test. */
function collectBrowserErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console.error: ${message.text()}`);
    }
  });
  return errors;
}

function expectNoBrowserErrors(errors: string[]): void {
  expect(errors, "Browser errors were logged during the flow").toEqual([]);
}

/** Sign in through the real login form and land on /dashboard. */
async function signInAsStudent(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email" }).fill(STUDENT_EMAIL);
  await page.getByRole("textbox", { name: "Password" }).fill(STUDENT_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/dashboard");
}

test("home page loads with a visible h1 and no console errors", async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expectNoBrowserErrors(errors);
});

test("Learn -> Loops lesson shows the dry-run table and the next-step button works", async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);

  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Learn" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Curriculum Explorer" }),
  ).toBeVisible();

  // Open the Loops topic card (the whole card is one link; its accessible
  // name starts with the topic number, which keeps the match unique - other
  // card descriptions also mention the word "loops").
  await page.getByRole("link", { name: /^06\s+Loops\b/ }).click();
  await expect(
    page.getByRole("heading", { level: 1, name: /Loops: while, for/i }),
  ).toBeVisible();

  // The dry-run section renders a table with steps.
  await expect(
    page.getByRole("heading", { name: /dry run/i }),
  ).toBeVisible();
  const table = page.getByRole("table");
  await expect(table).toBeVisible();
  await expect(table.getByRole("columnheader", { name: "Step" })).toBeVisible();
  await expect(page.getByText(/^Step 1 of \d+$/)).toBeVisible();

  // Clicking "Next step" advances the trace.
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByText(/^Step 2 of \d+$/)).toBeVisible();

  expectNoBrowserErrors(errors);
});

test("Playground: load a sample, Run, output panel shows the demo-mode note", async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);

  // The playground requires a signed-in user (apiGuard on /api/run too).
  await signInAsStudent(page);
  await page.goto("/playground");
  await expect(
    page.getByRole("heading", { name: "Code Playground" }),
  ).toBeVisible();

  // Loading a different sample exercises the sample loader.
  const sampleSelect = page.getByRole("combobox", { name: "Sample program" });
  await sampleSelect.selectOption({ index: 1 });

  await page.getByRole("button", { name: "Run" }).click();

  // Demo execution replays the pre-recorded output and says so honestly.
  await expect(
    page.getByText("Demo execution: pre-recorded output for this exact program."),
  ).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByText("Demo: pre-recorded", { exact: false }),
  ).toBeVisible();

  expectNoBrowserErrors(errors);
});

test("student login reaches a dashboard with real progress elements", async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);

  await signInAsStudent(page);

  await expect(page.getByRole("heading", { name: /Hello, Rakib/i })).toBeVisible();
  await expect(page.getByText("Lessons completed")).toBeVisible();
  await expect(page.getByText("Average quiz score")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Topic mastery" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Recommended next/i }),
  ).toBeVisible();

  expectNoBrowserErrors(errors);
});

test("logout control is visible after login and returns to the home page", async ({
  page,
}) => {
  const errors = collectBrowserErrors(page);

  await signInAsStudent(page);
  const logout = page.getByRole("button", { name: "Logout" });
  await expect(logout).toBeVisible();

  await logout.click();
  await page.waitForURL("/");
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Login" }),
  ).toBeVisible();

  expectNoBrowserErrors(errors);
});
