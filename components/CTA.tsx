import { buttonVariants } from "@/lib/button-variants";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CTA() {
  return (
    <section className="py-32 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden border border-border bg-card noise">
          {/* Background gradient mesh */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[400px] h-[300px] bg-primary/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-primary/6 rounded-full blur-[60px]" />
          </div>
          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

          <div className="relative px-8 sm:px-16 py-20 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-10">
            {/* Copy */}
            <div className="text-center lg:text-left max-w-xl">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-4">
                Get Started
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                Stop duplicating
                <br />
                payment logic.
              </h2>
              <p className="mt-4 text-muted-foreground text-base max-w-md mx-auto lg:mx-0">
                One package, three providers, full TypeScript support. Install once and unify your
                entire payment stack.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 shrink-0">
              <Link
                href="/docs"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 h-11 px-7 text-sm font-semibold whitespace-nowrap",
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
                  "gap-2 h-11 px-7 text-sm font-medium whitespace-nowrap",
                )}
              >
                <ExternalLink className="w-3.5 h-3.5" /> View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
