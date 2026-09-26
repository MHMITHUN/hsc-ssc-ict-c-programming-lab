# HSC-SSC-ICT-C-Programming-Lab

An interactive C programming practical lab for SSC and HSC ICT students: 15 guided lessons with a dry-run visualizer, a 30-problem auto-checked practice library, a code playground and real per-student progress tracking.

## Live Demo

To add after Vercel deploy.

## Screenshots

| Page | Screenshot |
| --- | --- |
| Home | `docs/screenshots/home.png` |
| Curriculum Explorer | `docs/screenshots/learn.png` |
| Lesson page with dry-run visualizer | `docs/screenshots/lesson-dry-run.png` |
| Code Playground (demo execution) | `docs/screenshots/playground.png` |
| Problem page | `docs/screenshots/problem.png` |
| Student dashboard | `docs/screenshots/dashboard.png` |
| Teacher dashboard | `docs/screenshots/teacher.png` |

(Image files are added separately; the paths above are where they live.)

## Problem

SSC and HSC ICT students must learn C programming for their practical exams, but most practice happens on paper or in static PDFs. Students cannot run the programs they write, cannot see how variables change while a loop runs, and get no feedback until a teacher grades their work by hand. Teachers, in turn, have no easy way to see which students completed which lessons or how the class is actually doing.

## Educational Objective

Give every student a place where they can read a short lesson, immediately run its example, trace variables step by step the way examiners ask in "dry run" questions, practise against auto-checked problems, and see honest, personal progress. Designed to complement common SSC/HSC ICT and introductory CSE learning outcomes - it follows the topics those courses cover (program structure through file handling and debugging) without claiming any board endorsement.

## Features

- **Curriculum Explorer** - 15 topics in teaching order (Program Structure -> Loops -> Arrays -> ... -> File Handling -> Debugging), filterable by level (SSC/HSC) and kind (practical/theory). Topics without a published lesson are labeled "coming soon" instead of hidden.
- **Guided lessons** - objective, plain-language concept, syntax block, a fully annotated example (click a numbered line to read what it does), common mistakes with fixes, a hand-authored dry-run trace, instant concept checks, and a practice task.
- **Dry-run visualizer** - step/prev/next/play controls over a hand-authored trace of the lesson's own sample input, with the current row highlighted and an aria-live narration for screen readers.
- **Code playground** - CodeMirror 6 editor with C syntax highlighting, sample programs, custom stdin, and an honest output panel that always states which execution mode produced the result.
- **30-problem library** - filtered/paged/searchable listing; each problem page has a statement, constraints, sample I/O, hint, and a "run and check" flow that compares your program's output against the sample case server-side and records the result.
- **Topic quizzes** - 6 quizzes x 5 MCQs, graded on the server from the stored answer keys; retakes are separate attempts; instant per-question feedback after submission.
- **Student dashboard** - lessons completed, problems attempted/solved, average quiz score, active days, topic mastery (50% lesson completion + 50% best quiz score), a recommended next lesson, recent activity and recent submissions - all computed from the student's real records.
- **Teacher workspace** - lesson and problem editors (with structured field formats for annotations, dry-run steps and checks), draft/publish workflow, all submissions feed, class progress table and a CSV export.
- **Dual-mode data layer** - runs with zero configuration on an in-memory demo store, or on MongoDB when `MONGODB_URI` is set; the store interface is identical either way.
- **Honest demo mode** - demo execution replays pre-recorded outputs for known programs and fails honestly for unknown ones; every demo-mode surface is labeled. Nothing fakes success.

## Technology Stack

| Layer | Technology | Version |
| --- | --- | --- |
| Framework | Next.js (App Router) | 16.3.6 |
| UI runtime | React | 19.3.0 |
| Language | TypeScript (strict) | 5.9.3 |
| Styling | Tailwind CSS (v4 `@theme` tokens, no config file) | 4.3.x |
| Validation | Zod | 4.6.x |
| Database driver | MongoDB (Node.js driver) | 7.6.x |
| Icons | lucide-react | 1.48.x |
| Charts | Recharts | 3.10.x |
| Code editor | @uiw/react-codemirror + @codemirror/lang-cpp | 4.25.x / 6.x |
| Auth | node:crypto (scrypt + HMAC-SHA256) | built-in |
| Unit tests | Vitest + happy-dom + Testing Library | 5.0.x |
| E2E tests | Playwright | 1.63.0 |
| Linting / formatting | ESLint (eslint-config-next) / Prettier | 9.x / 3.9.x |
| Package manager | npm | 11.x |

