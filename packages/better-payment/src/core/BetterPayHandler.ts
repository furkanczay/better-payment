import { BetterPay } from './BetterPay';
import { ProviderType } from './BetterPayConfig';
import { PaymentRequest, ThreeDSPaymentRequest, RefundRequest, CancelRequest } from '../types';

/**
 * HTTP Request interface for framework-agnostic handling
 */
export interface BetterPayRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
}

/**
 * HTTP Response interface for framework-agnostic handling
 */
export interface BetterPayResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
}

/**
 * Route handler için context
 */
interface RouteContext {
  provider: ProviderType;
  action: string;
  params: Record<string, string>;
}

/**
 * BetterPayHandler - Otomatik API endpoint'leri için merkezi handler
 *
 * Better-auth'tan ilham alınarak tasarlanmıştır. Tüm ödeme işlemlerini
 * otomatik olarak HTTP endpoint'lerine çevirir.
 *
 * Desteklenen endpoint'ler:
 * - POST /api/pay/:provider/payment           -> createPayment()
 * - POST /api/pay/:provider/payment/init-3ds  -> initThreeDSPayment()
 * - POST /api/pay/:provider/payment/complete-3ds -> completeThreeDSPayment()
 * - POST /api/pay/:provider/refund            -> refund()
 * - POST /api/pay/:provider/cancel            -> cancel()
 * - GET  /api/pay/:provider/payment/:id       -> getPayment()
 * - POST /api/pay/:provider/callback          -> 3DS callback handler
 * - GET  /api/pay/health                      -> Health check
 *
 * @example
 * ```typescript
 * const betterPay = new BetterPay({ ... });
 * const handler = new BetterPayHandler(betterPay);
 *
 * // Framework adapter kullanımı:
 * // Next.js: toNextJsHandler(handler)
 * // Express: toNodeHandler(handler)
 * ```
 */
export class BetterPayHandler {
  constructor(private betterPay: BetterPay) {}

  /**
   * Ana request handler - tüm framework'ler için ortak
   */
  async handle(request: BetterPayRequest): Promise<BetterPayResponse> {
    try {
      // Clean URL - remove query string and trailing slash
      const cleanUrl = request.url.split('?')[0].replace(/\/$/, '');

      // Health check
      if (cleanUrl.endsWith('/health') || cleanUrl.endsWith('/ok')) {
        return this.healthCheck();
      }

      // Route parsing
      const context = this.parseRoute(request.url);
      if (!context) {
        return this.errorResponse(404, 'Route not found');
      }

      // Provider validation
      if (!this.betterPay.isProviderEnabled(context.provider)) {
        return this.errorResponse(
          400,
          `Provider '${context.provider}' is not enabled or configured`
        );
      }

      // Route action handler'ı çağır
      return await this.handleAction(request, context);
    } catch (error: any) {
      return this.errorResponse(500, error.message || 'Internal server error');
    }
  }

  /**
   * URL'den route bilgilerini parse et
   *
   * Pattern: /api/pay/:provider/:action
   * Örnekler:
   * - /api/pay/iyzico/payment
   * - /api/pay/paytr/payment/init-3ds
   * - /api/pay/iyzico/payment/123
   */
  private parseRoute(url: string): RouteContext | null {
    // Query string'i temizle
    const cleanUrl = url.split('?')[0];

    // Trailing slash'i kaldır
    const normalizedUrl = cleanUrl.replace(/\/$/, '');

    // /api/pay/ prefix'ini kaldır
    const pathMatch = normalizedUrl.match(/\/api\/pay\/(.+)/);
    if (!pathMatch) {
      return null;
    }

    const segments = pathMatch[1].split('/');
    if (segments.length === 0) {
      return null;
    }

    // Provider (iyzico, paytr)
    const provider = segments[0] as ProviderType;

    // Validate provider
    if (!Object.values(ProviderType).includes(provider)) {
      return null;
    }

    // Action ve params
    const action = segments.slice(1).join('/');
    const params: Record<string, string> = {};

    // Payment ID extraction (/payment/:id)
    const paymentIdMatch = action.match(/^payment\/([^/]+)$/);
    if (paymentIdMatch) {
      params.paymentId = paymentIdMatch[1];
    }

    return { provider, action, params };
  }

