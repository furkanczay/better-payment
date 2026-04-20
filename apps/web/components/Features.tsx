import { Shield, Zap, Code2, Layers, RefreshCw, CreditCard, Webhook, GitBranch } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Unified API surface",
    description:
      "One consistent method set across every provider. createPayment, refund, cancel — all providers respond the same way.",
    color: "text-violet-500 dark:text-violet-400",
    bg: "bg-violet-500/8 border-violet-500/15",
    span: "lg:col-span-2",
  },
  {
    icon: Code2,
    title: "100% TypeScript",
    description:
      "Full type definitions shipped out of the box. Catch payment errors at compile time, not in production.",
    color: "text-sky-500 dark:text-sky-400",
    bg: "bg-sky-500/8 border-sky-500/15",
    span: "",
  },
  {
    icon: Zap,
    title: "Minimal dependencies",
    description:
      "Only axios as a peer dependency. Keeps your bundle lean and your dependency tree clean.",
    color: "text-amber-500 dark:text-amber-400",
    bg: "bg-amber-500/8 border-amber-500/15",
    span: "",
  },
  {
    icon: Shield,
    title: "Secure by default",
    description:
      "HMAC-SHA256 signature validation, 3D Secure support, and no credential exposure in transport.",
    color: "text-emerald-500 dark:text-emerald-400",
    bg: "bg-emerald-500/8 border-emerald-500/15",
    span: "",
  },
  {
    icon: Webhook,
    title: "Auto HTTP handler",
    description:
      "BetterPaymentHandler turns your config into a full REST API with zero boilerplate — drop-in for Next.js or Express.",
    color: "text-rose-500 dark:text-rose-400",
    bg: "bg-rose-500/8 border-rose-500/15",
    span: "",
  },
  {
    icon: GitBranch,
    title: "Multi-provider switching",
    description:
      "Configure all providers upfront, then switch at runtime with payment.use(\"paytr\"). A/B test gateways without code changes.",
    color: "text-primary",
    bg: "bg-primary/8 border-primary/15",
    span: "",
  },
  {
    icon: CreditCard,
    title: "All payment methods",
    description:
      "Card, 3DS, EFT/IBAN, hosted checkout, installments, subscriptions — fully unified across the provider surface.",
    color: "text-teal-500 dark:text-teal-400",
    bg: "bg-teal-500/8 border-teal-500/15",
    span: "lg:col-span-2",
  },
  {
    icon: RefreshCw,
    title: "Subscription billing",
    description:
      "İyzico subscription APIs — product creation, pricing plans, card update — all available through the unified handler.",
    color: "text-orange-500 dark:text-orange-400",
    bg: "bg-orange-500/8 border-orange-500/15",
    span: "",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-28 px-5 sm:px-8 bg-muted/15 border-y border-border/50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            Everything you need,
            <br />
            <span className="text-muted-foreground font-medium">nothing you don&apos;t.</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className={[
                "group relative rounded-xl border bg-card p-6 flex flex-col gap-4 transition-all duration-300",
                "hover:shadow-lg hover:-translate-y-0.5",
                f.span,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Hover accent line */}
              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center ${f.bg} transition-all duration-300 group-hover:scale-105`}
              >
                <f.icon className={`w-4.5 h-4.5 ${f.color}`} />
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
