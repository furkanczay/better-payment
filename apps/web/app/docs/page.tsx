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
          <li><strong className="text-foreground">İyzico</strong> — Direct payment, 3D Secure, Checkout Form, Subscriptions, Installments, BIN check, PWI (IBAN transfer)</li>
          <li><strong className="text-foreground">PayTR</strong> — 3D Secure iframe, Refund</li>
          <li><strong className="text-foreground">Akbank</strong> — Direct payment, 3D Secure, Refund, Cancel, Status inquiry</li>
          <li><strong className="text-foreground">Parampos</strong> — SOAP API, Direct payment, 3D Secure, Refund, Cancel, BIN check</li>
        </ul>
        <Callout type="tip">
          <strong>Framework-agnostic:</strong> Works with any Node.js framework. Use{" "}
          <code className="font-mono text-xs">betterPay.handler</code> to expose automatic HTTP
          endpoints without writing boilerplate route handlers.
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
          code={`import { BetterPayment, ProviderType } from "better-payment";

export const betterPay = new BetterPayment({
  defaultProvider: ProviderType.IYZICO,
  providers: {
    iyzico: {
      enabled: true,
      config: {
        apiKey: process.env.IYZICO_API_KEY!,
        secretKey: process.env.IYZICO_SECRET_KEY!,
        baseUrl: "https://sandbox-api.iyzipay.com",
      },
    },
  },
});`}
        />
        <CodeBlock
          file="app/api/pay/[...path]/route.ts"
          code={`import { NextRequest, NextResponse } from "next/server";
import { betterPay } from "@/lib/payment";
import type { BetterPaymentRequest } from "better-payment";

async function handler(req: NextRequest) {
  const body = req.method !== "GET"
    ? await req.json().catch(() => undefined)
    : undefined;

  const res = await betterPay.handler.handle({
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    body,
  } satisfies BetterPaymentRequest);

  return NextResponse.json(res.body, { status: res.status });
}

export const GET = handler;
export const POST = handler;`}
        />
        <p>This exposes automatic endpoints for all providers:</p>
        <CodeBlock
          file="terminal"
          code={`POST /api/pay/iyzico/payment          # direct payment
POST /api/pay/iyzico/payment/init-3ds  # 3D Secure
POST /api/pay/iyzico/checkout/init     # Checkout Form
POST /api/pay/iyzico/bin-check         # BIN lookup
GET  /api/pay/health                   # health check`}
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
          code={`const betterPay = new BetterPayment({
  defaultProvider: ProviderType.IYZICO,  // optional
  providers: {
    iyzico: { enabled: true, config: { ... } },
    paytr:  { enabled: true, config: { ... } },
    akbank: { enabled: true, config: { ... } },
    parampos: { enabled: true, config: { ... } },
  },
});`}
        />
        <PropTable
          rows={[
            { prop: "defaultProvider", type: "ProviderType", description: "Used when calling methods directly on betterPay without .use() or a named accessor." },
            { prop: "providers", type: "ProvidersConfig", required: true, description: "Config for each provider. Only enabled providers are initialized." },
          ]}
        />

        <SubSection id="iyzico" title="İyzico Configuration">
          <PropTable
            rows={[
              { prop: "enabled", type: "boolean", required: true, description: "Enable or disable this provider." },
              { prop: "config.apiKey", type: "string", required: true, description: "Your İyzico API key." },
              { prop: "config.secretKey", type: "string", required: true, description: "Your İyzico secret key." },
              { prop: "config.baseUrl", type: "string", required: true, description: "Sandbox: https://sandbox-api.iyzipay.com — Production: https://api.iyzipay.com" },
              { prop: "config.locale", type: '"tr" | "en"', description: "Request locale. Defaults to 'tr'." },
            ]}
          />
          <CodeBlock
            file="lib/payment.ts"
            code={`iyzico: {
  enabled: true,
  config: {
    apiKey: process.env.IYZICO_API_KEY!,
    secretKey: process.env.IYZICO_SECRET_KEY!,
    baseUrl: process.env.IYZICO_BASE_URL!,
  },
}`}
          />
        </SubSection>

        <SubSection id="paytr" title="PayTR Configuration">
          <PropTable
            rows={[
              { prop: "enabled", type: "boolean", required: true, description: "Enable or disable this provider." },
              { prop: "config.apiKey", type: "string", required: true, description: "Your PayTR merchant key (maps to apiKey)." },
              { prop: "config.merchantId", type: "string", required: true, description: "Your PayTR merchant ID." },
              { prop: "config.merchantSalt", type: "string", required: true, description: "Your PayTR merchant salt." },
              { prop: "config.baseUrl", type: "string", required: true, description: "https://www.paytr.com" },
            ]}
          />
          <CodeBlock
            file="lib/payment.ts"
            code={`paytr: {
  enabled: true,
  config: {
    apiKey: process.env.PAYTR_MERCHANT_KEY!,
    secretKey: process.env.PAYTR_MERCHANT_KEY!,
    merchantId: process.env.PAYTR_MERCHANT_ID!,
    merchantSalt: process.env.PAYTR_MERCHANT_SALT!,
    baseUrl: "https://www.paytr.com",
  },
}`}
          />
        </SubSection>

        <SubSection id="akbank" title="Akbank Configuration">
          <PropTable
            rows={[
              { prop: "enabled", type: "boolean", required: true, description: "Enable or disable this provider." },
              { prop: "config.merchantId", type: "string", required: true, description: "Akbank merchant ID." },
              { prop: "config.terminalId", type: "string", required: true, description: "Akbank terminal ID." },
              { prop: "config.storeKey", type: "string", required: true, description: "Store key for hash generation." },
              { prop: "config.secure3DStoreKey", type: "string", description: "Required for 3DS payments." },
              { prop: "config.baseUrl", type: "string", required: true, description: "Akbank API base URL." },
            ]}
          />
        </SubSection>

        <SubSection id="parampos" title="Parampos Configuration">
          <PropTable
            rows={[
              { prop: "enabled", type: "boolean", required: true, description: "Enable or disable this provider." },
              { prop: "config.clientCode", type: "string", required: true, description: "Parampos client code." },
              { prop: "config.clientUsername", type: "string", required: true, description: "Parampos client username." },
              { prop: "config.clientPassword", type: "string", required: true, description: "Parampos client password." },
              { prop: "config.guid", type: "string", required: true, description: "Parampos merchant GUID." },
              { prop: "config.baseUrl", type: "string", required: true, description: "Parampos SOAP endpoint URL." },
            ]}
          />
        </SubSection>

        <SubSection id="env" title="Environment Variables">
          <p>Store all credentials in environment variables. Never hardcode them.</p>
          <CodeBlock
            file=".env.local"
            code={`# İyzico
IYZICO_API_KEY=your_api_key
IYZICO_SECRET_KEY=your_secret_key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# PayTR
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt

# Akbank
AKBANK_MERCHANT_ID=your_merchant_id
AKBANK_TERMINAL_ID=your_terminal_id
AKBANK_STORE_KEY=your_store_key
AKBANK_SECURE3D_STORE_KEY=your_3d_store_key
AKBANK_BASE_URL=https://www.akbank.com/api

# Parampos
PARAMPOS_CLIENT_CODE=your_client_code
PARAMPOS_CLIENT_USERNAME=your_username
PARAMPOS_CLIENT_PASSWORD=your_password
PARAMPOS_GUID=your_guid
PARAMPOS_BASE_URL=https://posws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx`}
          />
          <Callout type="warning">
            Never commit <code className="font-mono text-xs">.env</code> files to version control.
            Add them to <code className="font-mono text-xs">.gitignore</code>.
          </Callout>
        </SubSection>
      </Section>

      {/* API Reference */}
      <Section id="api" title="API Reference">
        <SubSection id="use" title="betterPay.use(provider)">
          <p>
            Returns the specified provider instance for method chaining. Throws if the provider is
            not enabled.
          </p>
          <CodeBlock
            code={`const result = await betterPay.use(ProviderType.PAYTR).createPayment({ ... });`}
          />
        </SubSection>

        <SubSection id="named-accessors" title="Named accessors">
          <p>
            Access specific providers directly via typed getters. Preferred over{" "}
            <code className="font-mono text-xs text-primary">use()</code> when using
            provider-specific methods.
          </p>
          <CodeBlock
            code={`// Typed — gives access to iyzico-only methods
const checkout = await betterPay.iyzico.initCheckoutForm({ ... });
const bins     = await betterPay.iyzico.installmentInfo({ ... });

// Other providers
const result = await betterPay.paytr.initThreeDSPayment({ ... });
const status = await betterPay.akbank.getPayment("order-id");
const info   = await betterPay.parampos.binCheck("552879");`}
          />
        </SubSection>

        <SubSection id="createpayment" title="createPayment(request)">
          <p>Direct card payment without 3D Secure.</p>
          <CodeBlock
            code={`const result = await betterPay.createPayment({
  price: "150.00",
  paidPrice: "150.00",
  currency: Currency.TRY,
  basketId: "B67832",
  paymentCard: {
    cardHolderName: "John Doe",
    cardNumber: "5528790000000008",
    expireMonth: "12",
    expireYear: "2030",
    cvc: "123",
  },
  buyer: {
    id: "user-123",
    name: "John",
    surname: "Doe",
    email: "john@example.com",
    identityNumber: "74300864791",
    ip: "85.34.78.112",
    city: "Istanbul",
    country: "Turkey",
    registrationAddress: "Nidakule Göztepe",
    gsmNumber: "+905350000000",
  },
  shippingAddress: {
    contactName: "John Doe",
    city: "Istanbul",
    country: "Turkey",
    address: "Nidakule Göztepe",
  },
  billingAddress: {
    contactName: "John Doe",
    city: "Istanbul",
    country: "Turkey",
    address: "Nidakule Göztepe",
  },
  basketItems: [
    {
      id: "BI101",
      name: "Product",
      category1: "Electronics",
      itemType: BasketItemType.PHYSICAL,
      price: "150.00",
    },
  ],
});

if (result.status === PaymentStatus.SUCCESS) {
  console.log("Payment ID:", result.paymentId);
}`}
          />
        </SubSection>

        <SubSection id="initthreedsPayment" title="initThreeDSPayment(request)">
          <p>Initiates 3D Secure flow. Returns HTML content to render in the browser.</p>
          <CodeBlock
            code={`const result = await betterPay.initThreeDSPayment({
  ...paymentFields,
  callbackUrl: "https://yoursite.com/api/pay/iyzico/callback",
});

if (result.status === PaymentStatus.PENDING && result.threeDSHtmlContent) {
  // Render the HTML — it contains the bank's 3DS iframe/form
  document.getElementById("payment-container")!.innerHTML = result.threeDSHtmlContent;
}`}
          />
        </SubSection>

        <SubSection id="completethreedsPayment" title="completeThreeDSPayment(callbackData)">
          <p>
            Completes the 3D Secure flow after the bank posts back to your callback URL.
            Call this inside your callback route handler.
          </p>
          <CodeBlock
            file="app/api/pay/iyzico/callback/route.ts"
            code={`export async function POST(req: Request) {
  const body = await req.json();
  const result = await betterPay.iyzico.completeThreeDSPayment(body);

  if (result.status === PaymentStatus.SUCCESS) {
    // update order in DB
  }

  return Response.json(result);
}`}
          />
        </SubSection>

        <SubSection id="checkoutform" title="iyzico.initCheckoutForm(request)">
          <p>
            Creates an İyzico-hosted checkout form. Returns HTML content or a payment page URL.
            The customer enters their card details on İyzico's secure page.
          </p>
          <CodeBlock
            code={`const result = await betterPay.iyzico.initCheckoutForm({
  price: "150.00",
  paidPrice: "150.00",
  currency: Currency.TRY,
  basketId: "B67832",
  callbackUrl: "https://yoursite.com/payment/result",
  enabledInstallments: [1, 2, 3, 6, 9],
  buyer: { ... },
  shippingAddress: { ... },
  billingAddress: { ... },
  basketItems: [ ... ],
});

if (result.checkoutFormContent) {
  // Inject the script tag into your page
  document.body.innerHTML += result.checkoutFormContent;
}
// Or redirect:
// window.location.href = result.paymentPageUrl;`}
          />
        </SubSection>

        <SubSection id="installments" title="iyzico.installmentInfo(request)">
          <p>Returns available installment options for a card BIN and amount.</p>
          <CodeBlock
            code={`const result = await betterPay.iyzico.installmentInfo({
  binNumber: "552879",  // first 6 digits
  price: "500.00",
});

result.installmentDetails?.forEach(detail => {
  console.log(detail.bankName, detail.cardFamilyName);
  detail.installmentPrices.forEach(p => {
    console.log(\`\${p.installmentNumber} installments: \${p.totalPrice} TRY\`);
  });
});`}
          />
        </SubSection>

        <SubSection id="bincheck" title="iyzico.binCheck(binNumber) / parampos.binCheck(binNumber)">
          <p>Returns card information for a BIN number (first 6 digits).</p>
          <CodeBlock
            code={`const info = await betterPay.iyzico.binCheck("552879");
// { binNumber, cardType, cardAssociation, cardFamily, bankName, bankCode, commercial }`}
          />
        </SubSection>

        <SubSection id="refund" title="refund(request)">
          <p>Refunds a payment fully or partially.</p>
          <CodeBlock
            code={`const result = await betterPay.refund({
  paymentId: "transaction-id",
  price: "50.00",          // partial refund amount
  currency: Currency.TRY,
  ip: "85.34.78.112",
});`}
          />
        </SubSection>

        <SubSection id="cancel" title="cancel(request)">
          <p>Voids a payment. Must be called before settlement (same day).</p>
          <CodeBlock
            code={`const result = await betterPay.cancel({
  paymentId: "payment-id",
  ip: "85.34.78.112",
});`}
          />
          <Callout type="warning">
            PayTR does not support void. Call{" "}
            <code className="font-mono text-xs">refund()</code> with the full amount instead.
          </Callout>
        </SubSection>

        <SubSection id="subscription" title="iyzico.initializeSubscription(request)">
          <p>Subscribes a customer to an existing İyzico pricing plan.</p>
          <CodeBlock
            code={`const result = await betterPay.iyzico.initializeSubscription({
  pricingPlanReferenceCode: "PLAN_CODE_FROM_IYZICO",
  subscriptionInitialStatus: SubscriptionStatus.ACTIVE,
  customer: {
    name: "John",
    surname: "Doe",
    email: "john@example.com",
    gsmNumber: "+905350000000",
    identityNumber: "74300864791",
    billingAddress: { ... },
  },
  paymentCard: {
    cardHolderName: "John Doe",
    cardNumber: "5528790000000008",
    expireMonth: "12",
    expireYear: "2030",
    cvc: "123",
  },
});`}
          />
        </SubSection>

        <SubSection id="pwi" title="iyzico.initPWIPayment(request)">
          <p>
            Initiates a protected wire transfer (Korumalı Havale). Returns IBAN details for the
            customer to wire funds to.
          </p>
          <CodeBlock
            code={`const result = await betterPay.iyzico.initPWIPayment({
  price: "500.00",
  paidPrice: "500.00",
  currency: Currency.TRY,
  basketId: "B67832",
  callbackUrl: "https://yoursite.com/payment/callback",
  buyer: { ... },
  shippingAddress: { ... },
  billingAddress: { ... },
  basketItems: [ ... ],
});

// Show IBAN payment page to customer
if (result.htmlContent) document.body.innerHTML = result.htmlContent;
// Or redirect: window.location.href = result.paymentPageUrl;

// Poll or webhook to check status:
const status = await betterPay.iyzico.retrievePWIPayment(result.token!);
// status.paymentStatus: "WAITING" | "SUCCESS" | "FAILURE"
// status.iban — wire target IBAN`}
          />
        </SubSection>

        <SubSection id="handler" title="betterPay.handler">
          <p>
            Framework-agnostic HTTP handler. Wire it up manually in any framework.
          </p>
          <CodeBlock
            file="app/api/pay/[...path]/route.ts"
            code={`// Next.js App Router (manual — no adapter needed)
import { NextRequest, NextResponse } from "next/server";
import { betterPay } from "@/lib/payment";

async function handler(req: NextRequest) {
  const body = req.method !== "GET"
    ? await req.json().catch(() => undefined)
    : undefined;

  const res = await betterPay.handler.handle({
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    body,
  });

  return NextResponse.json(res.body, { status: res.status });
}

export const GET = handler;
export const POST = handler;`}
          />
          <p className="text-sm">All auto-exposed endpoints:</p>
          <CodeBlock
            file="terminal"
            code={`POST /api/pay/:provider/payment              createPayment
POST /api/pay/:provider/payment/init-3ds     initThreeDSPayment
POST /api/pay/:provider/payment/complete-3ds completeThreeDSPayment
POST /api/pay/:provider/refund               refund
POST /api/pay/:provider/cancel               cancel
GET  /api/pay/:provider/payment/:id          getPayment
POST /api/pay/:provider/callback             completeThreeDSPayment (alias)

# İyzico-only
POST /api/pay/iyzico/checkout/init           initCheckoutForm
POST /api/pay/iyzico/checkout/retrieve       retrieveCheckoutForm
POST /api/pay/iyzico/pwi/init                initPWIPayment
POST /api/pay/iyzico/pwi/retrieve            retrievePWIPayment
POST /api/pay/iyzico/installment             installmentInfo
POST /api/pay/iyzico/bin-check               binCheck
POST /api/pay/iyzico/subscription/initialize initializeSubscription
POST /api/pay/iyzico/subscription/cancel     cancelSubscription
POST /api/pay/iyzico/subscription/upgrade    upgradeSubscription
POST /api/pay/iyzico/subscription/retrieve   retrieveSubscription
POST /api/pay/iyzico/subscription/card-update updateSubscriptionCard
POST /api/pay/iyzico/subscription/product    createSubscriptionProduct
POST /api/pay/iyzico/subscription/pricing-plan createPricingPlan

GET  /api/pay/health                         health check`}
          />
        </SubSection>
      </Section>

      {/* Guides */}
      <Section id="guides" title="Guides">
        <SubSection id="guide-3d" title="3D Secure Payments">
          <p>The 3D Secure flow:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-sm">
            <li>Call <code className="font-mono text-xs text-primary">initThreeDSPayment()</code> with a <code className="font-mono text-xs text-primary">callbackUrl</code></li>
            <li>Render <code className="font-mono text-xs text-primary">result.threeDSHtmlContent</code> in the browser — it contains the bank's 3DS page</li>
            <li>Bank authenticates the user and POSTs to your callback URL</li>
            <li>Call <code className="font-mono text-xs text-primary">completeThreeDSPayment(callbackData)</code> to finalize</li>
          </ol>
          <CodeBlock
            file="app/api/pay/iyzico/callback/route.ts"
            code={`export async function POST(req: Request) {
  const data = await req.json();
  const result = await betterPay.iyzico.completeThreeDSPayment(data);

  if (result.status === PaymentStatus.SUCCESS) {
    await db.orders.update({ paymentId: result.paymentId, status: "paid" });
  }

  return Response.json(result);
}`}
          />
        </SubSection>

        <SubSection id="guide-subscription" title="Subscription Billing">
          <p>Steps to set up subscription billing with İyzico:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-sm">
            <li>Create a subscription product in İyzico dashboard (or via API)</li>
            <li>Create a pricing plan attached to that product</li>
            <li>Subscribe customers with their card details</li>
          </ol>
          <CodeBlock
            code={`// 1. Create product
const product = await betterPay.iyzico.createSubscriptionProduct({
  name: "Premium Plan",
  description: "Monthly premium subscription",
});

// 2. Create pricing plan
const plan = await betterPay.iyzico.createPricingPlan({
  productReferenceCode: product.data!.referenceCode,
  name: "Monthly",
  price: 99,
  currency: "TRY",
  paymentInterval: PaymentInterval.MONTHLY,
  paymentIntervalCount: 1,
  trialPeriodDays: 7,
});

// 3. Subscribe customer
const sub = await betterPay.iyzico.initializeSubscription({
  pricingPlanReferenceCode: plan.data!.referenceCode,
  subscriptionInitialStatus: SubscriptionStatus.ACTIVE,
  customer: { ... },
  paymentCard: { ... },
});`}
          />
        </SubSection>

        <SubSection id="guide-eft" title="Protected Wire Transfer (PWI)">
          <p>PWI lets customers pay via bank wire to an İyzico-managed IBAN. İyzico holds the funds and releases them after delivery confirmation.</p>
          <CodeBlock
            code={`const result = await betterPay.iyzico.initPWIPayment({
  price: "1000.00",
  paidPrice: "1000.00",
  currency: Currency.TRY,
  basketId: "ORDER-123",
  callbackUrl: "https://yoursite.com/payment/pwi-callback",
  buyer: { ... },
  shippingAddress: { ... },
  billingAddress: { ... },
  basketItems: [ ... ],
});

// Show payment info to customer
if (result.htmlContent) {
  document.getElementById("payment")!.innerHTML = result.htmlContent;
}

// Periodically poll status
const status = await betterPay.iyzico.retrievePWIPayment(result.token!);
if (status.paymentStatus === PWIPaymentStatus.WAITING) {
  console.log("Awaiting transfer to IBAN:", status.iban);
}`}
          />
        </SubSection>

        <SubSection id="guide-errors" title="Error Handling">
          <p>
            All methods return a result object with a <code className="font-mono text-xs text-primary">status</code> field.
            Wrap calls in try/catch for network-level errors.
          </p>
          <CodeBlock
            code={`try {
  const result = await betterPay.createPayment({ ... });

  if (result.status === PaymentStatus.SUCCESS) {
    console.log("Payment ID:", result.paymentId);
  } else {
    console.error("Failed:", result.errorMessage, result.errorCode);
  }
} catch (error) {
  // Network error or misconfiguration
  console.error("Unexpected:", error);
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
