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

// Direct access via use()
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
// Next.js App Router
import { payment } from '@/lib/payment';

export const { GET, POST } = payment.handler.toNextJs();

// Available routes:
// POST /api/pay/:provider/payment
// POST /api/pay/:provider/payment/init-3ds
// POST /api/pay/:provider/callback
// POST /api/pay/:provider/refund
// POST /api/pay/:provider/bin-check
// POST /api/pay/:provider/installment
// GET  /api/pay/health
```

## Documentation

Full documentation, provider-specific guides, and API reference:

**[https://github.com/furkanczay/better-payment](https://github.com/furkanczay/better-payment)**

## License

MIT — see [LICENSE](./LICENSE)
