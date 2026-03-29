import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CodeBlock from "@/components/docs/CodeBlock";
import Callout from "@/components/docs/Callout";
import { ExternalLink } from "lucide-react";

export const metadata = {
  title: "Documentation — better-payment",
  description: "Complete documentation for the better-payment unified payment gateway library.",
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 py-10 first:pt-0">
      <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">{title}</h2>
      <Separator className="mb-6" />
      <div className="prose-like space-y-4 text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function SubSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-20 pt-8">
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-4 text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function PropTable({ rows }: { rows: { prop: string; type: string; required?: boolean; description: string }[] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left font-medium text-foreground">Property</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Type</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Required</th>
            <th className="px-4 py-3 text-left font-medium text-foreground">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-primary">{row.prop}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.type}</td>
              <td className="px-4 py-3">
                {row.required ? (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0">Yes</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">No</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="max-w-3xl min-w-0 w-full py-10">
      {/* Page header */}
      <div className="mb-12">
        <Badge variant="secondary" className="mb-3">Documentation</Badge>
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight mb-3">
          better-payment
        </h1>
        <p className="text-lg text-muted-foreground">
          A unified, type-safe payment gateway library for Node.js applications.
          Integrate multiple Turkish payment providers with a single consistent API.
        </p>
        <div className="flex gap-3 mt-4">
          <a
            href="https://www.npmjs.com/package/better-payment"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> npm
          </a>
          <a
            href="https://github.com/furkanczay/better-payment"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> GitHub
          </a>
        </div>
      </div>

      {/* Introduction */}
      <Section id="introduction" title="Introduction">
        <p>
          <strong className="text-foreground">better-payment</strong> is an open-source Node.js
          library that provides a unified API for integrating multiple Turkish payment gateways.
          Instead of learning and maintaining separate integrations for each provider, you configure
          them all once and use the same method calls regardless of the provider.
        </p>
        <p>Supported providers:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong className="text-foreground">İyzico</strong> — V2 Authorization, Checkout Form, Subscriptions, Installments</li>
          <li><strong className="text-foreground">PayTR</strong> — Card Payments, 3D Secure, Hosted Checkout, IBAN Transfer</li>
          <li><strong className="text-foreground">Parampos</strong> — SOAP API, 3D Secure, Installments, Refund & Cancellation</li>
        </ul>
        <Callout type="tip">
          <strong>Framework-agnostic:</strong> Works with Next.js, Express, Fastify, NestJS, and any
          other Node.js framework. No adapter needed.
        </Callout>
      </Section>

      {/* Installation */}
      <Section id="installation" title="Installation">
        <p>Requires <strong className="text-foreground">Node.js 20+</strong>.</p>
        <CodeBlock code="npm install better-payment" file="terminal" />
        <p>Or using other package managers:</p>
        <CodeBlock code={`yarn add better-payment\npnpm add better-payment`} file="terminal" />
      </Section>

      {/* Quick Start */}
      <Section id="quickstart" title="Quick Start">
        <p>Here's everything you need to process your first payment:</p>
        <CodeBlock
          file="lib/payment.ts"
          code={`import { BetterPayment } from "better-payment";

const payment = new BetterPayment({
  defaultProvider: "iyzico",
  providers: {
    iyzico: {
      enabled: true,
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      baseUrl: "https://sandbox-api.iyzipay.com", // or production URL
    },
  },
});

export default payment;`}
        />
        <CodeBlock
          file="app/api/checkout/route.ts"
          code={`import payment from "@/lib/payment";

export async function POST(req: Request) {
  const { amount, buyerInfo } = await req.json();

  const result = await payment.createPayment({
    price: amount,
    currency: "TRY",
    buyer: buyerInfo,
    basketItems: [
      { id: "item-1", name: "Product", price: amount, category: "General" },
    ],
    billingAddress: {
      contactName: buyerInfo.name,
      city: "Istanbul",
      country: "Turkey",
      address: "Billing address here",
    },
  });

  return Response.json(result);
}`}
        />
      </Section>

      {/* Configuration */}
      <Section id="configuration" title="Configuration">
        <p>
          The <code className="text-primary font-mono text-sm">BetterPayment</code> constructor
          accepts a configuration object with the following structure:
        </p>
        <CodeBlock
          file="lib/payment.ts"
          code={`const payment = new BetterPayment({
  defaultProvider: "iyzico",  // optional: sets the default provider
  providers: {
    iyzico: { ... },
    paytr: { ... },
    parampos: { ... },
  },
});`}
        />
        <PropTable
          rows={[
            { prop: "defaultProvider", type: '"iyzico" | "paytr" | "parampos"', description: "The provider used when no explicit provider is selected via use()." },
            { prop: "providers", type: "ProvidersConfig", required: true, description: "An object containing the configuration for each provider." },
          ]}
        />

        <SubSection id="iyzico" title="İyzico Configuration">
          <PropTable
            rows={[
              { prop: "enabled", type: "boolean", required: true, description: "Enable or disable this provider." },
              { prop: "apiKey", type: "string", required: true, description: "Your İyzico API key." },
              { prop: "secretKey", type: "string", required: true, description: "Your İyzico secret key." },
              { prop: "baseUrl", type: "string", required: true, description: "API base URL. Use sandbox for testing." },
            ]}
          />
          <CodeBlock
            file="lib/payment.ts"
            code={`iyzico: {
  enabled: true,
  apiKey: process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  baseUrl: "https://sandbox-api.iyzipay.com",
  // Production: "https://api.iyzipay.com"
}`}
          />
        </SubSection>

        <SubSection id="paytr" title="PayTR Configuration">
          <PropTable
            rows={[
              { prop: "enabled", type: "boolean", required: true, description: "Enable or disable this provider." },
              { prop: "merchantId", type: "string", required: true, description: "Your PayTR merchant ID." },
              { prop: "merchantKey", type: "string", required: true, description: "Your PayTR merchant key." },
              { prop: "merchantSalt", type: "string", required: true, description: "Your PayTR merchant salt." },
            ]}
          />
          <CodeBlock
            file="lib/payment.ts"
            code={`paytr: {
  enabled: true,
  merchantId: process.env.PAYTR_MERCHANT_ID!,
  merchantKey: process.env.PAYTR_MERCHANT_KEY!,
  merchantSalt: process.env.PAYTR_MERCHANT_SALT!,
}`}
          />
        </SubSection>

        <SubSection id="parampos" title="Parampos Configuration">
          <PropTable
            rows={[
              { prop: "enabled", type: "boolean", required: true, description: "Enable or disable this provider." },
              { prop: "clientCode", type: "string", required: true, description: "Your Parampos client code." },
              { prop: "clientUsername", type: "string", required: true, description: "Your Parampos client username." },
              { prop: "clientPassword", type: "string", required: true, description: "Your Parampos client password." },
            ]}
          />
        </SubSection>

        <SubSection id="env" title="Environment Variables">
          <p>Store all credentials in environment variables. Never hardcode them.</p>
          <CodeBlock
            file=".env.local"
            code={`# İyzico
IYZICO_API_KEY=your_api_key_here
IYZICO_SECRET_KEY=your_secret_key_here

# PayTR
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt

# Parampos
PARAMPOS_CLIENT_CODE=your_client_code
PARAMPOS_USERNAME=your_username
PARAMPOS_PASSWORD=your_password`}
          />
          <Callout type="warning">
            Never commit <code className="font-mono text-xs">.env</code> files to version control.
            Add them to <code className="font-mono text-xs">.gitignore</code>.
          </Callout>
        </SubSection>
      </Section>

      {/* API Reference */}
      <Section id="api" title="API Reference">
        <SubSection id="use" title="use(provider)">
          <p>
            Switches to a specific provider for the next call. Returns the payment instance for
            method chaining.
          </p>
          <CodeBlock
            code={`// Use a specific provider for this call
const result = await payment.use("paytr").createPayment({ ... });

// Chain multiple calls
const iyzico = payment.use("iyzico");
const checkout = await iyzico.createCheckoutForm({ ... });`}
          />
        </SubSection>

        <SubSection id="createpayment" title="createPayment(options)">
          <p>Creates a standard (non-3D) payment request.</p>
          <CodeBlock
            code={`const result = await payment.createPayment({
  price: "150.00",       // total amount as string
  currency: "TRY",       // ISO 4217 currency code
  buyer: {
    id: "user-123",
    name: "John",
    surname: "Doe",
    email: "john@example.com",
    identityNumber: "11111111111",
    ip: "85.34.78.112",
    city: "Istanbul",
    country: "Turkey",
    address: "Billing address",
    zipCode: "34000",
  },
  basketItems: [
    {
      id: "item-1",
      name: "Product Name",
      price: "150.00",
      category: "Electronics",
      itemType: "PHYSICAL",  // or "VIRTUAL"
    },
  ],
  billingAddress: {
    contactName: "John Doe",
    city: "Istanbul",
    country: "Turkey",
    address: "Nispetiye Cd. No:1",
    zipCode: "34000",
  },
  shippingAddress: { ... }, // optional
});`}
          />
        </SubSection>

        <SubSection id="create3dpayment" title="create3DPayment(options)">
          <p>Creates a 3D Secure payment. Redirects the user to the bank's verification page.</p>
          <CodeBlock
            code={`const result = await payment.create3DPayment({
  ...sameOptionsAsCreatePayment,
  callbackUrl: "https://yoursite.com/payment/callback",
});

// result.redirectUrl — redirect the user here`}
          />
          <Callout type="info">
            After the user completes 3D verification, your <code className="font-mono text-xs">callbackUrl</code> will
            receive a POST request with the payment result.
          </Callout>
        </SubSection>

        <SubSection id="checkoutform" title="createCheckoutForm(options)">
          <p>Creates a hosted checkout form (iframe or redirect). Available for İyzico and PayTR.</p>
          <CodeBlock
            code={`const result = await payment.createCheckoutForm({
  ...sameOptionsAsCreatePayment,
  callbackUrl: "https://yoursite.com/payment/callback",
});

// result.checkoutFormContent — inject into your page (İyzico)
// result.redirectUrl — redirect user (PayTR)`}
          />
        </SubSection>

        <SubSection id="subscription" title="createSubscription(options)">
          <p>Creates a recurring/subscription payment. Available for İyzico.</p>
          <CodeBlock
            code={`const result = await payment.use("iyzico").createSubscription({
  pricingPlanReferenceCode: "your-plan-code",
  subscriptionInitialStatus: "ACTIVE",
  buyer: { ... },
  billingAddress: { ... },
  shippingAddress: { ... },
});`}
          />
        </SubSection>

        <SubSection id="installments" title="inquireInstallments(options)">
          <p>Retrieves available installment options for a card BIN number.</p>
          <CodeBlock
            code={`const result = await payment.inquireInstallments({
  binNumber: "454671", // first 6 digits of the card
  price: "500.00",
  currency: "TRY",
});

// result.installmentDetails — array of available installment plans`}
          />
        </SubSection>
      </Section>

      {/* Guides */}
      <Section id="guides" title="Guides">
        <SubSection id="guide-3d" title="3D Secure Payments">
          <p>
            3D Secure adds an extra layer of authentication. The flow is:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-sm">
            <li>Call <code className="font-mono text-xs text-primary">create3DPayment()</code> with a <code className="font-mono text-xs text-primary">callbackUrl</code></li>
            <li>Redirect the user to <code className="font-mono text-xs text-primary">result.redirectUrl</code></li>
            <li>The bank authenticates the user and POSTs the result to your callback URL</li>
            <li>Verify the result and complete the order</li>
          </ol>
          <CodeBlock
            file="app/api/payment/3d/route.ts"
            code={`export async function POST(req: Request) {
  const body = await req.json();

  const result = await payment.create3DPayment({
    ...body,
    callbackUrl: \`\${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback\`,
  });

  return Response.json({ redirectUrl: result.redirectUrl });
}

// app/api/payment/callback/route.ts
export async function POST(req: Request) {
  const formData = await req.formData();
  const status = formData.get("status");

  if (status === "success") {
    // Update order in database
  }

  return Response.redirect("/payment/result");
}`}
          />
        </SubSection>

        <SubSection id="guide-subscription" title="Subscription Billing">
          <p>Use İyzico's subscription API for recurring charges.</p>
          <CodeBlock
            code={`// 1. First create a subscription plan in İyzico dashboard
// 2. Then subscribe a customer to that plan

const result = await payment.use("iyzico").createSubscription({
  pricingPlanReferenceCode: "MONTHLY_PREMIUM",
  subscriptionInitialStatus: "ACTIVE",
  buyer: {
    gsmNumber: "+905350000000",
    name: "John",
    surname: "Doe",
    identityNumber: "11111111111",
    email: "john@example.com",
    id: "user-123",
  },
  billingAddress: { ... },
  shippingAddress: { ... },
  customer: {
    name: "John",
    surname: "Doe",
    email: "john@example.com",
    gsmNumber: "+905350000000",
    identityNumber: "11111111111",
    billingAddress: { ... },
    shippingAddress: { ... },
  },
});`}
          />
        </SubSection>

        <SubSection id="guide-eft" title="EFT / IBAN Transfer">
          <p>PayTR supports EFT and IBAN-based transfers (PWI — Payment With IBAN).</p>
          <CodeBlock
            code={`const result = await payment.use("paytr").createPayment({
  paymentMethod: "eft",
  price: "500.00",
  currency: "TRY",
  buyer: { ... },
  basketItems: [ ... ],
  billingAddress: { ... },
});`}
          />
        </SubSection>

        <SubSection id="guide-errors" title="Error Handling">
          <p>
            All methods return a result object with a <code className="font-mono text-xs text-primary">status</code> field.
            Wrap calls in try/catch for unexpected errors.
          </p>
          <CodeBlock
            code={`try {
  const result = await payment.createPayment({ ... });

  if (result.status === "success") {
    // Payment succeeded
    console.log("Payment ID:", result.paymentId);
  } else {
    // Payment failed — check error message
    console.error("Payment failed:", result.errorMessage);
  }
} catch (error) {
  // Network error, invalid configuration, etc.
  console.error("Unexpected error:", error);
}`}
          />
          <Callout type="warning">
            Always check <code className="font-mono text-xs">result.status</code> — a resolved
            promise does not necessarily mean a successful payment.
          </Callout>
        </SubSection>
      </Section>
    </div>
  );
}
