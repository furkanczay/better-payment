import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  PaymentCard,
  PaymentRequest,
  PaymentResponse,
  ThreeDSPaymentRequest,
  ThreeDSInitResponse,
  RefundRequest,
  RefundResponse,
  CancelRequest,
  CancelResponse,
  BinCheckResponse,
  InstallmentInfoRequest,
  InstallmentInfoResponse,
  CaptureRequest,
  VoidAuthorizationRequest,
  SaveCardRequest,
  SaveCardResponse,
  ListCardsResponse,
  DeleteCardRequest,
  DeleteCardResponse,
  PaymentStatus,
} from '../types';
import { BetterPaymentLogger } from './logger';
import type { RetryConfig } from './retry';
import { BetterPaymentError, ValidationError } from './errors';
import { PaymentErrorCode, resolveErrorCode } from './error-codes';
import { NETWORK_ERROR_CODE, type FailureResult } from './failure';
import {
  validateCaptureRequest,
  validatePaymentRequest,
  validateRefundAmount,
  type PaymentValidationRules,
} from './validation';

/**
 * Tüm provider'larda ortak olan yapılandırma alanları.
 * Kimlik bilgileri her provider'ın kendi config tipinde tanımlanır.
 */
export interface PaymentProviderConfig {
  baseUrl?: string;
  locale?: string;
  logger?: BetterPaymentLogger;
  retry?: RetryConfig;
  /**
   * Validate requests before calling the provider (card, amounts, basket,
   * required fields). Default: true.
   */
  validate?: boolean;
}

/**
 * Axios request config'ine eklenen, bu isteğin tekrar denenmesinin
 * güvenli olduğunu belirten işaret. Ödeme/iade gibi idempotent olmayan
 * istekler bu işaret olmadan asla yeniden gönderilmez.
 */
export interface RetryableRequestConfig extends AxiosRequestConfig {
  retryable?: boolean;
}

const IDEMPOTENT_METHODS = ['get', 'head', 'options'];

/**
 * Tüm ödeme sağlayıcıları için temel abstract sınıf
 */
export abstract class PaymentProvider<
  TConfig extends PaymentProviderConfig = PaymentProviderConfig,
