import { BetterPayHandler, BetterPayRequest } from '../core/BetterPayHandler';
import type { Request, Response } from 'express';
import type { IncomingMessage, ServerResponse } from 'http';

/**
 * Express/Node.js adapter for BetterPay
 *
 * Bu adapter, BetterPay handler'ını Express ve standart Node.js HTTP server ile uyumlu hale getirir.
 *
 * @example Express.js (v4):
 * ```typescript
 * import express from 'express';
 * import { betterPay } from './payment';
 * import { toExpressHandler } from 'better-pay/node';
 *
 * const app = express();
 *
 * // IMPORTANT: Don't use express.json() before the Better Pay handler
 * // or the client API will get stuck on "pending"
 * app.all('/api/pay/*', toExpressHandler(betterPay.handler));
 *
 * // Use express.json() AFTER the Better Pay handler
 * app.use(express.json());
 * ```
 *
 * @example Express.js (v5):
 * ```typescript
 * // Express v5 uses new wildcard syntax
 * app.all('/api/pay/{*any}', toExpressHandler(betterPay.handler));
 * ```
 *
 * @example Standard Node.js HTTP server:
 * ```typescript
 * import http from 'http';
 * import { betterPay } from './payment';
 * import { toNodeHttpHandler } from 'better-pay/node';
 *
 * const handler = toNodeHttpHandler(betterPay.handler);
 *
 * const server = http.createServer((req, res) => {
 *   if (req.url?.startsWith('/api/pay')) {
 *     return handler(req, res);
 *   }
 *   // Other routes...
 * });
 * ```
 */

/**
 * Express middleware adapter
 *
 * @param handler - BetterPayHandler instance
 * @returns Express middleware function
 */
export function toExpressHandler(handler: BetterPayHandler) {
  return async (req: Request, res: Response) => {
    try {
      // Construct full URL
      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost';
      const url = `${protocol}://${host}${req.originalUrl || req.url}`;

      // Express Request'i BetterPayRequest'e dönüştür
      const betterPayRequest: BetterPayRequest = {
        method: req.method,
        url,
        headers: req.headers as Record<string, string>,
        body: await parseExpressBody(req),
      };

      // Handler'ı çağır
      const response = await handler.handle(betterPayRequest);

      // Response headers'ı set et
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      // Response'u gönder
      res.status(response.status).json(response.body);
    } catch (error: any) {
      // Error'u next()'e ilet veya doğrudan response gönder
      res.status(500).json({
        error: true,
        message: error.message || 'Internal server error',
      });
    }
  };
}

/**
 * Standard Node.js HTTP server adapter
 *
 * @param handler - BetterPayHandler instance
 * @returns Node.js HTTP request handler
 */
export function toNodeHttpHandler(handler: BetterPayHandler) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    try {
      // Construct full URL
      const protocol = (req as any).protocol || 'http';
      const host = req.headers.host || 'localhost';
      const url = `${protocol}://${host}${req.url}`;

      // Node.js Request'i BetterPayRequest'e dönüştür
      const betterPayRequest: BetterPayRequest = {
        method: req.method || 'GET',
        url,
        headers: req.headers as Record<string, string>,
        body: await parseNodeHttpBody(req),
      };

      // Handler'ı çağır
      const response = await handler.handle(betterPayRequest);

      // Response headers'ı set et
      res.writeHead(response.status, {
        ...response.headers,
        'Content-Type': 'application/json',
      });

      // Response'u gönder
      res.end(JSON.stringify(response.body));
    } catch (error: any) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: true,
          message: error.message || 'Internal server error',
        })
      );
    }
  };
}

/**
 * Express request body'sini parse et
 */
async function parseExpressBody(req: Request): Promise<any> {
  // GET request - query params
  if (req.method === 'GET') {
    return Object.keys(req.query).length > 0 ? req.query : undefined;
  }

  // POST request - body already parsed by express.json() if it was called before
  if (req.body && Object.keys(req.body).length > 0) {
    return req.body;
  }

  // If express.json() not called, manually parse the body
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : undefined);
      } catch {
        resolve(body || undefined);
      }
    });
  });
}

/**
 * Standard Node.js HTTP request body'sini parse et
 */
async function parseNodeHttpBody(req: IncomingMessage): Promise<any> {
  // GET request - extract query params from URL
  if (req.method === 'GET') {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const params: Record<string, any> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return Object.keys(params).length > 0 ? params : undefined;
  }

  // POST request - parse body
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const contentType = req.headers['content-type'] || '';

        if (contentType.includes('application/json')) {
          resolve(body ? JSON.parse(body) : undefined);
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          // Parse form data
          const params: Record<string, any> = {};
          body.split('&').forEach((pair) => {
            const [key, value] = pair.split('=');
            if (key) {
              params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
          });
          resolve(params);
        } else {
          resolve(body || undefined);
        }
      } catch {
        resolve(body || undefined);
      }
    });
  });
}

/**
 * Alias for backwards compatibility
 * @deprecated Use toExpressHandler or toNodeHttpHandler instead
 */
export const toNodeHandler = toExpressHandler;
