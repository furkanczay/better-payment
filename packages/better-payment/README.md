# better-payment

> Unified, type-safe payment gateway for Node.js & TypeScript.

One API for Turkish payment providers — iyzico, PayTR, Parampos and Akbank.

[![npm](https://img.shields.io/npm/v/better-payment)](https://www.npmjs.com/package/better-payment)
[![license](https://img.shields.io/npm/l/better-payment)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

> **0.0.1 is a fresh start.** The version history was reset on purpose.
> Releases `1.x`–`3.x` are deprecated. See [What's new in 0.0.1](#whats-new-in-001).

---

## What's new in 0.0.1

`0.0.1` is not a patch on top of `3.x`. It is the first release of a rebuilt
library. A review found that the old releases had provider integrations that
did not match the providers' APIs, and callback checks that could be bypassed
(for example, forging a Parampos "success" callback). Fixing that required
breaking changes. Rather than stacking another major version on top of those
releases, we reset the version history. `0.0.1` is the new baseline.

What changed:

- **Callbacks are verified, not trusted.** Every 3D Secure callback and PayTR
  notification is checked with your own credentials. Parampos payments are
  finalized with the bank before they count as successful.
- **Real provider APIs.** PayTR signing, Parampos `TP_WMD_*`, the Akbank Sanal POS
  JSON API and iyzico payment statuses now match the official specifications.
- **Clear statuses.** `success`, `failure`, `pending` and `cancelled`. A timeout is
  `pending` with `NETWORK_ERROR` (the outcome is unknown), never a silent failure.
  Payments are never retried automatically.
- **Your order id is the payment id** for PayTR, Parampos and Akbank.
- **Secure-by-default HTTP handler:** routes are opt-in, sensitive actions require
  `authorize`, and amounts can be set on the server.
- **One config per provider**, validated at startup.

Upgrading from `3.x`: `npm install better-payment@latest` (a `^3` range will never
resolve to `0.0.1`), then follow the
[migration guide](https://better-payment.czaylabs.com/docs/whats-new).

## Install

```bash
npm install better-payment
# or
pnpm add better-payment
```

Requires Node.js 20+. The server entry point uses `node:crypto` and does not run
on edge runtimes (Vercel Edge, Cloudflare Workers). `better-payment/client` is
browser-safe.

## Quick Start

```typescript
import { BetterPayment, ProviderType } from 'better-payment';

const payment = new BetterPayment({
  mode: 'sandbox', // sandbox URLs + provider test modes
  providers: {
    iyzico: {
      enabled: true,
      config: {
        apiKey: process.env.IYZICO_API_KEY!,
        secretKey: process.env.IYZICO_SECRET_KEY!,
      },
    },
    paytr: {
      enabled: true,
      config: {
        merchantId: process.env.PAYTR_MERCHANT_ID!,
        merchantKey: process.env.PAYTR_MERCHANT_KEY!,
        merchantSalt: process.env.PAYTR_MERCHANT_SALT!,
      },
    },
    parampos: {
      enabled: true,
      config: {
        clientCode: process.env.PARAMPOS_CLIENT_CODE!,
        clientUsername: process.env.PARAMPOS_CLIENT_USERNAME!,
        clientPassword: process.env.PARAMPOS_CLIENT_PASSWORD!,
        guid: process.env.PARAMPOS_GUID!,
      },
    },
    akbank: {
      enabled: true,
      config: {
        merchantSafeId: process.env.AKBANK_MERCHANT_SAFE_ID!,
        terminalSafeId: process.env.AKBANK_TERMINAL_SAFE_ID!,
        secretKey: process.env.AKBANK_SECRET_KEY!,
      },
    },
  },
  defaultProvider: ProviderType.IYZICO,
});

// Start a 3D Secure payment and render result.threeDSHtmlContent in the browser
const result = await payment.iyzico.initThreeDSPayment({
  price: '100.00',
  paidPrice: '100.00',
  currency: 'TRY',
  basketId: 'B1',
  callbackUrl: 'https://yoursite.com/api/pay/iyzico/payment/complete-3ds',
  paymentCard: { ... },
  buyer: { ... },
  shippingAddress: { ... },
  billingAddress: { ... },
  basketItems: [ ... ],
});
```

## Results and statuses

Every operation resolves to a result with `status`:

| status      | meaning                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------- |
| `success`   | The provider confirmed the operation (payment captured, refund accepted, ...)               |
| `failure`   | The provider rejected it; see `errorCode` / `errorMessage` / `rawResponse`                  |
| `pending`   | Waiting for the customer (3DS, bank transfer) **or** the outcome is unknown                 |
| `cancelled` | The payment was voided or fully refunded (status queries)                                   |

When a request times out or the connection drops, the result is `pending` with
`errorCode: 'NETWORK_ERROR'`. The provider may still have processed the
payment. Check it with `getPayment()` before you retry. Payment, refund and cancel
requests are never retried automatically.

Failed results also carry `code`, a provider-independent `PaymentErrorCode`
(`INSUFFICIENT_FUNDS`, `CARD_DECLINED`, `THREEDS_FAILED`, `INVALID_HASH`, ...).
The provider's raw code stays in `errorCode`. Unmapped codes are `UNKNOWN`. See
[Error Codes](https://better-payment.czaylabs.com/docs/api/error-codes) for the
list and suggested customer messages.

```typescript
if (result.code === PaymentErrorCode.INSUFFICIENT_FUNDS) askForAnotherCard();
```

For PayTR, Parampos and Akbank, `paymentId` is your **order id**: the
`conversationId` you pass in, or an alphanumeric id generated for you. Pass
this id to `refund`, `cancel` and `getPayment`.

## Providers

| Provider | Non-3D                    | 3D Secure                   | Refund | Cancel             | Status | BIN | Installments      |
| -------- | ------------------------- | --------------------------- | :----: | ------------------ | :----: | :-: | ----------------- |
| iyzico   | ✓                         | ✓                           |   ✓    | ✓                  |   ✓    |  ✓  | ✓                 |
| PayTR    | ✓ (needs non-3D approval) | ✓ iFrame                    |   ✓    | ✓ (full refund)    |   ✓    |  ✓  | ✓ (account rates) |
| Parampos | ✓ (TRY)                   | ✓ `TP_WMD_UCD`/`TP_WMD_Pay` |   ✓    | ✓                  |   ✓    |  ✓  | ✓ (account rates) |
| Akbank   | ✓                         | ✓ 3D_PAY                    |   ✓    | ✓                  |   ✓    |  —  | —                 |

### 3D Secure completion

- **iyzico / Parampos / Akbank:** the bank POSTs to your `callbackUrl`. Pass the
  POST body to `completeThreeDSPayment()`. The signature is verified with your
  credentials before anything is trusted. Parampos then finalizes the payment
  with `TP_WMD_Pay`.
- **PayTR:** `callbackUrl` is only where the customer's browser returns. The
  result is sent to the **notification URL** set in the PayTR panel. Point it at
  `/api/pay/paytr/callback`; the handler verifies the notification and replies
  `OK`.

Pre-authorization (block now, charge later) works on iyzico, Parampos and Akbank:
`authorize()` / `initThreeDSAuthorize()`, then `capture({ paymentId, amount, ip })` or
`voidAuthorization({ paymentId, ip })`. See the
[pre-authorization guide](https://better-payment.czaylabs.com/docs/guides/pre-authorization).

Installments: pass `installment` in the request. For Parampos, set `paidPrice`
to the total including commission: `payment.parampos.calculatePaidPrice({ binNumber,
price, installment })` computes it from your Param rates. Akbank has no
installment-rate API; use your contracted rates. The library never invents
commission rates.

## HTTP Handler

A framework-agnostic handler that exposes REST endpoints under `/api/pay`. It is
**secure by default**: out of the box it exposes only the provider callbacks and
the card queries (`installment`, `bin-check`).

```typescript
const payment = new BetterPayment({
  providers: { ... },
  handler: {
    // opt in to what your frontend needs
    allowedActions: ['payment/init-3ds', 'payment/complete-3ds', 'callback', 'refund'],

    // required for refund/cancel/payment lookup/subscription management
    authorize: async (ctx) => {
      if (ctx.action === 'callback' || ctx.action === 'payment/complete-3ds') return true;
      return isAdmin(ctx.request.headers.authorization);
    },

    // never trust amounts from the browser
    transformRequest: async (ctx) => {
      if (ctx.action !== 'payment/init-3ds') return ctx.body;
      const order = await db.orders.find(ctx.body?.orderId);
      return buildPaymentRequest(order, ctx.body?.paymentCard);
    },

    // update your order from verified callbacks
    onCallback: async (result) => {
      await db.orders.markPaid(result.paymentId, result.status);
    },

    // send the customer somewhere after 3D Secure
    callbackRedirect: (result) => `/orders/${result.paymentId}?status=${result.status}`,
  },
});
```

```typescript
// Next.js App Router — app/api/pay/[...path]/route.ts
async function handler(req: Request) {
  const contentType = req.headers.get('content-type') ?? '';
  const body = req.method === 'GET' ? undefined : await req.text();

  const res = await payment.handler.handle({
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    body: contentType.includes('application/json') && body ? JSON.parse(body) : body,
  });

  const isJson = res.headers['Content-Type'] === 'application/json';
  return new Response(isJson ? JSON.stringify(res.body) : res.body, {
    status: res.status,
    headers: res.headers,
  });
}

export const GET = handler;
export const POST = handler;
```

| Route (under `basePath`)              | Action                   | Enabled by default                    |
| ------------------------------------- | ------------------------ | ------------------------------------- |
| `POST /:provider/payment/complete-3ds` | `payment/complete-3ds`   | ✓                                     |
| `POST /:provider/callback`             | `callback`               | ✓ (PayTR replies `OK`)                |
| `POST /:provider/installment`          | `installment`            | ✓                                     |
| `POST /:provider/bin-check`            | `bin-check`              | ✓                                     |
| `POST /:provider/payment`              | `payment`                | —                                     |
| `POST /:provider/payment/init-3ds`     | `payment/init-3ds`       | —                                     |
| `POST /:provider/payment/token`        | `payment/token` (PayTR)  | —                                     |
| `GET  /:provider/payment/:id`          | `payment/get`            | — (needs `authorize`)                 |
| `POST /:provider/refund`, `/cancel`    | `refund`, `cancel`       | — (needs `authorize`)                 |
| `POST /:provider/authorize[/init-3ds]` | `authorize`, `authorize/init-3ds` | —                          |
| `POST /:provider/capture`, `/void`     | `capture`, `void`        | — (needs `authorize`)                 |
| `POST /iyzico/checkout/*`, `/pwi/*`    | iyzico only              | —                                     |
| `POST /iyzico/subscription/*`          | iyzico only              | — (management actions need `authorize`) |
| `GET  /health`                        | health check             | ✓                                     |

Failed operations return HTTP 422 with the result body. Unexpected errors return a
generic 500 unless you set `exposeErrors: true`.

## Logging & Retry

```typescript
const payment = new BetterPayment({
  logger: {
    debug: (msg, meta) => console.debug(msg, meta),
    info: (msg, meta) => console.info(msg, meta),
    error: (msg, err, meta) => console.error(msg, err, meta),
  },
  // Only idempotent requests (status/BIN/installment queries) are retried
  retry: { attempts: 3, delay: 1000, statusCodes: [429, 503] },
  providers: { ... },
});
```

The logger receives method, URL and status only. Request bodies (card data,
credentials) are never logged.

## Documentation

[https://better-payment.czaylabs.com](https://better-payment.czaylabs.com)

## License

MIT
