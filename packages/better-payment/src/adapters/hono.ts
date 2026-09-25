/**
 * better-payment/hono: a Hono handler.
 *
 * @example
 * ```ts
 * import { Hono } from 'hono';
 * import { toHonoHandler } from 'better-payment/hono';
 *
 * const app = new Hono();
 * app.all('/api/pay/*', toHonoHandler(payment));
 * ```
 */
import { toFetchHandler, type HandlerSource } from 'better-payment';

export type { HandlerSource };

/** The part of Hono's `Context` the adapter uses */
export interface HonoContextLike {
  req: { raw: Request };
}

export function toHonoHandler(source: HandlerSource): (c: HonoContextLike) => Promise<Response> {
  const handler = toFetchHandler(source);
  return (c) => handler(c.req.raw);
}
