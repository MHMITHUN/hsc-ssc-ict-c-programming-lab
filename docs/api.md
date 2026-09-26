# API & Server Actions

Everything the app exposes: three HTTP route handlers and three server-action modules. All mutations go through Server Actions; the route handlers exist where HTTP semantics demand it (public JSON catalogue, code execution, file download).

Zod schemas validate every input at the boundary. Guards: `apiGuard` for route handlers (401/403 JSON), `getSessionUser`/`requireRole` for pages, per-action session re-checks for actions.

---

## Route handlers

### `GET /api/problems` - public problem catalogue

Paginated listing of **published problems only** (spec 15.4). Coaching fields (`hint`, `solutionExplanation`, `expectedOutput`) are stripped - it is a catalogue, not an answer key.

Query parameters:

| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| `topic` | string | - | filter by topicSlug |
| `difficulty` | `easy\|medium\|hard` | - | |
| `q` | string | - | case-insensitive title search (max 100 chars) |
| `page` | int >= 1 | `1` | |
| `pageSize` | int 1..50 | `10` | |

Response `200`:

```json
{
  "items": [
    {
      "slug": "sum-1-to-n",
      "title": "Sum of 1 to N",
      "statement": "...",
      "difficulty": "easy",
      "topicSlug": "loops",
      "constraints": "1 <= n <= 10000",
      "sampleInput": "5",
      "sampleOutput": "15",
      "status": "published",
      "createdAt": "2026-01-15T09:00:00.000Z"
    }
  ],
  "total": 30, "page": 1, "pageSize": 10
}
```

Errors: `400 { "error": "..." }` for an invalid query.

### `POST /api/run` - execute C code

**Requires a signed-in user** (any role). Body: `{ "code": string (1..20000), "stdin"?: string (max 10000, default "") }`.

Response `200` - the honest `RunResult` of the active executor:

```json
{ "mode": "demo", "ok": true, "stdout": "15\n", "exitCode": 0,
  "note": "Demo execution: pre-recorded output for this exact program." }
```

- `mode: "demo"` - catalog replay. `ok: false` variants: unknown program ("no live compiler... not in the pre-recorded catalog"), or known program with different stdin (recorded output cannot be replayed honestly).
- `mode: "judge0"` - real compile+run via Judge0 (when `EXECUTION_MODE=judge0` **and** `JUDGE0_API_URL`/`JUDGE0_API_KEY` are set).

Errors: `401 { "error": "Authentication required." }` anonymous; `400` invalid body.

### `GET /api/teacher/export` - class progress CSV

**TEACHER or ADMIN only.** Returns `class-progress.csv` (`text/csv`, attachment) computed live from the store - the same rows as the on-screen table. Columns: `Name,Email,LessonsCompleted,LessonsTotal,QuizAvgPercent,ProblemsSolved,ProblemsAttempted,LastActiveAt`.

Errors: `401` anonymous; `403` for students.

---

## Server actions - auth (`src/app/actions/auth.ts`)

### `loginAction(prev, formData)`

Fields: `email`, `password`, optional `next` (same-site path only - `//` and absolute URLs are rejected).

- Success: sets the `cp_lab_session` cookie, redirects to `next` if safe, else `/dashboard` (STUDENT) or `/teacher` (TEACHER/ADMIN).
- Failure: `{ fieldErrors: { email?, password? } }` for invalid input; `{ error: "Incorrect email or password." }` for bad credentials (same message for unknown email and wrong password).

### `registerAction(prev, formData)`

Fields: `name` (min 2), `email`, `password` (min 8). Creates a **STUDENT** account (self-registration is student-only; staff accounts come from the seed or an admin), signs the user in, redirects to `/dashboard`. Duplicate email: `{ fieldErrors: { email: "An account with this email already exists." } }`.

### `logoutAction()`

Clears the session cookie and redirects to `/`.

---

## Server actions - learning (`src/app/actions/learning.ts`)

### `markLessonCompleteAction(formData)`

Field: `lessonSlug`. Requires a session and a **published** lesson; upserts progress idempotently (the unique `userId+lessonSlug` index means one row ever; re-pressing only bumps the attempts counter). No return value.

### `submitQuizAction(prev, formData)`

Fields: `quizSlug`, `answer-0..n` (option index per question; missing/invalid becomes `-1` = skipped).

Grades **server-side** from the stored `answerIndex` values, records one `quizAttempt` row, returns:

```json
{ "result": { "attemptId": "qat-...", "score": 4, "total": 5,
  "items": [ { "correct": true, "answerIndex": 1, "explanation": "..." }, ... ] } }
```

Anonymous: `{ "error": "Please sign in to attempt a quiz and save your score." }`.

### `recordSubmissionAction(problemSlug, code, stdout)`

Called from the problem page client after a run. Requires a session and a published problem. The verdict is made here, server-side: `accepted` iff `stdout.trim() === problem.expectedOutput.trim()`, else `wrong_answer`. Records the submission with the code and an auto-check note, returns `{ recorded: true, status }` (or `{ recorded: false, error }`).

---

## Server actions - teacher content (`src/app/actions/teacher.ts`)

All require TEACHER or ADMIN (checked inside every action). All mutations write through the store and revalidate the affected paths.

| Action | Input | Effect |
| --- | --- | --- |
| `createLessonAction(prev, formData)` | lesson form fields + `slug` | Creates a **draft** lesson, redirects to its editor |
| `updateLessonAction(prev, formData)` | `lessonId` + lesson form fields | Saves edits, returns `{ saved: true }` |
| `setLessonStatusAction(formData)` | `lessonId`, `status` (`published\|draft`) | Publish / retract (drafts vanish from all public surfaces) |
| `createProblemAction(prev, formData)` | problem form fields + `slug` | Creates a **draft** problem, redirects to its editor |
| `updateProblemAction(prev, formData)` | `problemId` + problem form fields | Saves edits, returns `{ saved: true }` |
| `setProblemStatusAction(formData)` | `problemId`, `status` | Publish / retract |

Common failure states: `{ error: "Only teachers and admins can..." }` without a staff session; `{ error: "Please fix the highlighted fields.", fieldErrors }` on validation failure; duplicate slug -> `{ fieldErrors: { slug: "This slug is already in use" } }`.

### Structured field formats (lesson/problem editors)

The multi-line textareas serialize structured data in simple line formats, parsed and validated by `src/lib/validation/content-forms.ts`:

- **Annotations**: one per line - `lineNumber|note`, e.g. `4|scanf reads n from the keyboard`.
- **Dry-run steps**: one per line - `step|line|variable|value|explanation` (step and line are positive integers), e.g. `5|8|sum|0 + 1 = 1|First addition.`.
- **Checks**: blocks separated by a **blank line**, each block exactly 4 lines - question / options (comma-separated, min 2) / answer index (0-based) / explanation.
- **Mistakes**: one per line.

The same hints appear in the editor UI; the server never trusts the client's formatting.
