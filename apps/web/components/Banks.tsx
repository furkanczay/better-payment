import { Shield, Zap, CreditCard, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

const highlights = [
  { icon: Lock, label: "OAuth2 Auth", desc: "Token-based authentication" },
  { icon: CreditCard, label: "2D & 3D Secure", desc: "Both flows supported" },
  { icon: Shield, label: "Hash Verified", desc: "HMAC request signing" },
  { icon: Zap, label: "Direct API", desc: "No third-party middleware" },
];

const codeSnippet = `import { BetterPayment } from "better-payment";

const payment = new BetterPayment({
  providers: {
    akbank: {
      enabled: true,
      config: {
        merchantId: process.env.AKBANK_MERCHANT_ID!,
        terminalId: process.env.AKBANK_TERMINAL_ID!,
        storeKey:   process.env.AKBANK_STORE_KEY!,
        baseUrl:    "https://apiprod.akbank.com",
      },
    },
  },
});

// 3D Secure initialization
const init = await payment.akbank.initThreeDSPayment({
  price: "250.00",
  currency: "TRY",
  callbackUrl: "https://yoursite.com/akbank/callback",
  paymentCard: { ... },
  buyer: { ... },
});

// Complete in callback route
const result = await payment.akbank
  .completeThreeDSPayment({ paymentId: body.paymentId });`;

const comingSoon = [
  { name: "Garanti BBVA", color: "from-green-600 to-emerald-700" },
  { name: "İş Bankası", color: "from-blue-700 to-blue-900" },
  { name: "Yapı Kredi", color: "from-sky-600 to-blue-700" },
  { name: "Ziraat Bankası", color: "from-red-700 to-red-900" },
];

export default function Banks() {
  return (
    <section id="banks" className="py-28 px-5 sm:px-8 bg-foreground/[0.02] border-y border-border/40">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-red-500 mb-3">
              Direct Bank Integrations
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
              Native bank APIs,
              <br />
              <span className="text-muted-foreground font-medium">zero abstraction cost.</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Direct integrations with Turkish bank virtual POS systems — no third-party gateway,
            full control over your settlement.
          </p>
        </div>

        {/* Akbank spotlight card */}
        <div className="relative rounded-2xl overflow-hidden border border-red-500/20 bg-card">
          {/* Red top bar */}
          <div className="h-0.5 bg-gradient-to-r from-red-600 via-red-500 to-rose-500" />

          {/* Background texture */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-red-500/4 rounded-full blur-[120px]" />
            <div className="absolute inset-0 [background-image:radial-gradient(oklch(0.5_0_0_/_0.04)_1px,transparent_1px)] [background-size:20px_20px]" />
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] divide-y lg:divide-y-0 lg:divide-x divide-border/40">
            {/* Left — bank info */}
            <div className="p-8 lg:p-10 flex flex-col gap-7">
              {/* Bank identity */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-900/20 shrink-0">
                  <span className="text-white font-black text-lg tracking-tight">AK</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground leading-tight">Akbank</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Sanal POS · Direct Integration</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                Direct integration with Akbank&apos;s Virtual POS API. OAuth2 token authentication,
                HMAC-signed requests, and full support for both 2D and 3D Secure payment flows —
                no intermediary gateway.
              </p>

              {/* Feature highlights */}
              <div className="grid grid-cols-2 gap-3">
                {highlights.map((h) => (
                  <div
                    key={h.label}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50"
                  >
                    <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <h.icon className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{h.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{h.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Link to docs */}
              <Link
                href="/docs/banks/akbank"
                className="inline-flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400 hover:text-red-400 transition-colors group w-fit"
              >
                View Akbank docs
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Right — code */}
            <div className="p-8 lg:p-10 bg-background/40">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50 mb-4">
                Integration example
              </p>
              <div className="rounded-xl overflow-hidden border border-border/50">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border/40">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-border/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-border/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  </div>
                  <span className="ml-2 text-[10.5px] font-mono text-muted-foreground/50">
                    lib/akbank.ts
                  </span>
                </div>
                <pre className="p-5 font-mono text-[11px] leading-[1.85] overflow-x-auto text-foreground/75 bg-card/60">
                  <code>{codeSnippet}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Coming soon grid */}
        <div className="mt-5">
          <p className="text-[11px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em] mb-3 ml-1">
            More banks coming soon
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {comingSoon.map((bank) => (
              <div
                key={bank.name}
                className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/10 px-4 py-3.5 opacity-50"
              >
                <div
                  className={`w-7 h-7 rounded-lg bg-gradient-to-br ${bank.color} flex items-center justify-center shrink-0`}
                >
                  <span className="text-white font-bold text-[9px]">
                    {bank.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground font-medium">{bank.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
