import { Layers, Code2, Package, ShieldCheck, Lock, Clock, CreditCard, GitBranch } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";

const layout = [
  { key: "unified", icon: Layers, span: "lg:col-span-2" },
  { key: "typescript", icon: Code2 },
  { key: "footprint", icon: Package },
  { key: "callbacks", icon: ShieldCheck },
  { key: "handler", icon: Lock },
  { key: "doubleCharge", icon: Clock },
  { key: "iyzico", icon: CreditCard, span: "lg:col-span-2" },
  { key: "multi", icon: GitBranch },
] as const;

export default function Features({ t }: { t: Dictionary["features"] }) {
  const features = layout.map((item) => ({ ...item, ...t.items[item.key] }));
  return (
    <section id="features" className="py-24 px-5 sm:px-8 bg-muted/30 border-y border-border">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3">
            {t.eyebrow}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
            {t.titleLine1}
            <br />
            <span className="text-muted-foreground font-medium">{t.titleLine2}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f) => (
            <div
              key={f.key}
              className={[
                "rounded-xl border border-border bg-card p-6 flex flex-col gap-4 transition-colors hover:border-foreground/20",
                "span" in f ? f.span : "",
              ].join(" ")}
            >
              <div className="w-9 h-9 rounded-lg border border-border bg-muted/50 flex items-center justify-center">
                <f.icon className="w-4 h-4 text-foreground/80" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2 text-[15px]">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
