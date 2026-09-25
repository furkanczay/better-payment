import { Layers, Code2, Package, ShieldCheck, Lock, Clock, CreditCard, GitBranch } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Unified API surface",
    description:
      "createPayment, initThreeDSPayment, refund, cancel and getPayment take the same request types on every provider and return the same result shape.",
    span: "lg:col-span-2",
  },
  {
    icon: Code2,
    title: "TypeScript-first",
    description: "Typed requests, results and configuration, with no any types in the public API.",
  },
  {
    icon: Package,
    title: "Small footprint",
    description:
      "One runtime dependency, ESM and CJS builds, and a separate browser-safe client entry point.",
  },
  {
    icon: ShieldCheck,
    title: "Verified callbacks",
    description:
      "3D Secure callbacks and PayTR notifications are checked against your own credentials, in constant time, before anything counts as paid.",
  },
  {
    icon: Lock,
    title: "Secure-by-default handler",
    description:
      "The HTTP handler exposes only callbacks and card queries by default. Refunds, cancels and lookups require an authorize hook.",
  },
  {
    icon: Clock,
    title: "No double charges",
    description:
      "A timeout returns pending with NETWORK_ERROR instead of guessing. Payment, refund and cancel requests are never retried automatically.",
  },
  {
    icon: CreditCard,
    title: "iyzico extras",
    description:
      "Hosted checkout form, pay with IBAN (PWI) and subscription billing: products, pricing plans and card updates. These are iyzico-only APIs.",
    span: "lg:col-span-2",
  },
  {
    icon: GitBranch,
    title: "Several providers, one config",
    description:
      "Enable multiple providers and choose one per call with payment.use(). Provider-specific setup, like callback URLs, still applies.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-5 sm:px-8 bg-muted/30 border-y border-border">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
            Everything you need,
            <br />
            <span className="text-muted-foreground font-medium">nothing you don&apos;t.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className={[
                "rounded-xl border border-border bg-card p-6 flex flex-col gap-4 transition-colors hover:border-foreground/20",
                f.span ?? "",
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
