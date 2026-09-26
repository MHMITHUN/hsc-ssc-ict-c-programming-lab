import type { Metadata } from "next";
import { Alert } from "@/components/ui";
import { PlaygroundClient } from "@/components/playground/PlaygroundClient";
import { requireUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Write and run C programs with syntax highlighting, custom input and honest execution feedback.",
};

export default async function PlaygroundPage() {
  const user = await requireUser("/playground");

  const mode: "demo" | "judge0" =
    process.env.EXECUTION_MODE !== "demo" &&
    process.env.JUDGE0_API_URL &&
    process.env.JUDGE0_API_KEY
      ? "judge0"
      : "demo";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Code Playground
        </h1>
        <p className="max-w-2xl text-sm text-muted">
          Welcome, {user.name}. Pick a sample program or write your own, give
          it input, and press Run. Syntax highlighting, copy and reset are all
          here - this is the same editor the problem pages use.
        </p>
      </header>

      {mode === "demo" ? (
        <Alert tone="warning" title="Demo execution mode">
          No live compiler is connected, so runs are matched against a
          pre-recorded catalog of known programs (every lesson example, every
          reference solution and the samples in the dropdown). Exact matches
          replay the recorded output; anything else fails honestly instead of
          making output up. Connect Judge0 via JUDGE0_API_URL and
          JUDGE0_API_KEY (see .env.example) for real execution.
        </Alert>
      ) : (
        <Alert tone="success" title="Live execution mode">
          Programs run on a real C compiler through Judge0. Standard input
          comes from the input box below the editor.
        </Alert>
      )}

      <PlaygroundClient defaultMode={mode} />
    </div>
  );
}
