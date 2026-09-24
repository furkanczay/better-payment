import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { PaymentProvider, RetryableRequestConfig } from '../../core/PaymentProvider';
import { ConfigurationError } from '../../core/errors';
import { generateOrderId, errorMessage, isNetworkError, parseAmount } from '../../core/utils';
import {
  PaymentRequest,
  PaymentResponse,
  ThreeDSPaymentRequest,
  ThreeDSInitResponse,
  RefundRequest,
  RefundResponse,
  CancelRequest,
  CancelResponse,
  PaymentStatus,
  BinCheckResponse,
  InstallmentInfoRequest,
  InstallmentInfoResponse,
  InstallmentPrice,
} from '../../types';
import {
  generatePayTRIframeToken,
  generatePayTRDirectToken,
  generatePayTRRefundToken,
  generatePayTRStatusToken,
  generatePayTRBinToken,
  generatePayTRInstallmentRatesToken,
  verifyPayTRCallback,
  formatPayTRBasket,
  convertToKurus,
  formatPayTRAmount,
  mapPayTRCurrency,
  assertPayTRMerchantOid,
  createPayTRFormData,
  buildAutoSubmitForm,
  buildIframeHtml,
} from './utils';
import type {
  PayTRConfig,
  PayTRIframeResponse,
  PayTRCallbackData,
  PayTRRefundResponse,
  PayTRBasketItem,
  PayTRBinDetailResponse,
  PayTRTokenPaymentRequest,
  PayTRDirectPaymentResponse,
  PayTRStatusResponse,
  PayTRInstallmentRatesResponse,
} from './types';

const NETWORK_ERROR_CODE = 'NETWORK_ERROR';
const NETWORK_ERROR_MESSAGE =
  'No response from PayTR. The transaction may have been processed; verify it with getPayment() before retrying.';

/**
 * PayTR ödeme sağlayıcısı
 *
 * - initThreeDSPayment(): iFrame API. The payment result is delivered to the
 *   notification (Bildirim) URL configured in the PayTR panel; pass that POST
 *   body to completeThreeDSPayment() and respond with plain text "OK".
 * - createPayment(): Direct API, non-3D, synchronous (requires the "Non-3D"
 *   permission on the PayTR account).
 */
export class PayTR extends PaymentProvider<PayTRConfig> {
  private client: AxiosInstance;

  constructor(config: PayTRConfig) {
    super(config);

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    this.setupAxiosLogging(this.client, 'paytr');
    this.setupAxiosRetry(this.client);
  }

  protected validateConfig(): void {
    const missing = (['merchantId', 'merchantKey', 'merchantSalt'] as const).filter(
      (key) => !this.config[key]
    );
    if (missing.length > 0) {
      throw new ConfigurationError(
        `PayTR configuration is missing: ${missing.join(', ')}`,
        'paytr'
      );
    }
    if (!this.config.baseUrl) {
      this.config.baseUrl = 'https://www.paytr.com';
    }
  }

  private get testMode(): string {
    return this.config.testMode ? '1' : '0';
  }

  private get lang(): string {
    return (this.config.locale || 'tr').toLowerCase().startsWith('en') ? 'en' : 'tr';
  }

  private failure<
    T extends {
      status: PaymentStatus;
      errorCode?: string;
      errorMessage?: string;
      rawResponse?: any;
    },
  >(error: unknown, fallback: string, extra: Partial<T> = {}): T {
    if (isNetworkError(error)) {
      return {
        status: PaymentStatus.PENDING,
        errorCode: NETWORK_ERROR_CODE,
        errorMessage: NETWORK_ERROR_MESSAGE,
        ...extra,
      } as T;
    }
    return {
      status: PaymentStatus.FAILURE,
      errorMessage: errorMessage(error, fallback),
      rawResponse: (error as any)?.response?.data,
      ...extra,
    } as T;
  }

  private post<T>(path: string, data: Record<string, string>, retryable = false): Promise<T> {
    const config: RetryableRequestConfig = { retryable };
    return this.client.post<T>(path, createPayTRFormData(data), config).then((res) => res.data);
  }

  private buildBasket(items: Array<{ name: string; price: string; quantity?: number }>): string {
    const basket: PayTRBasketItem[] = items.map((item) => ({
      name: item.name,
      price: formatPayTRAmount(item.price),
      quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
    }));
    return formatPayTRBasket(basket);
  }

