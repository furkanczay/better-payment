/**
 * A custom provider, as in the "Custom providers" docs page. CI typechecks it.
 */
import {
  betterPayment,
  defineProvider,
  hmac,
  toHex,
  PaymentProvider,
  PaymentStatus,
  PaymentErrorCode,
  ConfigurationError,
  ValidationError,
  HttpError,
  type PaymentProviderConfig,
  type PaymentRequest,
  type PaymentResponse,
  type ThreeDSPaymentRequest,
  type ThreeDSInitResponse,
  type RefundRequest,
  type RefundResponse,
  type CancelRequest,
  type CancelResponse,
} from 'better-payment';

export interface MyPosConfig extends PaymentProviderConfig {
  terminalId: string;
  secretKey: string;
}

interface MyPosResult {
  approved: boolean;
  transactionId?: string;
  responseCode?: string;
  message?: string;
}

export class MyPos extends PaymentProvider<MyPosConfig> {
  private readonly http = this.createHttpClient('MyPos', { timeout: 30_000 });

  // Called by the base constructor: throw on missing credentials
  protected validateConfig(): void {
    if (!this.config.terminalId || !this.config.secretKey) {
      throw new ConfigurationError('MyPos: terminalId and secretKey are required', 'mypos');
    }
  }

  // The provider's error codes, mapped to the normalized ones
  protected errorCodeTable(): Record<string, PaymentErrorCode> {
    return { '51': PaymentErrorCode.INSUFFICIENT_FUNDS, '54': PaymentErrorCode.EXPIRED_CARD };
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Card, amounts and required fields: throws a ValidationError before any API call
      this.validatePayment(request, { card: true, required: ['buyer.ip'] });
      const body = JSON.stringify({
        terminalId: this.config.terminalId,
        orderId: request.conversationId,
        amount: request.paidPrice,
        cardNumber: this.cardOf(request).cardNumber,
      });
      const { data } = await this.http.post<MyPosResult>('/payments', body, {
        headers: { 'x-signature': toHex(await hmac('SHA-256', this.config.secretKey, body)) },
      });
      return this.withErrorCode({
        status: data.approved ? PaymentStatus.SUCCESS : PaymentStatus.FAILURE,
        paymentId: data.transactionId,
        conversationId: request.conversationId,
        errorCode: data.responseCode,
        errorMessage: data.message,
        rawResponse: data,
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        return this.withErrorCode({
          status: PaymentStatus.FAILURE,
          errorCode: 'VALIDATION_ERROR',
          errorMessage: error.message,
        });
      }
      if (error instanceof HttpError && error.isNetworkError) {
        // No response: the payment may have gone through. Never report it as failed.
        return this.withErrorCode({
          status: PaymentStatus.PENDING,
          errorCode: 'NETWORK_ERROR',
          conversationId: request.conversationId,
        });
      }
      throw error;
    }
  }

  async initThreeDSPayment(_request: ThreeDSPaymentRequest): Promise<ThreeDSInitResponse> {
    throw this.notSupported('3D Secure');
  }

  async completeThreeDSPayment(_callbackData: unknown): Promise<PaymentResponse> {
    throw this.notSupported('3D Secure');
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    this.validateRefund(request);
    const { data } = await this.http.post<MyPosResult>(
      '/refunds',
      JSON.stringify({ transactionId: request.paymentId, amount: request.price })
    );
    return this.withErrorCode({
      status: data.approved ? PaymentStatus.SUCCESS : PaymentStatus.FAILURE,
      refundId: data.transactionId,
      errorCode: data.responseCode,
    });
  }

  async cancel(_request: CancelRequest): Promise<CancelResponse> {
    throw this.notSupported('Cancel');
  }

  async getPayment(paymentId: string): Promise<PaymentResponse> {
    const { data } = await this.http.get<MyPosResult>(`/payments/${encodeURIComponent(paymentId)}`);
    return {
      status: data.approved ? PaymentStatus.SUCCESS : PaymentStatus.FAILURE,
      paymentId,
      rawResponse: data,
    };
  }
}

/** `providers: { mypos: myPos({ ... }) }`: gets the mode, logger, retry and fetch settings */
export const myPos = (config: MyPosConfig) =>
  defineProvider(
    (ctx) =>
      new MyPos({
        ...config,
        baseUrl:
          config.baseUrl ??
          (ctx.mode === 'sandbox' ? 'https://test.mypos.example' : 'https://api.mypos.example'),
        logger: config.logger ?? ctx.logger,
        retry: config.retry ?? ctx.retry,
        fetch: config.fetch ?? ctx.fetch,
        validate: config.validate ?? ctx.validate,
      })
  );

export const payment = betterPayment({
  providers: {
    mypos: myPos({ terminalId: 'T1', secretKey: 'secret' }),
  },
  mode: 'sandbox',
});

// payment.mypos is a MyPos; routes are /api/pay/mypos/...
