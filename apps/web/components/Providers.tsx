"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const providers = [
  {
    id: "iyzico",
    name: "İyzico",
    tagline: "Turkey's leading gateway",
    description:
      "Full-featured integration covering V2 auth, hosted checkout, PWI (IBAN payments), subscriptions, BIN check, and installment inquiry.",
    gradient: "from-orange-500 to-rose-500",
    activeColor: "border-orange-500/40 bg-orange-500/5",
    tabActive: "text-orange-500 border-orange-500",
    features: [
      "V2 Auth & 3D Secure",
      "Hosted Checkout Form",
      "PWI (IBAN/EFT Payments)",
      "Subscription & Recurring",
      "BIN Check & Installments",
      "Card Tokenization",
    ],
    snippet: [
      { c: "muted", v: "// Checkout form (hosted payment page)" },
      { c: "", v: "\n" },
      { c: "dim", v: "const" },
      { c: "", v: " result = " },
      { c: "dim", v: "await" },
      { c: "", v: " payment." },
      { c: "sky", v: "use" },
      { c: "dim", v: "(" },
      { c: "green", v: '"iyzico"' },
      { c: "dim", v: ")" },
      { c: "", v: "\n  ." },
      { c: "yellow", v: "initCheckoutForm" },
      { c: "dim", v: "({" },
      { c: "", v: "\n    price: " },
      { c: "green", v: '"100.00"' },
      { c: "dim", v: ", currency: " },
      { c: "green", v: '"TRY"' },
      { c: "dim", v: "," },
      { c: "", v: "\n    callbackUrl: " },
      { c: "green", v: '"https://yoursite.com/callback"' },
      { c: "dim", v: "," },
      { c: "", v: "\n    buyer: " },
      { c: "dim", v: "{ ... }" },
      { c: "dim", v: "," },
      { c: "", v: "\n    basketItems: " },
      { c: "dim", v: "[ ... ]" },
      { c: "", v: "\n  " },
      { c: "dim", v: "});" },
    ],
  },
  {
    id: "paytr",
    name: "PayTR",
    tagline: "Competitive rates, fast payouts",
    description:
      "iframe-based 3D Secure with HMAC-SHA256 signed requests. Supports BIN detail, installment queries, partial refunds, and callback verification.",
    gradient: "from-blue-500 to-indigo-600",
    activeColor: "border-blue-500/40 bg-blue-500/5",
    tabActive: "text-blue-500 border-blue-500",
    features: [
      "iframe 3D Secure Flow",
      "BIN Detail & Installments",
      "Partial & Full Refunds",
      "HMAC Callback Verification",
      "Test Mode Support",
      "Multi-currency",
    ],
    snippet: [
      { c: "muted", v: "// iframe 3D Secure" },
      { c: "", v: "\n" },
      { c: "dim", v: "const" },
      { c: "", v: " result = " },
      { c: "dim", v: "await" },
      { c: "", v: " payment." },
      { c: "sky", v: "use" },
      { c: "dim", v: "(" },
      { c: "green", v: '"paytr"' },
      { c: "dim", v: ")" },
      { c: "", v: "\n  ." },
      { c: "yellow", v: "initThreeDSPayment" },
      { c: "dim", v: "({" },
      { c: "", v: "\n    price: " },
      { c: "green", v: '"250.00"' },
      { c: "dim", v: ", currency: " },
      { c: "green", v: '"TL"' },
      { c: "dim", v: "," },
      { c: "", v: "\n    callbackUrl: " },
      { c: "green", v: '"https://yoursite.com/paytr-cb"' },
      { c: "dim", v: "," },
      { c: "", v: "\n    buyer: " },
      { c: "dim", v: "{ ... }" },
      { c: "dim", v: "," },
      { c: "", v: "\n    basketItems: " },
      { c: "dim", v: "[ ... ]" },
      { c: "", v: "\n  " },
      { c: "dim", v: "});" },
      { c: "", v: "\n\n" },
      { c: "muted", v: "// Returns HTML iframe content" },
    ],
  },
  {
    id: "parampos",
    name: "Parampos",
    tagline: "Enterprise-grade SOAP integration",
    description:
      "Full SOAP API integration with direct card charge, 3D Secure, installment support, and complete refund & cancellation flows.",
    gradient: "from-emerald-500 to-teal-600",
    activeColor: "border-emerald-500/40 bg-emerald-500/5",
    tabActive: "text-emerald-500 border-emerald-500",
    features: [
      "SOAP API (abstracted)",
      "Direct Card Charge",
      "3D Secure",
      "Installments",
      "Refund & Cancellation",
      "Test Environment",
    ],
    snippet: [
      { c: "muted", v: "// Direct payment (SOAP abstracted)" },
      { c: "", v: "\n" },
      { c: "dim", v: "const" },
      { c: "", v: " result = " },
      { c: "dim", v: "await" },
      { c: "", v: " payment." },
      { c: "sky", v: "use" },
      { c: "dim", v: "(" },
      { c: "green", v: '"parampos"' },
      { c: "dim", v: ")" },
      { c: "", v: "\n  ." },
      { c: "yellow", v: "createPayment" },
      { c: "dim", v: "({" },
      { c: "", v: "\n    price: " },
      { c: "green", v: '"500.00"' },
      { c: "dim", v: ", currency: " },
      { c: "green", v: '"TRY"' },
      { c: "dim", v: "," },
      { c: "", v: "\n    paymentCard: " },
      { c: "dim", v: "{ ... }" },
      { c: "dim", v: "," },
      { c: "", v: "\n    buyer: " },
      { c: "dim", v: "{ ... }" },
      { c: "dim", v: "," },
      { c: "", v: "\n    basketItems: " },
      { c: "dim", v: "[ ... ]" },
      { c: "", v: "\n  " },
      { c: "dim", v: "});" },
      { c: "", v: "\n\n" },
      { c: "muted", v: "// Same interface as iyzico & paytr" },
    ],
  },
];

