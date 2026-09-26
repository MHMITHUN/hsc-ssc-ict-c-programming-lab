import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  GraduationCap,
  ListChecks,
  Sparkles,
  Terminal,
  Users,
} from "lucide-react";
import { Badge, Card, CardContent, ProgressBar } from "@/components/ui";
import { LabPreview } from "@/components/landing/LabPreview";
import { Faq } from "@/components/landing/Faq";
import { listTopics, LEVEL_LABELS } from "@/lib/curriculum/topics";

/**
 * Landing page - fully static: no store reads, no session-dependent content.
 * Counts shown in copy are written as ranges ("13+ lessons") so the page
 * stays truthful without touching the database.
 */

export const metadata: Metadata = {
  title: "C Programming Lab - Interactive C Practicals for SSC & HSC ICT",
  description:
    "Interactive C programming lessons, a dry-run visualizer, a code playground and a 30-problem practice library for SSC and HSC ICT students - with real progress tracking for students and teachers.",
  openGraph: {
    title: "C Programming Lab - Interactive C Practicals for SSC & HSC ICT",
    description:
      "Lessons with annotated examples, dry-run traces, a code playground and an auto-checked problem library for SSC and HSC ICT students.",
    type: "website",
    siteName: "C Programming Lab",
  },
};

const LEARN_GRID = [
  {
    icon: BookOpen,
    title: "Guided lessons",
    text: "Every lesson states its objective, explains the concept in plain language, shows the syntax and walks through a fully annotated example.",
  },
  {
    icon: ListChecks,
    title: "Dry-run visualizer",
    text: "Step through hand-authored traces that show each variable changing line by line - the skill examiners actually test when they say trace the program.",
  },
  {
    icon: Terminal,
    title: "Code playground",
    text: "Write C in a real editor with syntax highlighting, custom input and an honest output panel. Sign in and your runs are executed against the configured runner.",
  },
  {
    icon: Code2,
    title: "30-problem library",
    text: "From summing two numbers to bubble sort and pointer swaps - each problem auto-checks your output against the sample case and records the result.",
  },
  {
    icon: ClipboardCheck,
    title: "Quizzes with real grading",
    text: "Topic quizzes are graded on the server and saved to your record - retakes are separate attempts, never overwritten.",
  },
  {
    icon: GraduationCap,
    title: "Progress that is actually yours",
    text: "Your dashboard is computed from your own lesson completions, submissions and quiz attempts - nothing on it is a mock-up.",
  },
];

