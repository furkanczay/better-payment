const frameworks = ["Next.js", "Express", "NestJS", "Fastify", "Hono", "Bun"];

export default function TrustBar() {
  return (
    <div className="border-y border-border py-5 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.16em] shrink-0">
            Works with any Node.js server framework
          </p>
          <ul className="flex items-center gap-6 sm:gap-8 flex-wrap justify-center">
            {frameworks.map((name) => (
              <li key={name} className="text-sm font-medium text-muted-foreground">
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
