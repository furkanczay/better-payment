# Changelog

Version history was reset. `0.0.1` is the first release of the reworked package;
earlier `1.x`–`3.x` releases are superseded and should not be used (see "Why the reset").

Upgrading from `3.x`? Read the migration guide:
https://better-payment.czaylabs.com/docs/whats-new

## 0.2.0

Pre-authorization and stored cards. Existing 0.1.0 code keeps working; the only type-level
change is that `PaymentRequest.paymentCard` is now optional (see "Changed"). Both features are
tested against the real iyzico sandbox every night.

### Added

- **Pre-authorization:** `authorize()` and `initThreeDSAuthorize()` block an amount on the card,
  `capture({ paymentId, amount, ip })` charges it (partial capture supported) and
  `voidAuthorization({ paymentId, ip })` releases it. Supported on iyzico, Parampos and Akbank;
  PayTR throws `NOT_SUPPORTED` for now (#60).
  See https://better-payment.czaylabs.com/docs/guides/pre-authorization
- **Stored cards:** pass `saveCard` with a payment to save the card with the provider, then pay
  with `storedCard: { customerToken, cardToken }` instead of `paymentCard`. Results carry the
  tokens in `storedCard`. `saveCard()`, `listCards()` and `deleteCard()` manage saved cards
  (iyzico card storage API; PayTR Kart Saklama `capi/list` and `capi/delete`, cards are saved
  during a Direct API payment). Only tokens are stored, never card numbers. Parampos and Akbank
  reject stored cards for now (#65).
  See https://better-payment.czaylabs.com/docs/guides/stored-cards
- HTTP handler routes `authorize`, `authorize/init-3ds`, `capture`, `void`, `cards/save`,
  `cards/list` and `cards/delete`. Capture, void and the card routes require an `authorize` hook;
  the mutating ones accept an `Idempotency-Key` header.
- Browser client methods for all of the above (`client.iyzico.capture(...)`,
  `client.iyzico.listCards(...)`, ...).

### Changed

- `PaymentRequest.paymentCard` is optional in the types. At runtime one of `paymentCard` or
  `storedCard` is still required; code that reads `request.paymentCard` from a `PaymentRequest`
  needs a check.
- The HTTP handler answers `400` (instead of `500`) when a provider does not support the
  requested operation (`NOT_SUPPORTED`).

## 0.1.0

The first feature release after the reset. Existing 0.0.1 code keeps working; behavior
changes are listed under "Changed". The iyzico integration is now tested against
the real iyzico sandbox every night.

### Added

- **Unified error codes.** Every failed result carries `code`, a provider-independent
  `PaymentErrorCode` (`INSUFFICIENT_FUNDS`, `CARD_DECLINED`, `INVALID_CARD`, `EXPIRED_CARD`,
  `INVALID_CVC`, `THREEDS_FAILED`, `FRAUD_SUSPECTED`, `LIMIT_EXCEEDED`, `DUPLICATE_ORDER`,
  `CANCELLED_BY_CUSTOMER`, `INVALID_REQUEST`, `NETWORK_ERROR`, `INVALID_HASH`, `PROVIDER_ERROR`,
  `UNKNOWN`). `errorCode` keeps the provider's raw code. iyzico payment errors, PayTR
  `failed_reason_code` and Akbank's ISO 8583 host codes are mapped; unmapped codes are
  `UNKNOWN`. See https://better-payment.czaylabs.com/docs/api/error-codes
- **Request validation** before the provider is called: card number (Luhn), expiry, CVC,
  amounts, iyzico basket totals, buyer email/IP/GSM formats and provider-required fields.
  Invalid requests return `code: 'INVALID_REQUEST'` and list every invalid field, without an
  HTTP call. `ValidationError` carries `issues` and `field`. Turn it off with `validate: false`.
- **Parampos installments:** `installmentInfo()` returns the card's available installment
  counts with Param's totals, `calculatePaidPrice()` computes `paidPrice` (Toplam_Tutar), and
  `getInstallmentRates()` returns the rate table. `InstallmentDetail` gains `commissionRate`.
- **Duplicate callbacks are processed once.** A repeated PayTR notification or browser
  re-post gets the stored response, without calling the provider or `onCallback` again, so
  Parampos payments are never finalized twice. If `onCallback` fails, the retry reuses the
  stored provider result.
- **`Idempotency-Key` header** on payment, refund, cancel and iyzico management routes of the
  HTTP handler. A repeated key replays the first response.
- `IdempotencyStore` interface with an in-memory default (use Redis or a database with
  several instances). Configure with `handler.idempotency`, or turn off with `idempotency: false`.
- `PaymentErrorCode` and `PaymentStatus` are exported from `better-payment/client`.

### Changed

- Request validation errors (missing `callbackUrl`, unsupported currency, invalid amount,
  invalid PayTR order id, ...) return `errorCode: 'VALIDATION_ERROR'`; `errorCode` used to be empty.
- Stricter public types, with no `any`: `rawResponse` is `unknown`, and the handler request and
  response bodies are `unknown`. `HandlerContext.body` is `Record<string, unknown> | undefined`,
  and `onCallback` / `callbackRedirect` receive a `PaymentResponse`. Code that read fields of
  `rawResponse` without narrowing needs a cast.
- `NETWORK_ERROR` messages name the transport error, e.g. `No response from iyzico
(ECONNRESET: read ECONNRESET)`.
- Akbank `installmentInfo()` explains that Akbank's API has no installment-rate query.
- The published build is minified (names kept, source maps included): about 19 kB gzip
  instead of 29.6 kB; the browser client is 1.2 kB.

## 0.0.1

### Why the reset

An audit found that several provider integrations in `1.x`–`3.x` did not match the
providers' APIs and that some callback checks could be bypassed. Do not use those
versions. `0.0.1` contains the corrected implementations described below.

### Security

- **Parampos:** the 3D callback hash is verified only with the GUID from your
  configuration. Earlier versions read the GUID from the callback payload, which
  let anyone forge a successful payment.
- **Parampos / Akbank:** a 3D callback no longer counts as a successful payment on
  its own. Parampos finalizes with `TP_WMD_Pay`; Akbank uses the 3D_PAY model with an
  HMAC-signed result. A missing result code is no longer treated as success.
- **HTTP handler:** secure by default. By default it only exposes provider
  callbacks, `installment` and `bin-check`. Refund, cancel, payment lookup and
  subscription management require an `authorize` hook.
- **Retries** only re-send idempotent requests (GET or read-only queries). Payment,
  refund and cancel requests are never retried, so a timeout cannot cause a double
  charge or double refund.
- Signatures are compared in constant time.

### Provider fixes

- **PayTR:** requests are signed with `merchant_key`, with `merchant_salt` appended
  to the signed data. `user_basket` is base64 JSON with TL prices. `merchant_oid`
  must be alphanumeric. `test_mode` follows sandbox mode. Refund amounts are in TL.
  Status queries use `/odeme/durum-sorgu`. The handler answers notifications with
  plain `OK`. Secrets are no longer sent in request bodies.
- **Parampos:** uses `TP_WMD_UCD` / `TP_WMD_Pay`, comma-decimal amounts and the
  documented hash. Refunds and cancels use `TP_Islem_Iptal_Iade_Kismi2`, status
  queries `TP_Islem_Sorgulama4` and BIN lookups `BIN_SanalPos`. Made-up
  installment rates were removed, and `UCD_HTML` is now unescaped.
- **Akbank:** rewritten against the Akbank Sanal POS JSON API: `auth-hash`
  signatures, transaction codes 1000/1002/1003/1010, and the 3D_PAY gateway.
- **iyzico:** Checkout Form and PWI results report the payment's own status
  (`paymentStatus`), not whether the API call succeeded. 3DS completion requires
  `mdStatus=1`. `retrieveSubscription` uses GET. Subscription responses map
  `status` to the shared `PaymentStatus` values.

### Breaking changes (compared with 3.x)

- Provider configuration:
  - PayTR: `{ merchantId, merchantKey, merchantSalt, testMode? }`
  - Akbank: `{ merchantSafeId, terminalSafeId, secretKey, subMerchantId?, testMode? }`
  - Parampos: `{ clientCode, clientUsername, clientPassword, guid }`
  - PayTR, Akbank and Parampos no longer take `apiKey` / `secretKey`.
- For PayTR, Akbank and Parampos, `paymentId` is the order id (`conversationId`,
  or an id generated for you). `refund`, `cancel` and `getPayment` take this order id.
- Network errors and timeouts return `status: 'pending'` with
  `errorCode: 'NETWORK_ERROR'`: the outcome is unknown, so check it with `getPayment()`.
- Handler: failed operations return HTTP 422, unexpected errors return a generic 500,
  and the health check no longer lists providers. New options: `basePath`,
  `allowedActions`, `authorize`, `transformRequest`, `onCallback`, `callbackRedirect`.
- Unsupported currencies throw an error instead of silently falling back to TRY.
