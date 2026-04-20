const before = `// iyzico setup
import Iyzipay from "iyzipay";
const iyzico = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET,
  uri: "https://sandbox-api.iyzipay.com",
});

// PayTR setup (completely different API)
// ... 50+ lines of form-encoded setup

// Parampos setup (SOAP, totally different)
// ... another 60+ lines of config

// Each provider: different request shape,
// different response format, different
// error codes. Maintain 3 integrations.`;

const after = `import { BetterPayment } from "better-payment";

const payment = new BetterPayment({
  defaultProvider: "iyzico",
  providers: {
    iyzico: { enabled: true, config: { ... } },
    paytr:  { enabled: true, config: { ... } },
  },
});

// Unified API — works identically
// across every provider
await payment.use("iyzico").createPayment(opts);
await payment.use("paytr").createPayment(opts);

// Switch providers without any code change.`;

type Line = { num: number; content: string };

function parseLines(code: string): Line[] {
  return code.split("\n").map((content, i) => ({ num: i + 1, content }));
}

function CodePane({
  title,
  badge,
  code,
  variant,
}: {
  title: string;
  badge: string;
  code: string;
  variant: "bad" | "good";
}) {
  const lines = parseLines(code);
  const borderColor = variant === "bad" ? "border-destructive/20" : "border-primary/25";
  const badgeClass =
    variant === "bad"
      ? "bg-destructive/10 text-destructive border-destructive/20"
      : "bg-primary/10 text-primary border-primary/20";
  const dotColor = variant === "bad" ? "bg-destructive/60" : "bg-emerald-500/70";

  return (
    <div className={`flex-1 rounded-2xl border ${borderColor} bg-card overflow-hidden min-w-0`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-border/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-border/60" />
            <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          </div>
          <span className="ml-2 text-[11px] font-mono text-muted-foreground/60">{title}</span>
        </div>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border ${badgeClass}`}
        >
          {badge}
        </span>
      </div>
      {/* Code */}
      <div className="p-5 font-mono text-[11.5px] leading-[1.85] overflow-x-auto">
        <div className="flex gap-4">
          <div className="select-none text-right text-muted-foreground/20 shrink-0 text-[10.5px] leading-[1.85] tabular-nums">
            {lines.map((l) => (
              <div key={l.num}>{l.num}</div>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            {lines.map((l, i) => {
              const isComment = l.content.trim().startsWith("//");
              const isImport = l.content.trim().startsWith("import");
              const cls = isComment
                ? "text-muted-foreground/40 italic"
                : isImport
                ? "text-sky-400 dark:text-sky-400"
                : "text-foreground/80";
              return (
                <div key={i} className={cls}>
                  {l.content || "\u00a0"}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Compare() {
  return (
    <section className="py-28 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-3">
            The Problem
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            Every gateway has a
            <br />
            <span className="text-muted-foreground font-medium">completely different API.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-xl">
            Switching providers means rewriting your entire payment stack — different request
            shapes, different error codes, different auth flows. better-payment eliminates that
            entirely.
          </p>
        </div>

        {/* Comparison */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <CodePane
            title="integration/payments.ts"
            badge="Without"
            code={before}
            variant="bad"
          />

          {/* Divider */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-2 shrink-0 px-2">
            <div className="w-px flex-1 bg-border" />
            <div className="w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center">
              <span className="text-muted-foreground/60 text-xs">→</span>
            </div>
            <div className="w-px flex-1 bg-border" />
          </div>

          <CodePane
            title="lib/payment.ts"
            badge="With better-payment"
            code={after}
            variant="good"
          />
        </div>

        {/* Key benefit pills */}
        <div className="flex flex-wrap gap-2 mt-8">
          {[
            "One interface for all providers",
            "TypeScript-first",
            "Unified error handling",
            "Switch providers in one line",
          ].map((benefit) => (
            <span
              key={benefit}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/40 border border-border/60 rounded-full px-3 py-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              {benefit}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
