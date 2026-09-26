const FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "Is it free to use?",
    answer:
      "Yes. Browsing every published lesson and problem, and using the playground with a free account, costs nothing. This deployment also ships with demo accounts so a teacher can preview the whole experience before inviting students.",
  },
  {
    question: "Does it really run C code?",
    answer:
      "It depends on how the lab is configured, and the app always says which mode it is in. In demo mode there is no live compiler: runs replay recorded outputs for the curriculum's known programs, and an unknown program gets an honest miss with an explanation. Connect a Judge0 API key and the same editor compiles and executes your code for real.",
  },
  {
    question: "How do teachers use it?",
    answer:
      "Teacher and admin accounts can create and edit lessons and problems, publish or unpublish them, review every auto-checked submission, follow per-student progress, and export the class progress table as CSV. Students only ever see published content.",
  },
  {
    question: "Is this an official board product?",
    answer:
      "No. The lab is designed to complement common SSC and HSC ICT learning outcomes, but it is not affiliated with, endorsed by, or approved by any education board. Your teacher's syllabus and exam instructions always come first.",
  },
  {
    question: "Do I need an account?",
    answer:
      "Reading lessons and the problem library is open to everyone. Signing in is what turns the lab into a course: your completed lessons, quiz scores and problem submissions are saved, and your dashboard and the teachers' class view are computed from those real records.",
  },
];

/** Landing FAQ - native details/summary keeps it keyboard accessible. */
export function Faq() {
  return (
    <div className="flex flex-col gap-3">
      {FAQS.map((faq) => (
        <details
          key={faq.question}
          className="group rounded-xl border border-border bg-surface px-5 py-4"
        >
          <summary className="cursor-pointer list-none text-sm font-medium text-fg marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            <span className="flex items-center justify-between gap-3">
              {faq.question}
              <span
                aria-hidden="true"
                className="text-muted transition-transform group-open:rotate-45"
              >
                +
              </span>
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
