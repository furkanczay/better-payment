/**
 * better-payment/next: Next.js App Router route handlers.
 *
 * @example
 * ```ts
 * // app/api/pay/[...path]/route.ts
 * import { toNextJsHandler } from 'better-payment/next';
 * import { getBetterPayment } from '@/lib/payment';
 *
 * export const { GET, POST } = toNextJsHandler(getBetterPayment);
 * ```
 */
import { toFetchHandler, type HandlerSource } from 'better-payment';

export type { HandlerSource };

export type NextRouteHandler = (request: Request) => Promise<Response>;

export function toNextJsHandler(source: HandlerSource): {
  GET: NextRouteHandler;
  POST: NextRouteHandler;
} {
  const handler = toFetchHandler(source);
  return { GET: handler, POST: handler };
}
