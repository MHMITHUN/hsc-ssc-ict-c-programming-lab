# Deployment Guide

Step-by-step from repository to a running Vercel deployment, in demo mode first, then with MongoDB persistence and real code execution.

## 1. Push to GitHub

The project is a standard Next.js 16 App Router app - no custom build configuration, no CI files required.

```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/<you>/hsc-ssc-ict-c-programming-lab.git
git push -u origin main
```

## 2. Create the Vercel project

1. Vercel dashboard -> **Add New... -> Project**.
2. Import the repository. Vercel detects the Next.js preset (build command `next build`, output handled automatically) - keep the defaults.
3. **Demo mode needs zero environment variables.** Press **Deploy**.

After the first deploy, the site runs on the in-memory DemoStore: 14 seeded users, 15 lessons, 30 problems, 6 quizzes and the demo students' history. Data resets whenever the serverless instance cold-starts - fine for a live demo, not for real classes.

## 3. Smoke test the deployment

- [ ] Home page loads; no console errors in DevTools.
- [ ] **Learn** -> a topic with a lesson (e.g. *Loops*) -> lesson page renders; the dry-run **Next** button steps the trace.
- [ ] Sign in as `student@demo.local` / `Demo@12345` -> dashboard shows stats and "Recommended next".
- [ ] **Playground** -> pick a sample -> **Run** -> output panel appears with a "Demo execution" note.
- [ ] Sign out, sign in as `teacher@demo.local` / `Demo@12345` -> class progress table renders; **Export CSV** downloads `class-progress.csv`.
- [ ] `/dashboard` while anonymous redirects to the login page.

## 4. Environment variables (all optional)

Set in Vercel -> Settings -> Environment Variables, for Production (and Preview if wanted):

| Variable | When you need it | Example |
| --- | --- | --- |
| `MONGODB_URI` | persistence across restarts / real classes | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net` |
| `MONGODB_DB_NAME` | custom database name (default `c_programming_lab`) | `c_programming_lab_prod` |
| `SESSION_SECRET` | **always in production** - otherwise a publicly-known fallback signs session cookies | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JUDGE0_API_URL` | real C execution instead of demo replay | `https://judge0-ce.p.rapidapi.com` |
| `JUDGE0_API_KEY` | with `JUDGE0_API_URL` | (your key) |
| `EXECUTION_MODE` | `judge0` to activate live execution (default `demo`) | `judge0` |

Redeploy after changing variables (Deployments -> ... -> Redeploy). Never commit secrets to the repository.

## 5. Seed the MongoDB database (Mongo mode)

With `MONGODB_URI` set in Vercel, seed the database once from any machine that can reach it:

```bash
# .env.local (do not commit)
MONGODB_URI="mongodb+srv://..."
# optional: MONGODB_DB_NAME=c_programming_lab

npm run seed
```

The script:

1. connects and creates the same indexes the app creates at boot (`users.email`, `lessons.slug`, `problems.slug`, `quizzes.slug` unique; `progress` unique on `userId+lessonSlug`; `quizAttempts` and `submissions` time indexes);
2. upserts **all** seed collections idempotently - users (by email, password scrypt-hashed at seed time), lessons/problems/quizzes (by slug), and the demo students' history: progress rows, quiz attempts and submissions;
3. prints per-collection counts (`inserted` vs `already present`).

Re-running is safe: `$setOnInsert` never overwrites teacher edits, new accounts, or real student activity.

Without `MONGODB_URI`, `npm run seed` prints a notice and exits 0 - the in-app demo store seeds itself automatically.

## 6. Rollback

1. Vercel -> **Deployments** -> open the last known-good deployment.
2. **Promote to Production**. The domain switches immediately (alias updates take seconds).
3. Deployments are stateless for the app. In demo mode there is nothing to roll back data-wise (the store resets anyway); in Mongo mode the database is untouched by a redeploy or rollback.
4. If a bad migration/seed ever needs undoing, restore the Atlas snapshot (Atlas -> Clusters -> Backups) rather than editing collections by hand.

## Cost notes

- Demo mode: free Hobby tier, no external services.
- Mongo mode: a free Atlas M0 cluster is enough for a class.
- Judge0: RapidAPI free tier works for small groups; without it the playground stays honestly in demo mode.
