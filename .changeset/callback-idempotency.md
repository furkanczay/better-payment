---
'better-payment': minor
---

The HTTP handler processes each provider callback once. A repeated PayTR notification or browser
re-post gets the stored response without calling the provider or `onCallback` again. If
`onCallback` fails, the retry reuses the stored provider result. Mutating routes honor an
`Idempotency-Key` header. Pluggable `IdempotencyStore` (in-memory by default; Redis/SQL examples in
the docs); configure with `handler.idempotency` or turn off with `idempotency: false`.
