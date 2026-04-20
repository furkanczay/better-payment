import { buttonVariants } from "@/lib/button-variants";
import { ArrowRight, Star, Terminal } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const codeLines = [
  { ln: 1, tokens: [{ c: "dim", v: "import" }, { c: "", v: " { " }, { c: "sky", v: "BetterPayment" }, { c: "", v: " } " }, { c: "dim", v: "from" }, { c: "green", v: ' "better-payment"' }] },
  { ln: 2, tokens: [] },
  { ln: 3, tokens: [{ c: "dim", v: "const" }, { c: "", v: " payment = " }, { c: "dim", v: "new" }, { c: "", v: " " }, { c: "sky", v: "BetterPayment" }, { c: "", v: "({" }] },
  { ln: 4, tokens: [{ c: "purple", v: "  defaultProvider" }, { c: "dim", v: ": " }, { c: "green", v: '"iyzico"' }, { c: "", v: "," }] },
  { ln: 5, tokens: [{ c: "purple", v: "  providers" }, { c: "dim", v: ": " }, { c: "", v: "{ iyzico: " }, { c: "dim", v: "{ enabled: " }, { c: "orange", v: "true" }, { c: "dim", v: " }" }, { c: "", v: ", paytr: " }, { c: "dim", v: "{ enabled: " }, { c: "orange", v: "true" }, { c: "dim", v: " }" }, { c: "", v: " }," }] },
  { ln: 6, tokens: [{ c: "", v: "});" }] },
  { ln: 7, tokens: [] },
  { ln: 8, tokens: [{ c: "muted", v: "// Switch providers on demand — same API" }] },
  { ln: 9, tokens: [{ c: "dim", v: "await" }, { c: "", v: " payment." }, { c: "sky", v: "use" }, { c: "dim", v: "(" }, { c: "green", v: '"paytr"' }, { c: "dim", v: ")." }, { c: "yellow", v: "initThreeDSPayment" }, { c: "dim", v: "(" }, { c: "", v: "opts" }, { c: "dim", v: ");" }] },
  { ln: 10, tokens: [{ c: "dim", v: "await" }, { c: "", v: " payment." }, { c: "sky", v: "use" }, { c: "dim", v: "(" }, { c: "green", v: '"iyzico"' }, { c: "dim", v: ")." }, { c: "yellow", v: "initThreeDSPayment" }, { c: "dim", v: "(" }, { c: "", v: "opts" }, { c: "dim", v: ");" }, { c: "primary", v: "▋" }] },
];

const colorMap: Record<string, string> = {
  dim: "text-muted-foreground/60",
  sky: "text-sky-400",
  green: "text-emerald-400",
  purple: "text-violet-400",
  orange: "text-orange-400",
  yellow: "text-amber-400",
  muted: "text-muted-foreground/40 italic",
  primary: "text-primary animate-[blink_1.1s_step-end_infinite]",
  "": "text-foreground/85",
};

function CodeWindow() {
  return (
    <div className="w-full max-w-[540px] rounded-2xl overflow-hidden border border-border/60 shadow-2xl shadow-black/30 bg-card">
      {/* Window chrome */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border/40">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Terminal className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-[11px] font-mono text-muted-foreground/60 tracking-wide">
            lib/payment.ts
          </span>
        </div>
      </div>
      {/* Code */}
      <div className="p-6 font-mono text-[12.5px] leading-[1.9] overflow-x-auto">
        <div className="flex gap-5">
          {/* Line numbers */}
          <div className="select-none text-right text-muted-foreground/20 shrink-0 leading-[1.9] tabular-nums text-[11px]">
            {codeLines.map((l) => <div key={l.ln}>{l.ln}</div>)}
          </div>
          {/* Code content */}
          <div className="flex-1 min-w-0">
            {codeLines.map((line, i) => (
              <div key={i}>
                {line.tokens.length === 0 ? (
                  <span>&nbsp;</span>
                ) : (
                  line.tokens.map((tok, j) => (
                    <span key={j} className={colorMap[tok.c] ?? "text-foreground/85"}>
                      {tok.v}
                    </span>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 [background-image:radial-gradient(oklch(0.5_0.1_270_/_0.06)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_40%,#000_30%,transparent_100%)]" />
        <div className="absolute -top-20 left-[15%] w-[600px] h-[600px] rounded-full bg-primary/6 blur-[140px]" />
        <div className="absolute top-1/2 right-[10%] w-[400px] h-[400px] rounded-full bg-violet-500/4 blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 w-full py-20 lg:py-10">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">
          {/* Left */}
          <div className="flex-1 flex flex-col items-start gap-7 min-w-0 max-w-xl">
            {/* Announcement badge */}
            <a
              href="https://github.com/furkanczay/better-payment/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 hover:bg-primary/12 px-3.5 py-1.5 text-xs font-mono text-primary transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              v3 Released — BetterPayment API
              <ArrowRight className="w-3 h-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Heading */}
            <div>
              <h1 className="text-[3rem] sm:text-[3.8rem] lg:text-[4.2rem] font-extrabold tracking-[-0.035em] leading-[1.0] text-foreground">
                One API.
                <br />
                <span className="gradient-text">Three providers.</span>
                <br />
                Zero repetition.
              </h1>
            </div>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-[440px]">
              <strong className="text-foreground font-semibold">better-payment</strong> unifies
              İyzico, PayTR, and Parampos under a single type-safe interface. Switch providers
              without rewriting your integration.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/docs"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 h-12 px-7 text-sm font-semibold shadow-lg shadow-primary/20",
                )}
              >
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <a
                href="https://github.com/furkanczay/better-payment"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "gap-2 h-12 px-7 text-sm font-medium",
                )}
              >
                <Star className="w-3.5 h-3.5" />
                Star on GitHub
              </a>
            </div>

            {/* Install command */}
            <div className="flex items-center gap-3 font-mono text-sm text-muted-foreground bg-muted/40 border border-border/60 rounded-xl px-5 py-3.5 w-full max-w-[340px]">
              <span className="text-primary select-none font-bold">$</span>
              <span className="text-foreground/75">npm install better-payment</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-1">
              <div>
                <div className="text-2xl font-bold tabular-nums text-foreground">3</div>
                <div className="text-xs text-muted-foreground mt-0.5">Providers</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <div className="text-2xl font-bold tabular-nums text-foreground">1</div>
                <div className="text-xs text-muted-foreground mt-0.5">Dependency</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <div className="text-2xl font-bold tabular-nums text-foreground">100%</div>
                <div className="text-xs text-muted-foreground mt-0.5">TypeScript</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <div className="text-2xl font-bold tabular-nums text-foreground">MIT</div>
                <div className="text-xs text-muted-foreground mt-0.5">License</div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex-1 flex justify-center lg:justify-end w-full">
            <CodeWindow />
          </div>
        </div>
      </div>
    </section>
  );
}