export default function HomePage() {
  const topics = listTopics();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 py-20 text-center sm:px-6">
          <Badge tone="accent">
            <Sparkles className="mr-1 size-3" aria-hidden="true" />
            SSC &amp; HSC ICT practical companion
          </Badge>
          <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Learn C programming by running it, not just reading it
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted">
            An interactive lab for Bangladeshi SSC and HSC ICT students:
            annotated lessons, step-by-step dry runs, a code playground and an
            auto-checked problem library - with honest progress tracking for
            you and your teacher.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/learn"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Start learning
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/playground"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-5 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Terminal className="size-4" aria-hidden="true" />
              Open the playground
            </Link>
          </div>
        </div>
      </section>

      {/* Curriculum focus strip */}
      <section aria-label="Curriculum focus" className="border-b border-border bg-surface-2/50">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <p className="text-center text-sm text-muted">
            Fifteen topics from program structure to file handling, designed to
            complement common SSC and HSC ICT learning outcomes - the lab is an
            independent study companion, not a board-published syllabus
            document.
          </p>
        </div>
      </section>

      {/* What students learn */}
      <section aria-labelledby="learn-heading" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 id="learn-heading" className="text-center text-2xl font-semibold tracking-tight text-fg">
          What you get
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEARN_GRID.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="h-full">
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <Icon className="size-6 text-accent" aria-hidden="true" />
                  <h3 className="font-semibold text-fg">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{item.text}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Interactive lab preview */}
      <section aria-labelledby="lab-heading" className="border-y border-border bg-surface">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 id="lab-heading" className="text-2xl font-semibold tracking-tight text-fg">
              The lab, at a glance
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              Each problem page and the playground follow the same rhythm:
              write code in the editor, give it input, run it, read the
              output. Submissions are checked against the expected output on
              the server - the client never grades itself - and the result
              lands in your progress record.
            </p>
            <ul className="flex flex-col gap-2 text-sm text-fg">
              {[
                "Syntax-highlighted editor with sample programs",
                "Custom standard input for every run",
                "Honest status: finished, failed, or demo-mode miss",
                "Accepted runs marked against the sample test case",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <LabPreview />
        </div>
      </section>

      {/* Topic grid */}
      <section aria-labelledby="topics-heading" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-3 text-center">
          <h2 id="topics-heading" className="text-2xl font-semibold tracking-tight text-fg">
            The curriculum
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-muted">
            Fifteen topics in teaching order. Each topic with a published
            lesson opens a full lesson page; the rest are marked coming soon
            and stay honest about it.
          </p>
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <li key={topic.slug}>
              <Link
                href={`/learn/${topic.slug}`}
                className="flex h-full flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/40 hover:bg-surface-2/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-muted">
                    {String(topic.order).padStart(2, "0")}
                  </span>
                  <Badge tone="neutral">
                    {LEVEL_LABELS[topic.level]}
                  </Badge>
                </span>
                <span className="text-sm font-semibold text-fg">{topic.title}</span>
                <span className="text-xs text-muted">
                  {topic.audience === "both" ? "SSC + HSC" : topic.audience}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Progress example */}
      <section aria-labelledby="progress-heading" className="border-y border-border bg-surface">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 id="progress-heading" className="text-2xl font-semibold tracking-tight text-fg">
              Progress you can act on
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              The student dashboard shows lessons completed, problems solved,
              quiz averages, a topic mastery chart and a recommended next
              lesson - all computed from your real records. Teachers see the
              same data per student and can export it as CSV.
            </p>
          </div>
          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-fg">My dashboard</h3>
                <Badge tone="warning">Illustrative sample</Badge>
              </div>
              <dl className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-surface-2 p-3">
                  <dt className="text-xs text-muted">Lessons</dt>
                  <dd className="text-lg font-semibold text-fg">8/13</dd>
                </div>
                <div className="rounded-lg bg-surface-2 p-3">
                  <dt className="text-xs text-muted">Solved</dt>
                  <dd className="text-lg font-semibold text-fg">12</dd>
                </div>
                <div className="rounded-lg bg-surface-2 p-3">
                  <dt className="text-xs text-muted">Quiz avg</dt>
                  <dd className="text-lg font-semibold text-fg">78%</dd>
                </div>
              </dl>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium text-fg">Topic mastery example: Loops</p>
                <ProgressBar value={78} label="Loops mastery (sample)" />
              </div>
              <p className="text-xs text-muted">
                This card is a labelled example, not live data - your real
                dashboard fills in as you work.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Teacher mode */}
      <section aria-labelledby="teacher-heading" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 id="teacher-heading" className="text-2xl font-semibold tracking-tight text-fg">
              Built for teachers too
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              Teacher accounts manage the whole lab: write and edit lessons and
              problems with a structured editor, keep work-in-progress as
              drafts that students never see, publish with one click, and
              review auto-checked submissions per student or per problem. The
              class progress table exports to CSV for mark sheets and parent
              meetings.
            </p>
            <ul className="flex flex-col gap-2 text-sm text-fg">
              {[
                "Draft/publish control on every lesson and problem",
                "Structured editor: objectives, annotations, dry-run traces",
                "Per-problem acceptance rates to spot stuck points",
                "One-click CSV export of class progress",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <Card>
            <CardContent className="flex flex-col gap-3 p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-fg">
                <Users className="size-4 text-accent" aria-hidden="true" />
                Try it with the demo accounts
              </h3>
              <p className="text-sm text-muted">
                This deployment includes demo accounts on the sign-in page -
                teacher@demo.local to explore the teacher dashboard, and
                student@demo.local to see a dashboard filled with a term of
                realistic activity. Demo data resets when the server restarts
                and is labelled as demo throughout.
              </p>
              <Link
                href="/login"
                className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
              >
                Sign in as a demo user
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading" className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
          <h2 id="faq-heading" className="text-center text-2xl font-semibold tracking-tight text-fg">
            Frequently asked questions
          </h2>
          <div className="mt-8">
            <Faq />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section aria-labelledby="cta-heading" className="mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-6">
        <h2 id="cta-heading" className="text-2xl font-semibold tracking-tight text-fg">
          Ready to write your first program?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted">
          Start with Program Structure - the lesson takes about fifteen
          minutes and ends with a quiz and a practice task.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/learn"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Begin lesson 01
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/register"
            className="inline-flex h-11 items-center rounded-lg border border-border bg-surface px-5 text-sm font-medium text-fg transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Create a free account
          </Link>
        </div>
      </section>
    </div>
  );
}