## Architecture

```text
            Browser (React client components: editor, dry-run player, charts)
                                |
              HTML (server components) + Server Action form posts
                                |
                     Next.js 16 App Router (Node runtime)
              /  server pages   \   /  route handlers  \   /  server actions
                     |                /api/problems        auth / learning / teacher
                     |                /api/run                     |
                     |                /api/teacher/export           |
                     +------------------+---------------------------+
                                            |
                                  Store interface (src/lib/db/index.ts)
                                     /                    \
                              DemoStore                MongoStore
                        (in-memory Maps,          (mongodb driver, every
                         lazily seeded on          document zod-parsed
                         first access, resets     at the boundary,
                         on restart; used when    used when MONGODB_URI
                         MONGODB_URI is unset)     is set)

              /api/run -> Executor interface (src/lib/code-execution)
                                     /                    \
                            DemoExecutor                Judge0Executor
                       (replays pre-recorded        (real compile+run via
                        outputs for known            the Judge0 API, used
                        programs; honest miss        when JUDGE0_API_URL +
                        for unknown ones)            JUDGE0_API_KEY are set)
```

**Dual-mode store.** Every page, route handler and server action talks to the same `Store` interface. With `MONGODB_URI` unset the app boots a `DemoStore` - plain in-memory Maps seeded on first access (14 users, 15 lessons, 30 problems, 6 quizzes, and the demo students' history), so `npm install && npm run dev` works with no database. With `MONGODB_URI` set, the same code runs on `MongoStore`; documents are parsed with the same zod schemas at the boundary, and `npm run seed` fills the database idempotently. No feature behaves differently between the modes except persistence.

**Demo execution honesty.** `POST /api/run` returns whatever the active executor really did, and the UI displays that note verbatim. In demo mode the executor normalizes the submitted source and looks it up in a 51-entry catalog (every lesson example, every problem reference solution, the playground samples). A hit replays the recorded stdout for the recorded stdin; a different stdin or an unknown program returns `ok: false` with an explanation - it never invents output.

**No middleware.** There is no `middleware.ts`. Guarding happens where the data is: server components call `requireUser` / `requireRole` (redirect to `/login` or `/403`), route handlers call `apiGuard` which returns a 401/403 JSON response, and every server action re-checks the session role before mutating.

## Database Model

All timestamps are ISO strings. Every collection is zod-schema'd in `src/lib/db/types.ts`.

| Collection | Key fields | Indexes |
| --- | --- | --- |
| `users` | `id`, `name`, `email`, `passwordHash` (`scrypt$salt$hash`), `role` (ADMIN/TEACHER/STUDENT), `createdAt` | `{ email: 1 }` unique |
| `lessons` | `id`, `slug`, `topicSlug`, `level`, `audience`, `summary`, `objective`, `conceptMd`, `syntax`, `example { code, annotations[] }`, `mistakes[]`, `dryRun[]?`, `checks[]?`, `sampleInput/Output`, `practiceTask`, `status` (draft/published), `authorId`, `createdAt`, `updatedAt` | `{ slug: 1 }` unique |
| `problems` | `id`, `slug`, `title`, `statement`, `difficulty` (easy/medium/hard), `topicSlug`, `constraints`, `sampleInput/Output`, `hint`, `solutionExplanation`, `starterCode`, `expectedOutput`, `status`, `createdAt` | `{ slug: 1 }` unique |
| `quizzes` | `id`, `slug`, `topicSlug`, `title`, `questions[] { id, prompt, options[], answerIndex, explanation }` | `{ slug: 1 }` unique |
| `quizAttempts` | `id`, `quizId`, `userId`, `answers[]` (chosen index, -1 = skipped), `score`, `total`, `createdAt` | `{ userId: 1, createdAt: -1 }` |
| `progress` | `id`, `userId`, `lessonSlug`, `completedAt`, `attempts` | `{ userId: 1, lessonSlug: 1 }` unique (idempotent completion) |
| `submissions` | `id`, `problemId`, `userId`, `code`, `status` (pending/accepted/wrong_answer/error/reviewed), `note?`, `createdAt` | `{ createdAt: -1 }` |

## Authentication and Authorization

- **Passwords**: scrypt via `node:crypto` - random 16-byte salt, 64-byte derived key, stored as `scrypt$<salt-hex>$<hash-hex>`; verification is timing-safe.
- **Sessions**: stateless token = base64url(JSON `{ uid, role, exp }`) + "." + base64url(HMAC-SHA256 signature), stored in an httpOnly, SameSite=Lax cookie (`cp_lab_session`, 7 days, `secure` in production). `SESSION_SECRET` signs it; in production set it to a strong random value (a fixed fallback exists only so demo mode runs out of the box).
- **Role re-check**: every request resolves the token then cross-checks the role against the stored user, so a token can never outlive a role change.
- **Roles**: STUDENT (dashboard, learning, quizzes, submissions), TEACHER (content editors, class progress, CSV export), ADMIN (everything teachers can do). Self-registration creates STUDENT accounts only; teacher and admin accounts come from the seed.
- **Guards, not middleware**: `requireUser`/`requireRole` protect server components (redirects), `apiGuard` protects route handlers (401/403 JSON), and each server action re-validates the session before writing.

## Testing

```bash
npm run test        # unit + integration in watch mode (Vitest)
npm run test:run    # same suites, one CI-style run (~90 tests across 10 files)
npm run test:e2e    # Playwright smoke tests (Chromium; auto-starts npm run dev)
npm run lint        # ESLint (eslint-config-next)
npm run typecheck   # tsc --noEmit
npm run build       # Next.js production build
```

- **Unit/integration** (`tests/*.test.ts`): password hashing (roundtrip, unique salts, malformed hashes), session tokens (roundtrip, tamper, expiry, schema), request validators (login/register/run schemas), quiz grading (perfect/partial/all-wrong/skipped, seeded-history consistency), store business rules (draft visibility, idempotent progress, submissions), curriculum integrity (15 ordered topics, valid + unique slugs), demo executor catalog behavior, and the dashboard analytics functions.
- **E2E** (`tests/e2e/smoke.spec.ts`): home page, Learn -> Loops lesson -> dry-run table stepping, playground sample run with the demo-mode note, student login -> dashboard progress elements, logout. Each test fails if any `pageerror` or `console.error` fires.

Also useful: `npm run lint`, `npm run typecheck`, `npm run build`.

## Local Development

```bash
npm install        # Node >= 22, npm 11
npm run dev        # http://localhost:3000 (demo mode: no database needed)
```

Sign in with a demo account (below) or register your own student account. Data lives in memory and resets when the dev server restarts; to persist across restarts, set `MONGODB_URI` in `.env` and run `npm run seed` once.

## Environment Variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MONGODB_URI` | no | _(unset = demo mode)_ | MongoDB connection string. Unset runs the in-memory DemoStore; set runs MongoStore. Example: `mongodb://localhost:27017` |
| `MONGODB_DB_NAME` | no | `c_programming_lab` | Database name when `MONGODB_URI` is set |
| `SESSION_SECRET` | in production | demo fallback | HMAC-SHA256 key for session cookies. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JUDGE0_API_URL` | no | _(unset = demo execution)_ | Judge0 endpoint for real C execution |
| `JUDGE0_API_KEY` | no | _(unset)_ | Judge0 API key |
| `EXECUTION_MODE` | no | `demo` | `"demo"` (pre-recorded catalog) or `"judge0"` (live compile) |

See `.env.example`. Never commit real secrets.

## Deployment (Vercel)

1. Push the repository to GitHub (the project is a standard Next.js App Router app - no custom build configuration).
2. In Vercel: **Add New... -> Project**, import the repository; the Next.js preset is detected automatically.
3. **Demo mode needs zero environment variables** - deploy immediately and the in-memory store seeds itself.
4. Optional variables (Production + Preview): `MONGODB_URI` + `MONGODB_DB_NAME` for persistence, `SESSION_SECRET` (strongly recommended in production), `JUDGE0_API_URL` + `JUDGE0_API_KEY` + `EXECUTION_MODE=judge0` for real code execution.
5. Deploy, then run the smoke checklist:
   - home page loads with no console errors;
   - Learn -> any topic with a lesson -> dry-run "Next" button steps the trace;
   - sign in as `student@demo.local` / `Demo@12345` -> dashboard shows your stats;
   - Playground -> Run on a sample -> output panel appears with an execution-mode note;
   - sign in as `teacher@demo.local` -> class progress table renders and CSV export downloads.
6. **Mongo mode**: create a cluster (Atlas or self-hosted), set `MONGODB_URI` (+ `SESSION_SECRET`), then run `npm run seed` once from any machine that can reach the database - it creates indexes and upserts all seed data idempotently (re-runs never overwrite teacher edits or real activity).
7. **Rollback**: Vercel -> Deployments -> open the last known-good deployment -> **Promote to Production**. Deployments are stateless for the app; database content is untouched by a rollback (demo-mode data resets on every deploy anyway).

## Demo Accounts

| Email | Role | Password |
| --- | --- | --- |
| `admin@demo.local` | ADMIN | `Demo@12345` |
| `teacher@demo.local` | TEACHER | `Demo@12345` |
| `student@demo.local` | STUDENT | `Demo@12345` |

All accounts (and the ten demo students behind the class progress views) are fictional and exist only in the seed data.

## Known Limitations

- **Demo execution is pre-recorded.** The catalog covers 51 programs (lesson examples, reference solutions, playground samples). Any other program - or a known program with different stdin - fails honestly instead of executing. Connect Judge0 for a real compiler.
- **The demo store resets on restart.** In-memory mode loses new accounts, quiz attempts and submissions when the server restarts. Set `MONGODB_URI` for persistence.
- **Dry-run traces are hand-authored**, produced by a teacher for the lesson's sample input - they are a teaching visualization, not a live debugger (pages say so).
- **Problem auto-checking uses the single sample test case** (trimmed exact output match), not a hidden multi-case suite.
- **No middleware**: correctness depends on every page/handler/action guarding itself - which they do, but adding a new route means adding its guard.

## Future Enhancements

- Hidden multi-case test suites per problem (needs a sandboxed runner).
- Judge0 websocket streaming with per-student CPU/time limits.
- Bengali-language toggle for lesson content.
- Teacher assignment flows (due dates, class rosters) on top of the existing progress data.
- Spaced-repetition review queue driven by quiz mistakes.
- Contest/leaderboard mode for programming clubs.

## Teaching Use Cases

- **Classroom demo**: project a lesson's dry-run and step through it while narrating - the table shows exactly which line runs and how each variable changes.
- **Lab sessions**: assign 2-3 problems from one topic; students run and self-check in the browser, and submissions land in the teacher's review feed automatically.
- **Homework tracking**: the class progress table (and CSV export) shows lessons completed, quiz averages and last-active dates per student - computed from real records, not self-reported.
- **Self-study**: the dashboard's "Recommended next" sends each student to the first incomplete published topic in curriculum order.
- **Exam preparation**: dry-run traces mirror the "trace the program" question style of SSC/HSC practical exams; quizzes give instant explanations for wrong answers.

## Interview Talking Points

- **Dual-mode persistence behind one interface**: swapping an in-memory store for MongoDB with zero page-level changes, with zod parsing at the Mongo boundary.
- **Security done without a framework crutch**: scrypt hashing, HMAC-signed stateless cookies, timing-safe comparisons, role re-verification against the store on every request, and guards colocated with data instead of middleware.
- **Honest degradation**: a demo executor that refuses to fabricate output, and UI that labels pre-recorded results - a concrete answer to "how do you handle missing third-party dependencies?"
- **Idempotent domain rules**: progress completion and seeding are upserts by design; quiz grading happens server-side from stored answer keys and can never be driven by the client.
- **Testing pyramid in practice**: pure-function analytics covered by unit tests, store business rules by integration-style tests, five user flows by Playwright with a zero-console-error policy.
- **Modern Next.js**: React 19 server components, Server Actions for mutations, awaited `cookies()`/`params`/`searchParams`, and streaming-friendly guarded pages.

## License

MIT - see [LICENSE](./LICENSE).
