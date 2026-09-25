---
'better-payment': minor
---

`better-payment/testing`: an in-memory `MockProvider` for application tests, with no credentials and no
network access. Enable it with `providers.mock: { enabled: true, provider: new MockProvider() }`;
handler routes are `/api/pay/mock/...` and the browser client has `client.mock`.

Magic card numbers (`MOCK_CARDS`) cover success, declines per `PaymentErrorCode`, 3D Secure required or
failed, lost responses (`NETWORK_ERROR`, while the payment went through) and failing refunds.
`failNext()` / `networkErrorNext()` override the next operation. Payments, refunds, pre-authorizations
and saved cards are kept in memory, so `getPayment()`, `refund()` and `cancel()` reflect earlier calls.
3D Secure callbacks are HMAC-signed and go through the real handler (signature check, duplicate
callbacks, `onCallback`).

`ProviderType` gains `MOCK`; `PROVIDER_DEFAULT_URLS` is keyed by the new `RemoteProviderType`.
