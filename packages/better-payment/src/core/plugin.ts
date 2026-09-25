import type {
  PaymentRequest,
  PaymentResponse,
  ThreeDSPaymentRequest,
  ThreeDSInitResponse,
  RefundRequest,
  RefundResponse,
  CancelRequest,
  CancelResponse,
  CaptureRequest,
  VoidAuthorizationRequest,
  SaveCardRequest,
  SaveCardResponse,
  ListCardsResponse,
  DeleteCardRequest,
  DeleteCardResponse,
  BinCheckResponse,
  InstallmentInfoRequest,
  InstallmentInfoResponse,
} from '../types';
import type { PaymentProvider } from './PaymentProvider';
import type { BetterPaymentLogger } from './logger';
import type { PaymentEventListeners } from './events';
import type { BetterPaymentRequest, BetterPaymentResponse } from './BetterPaymentHandler';

type Awaitable<T> = T | Promise<T>;

/**
 * The provider operations plugins can hook into, with their request and result
 * types. Provider-specific methods (iyzico checkout form, subscriptions, PayTR
 * token payments) are not operations: they run without hooks.
 */
export interface PaymentOperations {
  createPayment: { request: PaymentRequest; result: PaymentResponse };
  initThreeDSPayment: { request: ThreeDSPaymentRequest; result: ThreeDSInitResponse };
  /** The request is the provider's callback data */
  completeThreeDSPayment: { request: unknown; result: PaymentResponse };
  authorize: { request: PaymentRequest; result: PaymentResponse };
  initThreeDSAuthorize: { request: ThreeDSPaymentRequest; result: ThreeDSInitResponse };
  capture: { request: CaptureRequest; result: PaymentResponse };
  voidAuthorization: { request: VoidAuthorizationRequest; result: CancelResponse };
  refund: { request: RefundRequest; result: RefundResponse };
  cancel: { request: CancelRequest; result: CancelResponse };
  /** The request is the payment id */
  getPayment: { request: string; result: PaymentResponse };
  saveCard: { request: SaveCardRequest; result: SaveCardResponse };
  listCards: { request: { customerToken: string }; result: ListCardsResponse };
  deleteCard: { request: DeleteCardRequest; result: DeleteCardResponse };
  /** The request is the BIN (first 6-8 digits of the card) */
  binCheck: { request: string; result: BinCheckResponse };
  installmentInfo: { request: InstallmentInfoRequest; result: InstallmentInfoResponse };
}

export type PaymentOperation = keyof PaymentOperations;

export const PAYMENT_OPERATIONS: readonly PaymentOperation[] = [
  'createPayment',
  'initThreeDSPayment',
  'completeThreeDSPayment',
  'authorize',
  'initThreeDSAuthorize',
  'capture',
  'voidAuthorization',
  'refund',
  'cancel',
  'getPayment',
  'saveCard',
  'listCards',
  'deleteCard',
  'binCheck',
  'installmentInfo',
];

/**
 * An operation as hooks see it. Narrow it with `ctx.operation`:
 * after `if (ctx.operation === 'refund')`, `ctx.request` is a `RefundRequest`.
 */
export type OperationContext = {
  [K in PaymentOperation]: {
    operation: K;
    request: PaymentOperations[K]['request'];
    /**
     * The provider that runs the operation. Undefined on a call made on the payment
     * object when no default provider is set: a before hook must then choose one.
     */
    provider: string | undefined;
    /**
     * True when the call was made on the payment object (`payment.createPayment()`),
     * false when it was made on a provider (`payment.iyzico.createPayment()`, the
     * HTTP handler). Only routable calls can be sent to another provider.
     */
    routable: boolean;
  };
}[PaymentOperation];

/** An operation and its result, as after hooks see it */
export type OperationResultContext = {
  [K in PaymentOperation]: Extract<OperationContext, { operation: K }> & {
    provider: string;
    result: PaymentOperations[K]['result'];
  };
}[PaymentOperation];

