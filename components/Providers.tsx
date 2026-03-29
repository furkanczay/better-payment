import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

const providers = [
  {
    name: "İyzico",
    abbr: "IY",
    description: "Turkey's leading payment gateway with extensive feature support.",
    gradient: "from-orange-500 to-red-500",
    features: ["V2 Authorization", "Checkout Form", "Subscription Payments", "Installment Inquiry", "3D Secure"],
  },
  {
    name: "PayTR",
    abbr: "PT",
    description: "Fast and reliable payment processing with competitive rates.",
    gradient: "from-blue-500 to-indigo-600",
    features: ["Card Payments", "3D Secure", "Hosted Checkout", "Installments", "IBAN Transfer"],
    featured: true,
  },
  {
    name: "Parampos",
    abbr: "PP",
    description: "Enterprise-grade payment solution with SOAP API and advanced features.",
    gradient: "from-emerald-500 to-teal-600",
    features: ["SOAP API", "3D Secure", "Installments", "Refund & Cancellation", "Direct API"],
  },
];

export default function Providers() {
  return (
    <section id="providers" className="py-28 px-4 sm:px-6 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Integrations</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Supported providers
          </h2>
          <p className="mt-3 text-muted-foreground text-lg max-w-xl mx-auto">
            Leading Turkish payment gateways, all unified under one API.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg ${
                p.featured ? "border-primary/50 shadow-md shadow-primary/10" : "border-border"
              }`}
            >
              {p.featured && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
              )}
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center text-white font-bold text-sm shadow-sm`}
                  >
                    {p.abbr}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    {p.featured && (
                      <Badge className="text-[10px] px-1.5 py-0 mt-0.5">Popular</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-5">{p.description}</p>
                <ul className="space-y-2">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
