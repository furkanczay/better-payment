---
'better-payment': patch
---

Stricter public types: the package no longer uses `any`.

- `rawResponse` on result types is `unknown` (narrow it before reading fields).
- Handler: `BetterPaymentRequest.body` / `BetterPaymentResponse.body` are `unknown`,
  `HandlerContext.body` is `Record<string, unknown> | undefined`, and `onCallback` /
  `callbackRedirect` receive a `PaymentResponse`.
- `completeThreeDSPayment()` takes the provider's callback type (`unknown` on the base class).
