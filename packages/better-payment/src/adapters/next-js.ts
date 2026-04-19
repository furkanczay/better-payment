import { BetterPayHandler, BetterPayRequest } from '../core/BetterPayHandler';
import { NextRequest, NextResponse } from 'next/server';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Next.js App Router adapter for BetterPay
 *
 * Bu adapter, BetterPay handler'ını Next.js App Router ile uyumlu hale getirir.
 *
 * @example
 * ```typescript
 * // app/api/pay/[...all]/route.ts
 * import { betterPay } from '@/lib/payment';
 * import { toNextJsHandler } from 'better-pay/next-js';
 *
 * export const { GET, POST } = toNextJsHandler(betterPay.handler);
 * ```
 *
 * @param handler - BetterPayHandler instance
 * @returns Next.js route handlers (GET ve POST metodları)
 */
export function toNextJsHandler(handler: BetterPayHandler) {
  const routeHandler = async (request: NextRequest) => {
    try {
      // Next.js Request'i BetterPayRequest'e dönüştür
      const betterPayRequest: BetterPayRequest = {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
        body: await parseBody(request),
      };

      // Handler'ı çağır
      const response = await handler.handle(betterPayRequest);

      // BetterPayResponse'u Next.js Response'a dönüştür
      return NextResponse.json(response.body, {
        status: response.status,
        headers: response.headers,
      });
    } catch (error: any) {
      return NextResponse.json(
        {
          error: true,
          message: error.message || 'Internal server error',
        },
        { status: 500 }
      );
    }
  };

  return {
    GET: routeHandler,
    POST: routeHandler,
  };
}

/**
 * Next.js Request body'sini parse et
 */
async function parseBody(request: NextRequest): Promise<any> {
  const contentType = request.headers.get('content-type') || '';

  // GET request - URL params'tan data al
  if (request.method === 'GET') {
    const searchParams = new URL(request.url).searchParams;
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return Object.keys(params).length > 0 ? params : undefined;
  }

  // POST request - body'yi parse et
  if (contentType.includes('application/json')) {
    try {
      return await request.json();
    } catch {
      return undefined;
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    const params: Record<string, any> = {};
    formData.forEach((value: string | File, key: string) => {
      params[key] = value;
    });
    return params;
  }

  // Default: text olarak al
  try {
    const text = await request.text();
    return text || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Next.js Pages Router adapter for BetterPay
 *
 * Bu adapter, BetterPay handler'ını Next.js Pages Router ile uyumlu hale getirir.
 *
 * @example
 * ```typescript
 * // pages/api/pay/[...all].ts
 * import { betterPay } from '@/lib/payment';
 * import { toNodeHandler } from 'better-pay/next-js';
 *
 * // Body parser'ı devre dışı bırak (Better Pay kendi parse eder)
 * export const config = {
 *   api: {
 *     bodyParser: false,
 *   },
 * };
 *
 * export default toNodeHandler(betterPay.handler);
 * ```
 *
 * @param handler - BetterPayHandler instance
 * @returns Next.js API route handler
 */
export function toNodeHandler(handler: BetterPayHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Construct full URL
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const url = `${protocol}://${host}${req.url}`;

      // Next.js API Request'i BetterPayRequest'e dönüştür
      const betterPayRequest: BetterPayRequest = {
        method: req.method || 'GET',
        url,
        headers: req.headers as Record<string, string>,
        body: await parseNodeBody(req),
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
      res.status(500).json({
        error: true,
        message: error.message || 'Internal server error',
      });
    }
  };
}

/**
 * Next.js Pages Router request body'sini parse et
 */
async function parseNodeBody(req: NextApiRequest): Promise<any> {
  // GET request - query params
  if (req.method === 'GET') {
    return Object.keys(req.query).length > 0 ? req.query : undefined;
  }

  // POST request - body already parsed by Next.js if bodyParser is enabled
  if (req.body && Object.keys(req.body).length > 0) {
    return req.body;
  }

  // If bodyParser is disabled, manually parse the body
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
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
