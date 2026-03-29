import { buttonVariants } from "@/lib/button-variants";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ExternalLink, Terminal } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 w-full">
        <div className="flex flex-col items-center text-center gap-6 max-w-4xl mx-auto">
          <Badge variant="outline" className="gap-1.5 text-xs px-3 py-1 border-primary/30 text-primary bg-primary/5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Open Source · TypeScript · Node.js 20+
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.05]">
            One API for{" "}
            <span className="text-primary">all payment</span>
            <br />
            <span className="text-primary">gateways</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            <strong className="text-foreground font-medium">better-payment</strong> unifies İyzico,
            PayTR, and Parampos under a single, type-safe API. Stop rewriting payment logic —
            write it once, use it everywhere.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              href="/docs"
              className={cn(buttonVariants({ size: "lg" }), "gap-2 h-12 px-6 text-base")}
            >
              Read the Docs <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/furkanczay/better-payment"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 h-12 px-6 text-base")}
            >
              <ExternalLink className="w-4 h-4" /> GitHub
            </a>
          </div>

          {/* Install box */}
          <div className="mt-6 w-full max-w-sm">
            <div className="flex items-center gap-3 bg-muted/60 border border-border rounded-xl px-5 py-4 font-mono text-sm">
              <Terminal className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">$</span>
              <span className="text-foreground">npm install better-payment</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 mt-4 text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-bold text-foreground">3</span>
              <span>Providers</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-bold text-foreground">1</span>
              <span>Dependency</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-bold text-foreground">100%</span>
              <span>TypeScript</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