  private resolveMerchantOid(conversationId?: string): string {
    const merchantOid = conversationId || generateOrderId();
    assertPayTRMerchantOid(merchantOid);
    return merchantOid;
  }

  /**
   * Non-3D direct payment (Direct API, sync_mode=1)
   *
   * Requires the PayTR account to be authorized for non-3D payments.
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    let merchantOid: string | undefined;
    try {
      merchantOid = this.resolveMerchantOid(request.conversationId);
      const installmentCount =
        request.installment && request.installment > 1 ? String(request.installment) : '0';
      const paymentAmount = formatPayTRAmount(request.paidPrice ?? request.price);
      const currency = mapPayTRCurrency(request.currency);

      const params: Record<string, string> = {
        merchant_id: this.config.merchantId,
        user_ip: request.buyer.ip,
        merchant_oid: merchantOid,
        email: request.buyer.email,
        payment_amount: paymentAmount,
        payment_type: 'card',
        installment_count: installmentCount,
        currency,
        test_mode: this.testMode,
        non_3d: '1',
      };

      const body: Record<string, string> = {
        ...params,
        paytr_token: generatePayTRDirectToken(
          {
            merchantId: params.merchant_id,
            userIp: params.user_ip,
            merchantOid,
            email: params.email,
            paymentAmount,
            paymentType: 'card',
            installmentCount,
            currency,
            testMode: params.test_mode,
            non3d: '1',
          },
          this.config.merchantSalt,
          this.config.merchantKey
        ),
        sync_mode: '1',
        debug_on: this.testMode,
        client_lang: this.lang,
        user_name: `${request.buyer.name} ${request.buyer.surname}`,
        user_address: request.billingAddress?.address || request.shippingAddress?.address || '',
        user_phone: request.buyer.gsmNumber,
        user_basket: this.buildBasket(request.basketItems),
        cc_owner: request.paymentCard.cardHolderName,
        card_number: request.paymentCard.cardNumber,
        expiry_month: request.paymentCard.expireMonth.padStart(2, '0'),
        expiry_year: request.paymentCard.expireYear.slice(-2),
        cvv: request.paymentCard.cvc,
      };

      const data = await this.post<PayTRDirectPaymentResponse>('/odeme', body);
      const approved = data.status === 'success';

      return {
        status: approved ? PaymentStatus.SUCCESS : PaymentStatus.FAILURE,
        paymentId: merchantOid,
        conversationId: merchantOid,
        errorCode: approved ? undefined : String(data.failed_reason_code ?? data.err_no ?? ''),
        errorMessage: approved
          ? undefined
          : String(data.failed_reason_msg ?? data.err_msg ?? data.msg ?? data.reason ?? ''),
        rawResponse: data,
      };
    } catch (error) {
      return this.failure<PaymentResponse>(error, 'Payment failed', {
        paymentId: merchantOid,
        conversationId: merchantOid,
      });
    }
  }

  /**
   * iFrame payment (3D Secure handled by PayTR)
   *
   * `callbackUrl` is where the customer's browser is redirected (merchant_ok_url /
   * merchant_fail_url). It does NOT carry the payment result: the result is sent
   * server-to-server to the notification URL configured in the PayTR panel.
   *
   * `installment`: undefined = customer can choose any installment, 1 = single
   * payment only, n > 1 = up to n installments.
   */
  async initThreeDSPayment(
    request: ThreeDSPaymentRequest & { failUrl?: string }
  ): Promise<ThreeDSInitResponse> {
    let merchantOid: string | undefined;
    try {
      merchantOid = this.resolveMerchantOid(request.conversationId);
      if (!request.callbackUrl) {
        throw new Error('callbackUrl is required');
      }

      const userBasket = this.buildBasket(request.basketItems);
      const paymentAmount = convertToKurus(request.paidPrice ?? request.price);
      const currency = mapPayTRCurrency(request.currency);
      const noInstallment = request.installment === 1 ? '1' : '0';
      const maxInstallment =
        request.installment && request.installment > 1 ? String(request.installment) : '0';

      const paytrToken = generatePayTRIframeToken(
        {
          merchantId: this.config.merchantId,
          userIp: request.buyer.ip,
          merchantOid,
          email: request.buyer.email,
          paymentAmount,
          userBasket,
          noInstallment,
          maxInstallment,
          currency,
          testMode: this.testMode,
        },
        this.config.merchantSalt,
        this.config.merchantKey
      );

      const body: Record<string, string> = {
        merchant_id: this.config.merchantId,
        user_ip: request.buyer.ip,
        merchant_oid: merchantOid,
        email: request.buyer.email,
        payment_amount: paymentAmount,
        paytr_token: paytrToken,
        user_basket: userBasket,
        debug_on: this.testMode,
        no_installment: noInstallment,
        max_installment: maxInstallment,
        user_name: `${request.buyer.name} ${request.buyer.surname}`,
        user_address: request.billingAddress?.address || request.shippingAddress?.address || '',
        user_phone: request.buyer.gsmNumber,
        merchant_ok_url: request.callbackUrl,
        merchant_fail_url: request.failUrl || request.callbackUrl,
        timeout_limit: String(this.config.timeoutLimit ?? 30),
        currency,
        test_mode: this.testMode,
        lang: this.lang,
      };

      const data = await this.post<PayTRIframeResponse>('/odeme/api/get-token', body);

      if (data.status === 'success' && data.token) {
        const iframeUrl = `${this.config.baseUrl!.replace(/\/$/, '')}/odeme/guvenli/${data.token}`;
        return {
          status: PaymentStatus.PENDING,
          threeDSHtmlContent: buildIframeHtml(iframeUrl),
          redirectUrl: iframeUrl,
          paymentId: merchantOid,
          conversationId: merchantOid,
          rawResponse: data,
        };
      }

      return {
        status: PaymentStatus.FAILURE,
        paymentId: merchantOid,
        conversationId: merchantOid,
        errorMessage: data.reason || 'Payment initialization failed',
        rawResponse: data,
      };
    } catch (error) {
      return this.failure<ThreeDSInitResponse>(error, '3DS initialization failed', {
        paymentId: merchantOid,
        conversationId: merchantOid,
      });
    }
  }

