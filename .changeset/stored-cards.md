---
'better-payment': minor
---

Stored cards: pass `saveCard` with a payment to save the card, and pay later with
`storedCard: { customerToken, cardToken }` instead of `paymentCard`. New `saveCard()`, `listCards()`
and `deleteCard()` methods (iyzico card storage API; PayTR `capi/list` and `capi/delete`), with
`storedCard` tokens in payment results. The HTTP handler adds `cards/save`, `cards/list` and
`cards/delete` routes, which require an `authorize` hook. Parampos and Akbank reject stored cards for now.

Type change: `PaymentRequest.paymentCard` is now optional (one of `paymentCard` or `storedCard` is
required at runtime).
