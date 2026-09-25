---
'better-payment': minor
---

Validate payment requests before calling the provider. Card number (Luhn), expiry, CVC, amounts,
iyzico basket totals, buyer email/IP/GSM formats and provider-required fields are checked, and
invalid requests return `code: 'INVALID_REQUEST'` with every invalid field listed in `errorMessage`
without an HTTP call. `ValidationError` now carries `issues` (field paths) and `field`. Disable
with `validate: false` globally or per provider.