  /**
   * Verifies and maps the notification (Bildirim URL) POST.
   *
   * After processing, the endpoint MUST respond with plain text "OK"; otherwise
   * PayTR keeps re-sending the notification. The built-in handler does this.
   * PayTR may send the same notification more than once: make order updates idempotent.
   */
  async completeThreeDSPayment(callbackData: PayTRCallbackData): Promise<PaymentResponse> {
    if (
      !verifyPayTRCallback(
        callbackData ?? ({} as PayTRCallbackData),
        this.config.merchantSalt,
        this.config.merchantKey
      )
    ) {
      return {
        status: PaymentStatus.FAILURE,
        paymentId: callbackData?.merchant_oid,
        conversationId: callbackData?.merchant_oid,
        errorCode: 'INVALID_HASH',
        errorMessage: 'Invalid callback signature',
        rawResponse: callbackData,
      };
    }

    const approved = callbackData.status === 'success';

    return {
      status: approved ? PaymentStatus.SUCCESS : PaymentStatus.FAILURE,
      paymentId: callbackData.merchant_oid,
      conversationId: callbackData.merchant_oid,
      errorCode: approved ? undefined : callbackData.failed_reason_code,
      errorMessage: approved ? undefined : callbackData.failed_reason_msg,
      rawResponse: callbackData,
    };
  }

  /**
   * Refund (full or partial). `paymentId` is the merchant_oid; `price` is in TL.
   */
  async refund(request: RefundRequest): Promise<RefundResponse> {
    try {
      const returnAmount = formatPayTRAmount(request.price);

      const body: Record<string, string> = {
        merchant_id: this.config.merchantId,
        merchant_oid: request.paymentId,
        return_amount: returnAmount,
        paytr_token: generatePayTRRefundToken(
          this.config.merchantId,
          request.paymentId,
          returnAmount,
          this.config.merchantSalt,
          this.config.merchantKey
        ),
      };

      const data = await this.post<PayTRRefundResponse>('/odeme/iade', body);

      if (data.status === 'success') {
        return {
          status: PaymentStatus.SUCCESS,
          refundId: data.reference_no || data.merchant_oid,
          conversationId: request.conversationId,
          rawResponse: data,
        };
      }

      return {
        status: PaymentStatus.FAILURE,
        conversationId: request.conversationId,
        errorCode: data.err_no,
        errorMessage: data.err_msg,
        rawResponse: data,
      };
    } catch (error) {
      return this.failure<RefundResponse>(error, 'Refund failed', {
        conversationId: request.conversationId,
      });
    }
  }

