import { Badge } from "@/components/ui/badge";

const steps = [
  {
    number: "01",
    title: "Install the package",
    file: "terminal",
    lang: "bash",
    code: `npm install better-payment`,
  },
  {
    number: "02",
    title: "Configure your providers",
    file: "lib/payment.ts",
    lang: "typescript",
    code: `import { BetterPayment } from "better-payment";

const payment = new BetterPayment({
  defaultProvider: "iyzico",
  providers: {
    iyzico: {
      enabled: true,
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      baseUrl: "https://sandbox-api.iyzipay.com",
    },
    paytr: {
      enabled: true,
      merchantId: process.env.PAYTR_MERCHANT_ID!,
      merchantKey: process.env.PAYTR_MERCHANT_KEY!,
      merchantSalt: process.env.PAYTR_MERCHANT_SALT!,
    },
  },
});

export default payment;`,
  },
  {
    number: "03",
    title: "Create your first payment",
    file: "app/checkout.ts",
    lang: "typescript",
    code: `import payment from "@/lib/payment";

// Uses the default provider (iyzico)
const result = await payment.createPayment({
  price: "100.00",
  currency: "TRY",
  buyer: {
    id: "user-123",
    name: "John",
    surname: "Doe",
    email: "john@example.com",
    identityNumber: "11111111111",
    ip: "85.34.78.112",
  },
  basketItems: [
    {
      id: "item-1",
      name: "Premium Plan",
      price: "100.00",
      category: "Subscription",
    },
  ],
  billingAddress: {
    contactName: "John Doe",
    city: "Istanbul",
    country: "Turkey",
    address: "Nispetiye Cd. Akmerkez B Blok",
  },
});

// Or switch provider on the fly
const result2 = await payment.use("paytr").createPayment({ ... });`,
  },
];

function CodeBlock({ code, file }: { code: string; file: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/60" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <span className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <span className="ml-2 text-xs text-muted-foreground font-mono">{file}</span>
      </div>
      <pre className="bg-muted/20 text-foreground text-xs sm:text-sm font-mono p-5 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function QuickStart() {
  return (
    <section id="quickstart" className="py-28 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Quick Start</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Up and running in minutes
          </h2>
          <p className="mt-3 text-muted-foreground text-lg">
            Three steps to integrate any payment provider.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary font-mono">{step.number}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-3">{step.title}</h3>
                <CodeBlock code={step.code} file={step.file} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
