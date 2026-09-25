/**
 * better-payment/fastify: a Fastify plugin.
 *
 * @example
 * ```ts
 * import Fastify from 'fastify';
 * import { toFastifyPlugin } from 'better-payment/fastify';
 *
 * const app = Fastify();
 * await app.register(toFastifyPlugin(payment), { prefix: '/api/pay' });
 * ```
 *
 * Fastify rejects `application/x-www-form-urlencoded` bodies by default (415), but
 * the bank callbacks use it. The plugin accepts them as raw text for its own routes
 * only; the parser does not leak into the rest of the app.
 */
import { resolveHandler, serializeResponse, type HandlerSource } from 'better-payment';

export type { HandlerSource };

/** The parts of Fastify's request the plugin uses */
export interface FastifyRequestLike {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

/** The parts of Fastify's reply the plugin uses */
export interface FastifyReplyLike {
  code(statusCode: number): FastifyReplyLike;
  header(name: string, value: string): FastifyReplyLike;
  send(payload?: unknown): FastifyReplyLike;
}

/** The parts of a Fastify instance the plugin uses */
export interface FastifyInstanceLike {
  hasContentTypeParser(contentType: string): boolean;
  addContentTypeParser(
    contentType: string,
    options: { parseAs: 'string' },
    parser: (
      request: unknown,
      body: string,
      done: (error: Error | null, body?: unknown) => void
    ) => void
  ): void;
  all(
    path: string,
    handler: (request: FastifyRequestLike, reply: FastifyReplyLike) => Promise<unknown>
  ): unknown;
}

const FORM = 'application/x-www-form-urlencoded';

function flattenHeaders(headers: FastifyRequestLike['headers']): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) result[key] = Array.isArray(value) ? value.join(', ') : value;
  }
  return result;
}

/**
 * Fastify plugin that serves the payment routes. Register it with the handler's
 * basePath as `prefix` (default `/api/pay`).
 */
export function toFastifyPlugin(
  source: HandlerSource
): (fastify: FastifyInstanceLike) => Promise<void> {
  return async (fastify) => {
    if (!fastify.hasContentTypeParser(FORM)) {
      fastify.addContentTypeParser(FORM, { parseAs: 'string' }, (_request, body, done) =>
        done(null, body)
      );
    }

    const route = async (request: FastifyRequestLike, reply: FastifyReplyLike) => {
      const response = await resolveHandler(source).handle({
        method: request.method.toUpperCase(),
        url: request.url,
        headers: flattenHeaders(request.headers),
        body: request.body === '' ? undefined : request.body,
      });
      const { status, headers, body } = serializeResponse(response);
      reply.code(status);
      for (const [name, value] of Object.entries(headers)) reply.header(name, value);
      return reply.send(body ?? undefined);
    };

    fastify.all('/', route);
    fastify.all('/*', route);
  };
}
