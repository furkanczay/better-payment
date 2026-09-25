import Code from "@/components/Code";
import type { Dictionary } from "@/lib/i18n/dictionary";

const before = `// iyzico: JSON + IYZWSv2 signatures
const iyzico = new Iyzipay({ apiKey, secretKey, uri });

// PayTR: form-encoded, HMAC tokens, iFrame flow,
// notifications that must be answered with "OK"

// Parampos: SOAP envelopes, ISO-8859-9 SHA1 hashes,
// a second call to finalize every 3D payment

// Akbank: JSON API, HMAC-SHA512 auth headers

// Four request shapes, four response formats,
// four ways to verify a callback.`;

const after = `import { BetterPayment } from "better-payment";

const payment = new BetterPayment({
  providers: {
    iyzico:   { enabled: true, config: { ... } },
    paytr:    { enabled: true, config: { ... } },
    parampos: { enabled: true, config: { ... } },
    akbank:   { enabled: true, config: { ... } },
  },
});

// Same request type, same result shape
const result = await payment.use("parampos").createPayment(order);

result.status; // "success" | "failure" | "pending" | "cancelled"`;

export default function Compare({ t }: { t: Dictionary["compare"] }) {
  return (
    <section className="py-24 px-5 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3">
            {t.eyebrow}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
            {t.titleLine1}
            <br />
            <span className="text-muted-foreground font-medium">{t.titleLine2}</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-xl">
            {t.lead}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <div className="flex flex-col gap-2 min-w-0">
            <span className="text-xs font-medium text-muted-foreground">{t.without}</span>
            <Code code={before} file="integration/payments.ts" className="flex-1" />
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <span className="text-xs font-medium text-foreground">{t.with}</span>
            <Code code={after} file="lib/payment.ts" className="flex-1" />
          </div>
        </div>

        <ul className="flex flex-wrap gap-2 mt-8">
          {t.points.map((point) => (
            <li
              key={point}
              className="text-xs font-medium text-muted-foreground border border-border rounded-full px-3 py-1.5"
            >
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
