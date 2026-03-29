import {
  Shield,
  Zap,
  Code2,
  Layers,
  RefreshCw,
  CreditCard,
} from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Unified API",
    description:
      "One consistent interface across all payment providers. Switch providers without rewriting your integration.",
  },
  {
    icon: Code2,
    title: "Full TypeScript Support",
    description:
      "Complete type definitions out of the box. Catch errors at compile time, not in production.",
  },
  {
    icon: Zap,
    title: "Minimal Dependencies",
    description:
      "Only requires axios. Keep your bundle lean and your dependency tree clean.",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    description:
      "API key and secret key encryption built-in. 3D Secure support across all providers.",
  },
  {
    icon: RefreshCw,
    title: "Recurring Payments",
    description:
      "Built-in subscription and recurring payment support. Handle installments with ease.",
  },
  {
    icon: CreditCard,
    title: "Multiple Payment Methods",
    description:
      "Standard card, 3D Secure, EFT/IBAN transfer, hosted checkout forms, and installment inquiries.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Everything you need
          </h2>
          <p className="mt-3 text-slate-500 text-lg max-w-xl mx-auto">
            Designed to be framework-agnostic and production-ready from day one.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                <f.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
