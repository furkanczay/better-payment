import { buttonVariants } from "@/lib/button-variants";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const terminalLines = [
  { type: "comment", text: "// Configure once, use everywhere" },
  { type: "keyword", text: "const", rest: " payment = ", accent: "new BetterPayment", end: "({" },
  { type: "indent", text: "  defaultProvider:", value: ' "iyzico",' },
  { type: "indent", text: "  providers: {" },
  { type: "indent2", text: "    iyzico: {", dim: " enabled: true }" },
  { type: "indent2", text: "    paytr: {", dim: " enabled: true }" },
  { type: "indent", text: "  }" },
  { type: "bracket", text: "});" },
  { type: "blank" },
  { type: "comment", text: "// Switch providers on the fly" },
  {
    type: "call",
    pre: "await payment.",
    method: "use",
    args: '("paytr")',
    chain: ".",
    method2: "createPayment",
    args2: "({ ... })",
  },
];

function TerminalWindow() {
  return (
    <div className="relative w-full max-w-[520px] rounded-xl overflow-hidden border border-border/80 shadow-2xl shadow-black/20">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-card border-b border-border/60">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <span className="ml-2 text-[11px] font-mono text-muted-foreground/70 tracking-wide">
          lib/payment.ts
        </span>
      </div>

      {/* Code area */}
      <div className="relative bg-card/50 scanlines overflow-hidden">
        <div className="p-5 font-mono text-[12.5px] leading-[1.8] overflow-x-auto">
          {/* Line numbers */}
          <div className="flex gap-4">
            <div className="select-none text-right text-muted-foreground/25 shrink-0 leading-[1.8]">
              {terminalLines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <div className="flex-1 min-w-0">
              {terminalLines.map((line, i) => {
                if (line.type === "blank") return <div key={i}>&nbsp;</div>;
                if (line.type === "comment")
                  return (
                    <div key={i} className="text-muted-foreground/40 italic">
                      {line.text}
                    </div>
                  );
                if (line.type === "keyword")
                  return (
                    <div key={i}>
                      <span className="text-primary/70">{line.text}</span>
                      <span className="text-foreground/80">{line.rest}</span>
                      <span className="text-primary">{line.accent}</span>
                      <span className="text-muted-foreground/60">{line.end}</span>
                    </div>
                  );
                if (line.type === "bracket")
                  return (
                    <div key={i} className="text-muted-foreground/60">
                      {line.text}
                    </div>
                  );
                if (line.type === "indent")
                  return (
                    <div key={i}>
                      <span className="text-foreground/50">{line.text}</span>
                      {line.value && (
                        <span className="text-primary/60">{line.value}</span>
                      )}
                    </div>
                  );
                if (line.type === "indent2")
                  return (
                    <div key={i}>
                      <span className="text-foreground/40">{line.text}</span>
                      {line.dim && (
                        <span className="text-muted-foreground/30">{line.dim}</span>
                      )}
                    </div>
                  );
                if (line.type === "call")
                  return (
                    <div key={i}>
                      <span className="text-muted-foreground/50">{"await "}</span>
                      <span className="text-foreground/70">{line.pre}</span>
                      <span className="text-primary">{line.method}</span>
                      <span className="text-muted-foreground/60">{line.args}</span>
                      <span className="text-foreground/50">{line.chain}</span>
                      <span className="text-primary">{line.method2}</span>
                      <span className="text-muted-foreground/60">{line.args2}</span>
                      <span className="cursor-blink text-primary ml-0.5">▋</span>
                    </div>
                  );
                return null;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-14 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 noise">
        {/* Dot grid */}
        <div className="absolute inset-0 [background-image:radial-gradient(oklch(var(--foreground-oklch,0.5)_/_0.07)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_40%,transparent_100%)]" />
        {/* Glow orbs */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 w-full py-20 lg:py-0">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          {/* Left — Copy */}
          <div className="flex-1 flex flex-col items-start gap-6 min-w-0">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground border border-border/60 rounded-full px-3 py-1.5 bg-card/50 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Open Source &nbsp;·&nbsp; TypeScript &nbsp;·&nbsp; Node.js 20+
            </div>

            {/* Heading */}
            <h1 className="text-[2.8rem] sm:text-[3.6rem] lg:text-[4rem] font-extrabold tracking-[-0.03em] leading-[1.02] text-foreground">
              One API for{" "}
              <br />
              <span className="gradient-text">all payment</span>
              <br />
              <span className="gradient-text">gateways</span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-md leading-relaxed">
              <span className="text-foreground font-medium">better-payment</span> unifies İyzico,
              PayTR, and Parampos under a single type-safe interface.{" "}
              <span className="text-foreground/80">Stop rewriting payment logic.</span>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-1">
              <Link
                href="/docs"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 h-11 px-6 text-sm font-semibold",
                )}
              >
                Read the Docs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="https://github.com/furkanczay/better-payment"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "gap-2 h-11 px-6 text-sm font-medium",
                )}
              >
                <ExternalLink className="w-3.5 h-3.5" /> GitHub
              </a>
            </div>

            {/* Install */}
            <div className="flex items-center gap-3 font-mono text-sm text-muted-foreground bg-card/60 border border-border/60 backdrop-blur-sm rounded-lg px-4 py-3 w-full max-w-xs">
              <span className="text-primary select-none">$</span>
              <span className="text-foreground/80">npm install better-payment</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 pt-2 text-sm">
              <div>
                <span className="text-2xl font-bold tabular-nums text-foreground">3</span>
                <p className="text-xs text-muted-foreground mt-0.5">Providers</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <span className="text-2xl font-bold tabular-nums text-foreground">1</span>
                <p className="text-xs text-muted-foreground mt-0.5">Dependency</p>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <span className="text-2xl font-bold tabular-nums text-foreground">100%</span>
                <p className="text-xs text-muted-foreground mt-0.5">TypeScript</p>
              </div>
            </div>
          </div>

          {/* Right — Terminal */}
          <div className="flex-1 flex justify-center lg:justify-end w-full max-w-[520px]">
            <TerminalWindow />
          </div>
        </div>
      </div>
    </section>
  );
}
