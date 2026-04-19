---
"better-payment": major
---

## Breaking Changes

### Class and type renames

All exports have been renamed from `BetterPay*` to `BetterPayment*`:

| Before | After |
|--------|-------|
| `BetterPay` | `BetterPayment` |
| `BetterPayConfig` | `BetterPaymentConfig` |
| `BetterPayHandler` | `BetterPaymentHandler` |
| `BetterPayRequest` | `BetterPaymentRequest` |
| `BetterPayResponse` | `BetterPaymentResponse` |
| `BetterPayClient` | `BetterPaymentClient` |
| `BetterPayClientConfig` | `BetterPaymentClientConfig` |
| `createBetterPayClient` | `createBetterPaymentClient` |

**Migration:**

```ts
// Before
import { BetterPay } from 'better-payment';
const pay = new BetterPay({ ... });

// After
import { BetterPayment } from 'better-payment';
const pay = new BetterPayment({ ... });
```

### Adapters removed

The framework-specific adapters have been removed. Use the framework-agnostic `BetterPaymentHandler` directly.

```ts
// Before (Next.js adapter)
import { createNextHandler } from 'better-payment/adapters/next-js';

// After (manual Next.js App Router integration)
import { getBetterPayment } from '@/lib/payment';
import { NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
  const res = await getBetterPayment().handler.handle({
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    body: await req.json().catch(() => undefined),
  });
  return NextResponse.json(res.body, { status: res.status, headers: res.headers });
}
export const GET = handler;
export const POST = handler;
```

### PayTR `cancel()` behavior changed

`cancel()` no longer silently calls `refund()` with amount 0. It now returns a `FAILURE` status with an explanatory message. Use `refund()` with the original payment amount to void a PayTR payment.

### New iyzico handler routes

`BetterPaymentHandler` now supports these additional iyzico-specific endpoints:

- `POST /api/pay/iyzico/checkout/init`
- `POST /api/pay/iyzico/checkout/retrieve`
- `POST /api/pay/iyzico/pwi/init`
- `POST /api/pay/iyzico/pwi/retrieve`
- `POST /api/pay/iyzico/installment`
- `POST /api/pay/iyzico/bin-check`
- `POST /api/pay/iyzico/subscription/initialize`
- `POST /api/pay/iyzico/subscription/cancel`
- `POST /api/pay/iyzico/subscription/upgrade`
- `POST /api/pay/iyzico/subscription/retrieve`
- `POST /api/pay/iyzico/subscription/card-update`
- `POST /api/pay/iyzico/subscription/product`
- `POST /api/pay/iyzico/subscription/pricing-plan`
