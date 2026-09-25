---
'better-payment': minor
---

Pre-authorization: `authorize()`, `initThreeDSAuthorize()`, `capture({ paymentId, amount, ip })` and
`voidAuthorization({ paymentId, ip })` for iyzico, Parampos and Akbank (partial capture supported).
The HTTP handler adds `authorize`, `authorize/init-3ds`, `capture` and `void` routes; capture and void
require an `authorize` hook, and unsupported providers answer `400`. PayTR throws `NOT_SUPPORTED`
for now (#60).
