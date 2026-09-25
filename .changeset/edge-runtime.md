---
'better-payment': minor
---

Edge runtime support and zero runtime dependencies. The server entry point now uses only `fetch` and
WebCrypto, so it runs on Vercel Edge, Cloudflare Workers, Deno and Bun as well as Node.js 20+. axios
is removed; provider calls use a small internal fetch client with the same timeouts, logging and
idempotent-only retry rules. New `fetch` option (top level or per provider) for a custom fetch
implementation. CI runs the test suite with edge-runtime globals and runs the built bundle in the
Vercel Edge Runtime VM.

Custom providers that extend `PaymentProvider`: `setupAxiosLogging()` / `setupAxiosRetry()` are
replaced by `createHttpClient(name, { timeout, headers })`. Transport errors are `HttpError`s
(`isNetworkError`, `code`, `response`); results keep reporting them as `NETWORK_ERROR`.