  /**
   * Action'a göre ilgili provider metodunu çağır
   */
  private async handleAction(
    request: BetterPayRequest,
    context: RouteContext
  ): Promise<BetterPayResponse> {
    const provider = this.betterPay.use(context.provider);
    const { action, params } = context;

    try {
      switch (action) {
        case 'payment':
          return await this.handleCreatePayment(request, provider);

        case 'payment/init-3ds':
          return await this.handleInitThreeDS(request, provider);

        case 'payment/complete-3ds':
        case 'callback':
          return await this.handleCompleteThreeDS(request, provider);

        case 'refund':
          return await this.handleRefund(request, provider);

        case 'cancel':
          return await this.handleCancel(request, provider);

        default:
          // GET /payment/:id için
          if (params.paymentId && request.method === 'GET') {
            return await this.handleGetPayment(params.paymentId, provider);
          }

          return this.errorResponse(404, `Action '${action}' not found`);
      }
    } catch (error: any) {
      return this.errorResponse(500, error.message || 'Payment operation failed');
    }
  }

  /**
   * POST /api/pay/:provider/payment - Ödeme oluştur
   */
  private async handleCreatePayment(
    request: BetterPayRequest,
    provider: any
  ): Promise<BetterPayResponse> {
    if (request.method !== 'POST') {
      return this.errorResponse(405, 'Method not allowed');
    }

    const paymentRequest: PaymentRequest = request.body;
    const result = await provider.createPayment(paymentRequest);

    return this.successResponse(result);
  }

  /**
   * POST /api/pay/:provider/payment/init-3ds - 3DS ödeme başlat
   */
  private async handleInitThreeDS(
    request: BetterPayRequest,
    provider: any
  ): Promise<BetterPayResponse> {
    if (request.method !== 'POST') {
      return this.errorResponse(405, 'Method not allowed');
    }

    const paymentRequest: ThreeDSPaymentRequest = request.body;
    const result = await provider.initThreeDSPayment(paymentRequest);

    return this.successResponse(result);
  }

  /**
   * POST /api/pay/:provider/payment/complete-3ds - 3DS ödeme tamamla
   * POST /api/pay/:provider/callback - Provider callback (alias)
   */
  private async handleCompleteThreeDS(
    request: BetterPayRequest,
    provider: any
  ): Promise<BetterPayResponse> {
    if (request.method !== 'POST') {
      return this.errorResponse(405, 'Method not allowed');
    }

    const callbackData = request.body;
    const result = await provider.completeThreeDSPayment(callbackData);

    return this.successResponse(result);
  }

  /**
   * POST /api/pay/:provider/refund - İade işlemi
   */
  private async handleRefund(request: BetterPayRequest, provider: any): Promise<BetterPayResponse> {
    if (request.method !== 'POST') {
      return this.errorResponse(405, 'Method not allowed');
    }

    const refundRequest: RefundRequest = request.body;
    const result = await provider.refund(refundRequest);

    return this.successResponse(result);
  }

  /**
   * POST /api/pay/:provider/cancel - İptal işlemi
   */
  private async handleCancel(request: BetterPayRequest, provider: any): Promise<BetterPayResponse> {
    if (request.method !== 'POST') {
      return this.errorResponse(405, 'Method not allowed');
    }

    const cancelRequest: CancelRequest = request.body;
    const result = await provider.cancel(cancelRequest);

    return this.successResponse(result);
  }

  /**
   * GET /api/pay/:provider/payment/:id - Ödeme sorgula
   */
  private async handleGetPayment(paymentId: string, provider: any): Promise<BetterPayResponse> {
    const result = await provider.getPayment(paymentId);
    return this.successResponse(result);
  }

  /**
   * GET /api/pay/health - Health check
   */
  private healthCheck(): BetterPayResponse {
    const enabledProviders = this.betterPay.getEnabledProviders();

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        status: 'ok',
        service: 'better-pay',
        version: '1.0.0',
        providers: enabledProviders,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Success response helper
   */
  private successResponse(data: any): BetterPayResponse {
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: data,
    };
  }

  /**
   * Error response helper
   */
  private errorResponse(status: number, message: string): BetterPayResponse {
    return {
      status,
      headers: { 'Content-Type': 'application/json' },
      body: {
        error: true,
        message,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
