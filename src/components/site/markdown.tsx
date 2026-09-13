import { cn } from "@/lib/cn";

/**
 * Very small markdown renderer for CMS article bodies.
 * Supports ## / ### headings, ordered + unordered lists, bold and paragraphs.
 */
export function Markdown({ content, className }: { content: string; className?: string }) {
  const blocks = content.split(/\n{2,}/);

  return (
    <div className={cn("space-y-4", className)}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={i} className="pt-2 text-base font-semibold text-slate-900">
              {inline(trimmed.slice(4))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="pt-4 text-xl font-bold tracking-tight text-slate-900">
              {inline(trimmed.slice(3))}
            </h2>
          );
        }
        if (/^\d+\.\s/m.test(trimmed) && trimmed.split("\n").every((l) => /^\d+\.\s/.test(l.trim()))) {
          return (
            <ol key={i} className="ml-5 list-decimal space-y-1.5 text-sm leading-relaxed text-slate-600">
              {trimmed.split("\n").map((line, k) => (
                <li key={k}>{inline(line.replace(/^\d+\.\s*/, ""))}</li>
              ))}
            </ol>
          );
        }
        if (trimmed.split("\n").every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={i} className="ml-5 list-disc space-y-1.5 text-sm leading-relaxed text-slate-600">
              {trimmed.split("\n").map((line, k) => (
                <li key={k}>{inline(line.replace(/^-\s*/, ""))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-slate-600">
            {inline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-slate-800">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