> {
  protected config: TConfig;

  constructor(config: TConfig) {
    this.config = {
      locale: 'tr',
      ...config,
    };
    this.validateConfig();
  }

  /**
   * Yapılandırmayı doğrula. Provider'lar kendi zorunlu alanlarını kontrol eder.
   */
  protected validateConfig(): void {}

  /**
   * The provider's documented error codes mapped to PaymentErrorCode.
   * Codes missing from the table resolve to UNKNOWN.
   */
  protected errorCodeTable(): Record<string, PaymentErrorCode> {
    return {};
  }

  /**
   * Throws a ValidationError naming the invalid fields, unless validation is
   * disabled with `validate: false`. Call it before building the provider request.
   */
  protected validatePayment(request: PaymentRequest, rules: PaymentValidationRules): void {
    if (this.config.validate === false) return;
    validatePaymentRequest(request, rules, this.constructor.name);
  }

  protected validateRefund(request: RefundRequest): void {
    if (this.config.validate === false) return;
    validateRefundAmount(request?.price, this.constructor.name);
  }

  /** Resolves the normalized code of a failed result */
  protected resolveErrorCode(result: FailureResult): PaymentErrorCode {
    return resolveErrorCode(result.errorCode, this.errorCodeTable());
  }

  /**
   * Adds the normalized `code` to failed results (and to NETWORK_ERROR results,
   * which are pending). Other results are returned unchanged.
   */
  protected withErrorCode<T extends FailureResult>(result: T): T {
    if (result.status !== PaymentStatus.FAILURE && result.errorCode !== NETWORK_ERROR_CODE) {
      return result;
    }
    return { ...result, code: this.resolveErrorCode(result) };
  }

  /**
   * Direkt ödeme (3D Secure olmadan)
   */
  abstract createPayment(request: PaymentRequest): Promise<PaymentResponse>;

  /**
   * 3D Secure ödeme başlat
   */
  abstract initThreeDSPayment(request: ThreeDSPaymentRequest): Promise<ThreeDSInitResponse>;

  /**
   * 3D Secure ödeme tamamla (callback'ten sonra)
   */
  abstract completeThreeDSPayment(callbackData: unknown): Promise<PaymentResponse>;

  /**
   * İade işlemi
   */
  abstract refund(request: RefundRequest): Promise<RefundResponse>;

  /**
   * İptal işlemi
   */
  abstract cancel(request: CancelRequest): Promise<CancelResponse>;

  /**
   * Ödeme sorgulama
   */
  abstract getPayment(paymentId: string): Promise<PaymentResponse>;

  /**
   * Attaches request/response logging interceptors to an axios instance.
   * No-op when no logger is configured. Request/response bodies are never
   * logged because they contain card data and credentials.
   */
  protected setupAxiosLogging(client: AxiosInstance, provider: string): void {
    const logger = this.config.logger;
    if (!logger) return;

    client.interceptors.request.use((config) => {
      logger.debug(`[${provider}] ${config.method?.toUpperCase()} ${config.url}`, {
        provider,
        method: config.method,
        url: config.url,
      });
      return config;
    });

    client.interceptors.response.use(
      (response) => {
        logger.debug(`[${provider}] ${response.status} ${response.config.url}`, {
          provider,
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        logger.error(
          `[${provider}] Request failed: ${error?.message}`,
          error instanceof Error ? error : new Error(String(error)),
          {
            provider,
            url: error?.config?.url,
            status: error?.response?.status,
          }
        );
        return Promise.reject(error);
      }
    );
  }

  /**
   * Attaches retry logic to an axios instance.
   *
   * Only idempotent requests are retried: GET/HEAD/OPTIONS, or requests
   * explicitly marked with `retryable: true` (e.g. read-only SOAP/POST queries).
   * Payment, refund and cancel requests are never retried, because a timeout
   * after the provider received the request would otherwise charge or refund
   * twice.
   *
   * No-op when retry.attempts <= 1 or retry is not configured.
   */
  protected setupAxiosRetry(client: AxiosInstance): void {
    const retry = this.config.retry;
    if (!retry || retry.attempts <= 1) return;

    client.interceptors.response.use(undefined, async (error) => {
      const config = error.config as
        | (RetryableRequestConfig & { __retryCount?: number })
        | undefined;
      if (!config) return Promise.reject(error);

      const method = (config.method || 'get').toLowerCase();
      const isSafe = config.retryable === true || IDEMPOTENT_METHODS.includes(method);
      if (!isSafe) return Promise.reject(error);

      const retryCount = config.__retryCount ?? 0;

      const networkError = !error.response;
      const statusMatch =
        !!error.response &&
        !!retry.statusCodes &&
        retry.statusCodes.includes(error.response.status as number);

      const shouldRetry = retryCount < retry.attempts - 1 && (networkError || statusMatch);

      if (!shouldRetry) return Promise.reject(error);

      config.__retryCount = retryCount + 1;
      await new Promise<void>((resolve) => setTimeout(resolve, retry.delay ?? 1000));
      return client(config);
    });
  }

  /**
   * Pre-authorization: blocks the amount on the card without charging it.
   * Charge it later with capture(), or release it with voidAuthorization().
   * A `success` result means the amount is blocked.
   */
  async authorize(_request: PaymentRequest): Promise<PaymentResponse> {
    throw this.notSupported('Pre-authorization');
  }

  /**
   * Pre-authorization with 3D Secure. Complete it with completeThreeDSPayment()
   * as usual; `success` then means the amount is blocked.
   */
  async initThreeDSAuthorize(_request: ThreeDSPaymentRequest): Promise<ThreeDSInitResponse> {
    throw this.notSupported('Pre-authorization');
  }

  /** Charges (all or part of) a pre-authorized amount */
  async capture(_request: CaptureRequest): Promise<PaymentResponse> {
    throw this.notSupported('Capture');
  }

  /** Releases a pre-authorization; nothing is charged */
  async voidAuthorization(_request: VoidAuthorizationRequest): Promise<CancelResponse> {
    throw this.notSupported('Voiding a pre-authorization');
  }

  /** Saves a card with the provider without charging it */
  async saveCard(_request: SaveCardRequest): Promise<SaveCardResponse> {
    throw this.notSupported('Card storage');
  }

  /** A customer's saved cards */
  async listCards(_request: { customerToken: string }): Promise<ListCardsResponse> {
    throw this.notSupported('Card storage');
  }

  /** Deletes a saved card */
  async deleteCard(_request: DeleteCardRequest): Promise<DeleteCardResponse> {
    throw this.notSupported('Card storage');
  }

  /**
   * The request's card, for code paths that need card data. Validation normally
   * rejects a missing card first; this keeps the types honest.
   */
  protected cardOf(request: { paymentCard?: PaymentCard }): PaymentCard {
    if (!request.paymentCard) {
      throw new ValidationError('paymentCard is required', undefined, [
        { path: 'paymentCard', message: 'is required' },
      ]);
    }
    return request.paymentCard;
  }

  protected notSupported(feature: string, detail?: string): BetterPaymentError {
    return new BetterPaymentError(
      `${feature} is not supported by this provider${detail ? `: ${detail}` : ''}`,
      'NOT_SUPPORTED'
    );
  }

  /** Validates a capture request (payment id and amount) */
  protected validateCapture(request: CaptureRequest): void {
    if (this.config.validate === false) return;
    validateCaptureRequest(request, this.constructor.name);
  }

  /**
   * BIN sorgulama
   */
  async binCheck(_binNumber: string): Promise<BinCheckResponse> {
    throw new BetterPaymentError('BIN check is not supported by this provider', 'NOT_SUPPORTED');
  }

  /**
   * Taksit sorgulama
   */
  async installmentInfo(_request: InstallmentInfoRequest): Promise<InstallmentInfoResponse> {
    throw new BetterPaymentError(
      'Installment info is not supported by this provider',
      'NOT_SUPPORTED'
    );
  }
}