  /**
   * PayTR has no void endpoint; a cancel is a full refund.
   * When `price` is not given, the paid amount is read with a status query.
   */
  async cancel(request: CancelRequest): Promise<CancelResponse> {
    try {
      let amount = request.price;
      if (!amount) {
        const status = await this.queryStatus(request.paymentId);
        if (status.status !== 'success' || !status.payment_amount) {
          return {
            status: PaymentStatus.FAILURE,
            conversationId: request.conversationId,
            errorMessage:
              status.err_msg || 'Could not determine payment amount for cancellation; pass price',
            rawResponse: status,
          };
        }
        amount = String(status.payment_amount).replace(',', '.');
      }

      const refund = await this.refund({
        paymentId: request.paymentId,
        price: amount,
        currency: request.currency || 'TRY',
        ip: request.ip,
        conversationId: request.conversationId,
      });

      return {
        status: refund.status,
        transactionId: refund.refundId,
        conversationId: refund.conversationId,
        errorCode: refund.errorCode,
        errorMessage: refund.errorMessage,
        rawResponse: refund.rawResponse,
      };
    } catch (error) {
      return this.failure<CancelResponse>(error, 'Cancel failed', {
        conversationId: request.conversationId,
      });
    }
  }

  /**
   * Payment with a stored card (utoken + ctoken)
   *
   * Returns an auto-submitting HTML form that posts to the PayTR Direct API from
   * the customer's browser (3D Secure). The result is delivered to the
   * notification URL like any other payment.
   */
  async createPaymentWithToken(request: PayTRTokenPaymentRequest): Promise<ThreeDSInitResponse> {
    let merchantOid: string | undefined;
    try {
      merchantOid = this.resolveMerchantOid(request.conversationId);
      const paymentAmount = formatPayTRAmount(request.price);
      const currency = mapPayTRCurrency(request.currency);
      const installmentCount =
        request.installment && request.installment > 1 ? String(request.installment) : '0';

      const fields: Record<string, string> = {
        merchant_id: this.config.merchantId,
        user_ip: request.buyer.ip,
        merchant_oid: merchantOid,
        email: request.buyer.email,
        payment_amount: paymentAmount,
        payment_type: 'card',
        installment_count: installmentCount,
        currency,
        test_mode: this.testMode,
        non_3d: '0',
      };

      fields.paytr_token = generatePayTRDirectToken(
        {
          merchantId: fields.merchant_id,
          userIp: fields.user_ip,
          merchantOid,
          email: fields.email,
          paymentAmount,
          paymentType: 'card',
          installmentCount,
          currency,
          testMode: fields.test_mode,
          non3d: '0',
        },
        this.config.merchantSalt,
        this.config.merchantKey
      );

      Object.assign(fields, {
        utoken: request.utoken,
        ctoken: request.ctoken,
        require_cvv: request.cvv ? '1' : '0',
        ...(request.cvv ? { cvv: request.cvv } : {}),
        client_lang: this.lang,
        debug_on: this.testMode,
        user_name: `${request.buyer.name} ${request.buyer.surname}`,
        user_address: request.buyer.address || '',
        user_phone: request.buyer.gsmNumber,
        user_basket: this.buildBasket(request.basketItems),
        merchant_ok_url: request.callbackUrl,
        merchant_fail_url: request.failUrl || request.callbackUrl,
      });

      const action = `${this.config.baseUrl!.replace(/\/$/, '')}/odeme`;

      return {
        status: PaymentStatus.PENDING,
        threeDSHtmlContent: buildAutoSubmitForm(action, fields),
        paymentId: merchantOid,
        conversationId: merchantOid,
      };
    } catch (error) {
      return this.failure<ThreeDSInitResponse>(error, 'Token payment failed', {
        paymentId: merchantOid,
        conversationId: merchantOid,
      });
    }
  }

  private queryStatus(merchantOid: string): Promise<PayTRStatusResponse> {
    return this.post<PayTRStatusResponse>(
      '/odeme/durum-sorgu',
      {
        merchant_id: this.config.merchantId,
        merchant_oid: merchantOid,
        paytr_token: generatePayTRStatusToken(
          this.config.merchantId,
          merchantOid,
          this.config.merchantSalt,
          this.config.merchantKey
        ),
      },
      true
    );
  }

  /**
   * Payment status query (/odeme/durum-sorgu). `paymentId` is the merchant_oid.
   */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const data = await this.queryStatus(paymentId);

      if (data.status !== 'success') {
        return {
          status: PaymentStatus.FAILURE,
          paymentId,
          conversationId: paymentId,
          errorCode: data.err_no,
          errorMessage: data.err_msg,
          rawResponse: data,
        };
      }

