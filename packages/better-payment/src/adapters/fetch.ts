import type {
  BetterPaymentHandler,
  BetterPaymentRequest,
  BetterPaymentResponse,
} from '../core/BetterPaymentHandler';

/**
 * Where an adapter gets the handler from: a handler, a BetterPayment instance
 * (its `handler` is used), or a function returning either. A function is called on
 * every request, so the instance can be created lazily (for example to keep
 * Next.js builds working without environment variables).
 */
export type HandlerSource =
  | BetterPaymentHandler
  | { readonly handler: BetterPaymentHandler }
  | (() => BetterPaymentHandler | { readonly handler: BetterPaymentHandler });

export function resolveHandler(source: HandlerSource): BetterPaymentHandler {
  const value = typeof source === 'function' ? source() : source;
  return 'handle' in value ? value : value.handler;
}

const NO_BODY_STATUSES = [204, 205, 301, 302, 303, 304, 307, 308];

/**
 * Serializes a handler response: text bodies (PayTR's `OK`) as is, redirects
 * without a body (keeping `Location`), everything else as JSON.
 */
export function serializeResponse(response: BetterPaymentResponse): {
  status: number;
  headers: Record<string, string>;
  body: string | null;
} {
  const headers = { ...response.headers };
  if (NO_BODY_STATUSES.includes(response.status) || response.body === undefined) {
    return { status: response.status, headers, body: null };
  }
  if (typeof response.body === 'string') {
    return { status: response.status, headers, body: response.body };
  }
  if (!Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')) {
    headers['Content-Type'] = 'application/json';
  }
  return { status: response.status, headers, body: JSON.stringify(response.body) };
}

/** Converts a web `Request` for the handler. The body is passed as raw text. */
export async function fromWebRequest(request: Request): Promise<BetterPaymentRequest> {
  const method = request.method.toUpperCase();
  const text = method === 'GET' || method === 'HEAD' ? '' : await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return {
    method,
    url: request.url,
    headers,
    body: text === '' ? undefined : text,
  };
}

export function toWebResponse(response: BetterPaymentResponse): Response {
  const { status, headers, body } = serializeResponse(response);
  return new Response(body, { status, headers });
}

/**
 * `(request: Request) => Promise<Response>` for fetch-based runtimes: Cloudflare
 * Workers, Deno, Bun, Hono, Next.js route handlers.
 *
 * @example
 * ```ts
 * export default { fetch: toFetchHandler(payment) }; // Cloudflare Workers
 * Deno.serve(toFetchHandler(payment));
 * ```
 */
export function toFetchHandler(source: HandlerSource): (request: Request) => Promise<Response> {
  return async (request) =>
    toWebResponse(await resolveHandler(source).handle(await fromWebRequest(request)));
}
