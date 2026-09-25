import type { BetterPayment } from './BetterPayment';
import { ProviderType } from './BetterPaymentConfig';
import { ConfigurationError } from './errors';
import { VERSION } from '../version';
import { PaymentStatus } from '../types';
import type { PaymentResponse } from '../types';
import type { PaymentProvider } from './PaymentProvider';
import { errorMessage } from './utils';
import type {
  CheckoutFormRequest,
  PWIPaymentRequest,
  InstallmentInfoRequest,
  SubscriptionInitializeRequest,
  SubscriptionCancelRequest,
  SubscriptionUpgradeRequest,
  SubscriptionRetrieveRequest,
  SubscriptionCardUpdateRequest,
  SubscriptionProductCreateRequest,
  PricingPlanCreateRequest,
} from '../types';
import { Iyzico } from '../providers/iyzico';
import type { PayTR } from '../providers/paytr';

/**
 * HTTP Request interface for framework-agnostic handling
 */
export interface BetterPaymentRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  /** Raw body (string) or an already parsed object */
  body?: unknown;
}

/**
 * HTTP Response interface for framework-agnostic handling.
 * `body` is a JSON-serializable object, except for text responses
 * (Content-Type text/plain, e.g. the PayTR "OK" acknowledgement) where it is a string.
 */
export interface BetterPaymentResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

/**
 * Handler actions (URL path after `/:provider/`)
 */
export type HandlerAction =
  | 'payment'
  | 'payment/init-3ds'
  | 'payment/token'
  | 'payment/complete-3ds'
  | 'payment/get'
  | 'callback'
  | 'refund'
  | 'cancel'
  | 'checkout/init'
  | 'checkout/retrieve'
  | 'pwi/init'
  | 'pwi/retrieve'
  | 'installment'
  | 'bin-check'
  | 'subscription/initialize'
  | 'subscription/cancel'
  | 'subscription/upgrade'
  | 'subscription/retrieve'
  | 'subscription/card-update'
  | 'subscription/product'
  | 'subscription/pricing-plan';

export const ALL_HANDLER_ACTIONS: HandlerAction[] = [
  'payment',
  'payment/init-3ds',
  'payment/token',
  'payment/complete-3ds',
  'payment/get',
  'callback',
  'refund',
  'cancel',
  'checkout/init',
  'checkout/retrieve',
  'pwi/init',
  'pwi/retrieve',
  'installment',
  'bin-check',
  'subscription/initialize',
  'subscription/cancel',
  'subscription/upgrade',
  'subscription/retrieve',
  'subscription/card-update',
  'subscription/product',
  'subscription/pricing-plan',
];

/**
 * Enabled when `allowedActions` is not set: provider callbacks (which must be
 * reachable by the bank/provider) and read-only card queries.
 */
export const DEFAULT_HANDLER_ACTIONS: HandlerAction[] = [
  'payment/complete-3ds',
  'callback',
  'installment',
  'bin-check',
];

/**
 * Actions that move money back, manage subscriptions or expose payment
 * details. They can only be enabled together with an `authorize` hook.
 */
export const PRIVILEGED_HANDLER_ACTIONS: HandlerAction[] = [
  'refund',
  'cancel',
  'payment/get',
  'subscription/cancel',
  'subscription/upgrade',
  'subscription/retrieve',
  'subscription/card-update',
  'subscription/product',
  'subscription/pricing-plan',
];

/**
 * Provider callbacks. They are signed by the provider and are called by the
 * bank or the customer's browser, not by your frontend.
 */
export const CALLBACK_HANDLER_ACTIONS: HandlerAction[] = ['payment/complete-3ds', 'callback'];

export interface HandlerContext {
  provider: ProviderType;
  action: HandlerAction;
  params: Record<string, string>;
  request: BetterPaymentRequest;
  /**
   * Parsed request body (form-urlencoded callbacks are converted to objects).
   * Undefined when the request has no object body.
   */
  body: Record<string, unknown> | undefined;
}

