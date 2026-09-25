import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const KEYWORDS = new Set([
  "import", "from", "export", "default", "const", "let", "new", "await", "async",
  "return", "if", "true", "false",
]);

// Comments, strings, identifiers — highlighted with weight and contrast only, no hue.
const TOKEN = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|([A-Za-z_$][\w$]*)/gm;

function highlight(code: string) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of code.matchAll(TOKEN)) {
    const index = m.index ?? 0;
    if (index > last) out.push(code.slice(last, index));
    const [text, comment, string, word] = m;
    if (comment) {
      out.push(<span key={index} className="text-muted-foreground/70 italic">{text}</span>);
    } else if (string) {
      out.push(<span key={index} className="text-foreground">{text}</span>);
    } else if (word && KEYWORDS.has(word)) {
      out.push(<span key={index} className="text-muted-foreground">{text}</span>);
    } else {
      out.push(text);
    }
    last = index + text.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export default function Code({
  code,
  file,
  shell = false,
  className,
}: {
  code: string;
  file?: string;
  shell?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden min-w-0", className)}>
      {file && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/40">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-border" />
            <span className="w-2.5 h-2.5 rounded-full bg-border" />
            <span className="w-2.5 h-2.5 rounded-full bg-border" />
          </div>
          <span className="ml-2 text-[11px] font-mono text-muted-foreground">{file}</span>
        </div>
      )}
      <pre className="p-5 font-mono text-[12px] leading-[1.8] overflow-x-auto text-foreground/80">
        {shell ? (
          <code>
            <span className="text-muted-foreground select-none">$ </span>
            {code}
          </code>
        ) : (
          <code>{highlight(code)}</code>
        )}
      </pre>
    </div>
  );
}
