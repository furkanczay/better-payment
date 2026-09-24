# Changelog

Version history was reset. `0.0.1` is the first release of the reworked package;
earlier `1.x`–`3.x` releases are superseded and should not be used (see "Why the reset").

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
