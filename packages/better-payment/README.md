# better-payment

> Unified, type-safe payment gateway for Node.js & TypeScript.

One API for all Turkish payment providers — Iyzico, PayTR, Parampos, and Akbank. Switch providers without rewriting code.

[![npm](https://img.shields.io/npm/v/better-payment)](https://www.npmjs.com/package/better-payment)
[![license](https://img.shields.io/npm/l/better-payment)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

---

## Install

```bash
npm install better-payment
# or
pnpm add better-payment
```

## Quick Start

```typescript
import { BetterPayment } from 'better-payment';

const payment = new BetterPayment({
  mode: 'sandbox',
  providers: {
    iyzico: {
      enabled: true,
      config: {
        apiKey: process.env.IYZICO_API_KEY!,
        secretKey: process.env.IYZICO_SECRET_KEY!,
      },
    },
  },
});

// 3D Secure
const result = await payment.iyzico.initThreeDSPayment({
  price: '100.00',
  paidPrice: '100.00',
  currency: 'TRY',
  callbackUrl: 'https://yoursite.com/callback',
  buyer: { ... },
  basketItems: [ ... ],
});

// Refund
const refund = await payment.use('iyzico').refund({
  paymentId: '12345',
  price: '50.00',
  currency: 'TRY',
  ip: '1.2.3.4',
});
```

## Supported Providers

| Provider  | 2D | 3D Secure | Refund | Cancel | BIN Check | Installments |
|-----------|:--:|:---------:|:------:|:------:|:---------:|:------------:|
| Iyzico    | ✓  | ✓         | ✓      | ✓      | ✓         | ✓            |
| PayTR     | —  | ✓         | ✓      | —      | ✓         | ✓            |
| Parampos  | ✓  | ✓         | ✓      | ✓      | ✓         | —            |
| Akbank    | ✓  | ✓         | ✓      | ✓      | ✓         | ✓            |

## HTTP Handler

Automatically exposes REST endpoints — works with Next.js, Express, Fastify, Hono, Bun, and any Node.js framework.

```typescript
// Next.js App Router — app/api/pay/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { payment } from '@/lib/payment';

async function handler(req: NextRequest) {
  const res = await payment.handler.handle({
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    body: await req.json().catch(() => undefined),
  });
  return NextResponse.json(res.body, { status: res.status });
}

export const GET = handler;
export const POST = handler;

// Available routes:
// POST /api/pay/:provider/payment
// POST /api/pay/:provider/payment/init-3ds
// POST /api/pay/:provider/callback
// POST /api/pay/:provider/refund
// POST /api/pay/:provider/cancel
// POST /api/pay/:provider/bin-check
// POST /api/pay/:provider/installment
// GET  /api/pay/health
```

## Logging & Retry

```typescript
const payment = new BetterPayment({
  mode: 'sandbox',
  logger: {
    debug: (msg, meta) => console.debug(msg, meta),
    info:  (msg, meta) => console.info(msg, meta),
    error: (msg, err, meta) => console.error(msg, err, meta),
  },
  retry: {
    attempts: 3,
    delay: 1000,
    statusCodes: [429, 503],
  },
  providers: { ... },
});
```

## Documentation

Full documentation, provider-specific guides, and API reference:

**[https://better-payment.czaylabs.com](https://better-payment.czaylabs.com)**

## License

MIT
