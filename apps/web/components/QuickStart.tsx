const steps = [
  {
    number: "01",
    title: "Install the package",
    file: "terminal",
    isShell: true,
    code: `npm install better-payment`,
  },
  {
    number: "02",
    title: "Configure your providers",
    file: "lib/payment.ts",
    isShell: false,
    tokens: [
      { t: "dim", v: "import" }, { t: "plain", v: " { " }, { t: "sky", v: "BetterPayment" },
      { t: "plain", v: ", " }, { t: "sky", v: "ProviderType" }, { t: "plain", v: " } " },
      { t: "dim", v: "from" }, { t: "string", v: ' "better-payment"' }, { t: "plain", v: ";\n\n" },
      { t: "dim", v: "const" }, { t: "plain", v: " payment = " }, { t: "dim", v: "new" },
      { t: "plain", v: " " }, { t: "sky", v: "BetterPayment" }, { t: "plain", v: "({\n" },
      { t: "plain", v: "  defaultProvider: " }, { t: "sky", v: "ProviderType" },
      { t: "plain", v: "." }, { t: "sky", v: "IYZICO" }, { t: "plain", v: ",\n" },
      { t: "plain", v: "  providers: {\n" },
      { t: "plain", v: "    iyzico: {\n" },
      { t: "plain", v: "      enabled: " }, { t: "bool", v: "true" }, { t: "plain", v: ",\n" },
      { t: "plain", v: "      config: {\n" },
      { t: "plain", v: "        apiKey: process.env." }, { t: "sky", v: "IYZICO_API_KEY" }, { t: "plain", v: "!,\n" },
      { t: "plain", v: "        secretKey: process.env." }, { t: "sky", v: "IYZICO_SECRET_KEY" }, { t: "plain", v: "!,\n" },
      { t: "plain", v: "        baseUrl: process.env." }, { t: "sky", v: "IYZICO_BASE_URL" }, { t: "plain", v: "!,\n" },
      { t: "plain", v: "      },\n    },\n  },\n});\n\n" },
      { t: "dim", v: "export" }, { t: "plain", v: " " }, { t: "dim", v: "default" }, { t: "plain", v: " payment;" },
    ],
  },
  {
    number: "03",
    title: "Process your first payment",
    file: "app/checkout.ts",
    isShell: false,
    tokens: [
      { t: "dim", v: "import" }, { t: "plain", v: " payment " }, { t: "dim", v: "from" },
      { t: "string", v: ' "@/lib/payment"' }, { t: "plain", v: ";\n\n" },
      { t: "comment", v: "// Unified API — works identically for every provider" }, { t: "plain", v: "\n" },
      { t: "dim", v: "const" }, { t: "plain", v: " result = " }, { t: "dim", v: "await" },
      { t: "plain", v: " payment." }, { t: "method", v: "createPayment" }, { t: "plain", v: "({\n" },
      { t: "plain", v: "  price: " }, { t: "string", v: '"100.00"' }, { t: "plain", v: ",\n" },
      { t: "plain", v: "  currency: " }, { t: "string", v: '"TRY"' }, { t: "plain", v: ",\n" },
      { t: "plain", v: "  buyer: { id: " }, { t: "string", v: '"usr-123"' }, { t: "plain", v: ", ... },\n" },
      { t: "plain", v: "  basketItems: [ ... ],\n" },
      { t: "plain", v: "});\n\n" },
      { t: "comment", v: "// Or switch to a different provider at runtime" }, { t: "plain", v: "\n" },
      { t: "dim", v: "const" }, { t: "plain", v: " checkout = " }, { t: "dim", v: "await" },
      { t: "plain", v: " payment." }, { t: "sky", v: "use" }, { t: "plain", v: '("paytr").' },
      { t: "method", v: "initThreeDSPayment" }, { t: "plain", v: "({ ... });" },
    ],
  },
];

type Token = { t: string; v: string };

const colorMap: Record<string, string> = {
  dim: "text-primary/80",
  sky: "text-sky-500 dark:text-sky-400",
  string: "text-emerald-600 dark:text-emerald-400",
  method: "text-amber-600 dark:text-amber-400",
  bool: "text-rose-500 dark:text-rose-400",
  comment: "text-muted-foreground/45 italic",
  plain: "text-foreground/80",
};

function CodeBlock({ step }: { step: (typeof steps)[number] }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border/60">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
        </div>
        <span className="ml-2 text-[11px] font-mono text-muted-foreground/60">{step.file}</span>
      </div>
      <pre className="p-5 text-[12px] font-mono leading-[1.8] overflow-x-auto">
        {step.isShell ? (
          <code>
            <span className="text-primary select-none font-bold">$ </span>
            <span className="text-foreground/80">{step.code}</span>
          </code>
        ) : (
          <code>
            {(step.tokens as Token[]).map((tok, i) => (
              <span key={i} className={colorMap[tok.t] ?? "text-foreground/80"}>
                {tok.v}
              </span>
            ))}
          </code>
        )}
      </pre>
    </div>
  );
}

export default function QuickStart() {
  return (
    <section id="quickstart" className="py-28 px-5 sm:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16 max-w-lg">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-3">
            Quick Start
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
            Up and running
            <br />
            <span className="text-muted-foreground font-medium">in minutes.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-0">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex gap-6 sm:gap-8">
              {/* Timeline */}
              <div className="flex flex-col items-center shrink-0 pt-1">
                <div className="w-9 h-9 rounded-xl bg-primary/8 border border-primary/20 flex items-center justify-center z-10">
                  <span className="text-[10px] font-bold text-primary font-mono tracking-tight">
                    {step.number}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-px flex-1 bg-gradient-to-b from-primary/20 to-transparent mt-3 mb-3" />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 min-w-0 ${idx < steps.length - 1 ? "pb-10" : "pb-0"}`}>
                <h3 className="font-semibold text-foreground text-[15px] mb-4 mt-1.5">
                  {step.title}
                </h3>
                <CodeBlock step={step} />
              </div>
            </div>
          ))}
        </div>

        {/* Link to full docs */}
        <div className="mt-12 pl-[calc(36px+1.5rem)] sm:pl-[calc(36px+2rem)]">
          <a
            href="/docs"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            View full documentation
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
