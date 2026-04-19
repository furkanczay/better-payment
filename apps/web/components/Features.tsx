import { Shield, Zap, Code2, Layers, RefreshCw, CreditCard } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Unified API",
    description:
      "One consistent interface across all payment providers. Switch without rewriting integration logic.",
    wide: true,
    accent: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-500/8 dark:bg-violet-500/10 border-violet-500/15",
  },
  {
    icon: Code2,
    title: "Full TypeScript",
    description:
      "Complete type definitions out of the box. Catch payment errors at compile time, not in production.",
    wide: false,
    accent: "text-sky-500 dark:text-sky-400",
    bg: "bg-sky-500/8 dark:bg-sky-500/10 border-sky-500/15",
  },
  {
    icon: Zap,
    title: "Minimal Footprint",
    description: "Only axios as a dependency. Lean bundle, clean dependency tree.",
    wide: false,
    accent: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/8 dark:bg-amber-500/10 border-amber-500/15",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description: "API key encryption built in. 3D Secure across all providers from day one.",
    wide: false,
    accent: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/8 dark:bg-emerald-500/10 border-emerald-500/15",
  },
  {
    icon: RefreshCw,
    title: "Recurring Billing",
    description: "Built-in subscription support and installment inquiry across providers.",
    wide: false,
    accent: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-500/8 dark:bg-rose-500/10 border-rose-500/15",
  },
  {
    icon: CreditCard,
    title: "Payment Methods",
    description: "Card, 3DS, EFT/IBAN, hosted checkout, installments — all unified.",
    wide: true,
    accent: "text-primary",
    bg: "bg-primary/8 border-primary/15",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-32 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            Everything you need,
            <br />
            <span className="text-muted-foreground font-medium">nothing you don&apos;t.</span>
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={[
                "group relative rounded-xl border bg-card p-6 flex flex-col gap-4",
                "hover:shadow-lg transition-all duration-300",
                f.wide && i === 0 ? "sm:col-span-2 lg:col-span-2" : "",
                f.wide && i !== 0 ? "sm:col-span-2 lg:col-span-2" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Subtle top line accent */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div
                className={`w-9 h-9 rounded-lg border flex items-center justify-center ${f.bg} transition-all duration-300 group-hover:scale-110`}
              >
                <f.icon className={`w-4 h-4 ${f.accent}`} />
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-1.5 text-[15px]">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
