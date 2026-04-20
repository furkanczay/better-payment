import { buttonVariants } from "@/lib/button-variants";
import { ArrowRight, GitBranch } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CTA() {
  return (
    <section className="py-28 px-5 sm:px-8 bg-muted/15 border-y border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden border border-primary/15 bg-card noise">
          {/* Gradient blobs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-16 left-1/4 w-[500px] h-[400px] rounded-full bg-primary/10 blur-[100px]" />
            <div className="absolute -bottom-16 right-1/4 w-[400px] h-[300px] rounded-full bg-violet-500/6 blur-[80px]" />
          </div>

          {/* Top shimmer */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="relative px-8 sm:px-16 py-20">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
              {/* Copy */}
              <div className="max-w-lg">
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-4">
                  Open Source · MIT License
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                  Stop rewriting
                  <br />
                  payment logic.
                </h2>
                <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-md">
                  One package, three providers, full TypeScript support. Install
                  once and unify your entire Turkish payment stack.
                </p>

                {/* Install command */}
                <div className="flex items-center gap-3 font-mono text-sm text-muted-foreground bg-background/60 border border-border/60 rounded-xl px-5 py-3.5 mt-6 w-fit">
                  <span className="text-primary select-none font-bold">$</span>
                  <span className="text-foreground/75">
                    npm install better-payment
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 shrink-0">
                <Link
                  href="/docs"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "gap-2 h-12 px-8 text-sm font-semibold whitespace-nowrap shadow-lg shadow-primary/20",
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
                    "gap-2 h-12 px-8 text-sm font-medium whitespace-nowrap",
                  )}
                >
                  <GitBranch className="w-4 h-4" /> View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
