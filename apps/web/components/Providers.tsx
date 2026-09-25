"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Image from "next/image";
import Code from "@/components/Code";

const providers = [
  {
    id: "iyzico",
    name: "iyzico",
    logo: "/iyzico.svg",
    tagline: "Payment gateway",
    description:
      "IYZWSv2-signed JSON API with non-3D and 3D Secure payments, a hosted checkout form, pay with IBAN (PWI), subscriptions, and BIN and installment queries.",
    features: [
      "Non-3D & 3D Secure",
      "Hosted checkout form",
      "Pay with IBAN (PWI)",
      "Subscriptions",
      "BIN & installment queries",
      "Refund, cancel, status",
    ],
    file: "checkout.ts",
    code: `// Hosted checkout form
const result = await payment.iyzico.initCheckoutForm({
  price: "100.00",
  paidPrice: "100.00",
  currency: "TRY",
  basketId: "B1",
  callbackUrl: "https://yoursite.com/checkout/callback",
  buyer: { ... },
  basketItems: [ ... ],
  ...
});

// Render result.checkoutFormContent on your page`,
  },
  {
    id: "paytr",
    name: "PayTR",
    logo: "/paytr.svg",
    tagline: "Payment gateway",
    description:
      "iFrame payment page with HMAC-signed requests. Results arrive as server notifications, which the handler verifies and answers with OK.",
    features: [
      "iFrame payment page",
      "Verified notifications",
      "BIN & installment rates",
      "Partial & full refunds",
      "Status queries",
      "Test mode",
    ],
    file: "paytr.ts",
    code: `// iFrame payment page
const result = await payment.paytr.initThreeDSPayment({
  price: "250.00",
  paidPrice: "250.00",
  currency: "TRY",
  conversationId: "ORDER123", // becomes merchant_oid
  callbackUrl: "https://yoursite.com/orders/ORDER123",
  buyer: { ... },
  basketItems: [ ... ],
  ...
});

// Render result.threeDSHtmlContent (the iFrame).
// The result is POSTed to your notification URL:
// /api/pay/paytr/callback verifies it and replies "OK".`,
  },
  {
    id: "parampos",
    name: "Parampos",
    logo: "/param.svg",
    tagline: "Virtual POS (SOAP)",
    description:
      "The SOAP API behind the same interface: 3D payments finalized with TP_WMD_Pay, non-3D payments, refunds, cancels, and status and BIN queries. TRY only.",
    features: [
      "3D Secure (TP_WMD_UCD / Pay)",
      "Non-3D payments",
      "Installment count per payment",
      "Refund & cancel",
      "Status queries",
      "BIN lookup",
    ],
    file: "parampos.ts",
    code: `// Non-3D payment, SOAP handled for you
const result = await payment.parampos.createPayment({
  price: "500.00",
  paidPrice: "500.00",
  currency: "TRY",
  conversationId: "ORDER123", // becomes Siparis_ID
  paymentCard: { ... },
  buyer: { ... },
  basketItems: [ ... ],
  ...
});

// result.paymentId === "ORDER123"`,
  },
];

export default function Providers() {
  const [active, setActive] = useState(0);
  const p = providers[active];

  return (
    <section id="providers" className="py-24 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Payment gateways
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
            Three gateways,
            <br />
            <span className="text-muted-foreground font-medium">one set of types.</span>
          </h2>
        </div>

        <div
          role="tablist"
          className="flex items-center gap-1 border border-border rounded-lg bg-muted/40 p-1 w-fit mb-6"
        >
          {providers.map((pr, i) => (
            <button
              key={pr.id}
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              className={[
                "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                active === i
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground border border-transparent",
              ].join(" ")}
            >
              <span className="w-5 h-5 rounded bg-white flex items-center justify-center overflow-hidden shrink-0 p-0.5">
                <Image src={pr.logo} alt="" width={20} height={20} className="w-full h-full object-contain" />
              </span>
              {pr.name}
            </button>
          ))}
        </div>

        <div key={p.id} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] lg:divide-x divide-border">
            <div className="p-8 flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden p-1.5">
                    <Image src={p.logo} alt={p.name} width={40} height={40} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg leading-tight">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.tagline}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.description}</p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
                  Capabilities
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-foreground/80">
                      <Check className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-8 bg-muted/30">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-4">
                Example
              </p>
              <Code code={p.code} file={p.file} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
