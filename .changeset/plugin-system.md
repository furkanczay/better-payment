---
'better-payment': minor
---

Plugin system and `betterPayment()` factory (breaking).

- `betterPayment({ providers, plugins })` replaces `new BetterPayment()`. Providers are created with factories: `iyzico({...})`, `paytr({...})`, `akbank({...})`, `parampos({...})`, or `defineProvider()` for custom providers; `MockProvider` is passed as an instance. Any key works as provider id. The `enabled` flag is gone: leave a provider out instead.
- Plugins: `init`, before/after hooks (choose the provider, replace the request or the result), `methods` added to the payment object, handler `endpoints` and `$ERROR_CODES`. What a plugin adds is typed on the payment object. `definePlugin()` keeps a plugin's exact type.
- Typed payment events (`payment.succeeded`, `payment.authorized`, `payment.pending`, `payment.failed`, `payment.cancelled`, `refund.succeeded`, `refund.failed`) with `payment.on()` or a plugin's `events`. They are emitted once per verified result; a failing listener throws `EventListenerError` with the result, and callback events are retried with the stored result.
- `client.use(id)` for custom provider ids; WebCrypto helpers (`hmac`, `digest`, `safeEqual`, `toHex`, `toBase64`, `randomHex`) are exported for custom providers.
- Removed: the `BetterPayment` class (now a type), `BetterPaymentConfig` (now `BetterPaymentOptions`) and the per-provider config types. `getEnabledProviders()` returns `string[]`; `HandlerContext.provider` is a `string` (undefined for plugin endpoints).

See the migration guide: https://better-payment.czaylabs.com/docs/guides/migration-0-5
