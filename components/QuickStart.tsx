const installCode = `npm install better-payment`;

const configCode = `import { BetterPayment } from "better-payment";

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
});`;

const usageCode = `// Use the default provider (iyzico)
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
    { id: "item-1", name: "Book", price: "100.00", category: "Books" },
  ],
  billingAddress: {
    contactName: "John Doe",
    city: "Istanbul",
    country: "Turkey",
    address: "Nispetiye Cd. Akmerkez B Blok",
  },
});

// Or switch provider on the fly
const result2 = await payment.use("paytr").createPayment({ ... });`;

function CodeBlock({ code, label }: { code: string; label: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 shadow-xl">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border-b border-slate-700">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-slate-400 font-mono">{label}</span>
      </div>
      <pre className="bg-slate-900 text-slate-100 text-xs sm:text-sm font-mono p-4 overflow-x-auto leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function QuickStart() {
  return (
    <section id="quickstart" className="py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Quick Start
          </h2>
          <p className="mt-3 text-slate-500 text-lg">
            Up and running in minutes.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="font-semibold text-slate-900">Install the package</h3>
            </div>
            <CodeBlock code={installCode} label="terminal" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="font-semibold text-slate-900">Configure your providers</h3>
            </div>
            <CodeBlock code={configCode} label="payment.ts" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="font-semibold text-slate-900">Create payments</h3>
            </div>
            <CodeBlock code={usageCode} label="checkout.ts" />
          </div>
        </div>
      </div>
    </section>
  );
}
