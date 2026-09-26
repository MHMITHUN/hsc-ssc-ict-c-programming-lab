import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="max-w-md">
          <p className="text-sm font-semibold text-fg">C Programming Lab</p>
          <p className="mt-1 text-sm text-muted">
            An interactive practical companion for SSC and HSC ICT students
            learning C programming — from program structure to file handling.
          </p>
          <p className="mt-3 text-xs text-muted">
            Demo data notice: without a configured database the app runs on
            sample data that resets on server restart.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
          <Link href="/learn" className="text-muted transition-colors hover:text-fg">
            Learn
          </Link>
          <Link href="/problems" className="text-muted transition-colors hover:text-fg">
            Problems
          </Link>
          <Link href="/playground" className="text-muted transition-colors hover:text-fg">
            Playground
          </Link>
          <Link href="/login" className="text-muted transition-colors hover:text-fg">
            Sign in
          </Link>
        </nav>
      </div>
      <div className="border-t border-border py-4">
        <p className="mx-auto max-w-6xl px-4 text-xs text-muted sm:px-6">
          © 2026 C Programming Lab. Built for classroom use.
        </p>
      </div>
    </footer>
  );
}
