---
'better-payment': minor
---

Framework adapters that mount the HTTP handler in one line and get the tricky parts right: raw bodies for
form-urlencoded bank callbacks, PayTR's plain-text `OK`, and redirects that keep `Location` with no body.

- `better-payment/next`: `export const { GET, POST } = toNextJsHandler(getBetterPayment)`
- `better-payment/express`: `toExpressHandler(payment)` middleware (no body parser needed), and
  `toNodeHandler` for plain `node:http`
- `better-payment/fastify`: `toFastifyPlugin(payment)`. Registers a form-urlencoded parser for its own
  routes only (Fastify rejects that content type by default).
- `better-payment/hono`: `toHonoHandler(payment)`
- `toFetchHandler(payment)` in the main entry for Cloudflare Workers, Deno and Bun

Adapters accept a handler, a `BetterPayment` instance, or a function returning either (lazy
initialization). They have no dependencies and do not import the frameworks.
