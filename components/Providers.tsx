import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const providers = [
  {
    name: "İyzico",
    abbr: "IY",
    tagline: "Turkey's leading gateway",
    description:
      "Full-featured integration with V2 auth, checkout forms, subscriptions, and installment inquiry.",
    gradient: "from-orange-500 to-rose-500",
    glowColor: "shadow-orange-500/10",
    borderColor: "border-orange-500/20",
    accentColor: "text-orange-500 dark:text-orange-400",
    features: [
      "V2 Authorization",
      "Checkout Form",
      "Subscription Payments",
      "Installment Inquiry",
      "3D Secure",
    ],
    snippet: `payment.use("iyzico").createPayment(opts)`,
  },
  {
    name: "PayTR",
    abbr: "PT",
    tagline: "Fast & reliable",
    description:
      "Competitive rates with hosted checkout, card payments, 3D Secure, and IBAN transfer support.",
    gradient: "from-blue-500 to-indigo-600",
    glowColor: "shadow-blue-500/10",
    borderColor: "border-blue-500/20",
    accentColor: "text-blue-500 dark:text-blue-400",
    featured: true,
    features: ["Card Payments", "3D Secure", "Hosted Checkout", "Installments", "IBAN Transfer"],
    snippet: `payment.use("paytr").create3DPayment(opts)`,
  },
  {
    name: "Parampos",
    abbr: "PP",
    tagline: "Enterprise-grade",
    description:
      "SOAP API integration with direct API, 3D Secure, refund & cancellation, and installments.",
    gradient: "from-emerald-500 to-teal-600",
    glowColor: "shadow-emerald-500/10",
    borderColor: "border-emerald-500/20",
    accentColor: "text-emerald-500 dark:text-emerald-400",
    features: [
      "SOAP API",
      "3D Secure",
      "Installments",
      "Refund & Cancellation",
      "Direct API",
    ],
    snippet: `payment.use("parampos").createPayment(opts)`,
  },
];

export default function Providers() {
  return (
    <section id="providers" className="py-32 px-5 sm:px-8 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-3">
            Integrations
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            Supported providers
          </h2>
          <p className="mt-3 text-muted-foreground text-base max-w-lg">
            Leading Turkish payment gateways unified under one consistent API.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-xl border bg-card overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl ${p.glowColor} ${
                p.featured ? `${p.borderColor} shadow-lg` : "border-border"
              }`}
            >
              {/* Top gradient bar */}
              <div className={`h-0.5 bg-gradient-to-r ${p.gradient}`} />

              <div className="p-6 flex flex-col gap-5 flex-1">
                {/* Provider header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white font-bold text-sm shadow-sm`}
                    >
                      {p.abbr}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base leading-tight">
                        {p.name}
                      </h3>
                      <p className={`text-xs font-medium ${p.accentColor}`}>{p.tagline}</p>
                    </div>
                  </div>
                  {p.featured && (
                    <Badge className="text-[10px] px-2 py-0.5 shrink-0">Popular</Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>

                {/* Features */}
                <ul className="flex flex-col gap-2">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-foreground/80">
                      <Check className={`w-3.5 h-3.5 shrink-0 ${p.accentColor}`} />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* Code snippet */}
                <div className="mt-auto pt-2">
                  <div className="bg-muted/60 border border-border/60 rounded-lg px-3 py-2 font-mono text-[11px] text-muted-foreground overflow-x-auto whitespace-nowrap">
                    {p.snippet}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
