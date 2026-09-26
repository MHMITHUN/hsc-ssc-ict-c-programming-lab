/**
 * Renders a lesson's conceptMd: plain paragraphs separated by blank lines;
 * lines that start with "- " inside a block become a bullet list.
 * Server-safe, no markdown dependency (by design - content stays plain).
 */
export function ConceptText({ markdown }: { markdown: string }) {
  const blocks = markdown
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-fg">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim());
        const isList = lines.every((l) => l.startsWith("- "));
        if (isList) {
          return (
            <ul key={i} className="ml-5 list-disc space-y-1.5">
              {lines.map((line, j) => (
                <li key={j}>{line.slice(2).trim()}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 && " "}
                {line}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