      // Status query amounts are in TL and may use a decimal comma ("1,16")
      const toNumber = (v: unknown) => Number(String(v ?? 0).replace(',', '.')) || 0;
      const paid = toNumber(data.payment_amount ?? data.payment_total);
      const refunded = (data.returns ?? []).reduce(
        (sum, r) => sum + toNumber(r.return_amount ?? r.refund_amount),
        0
      );
      const fullyRefunded = paid > 0 && refunded >= paid;

      return {
        status: fullyRefunded ? PaymentStatus.CANCELLED : PaymentStatus.SUCCESS,
        paymentId,
        conversationId: paymentId,
        rawResponse: data,
      };
    } catch (error) {
      return this.failure<PaymentResponse>(error, 'Get payment failed', {
        paymentId,
        conversationId: paymentId,
      });
    }
  }

  /**
   * BIN query (/odeme/api/bin-detail)
   */
  async binCheck(binNumber: string): Promise<BinCheckResponse> {
    const data = await this.post<PayTRBinDetailResponse>(
      '/odeme/api/bin-detail',
      {
        merchant_id: this.config.merchantId,
        bin_number: binNumber,
        paytr_token: generatePayTRBinToken(
          binNumber,
          this.config.merchantId,
          this.config.merchantSalt,
          this.config.merchantKey
        ),
      },
      true
    );

    if (data.status !== 'success') {
      throw new Error(data.err_msg || `BIN check failed (${data.status})`);
    }

    return {
      binNumber,
      cardType: data.cardType || '',
      cardAssociation: data.schema || '',
      cardFamily: data.brand || '',
      bankName: data.bank || '',
      bankCode: Number(data.bankCode) || 0,
      commercial: data.businessCard === 'y' || data.businessCard === '1',
      rawResponse: data,
    };
  }

  /**
   * Installment options for a card, computed from the commission rates defined
   * on the PayTR account (/odeme/taksit-oranlari) and the card family (BIN query).
   */
  async installmentInfo(request: InstallmentInfoRequest): Promise<InstallmentInfoResponse> {
    try {
      const price = parseAmount(request.price, 'price');
      const bin = await this.binCheck(request.binNumber);

      const requestId = crypto.randomBytes(8).toString('hex');
      const rates = await this.post<PayTRInstallmentRatesResponse>(
        '/odeme/taksit-oranlari',
        {
          merchant_id: this.config.merchantId,
          request_id: requestId,
          paytr_token: generatePayTRInstallmentRatesToken(
            this.config.merchantId,
            requestId,
            this.config.merchantSalt,
            this.config.merchantKey
          ),
        },
        true
      );

      if (rates.status !== 'success') {
        return {
          status: PaymentStatus.FAILURE,
          errorMessage: rates.err_msg || 'Installment rates query failed',
          rawResponse: rates,
        };
      }

      const family = (bin.cardFamily || '').toLowerCase();
      const familyRates = (rates.oranlar ?? {})[family] ?? {};
      const round = (n: number) => Math.round(n * 100) / 100;

      const installmentPrices = [
        { installmentNumber: 1, totalPrice: round(price), installmentPrice: round(price) },
      ];
      for (const [key, rate] of Object.entries(familyRates)) {
        const count = parseInt(key.replace('taksit_', ''), 10);
        const percent = Number(rate);
        if (!Number.isFinite(count) || count < 2 || !Number.isFinite(percent) || percent < 0)
          continue;
        const total = price * (1 + percent / 100);
        installmentPrices.push({
          installmentNumber: count,
          totalPrice: round(total),
          installmentPrice: round(total / count),
        });
      }
      installmentPrices.sort((a, b) => a.installmentNumber - b.installmentNumber);

      const detail: InstallmentPrice = {
        binNumber: request.binNumber,
        price,
        cardType: bin.cardType,
        cardAssociation: bin.cardAssociation,
        cardFamilyName: bin.cardFamily,
        bankCode: bin.bankCode,
        bankName: bin.bankName,
        commercial: bin.commercial ? 1 : 0,
        installmentPrices,
      };

      return {
        status: PaymentStatus.SUCCESS,
        installmentDetails: [detail],
        conversationId: request.conversationId,
        rawResponse: { bin: bin.rawResponse, rates },
      };
    } catch (error) {
      return this.failure<InstallmentInfoResponse>(error, 'Installment info failed');
    }
  }
}
