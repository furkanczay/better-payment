const steps = [
  {
    number: "01",
    title: "Install the package",
    file: "terminal",
    lang: "bash",
    code: `npm install better-payment`,
    isShell: true,
  },
  {
    number: "02",
    title: "Configure your providers",
    file: "lib/payment.ts",
    lang: "typescript",
    code: [
      { t: "keyword", v: "import" },
      { t: "plain", v: " { " },
      { t: "symbol", v: "BetterPay" },
      { t: "plain", v: ' } ' },
      { t: "keyword", v: "from" },
      { t: "string", v: ' "better-payment"' },
      { t: "plain", v: ";\n\n" },
      { t: "keyword", v: "const" },
      { t: "plain", v: " betterPay = " },
      { t: "keyword", v: "new" },
      { t: "plain", v: " " },
      { t: "symbol", v: "BetterPay" },
      { t: "plain", v: "({\n" },
      { t: "plain", v: "  defaultProvider: " },
      { t: "symbol", v: "ProviderType" },
      { t: "plain", v: "." },
      { t: "symbol", v: "IYZICO" },
      { t: "plain", v: ",\n" },
      { t: "plain", v: "  providers: {\n" },
      { t: "plain", v: "    iyzico: {\n" },
      { t: "plain", v: "      enabled: " },
      { t: "bool", v: "true" },
      { t: "plain", v: ",\n" },
      { t: "plain", v: "      config: {\n" },
      { t: "plain", v: "        apiKey: process.env." },
      { t: "symbol", v: "IYZICO_API_KEY" },
      { t: "plain", v: "!,\n" },
      { t: "plain", v: "        secretKey: process.env." },
      { t: "symbol", v: "IYZICO_SECRET_KEY" },
      { t: "plain", v: "!,\n" },
      { t: "plain", v: "        baseUrl: process.env." },
      { t: "symbol", v: "IYZICO_BASE_URL" },
      { t: "plain", v: "!,\n" },
      { t: "plain", v: "      },\n" },
      { t: "plain", v: "    },\n" },
      { t: "plain", v: "  },\n" },
      { t: "plain", v: "});\n\n" },
      { t: "keyword", v: "export" },
      { t: "plain", v: " " },
      { t: "keyword", v: "default" },
      { t: "plain", v: " betterPay;" },
    ],
  },
  {
    number: "03",
    title: "Create your first payment",
    file: "app/checkout.ts",
    lang: "typescript",
    code: [
      { t: "keyword", v: "import" },
      { t: "plain", v: " { betterPay } " },
      { t: "keyword", v: "from" },
      { t: "string", v: ' "@/lib/payment"' },
      { t: "plain", v: ";\n\n" },
      { t: "comment", v: "// Uses the default provider (iyzico)" },
      { t: "plain", v: "\n" },
      { t: "keyword", v: "const" },
      { t: "plain", v: " result = " },
      { t: "keyword", v: "await" },
      { t: "plain", v: " betterPay." },
      { t: "method", v: "createPayment" },
      { t: "plain", v: "({\n" },
      { t: "plain", v: "  price: " },
      { t: "string", v: '"100.00"' },
      { t: "plain", v: ",\n" },
      { t: "plain", v: "  currency: " },
      { t: "string", v: '"TRY"' },
      { t: "plain", v: ",\n" },
      { t: "plain", v: "  buyer: { id: " },
      { t: "string", v: '"user-123"' },
      { t: "plain", v: ", ... },\n" },
      { t: "plain", v: "  basketItems: [ ... ],\n" },
      { t: "plain", v: "});\n\n" },
      { t: "comment", v: "// Iyzico-specific methods via typed accessor" },
      { t: "plain", v: "\n" },
      { t: "keyword", v: "const" },
      { t: "plain", v: " checkout = " },
      { t: "keyword", v: "await" },
      { t: "plain", v: " betterPay." },
      { t: "symbol", v: "iyzico" },
      { t: "plain", v: "." },
      { t: "method", v: "initCheckoutForm" },
      { t: "plain", v: "({ ... });" },
    ],
  },
];

type Token = { t: string; v: string };

function SyntaxLine({ tokens }: { tokens: Token[] | string; isShell?: boolean }) {
  if (typeof tokens === "string") {
    return (
      <span className="text-foreground/85">{tokens}</span>
    );
  }
  return (
    <>
      {tokens.map((tok, i) => {
        const cls =
          tok.t === "keyword"
            ? "text-primary"
            : tok.t === "string"
            ? "text-emerald-500 dark:text-emerald-400"
            : tok.t === "symbol"
            ? "text-sky-500 dark:text-sky-400"
            : tok.t === "method"
            ? "text-amber-500 dark:text-amber-400"
            : tok.t === "bool"
            ? "text-rose-500 dark:text-rose-400"
            : tok.t === "comment"
            ? "text-muted-foreground/50 italic"
            : "text-foreground/80";
        return (
          <span key={i} className={cls}>
            {tok.v}
          </span>
        );
      })}
    </>
  );
}

function CodeBlock({
  code,
  file,
  isShell,
}: {
  code: string | Token[];
  file: string;
  isShell?: boolean;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <span className="ml-2 text-[11px] font-mono text-muted-foreground/70 tracking-wide">
          {file}
        </span>
      </div>
      {/* Code */}
      <pre className="p-5 text-[12.5px] font-mono leading-[1.75] overflow-x-auto">
        {isShell ? (
          <code>
            <span className="text-primary select-none">$ </span>
            <span className="text-foreground/85">{code as string}</span>
          </code>
        ) : (
          <code>
            <SyntaxLine tokens={code as Token[]} />
          </code>
        )}
      </pre>
    </div>
  );
}

export default function QuickStart() {
  return (
    <section id="quickstart" className="py-32 px-5 sm:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
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
              <div className="flex flex-col items-center shrink-0">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 z-10">
                  <span className="text-[10px] font-bold text-primary font-mono tracking-tight">
                    {step.number}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-3 mb-3" />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 min-w-0 ${idx < steps.length - 1 ? "pb-10" : "pb-0"}`}>
                <h3 className="font-semibold text-foreground text-[15px] mb-4 mt-2">
                  {step.title}
                </h3>
                <CodeBlock
                  code={step.code}
                  file={step.file}
                  isShell={step.isShell}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