export interface BetterPaymentHandlerOptions {
  /** Path prefix the handler is mounted on. Default: '/api/pay' */
  basePath?: string;
  /**
   * Actions exposed over HTTP. Default: DEFAULT_HANDLER_ACTIONS.
   * Use 'all' to expose everything (requires `authorize`).
   */
  allowedActions?: HandlerAction[] | 'all';
  /**
   * Called before every action except the health check. Return false (or throw)
   * to reject the request with 403. Required when privileged actions are enabled.
   *
   * Provider callbacks (`callback`, `payment/complete-3ds`) are signed by the
   * provider and are called by the bank/customer browser, so the hook usually
   * lets them through: `if (CALLBACK_HANDLER_ACTIONS.includes(ctx.action)) return true`.
   */
  authorize?: (ctx: HandlerContext) => boolean | Promise<boolean>;
  /**
   * Returns the body passed to the provider. Use it to set amounts, basket and
   * buyer on the server instead of trusting the client, e.g. look up the order
   * by id and build the payment request from your database.
   */
  transformRequest?: (ctx: HandlerContext) => object | undefined | Promise<object | undefined>;
  /**
   * Called with the verified result of a provider callback. Update your order here.
   * Errors thrown here make the handler return 500 (PayTR will then retry the notification).
   */
  onCallback?: (result: PaymentResponse, ctx: HandlerContext) => void | Promise<void>;
  /**
   * For browser callbacks (3D Secure return), return a URL to redirect the
   * customer to (303). When undefined, the result is returned as JSON.
   */
  callbackRedirect?: (
    result: PaymentResponse,
    ctx: HandlerContext
  ) => string | undefined | Promise<string | undefined>;
  /** Include error messages of unexpected exceptions in 500 responses. Default: false */
  exposeErrors?: boolean;
}

interface TokenBody {
  token: string;
  conversationId?: string;
}

