import { buttonVariants } from "@/lib/button-variants";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CTA() {
  return (
    <section className="py-28 px-4 sm:px-6 bg-muted/20">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-3xl border border-primary/20 bg-card overflow-hidden p-10 sm:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Ready to simplify payments?
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-md mx-auto">
              Join developers who stopped duplicating payment logic across providers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link
                href="/docs"
                className={cn(buttonVariants({ size: "lg" }), "gap-2 h-12 px-6")}
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://github.com/furkanczay/better-payment"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 h-12 px-6")}
              >
                <ExternalLink className="w-4 h-4" /> View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
