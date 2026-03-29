import { Shield, Zap, Code2, Layers, RefreshCw, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Layers,
    title: "Unified API",
    description: "One consistent interface across all payment providers. Switch providers without rewriting your integration logic.",
    tag: "Core",
  },
  {
    icon: Code2,
    title: "Full TypeScript",
    description: "Complete type definitions out of the box. Catch payment errors at compile time, not in production.",
    tag: "DX",
  },
  {
    icon: Zap,
    title: "Minimal Footprint",
    description: "Only requires axios as a dependency. Keep your bundle lean and your dependency tree clean.",
    tag: "Performance",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description: "API key and secret key encryption built in. 3D Secure support across all providers from day one.",
    tag: "Security",
  },
  {
    icon: RefreshCw,
    title: "Recurring Payments",
    description: "Built-in subscription and recurring payment support. Handle installment inquiries with ease.",
    tag: "Billing",
  },
  {
    icon: CreditCard,
    title: "Multiple Methods",
    description: "Standard card, 3D Secure, EFT/IBAN transfer, hosted checkout, and installment options.",
    tag: "Payments",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Features</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Everything you need
          </h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-xl mx-auto">
            Designed to be framework-agnostic and production-ready from day one.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-accent/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl border border-border bg-background flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                  <f.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <Badge variant="secondary" className="text-[10px] font-normal">
                  {f.tag}
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
