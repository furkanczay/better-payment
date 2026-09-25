---
'better-payment': minor
---

Unified error codes: failed results now carry `code`, a provider-independent `PaymentErrorCode`
(`INSUFFICIENT_FUNDS`, `CARD_DECLINED`, `INVALID_CARD`, `EXPIRED_CARD`, `INVALID_CVC`,
`THREEDS_FAILED`, `FRAUD_SUSPECTED`, `LIMIT_EXCEEDED`, `DUPLICATE_ORDER`, `CANCELLED_BY_CUSTOMER`,
`INVALID_REQUEST`, `NETWORK_ERROR`, `INVALID_HASH`, `PROVIDER_ERROR`, `UNKNOWN`). `errorCode` keeps
the provider's raw code.

- iyzico payment error codes, PayTR `failed_reason_code` and Akbank's ISO 8583 host response codes are mapped.
- Request validation errors (missing `callbackUrl`, unsupported currency, invalid amount, invalid
  PayTR order id, ...) now throw `ValidationError` internally and return `errorCode: 'VALIDATION_ERROR'`
  with `code: 'INVALID_REQUEST'`; previously `errorCode` was empty.
- `PaymentErrorCode` and `PaymentStatus` are exported from `better-payment/client`.