const colorMap: Record<string, string> = {
  dim: "text-muted-foreground/60",
  sky: "text-sky-400",
  green: "text-emerald-400",
  yellow: "text-amber-400",
  muted: "text-muted-foreground/40 italic",
  "": "text-foreground/85",
};

type Token = { c: string; v: string };

function CodeSnippet({ tokens }: { tokens: Token[] }) {
  return (
    <div className="bg-background/60 rounded-xl border border-border/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/20 border-b border-border/40">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-border/60" />
          <span className="w-2 h-2 rounded-full bg-border/60" />
          <span className="w-2 h-2 rounded-full bg-green-500/50" />
        </div>
        <span className="ml-2 text-[10.5px] font-mono text-muted-foreground/50">checkout.ts</span>
      </div>
      <pre className="p-5 font-mono text-[11.5px] leading-[1.85] overflow-x-auto">
        <code>
          {tokens.map((tok, i) => (
            <span key={i} className={colorMap[tok.c] ?? "text-foreground/85"}>
              {tok.v}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export default function Providers() {
  const [active, setActive] = useState(0);
  const p = providers[active];

  return (
    <section id="providers" className="py-28 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-3">
            Supported Providers
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            Three gateways,
            <br />
            <span className="text-muted-foreground font-medium">one integration.</span>
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border border-border/60 rounded-xl bg-muted/20 p-1 w-fit mb-8">
          {providers.map((pr, i) => (
            <button
              key={pr.id}
              onClick={() => setActive(i)}
              className={[
                "px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                active === i
                  ? "bg-card shadow-sm text-foreground border border-border/60"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {pr.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          key={p.id}
          className={`rounded-2xl border ${p.activeColor} overflow-hidden transition-all duration-300`}
        >
          {/* Top gradient bar */}
          <div className={`h-0.5 bg-gradient-to-r ${p.gradient}`} />

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-0 lg:divide-x divide-border/40">
            {/* Left: info */}
            <div className="p-8 flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${p.gradient} flex items-center justify-center shadow-sm`}>
                    <span className="text-white font-bold text-sm">
                      {p.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg leading-tight">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.tagline}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">
                  Capabilities
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-foreground/80">
                      <Check className="w-3.5 h-3.5 shrink-0 text-emerald-500 dark:text-emerald-400" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: code */}
            <div className="p-8 bg-muted/10">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-4">
                Example usage
              </p>
              <CodeSnippet tokens={p.snippet} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