function supportsTokenPayment(
  provider: PaymentProvider
): provider is PaymentProvider & Pick<PayTR, 'createPaymentWithToken'> {
  return typeof (provider as Partial<PayTR>).createPaymentWithToken === 'function';
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

interface RouteContext {
  provider: ProviderType;
  action: HandlerAction | string;
  params: Record<string, string>;
}

class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * BetterPaymentHandler - Framework-agnostic HTTP handler
 *
 * Endpoints (relative to `basePath`, default `/api/pay`):
 * - POST /:provider/payment                -> createPayment()
 * - POST /:provider/payment/init-3ds       -> initThreeDSPayment()
 * - POST /:provider/payment/token          -> createPaymentWithToken() (PayTR)
 * - POST /:provider/payment/complete-3ds   -> completeThreeDSPayment()
 * - POST /:provider/callback               -> completeThreeDSPayment() (PayTR: responds "OK")
 * - GET  /:provider/payment/:id            -> getPayment()
 * - POST /:provider/refund | cancel        -> refund() / cancel()
 * - POST /:provider/installment | bin-check
 * - iyzico only: checkout/*, pwi/*, subscription/*
 * - GET  /health
 *
 * Secure by default: only callbacks and card queries are enabled. Enable more
 * with `allowedActions`; privileged actions also require `authorize`.
 */
export class BetterPaymentHandler {
  private readonly basePath: string;
  private readonly allowed: Set<HandlerAction>;

  constructor(
    private betterPayment: BetterPayment,
    private options: BetterPaymentHandlerOptions = {}
  ) {
    this.basePath = '/' + (options.basePath ?? '/api/pay').replace(/^\/+|\/+$/g, '');
    const allowed =
      options.allowedActions === 'all'
        ? ALL_HANDLER_ACTIONS
        : (options.allowedActions ?? DEFAULT_HANDLER_ACTIONS);
    this.allowed = new Set(allowed);

    const privileged = allowed.filter((a) => PRIVILEGED_HANDLER_ACTIONS.includes(a));
    if (privileged.length > 0 && !options.authorize) {
      throw new ConfigurationError(
        `Handler actions [${privileged.join(', ')}] require an 'authorize' hook. ` +
          'Refunds, cancellations and subscription management must never be publicly reachable.'
      );
    }
  }

  /**
   * Main request handler
   */
  async handle(request: BetterPaymentRequest): Promise<BetterPaymentResponse> {
    try {
      const path = this.getPath(request.url);
      if (path === null) {
        return this.errorResponse(404, 'Route not found');
      }

      if (path === '/health' || path === '/ok') {
        return this.healthCheck();
      }

      const route = this.parseRoute(path);
      if (!route) {
        return this.errorResponse(404, 'Route not found');
      }

      const action = route.action as HandlerAction;
      if (!ALL_HANDLER_ACTIONS.includes(action)) {
        return this.errorResponse(404, `Action '${route.action}' not found`);
      }
      if (!this.allowed.has(action)) {
        return this.errorResponse(404, `Action '${route.action}' is not enabled`);
      }

      if (!this.betterPayment.isProviderEnabled(route.provider)) {
        return this.errorResponse(400, `Provider '${route.provider}' is not enabled or configured`);
      }

      const ctx: HandlerContext = {
        provider: route.provider,
        action,
        params: route.params,
        request,
        body: asRecord(this.parseBody(request)),
      };

      if (this.options.authorize) {
        let ok = false;
        try {
          ok = await this.options.authorize(ctx);
        } catch {
          ok = false;
        }
        if (!ok) {
          return this.errorResponse(403, 'Forbidden');
        }
      }

      if (this.options.transformRequest && !CALLBACK_HANDLER_ACTIONS.includes(action)) {
        ctx.body = asRecord(await this.options.transformRequest(ctx));
      }

      return await this.handleAction(ctx);
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        return this.errorResponse(error.status, error.message);
      }
      const fallback = 'Internal server error';
      return this.errorResponse(
        500,
        this.options.exposeErrors ? errorMessage(error, fallback) : fallback
      );
    }
  }

  private getPath(url: string): string | null {
    let pathname: string;
    try {
      pathname = new URL(url, 'http://localhost').pathname;
    } catch {
      return null;
    }
    pathname = pathname.replace(/\/+$/, '');
    if (pathname === this.basePath) return '';
    if (!pathname.startsWith(this.basePath + '/')) return null;
    return pathname.slice(this.basePath.length);
  }

  /**
   * Parses "/:provider/:action..." (path relative to basePath)
   */
  private parseRoute(path: string): RouteContext | null {
    const segments = path
      .split('/')
      .filter(Boolean)
      .map((s) => decodeURIComponent(s));
    if (segments.length < 2) return null;

    const provider = segments[0] as ProviderType;
    if (!Object.values(ProviderType).includes(provider)) {
      return null;
    }

    const rest = segments.slice(1);
    const params: Record<string, string> = {};

    // GET /payment/:id
    if (
      rest.length === 2 &&
      rest[0] === 'payment' &&
      !['init-3ds', 'token', 'complete-3ds'].includes(rest[1])
    ) {
      params.paymentId = rest[1];
      return { provider, action: 'payment/get', params };
    }

    return { provider, action: rest.join('/'), params };
  }

  private parseBody(request: BetterPaymentRequest): unknown {
    const body = request.body;
    const contentType = (this.header(request, 'content-type') || '').toLowerCase();
    if (typeof body === 'string') {
      if (contentType.includes('application/x-www-form-urlencoded')) {
        return Object.fromEntries(new URLSearchParams(body));
      }
      if (contentType.includes('application/json')) {
        try {
          return JSON.parse(body);
        } catch {
          throw new HttpError(400, 'Invalid JSON body');
        }
      }
    }
    return body;
  }

  private header(request: BetterPaymentRequest, name: string): string | undefined {
    const key = Object.keys(request.headers || {}).find((k) => k.toLowerCase() === name);
    return key ? request.headers[key] : undefined;
  }

  private requireMethod(ctx: HandlerContext, method: 'GET' | 'POST'): void {
    if (ctx.request.method.toUpperCase() !== method) {
      throw new HttpError(405, 'Method not allowed');
    }
  }

  /**
   * Returns the request body. The type parameter is an unchecked cast: the
   * provider validates the fields it needs.
   */
  private requireBody<T extends object = Record<string, unknown>>(ctx: HandlerContext): T {
    if (!ctx.body) {
      throw new HttpError(400, 'Request body is required');
    }
    return ctx.body as T;
  }

  private requireIyzico(ctx: HandlerContext): Iyzico {
    const provider = this.betterPayment.use(ctx.provider);
    if (!(provider instanceof Iyzico)) {
      throw new HttpError(400, 'Route only available for iyzico provider');
    }
    return provider;
  }

  private async handleAction(ctx: HandlerContext): Promise<BetterPaymentResponse> {
    const provider = this.betterPayment.use(ctx.provider);

    switch (ctx.action) {
      case 'payment':
        this.requireMethod(ctx, 'POST');
        return this.resultResponse(await provider.createPayment(this.requireBody(ctx)));

      case 'payment/init-3ds':
        this.requireMethod(ctx, 'POST');
        return this.resultResponse(await provider.initThreeDSPayment(this.requireBody(ctx)));

      case 'payment/token':
        this.requireMethod(ctx, 'POST');
        if (!supportsTokenPayment(provider)) {
          throw new HttpError(400, 'This provider does not support token payments');
        }
        return this.resultResponse(await provider.createPaymentWithToken(this.requireBody(ctx)));

      case 'payment/complete-3ds':
      case 'callback':
        this.requireMethod(ctx, 'POST');
        return this.handleCallback(ctx, provider);

      case 'payment/get':
        this.requireMethod(ctx, 'GET');
        return this.resultResponse(await provider.getPayment(ctx.params.paymentId));

      case 'refund':
        this.requireMethod(ctx, 'POST');
        return this.resultResponse(await provider.refund(this.requireBody(ctx)));

      case 'cancel':
        this.requireMethod(ctx, 'POST');
        return this.resultResponse(await provider.cancel(this.requireBody(ctx)));

      case 'installment':
        this.requireMethod(ctx, 'POST');
        return this.resultResponse(
          await provider.installmentInfo(this.requireBody(ctx) as InstallmentInfoRequest)
        );

      case 'bin-check': {
        this.requireMethod(ctx, 'POST');
        const { binNumber } = this.requireBody(ctx);
        if (typeof binNumber !== 'string' || !/^\d{6,8}$/.test(binNumber)) {
          throw new HttpError(400, 'binNumber must be 6-8 digits');
        }
        try {
          return this.jsonResponse(200, await provider.binCheck(binNumber));
        } catch (error: unknown) {
          return this.errorResponse(422, errorMessage(error, 'BIN check failed'));
        }
      }

      case 'checkout/init':
        this.requireMethod(ctx, 'POST');
        return this.resultResponse(
          await this.requireIyzico(ctx).initCheckoutForm(
            this.requireBody(ctx) as CheckoutFormRequest
          )
        );

      case 'checkout/retrieve': {
        this.requireMethod(ctx, 'POST');
        const { token, conversationId } = this.requireBody<TokenBody>(ctx);
        return this.resultResponse(
          await this.requireIyzico(ctx).retrieveCheckoutForm(token, conversationId)
        );
      }

      case 'pwi/init':
        this.requireMethod(ctx, 'POST');
        return this.resultResponse(
          await this.requireIyzico(ctx).initPWIPayment(this.requireBody(ctx) as PWIPaymentRequest)
        );

      case 'pwi/retrieve': {
        this.requireMethod(ctx, 'POST');
        const { token, conversationId } = this.requireBody<TokenBody>(ctx);
        return this.resultResponse(
          await this.requireIyzico(ctx).retrievePWIPayment(token, conversationId)
        );
      }

      case 'subscription/initialize':
        this.requireMethod(ctx, 'POST');
        return this.resultResponse(
          await this.requireIyzico(ctx).initializeSubscription(
            this.requireBody(ctx) as SubscriptionInitializeRequest
          )
        );

      case 'subscription/cancel':
        this.requireMethod(ctx, 'POST');
        return this.resultResponse(
          await this.requireIyzico(ctx).cancelSubscription(
            this.requireBody(ctx) as SubscriptionCancelRequest
          )
        );

      case 'subscription/upgrade':
        this.requireMethod(ctx, 'POST');
        return this.resultResponse(
          await this.requireIyzico(ctx).upgradeSubscription(
            this.requireBody(ctx) as SubscriptionUpgradeRequest
          )
        );

      case 'subscription/retrieve':
        this.requireMethod(ctx, 'POST');
        return this.resultResponse(
          await this.requireIyzico(ctx).retrieveSubscription(
            this.requireBody(ctx) as SubscriptionRetrieveRequest
          )
        );

      case 'subscription/card-update':
        this.requireMethod(ctx, 'POST');
        return this.resultResponse(
          await this.requireIyzico(ctx).updateSubscriptionCard(
            this.requireBody(ctx) as SubscriptionCardUpdateRequest
          )
        );

      case 'subscription/product':
        this.requireMethod(ctx, 'POST');
        return this.resultResponse(
          await this.requireIyzico(ctx).createSubscriptionProduct(
            this.requireBody(ctx) as SubscriptionProductCreateRequest
          )
        );

      case 'subscription/pricing-plan':
        this.requireMethod(ctx, 'POST');
        return this.resultResponse(
          await this.requireIyzico(ctx).createPricingPlan(
            this.requireBody(ctx) as PricingPlanCreateRequest
          )
        );

      default:
        return this.errorResponse(404, `Action '${ctx.action}' not found`);
    }
  }

  /**
   * Provider callbacks.
   *
   * PayTR notifications (server-to-server) must be answered with plain "OK",
   * otherwise PayTR keeps re-sending them. Browser callbacks (3D return) can be
   * redirected with `callbackRedirect`.
   */
  private async handleCallback(
    ctx: HandlerContext,
    provider: PaymentProvider
  ): Promise<BetterPaymentResponse> {
    const result = await provider.completeThreeDSPayment(this.requireBody(ctx));
    const invalidSignature = result?.errorCode === 'INVALID_HASH';

    if (!invalidSignature && this.options.onCallback) {
      await this.options.onCallback(result, ctx);
    }

    if (ctx.provider === ProviderType.PAYTR && ctx.action === 'callback') {
      if (invalidSignature) {
        return {
          status: 400,
          headers: { 'Content-Type': 'text/plain' },
          body: 'PAYTR notification failed: bad hash',
        };
      }
      return { status: 200, headers: { 'Content-Type': 'text/plain' }, body: 'OK' };
    }

    if (this.options.callbackRedirect) {
      const location = await this.options.callbackRedirect(result, ctx);
      if (location) {
        return { status: 303, headers: { Location: location }, body: '' };
      }
    }

    return this.resultResponse(result);
  }

  /**
   * Maps a provider result to an HTTP response:
   * success/pending -> 200, failure -> 422 (the body carries the details)
   */
  private resultResponse(result: unknown): BetterPaymentResponse {
    const failed = asRecord(result)?.status === PaymentStatus.FAILURE;
    return this.jsonResponse(failed ? 422 : 200, result);
  }

  private healthCheck(): BetterPaymentResponse {
    return this.jsonResponse(200, {
      status: 'ok',
      service: 'better-payment',
      version: VERSION,
      timestamp: new Date().toISOString(),
    });
  }

  private jsonResponse(status: number, body: unknown): BetterPaymentResponse {
    return { status, headers: { ...JSON_HEADERS }, body };
  }

  private errorResponse(status: number, message: string): BetterPaymentResponse {
    return this.jsonResponse(status, {
      error: true,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
