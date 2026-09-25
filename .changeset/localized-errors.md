---
'better-payment': minor
---

`better-payment/plugins` with the first official plugin: `localizedErrors()`.

- Replaces the `errorMessage` of failed results with a customer-facing message chosen by the normalized `code` (or by a plugin's error code), in English or Turkish. The provider's message stays in the new `providerMessage` field.
- Custom wording and new languages with `messages`, falling back to `fallbackLocale`. The built-in dictionaries are typed, so a missing code does not compile.
- The HTTP handler answers in the language of each request (`Accept-Language` by default, or a `detectLocale` function), also for replayed `Idempotency-Key` responses.
- `payment.errors.message()`, `translate()` and `locales` for other languages and for provider-specific methods.
- Plugins can change handler responses with `onResponse`, and read every plugin's `$ERROR_CODES` from `ctx.errorCodes`.
