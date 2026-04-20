const frameworks = [
  { name: "Next.js", icon: "▲" },
  { name: "Express", icon: "⬡" },
  { name: "NestJS", icon: "✦" },
  { name: "Fastify", icon: "⚡" },
  { name: "Hono", icon: "🔥" },
  { name: "Bun", icon: "○" },
];

export default function TrustBar() {
  return (
    <div className="border-y border-border/50 bg-muted/15 py-5 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-[0.18em] shrink-0">
            Works with any Node.js framework
          </p>
          <div className="flex items-center gap-6 sm:gap-8 flex-wrap justify-center">
            {frameworks.map((fw) => (
              <div
                key={fw.name}
                className="flex items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors"
              >
                <span className="text-base" aria-hidden="true">{fw.icon}</span>
                <span className="text-sm font-medium">{fw.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
