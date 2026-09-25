/**
 * Mounting the HTTP handler in each supported framework. Typechecked in CI
 * (`pnpm typecheck:examples`) against the frameworks' own types.
 */
import express from 'express';
import Fastify from 'fastify';
import { Hono } from 'hono';
import { createServer } from 'node:http';
import { BetterPayment, ProviderType, toFetchHandler } from 'better-payment';
import { toNextJsHandler } from 'better-payment/next';
import { toExpressHandler, toNodeHandler } from 'better-payment/express';
import { toHonoHandler } from 'better-payment/hono';
import { toFastifyPlugin } from 'better-payment/fastify';

let instance: BetterPayment | undefined;
export function getBetterPayment(): BetterPayment {
  instance ??= new BetterPayment({
    mode: 'sandbox',
    providers: {
      [ProviderType.IYZICO]: {
        enabled: true,
        config: { apiKey: process.env.IYZICO_API_KEY!, secretKey: process.env.IYZICO_SECRET_KEY! },
      },
    },
  });
  return instance;
}

// Next.js: app/api/pay/[...path]/route.ts (lazy, so builds work without env vars)
export const { GET, POST } = toNextJsHandler(getBetterPayment);

// Express: no body parser needed for the payment routes
const expressApp = express();
expressApp.all('/api/pay/*path', toExpressHandler(getBetterPayment));

// Plain node:http
createServer(toNodeHandler(getBetterPayment));

// Fastify: accepts the form-urlencoded bank callbacks inside the plugin
const fastify = Fastify();
void fastify.register(toFastifyPlugin(getBetterPayment), { prefix: '/api/pay' });

// Hono
const hono = new Hono();
hono.all('/api/pay/*', toHonoHandler(getBetterPayment));

// Cloudflare Workers / Deno / Bun
export default { fetch: toFetchHandler(getBetterPayment) };