/**
 * What a before hook can return (all optional):
 * - `provider`: run the operation on this provider (routable calls only)
 * - `request`: replace the request
 * - `result`: skip the provider and return this result; remaining before hooks
 *   do not run, after hooks and events do
 */
export interface BeforeHookResult {
  provider?: string;
  request?: unknown;
  result?: unknown;
}

export interface BeforeHook {
  /** Which operations the hook runs for. Default: all. */
  matcher?: (ctx: OperationContext) => boolean;
  handler: (ctx: OperationContext) => Awaitable<BeforeHookResult | void>;
}

export interface AfterHook {
  /** Which operations the hook runs for. Default: all. */
  matcher?: (ctx: OperationResultContext) => boolean;
  /** Return `{ result }` to replace the result */
  handler: (ctx: OperationResultContext) => Awaitable<{ result: unknown } | void>;
}

/** What plugins get in `init`, `methods` and endpoints */
export interface PluginContext {
  /** Ids of the configured providers */
  readonly providerIds: readonly string[];
  /** The default provider, if any */
  readonly defaultProvider: string | undefined;
  readonly mode: 'sandbox' | 'production';
  readonly logger: BetterPaymentLogger | undefined;
  /** A provider by id. Its operations run with hooks and events. */
  use(providerId: string): PaymentProvider;
}

export interface EndpointContext extends PluginContext {
  request: BetterPaymentRequest;
  /** Parsed body (JSON or form-urlencoded), undefined when there is none */
  body: Record<string, unknown> | undefined;
  query: URLSearchParams;
  /** Builds a JSON response with a status code other than 200 */
  json(body: unknown, status?: number): BetterPaymentResponse;
}

/**
 * An HTTP route served by the handler, at `basePath + path`. The handler returns
 * what it gets as JSON (200), or a response built with `ctx.json(body, status)`.
 */
export interface PaymentEndpoint {
  method: 'GET' | 'POST';
  /** Path relative to the handler's basePath, e.g. `/router/quote` */
  path: string;
  /**
   * Privileged endpoints can only be served together with an `authorize` hook,
   * like refunds. The hook runs for every endpoint that has one.
   */
  privileged?: boolean;
  handler: (ctx: EndpointContext) => Awaitable<unknown>;
}

/**
 * A plugin: an object with an `id` and only the parts it needs.
 *
 * @example
 * ```ts
 * const auditLog = definePlugin({
 *   id: 'audit-log',
 *   events: {
 *     '*': (event) => console.log(event.type, event.provider, event.paymentId),
 *   },
 * });
 *
 * const payment = betterPayment({ providers: { ... }, plugins: [auditLog] });
 * ```
 */
export interface BetterPaymentPlugin {
  /** Unique id, e.g. `commission-router` */
  id: string;
  version?: string;
  /** The options the plugin was created with, for introspection */
  options?: unknown;
  /** Runs once, before the first operation. Plugins run it in order. */
  init?: (ctx: PluginContext) => Awaitable<void>;
  /** Runs before and after provider operations */
  hooks?: {
    before?: BeforeHook[];
    after?: AfterHook[];
  };
  /** Typed payment events (see `payment.on()`) */
  events?: PaymentEventListeners;
  /** Members added to the payment object, e.g. `{ router: { quote } }` */
  methods?: (ctx: PluginContext) => Record<string, unknown>;
  /** HTTP routes added to the handler */
  endpoints?: Record<string, PaymentEndpoint>;
  /** The plugin's error codes and their default (English) messages */
  $ERROR_CODES?: Record<string, string>;
}

/**
 * Returns the plugin unchanged, keeping its exact type, so that the methods and
 * error codes it adds are typed on the payment object.
 */
export function definePlugin<const P extends BetterPaymentPlugin>(plugin: P): P {
  return plugin;
}
