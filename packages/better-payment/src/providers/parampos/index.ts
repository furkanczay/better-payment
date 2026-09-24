/**
 * Parampos Payment Provider
 *
 * SOAP-based integration with Param (TurkPOS).
 */

import axios, { AxiosInstance } from 'axios';
import {
  PaymentProvider,
  PaymentProviderConfig,
  RetryableRequestConfig,
} from '../../core/PaymentProvider';
import { ConfigurationError } from '../../core/errors';
import { generateOrderId, errorMessage, isNetworkError } from '../../core/utils';
import {
  PaymentRequest,
  PaymentResponse,
  ThreeDSPaymentRequest,
  ThreeDSInitResponse,
  RefundRequest,
  RefundResponse,
  CancelRequest,
  CancelResponse,
  BinCheckResponse,
  PaymentStatus,
} from '../../types';
import { ParamposResult, Parampos3DSCallbackData, ParamposOrderStatus } from './types';
import {
  generateParamposPaymentHash,
  verifyParampos3DSCallback,
  formatParamposAmount,
  formatParamposRefundAmount,
  formatParamposExpiryMonth,
  formatParamposExpiryYear,
  formatParamposGsm,
  buildParamposSoapEnvelope,
  parseParamposSoapResponse,
  isParamposSuccess,
  parseParamposAmount,
} from './utils';

/**
 * Parampos configuration
 */
export interface ParamposConfig extends PaymentProviderConfig {
  /** CLIENT_CODE (terminal numarası) */
  clientCode: string;
  /** CLIENT_USERNAME */
  clientUsername: string;
  /** CLIENT_PASSWORD */
  clientPassword: string;
  /** Merchant GUID (anahtar). Used for hashes, never sent to the browser. */
  guid: string;
}

const NETWORK_ERROR_CODE = 'NETWORK_ERROR';
const NETWORK_ERROR_MESSAGE =
  'No response from Parampos. The transaction may have been processed; verify it with getPayment() before retrying.';

/**
 * Parampos Payment Provider
 */
export class Parampos extends PaymentProvider<ParamposConfig> {
  private client: AxiosInstance;

  constructor(config: ParamposConfig) {
    super(config);

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 60000,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
      },
    });
    this.setupAxiosLogging(this.client, 'parampos');
    this.setupAxiosRetry(this.client);
  }

  protected validateConfig(): void {
    const missing = (['clientCode', 'clientUsername', 'clientPassword', 'guid'] as const).filter(
      (key) => !this.config[key]
    );
    if (missing.length > 0) {
      throw new ConfigurationError(
        `Parampos configuration is missing: ${missing.join(', ')}`,
        'parampos'
      );
    }
    if (!this.config.baseUrl) {
      throw new ConfigurationError('Parampos baseUrl is required', 'parampos');
    }
  }

  private get credentials() {
    return {
      G: {
        CLIENT_CODE: this.config.clientCode,
        CLIENT_USERNAME: this.config.clientUsername,
        CLIENT_PASSWORD: this.config.clientPassword,
      },
      GUID: this.config.guid,
    };
  }

  /**
   * Send SOAP request to Parampos API
   */
  private async sendSoapRequest(
    soapAction: string,
    fields: Record<string, any>,
    options: { retryable?: boolean } = {}
  ): Promise<ParamposResult> {
    const envelope = buildParamposSoapEnvelope(soapAction, fields);

    const requestConfig: RetryableRequestConfig = {
      headers: { SOAPAction: `https://turkpos.com.tr/${soapAction}` },
      retryable: options.retryable === true,
      responseType: 'text',
    };

    const response = await this.client.post('', envelope, requestConfig);
    return parseParamposSoapResponse<ParamposResult>(String(response.data), `${soapAction}Result`);
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

  private buildPaymentFields(
    request: PaymentRequest,
    orderId: string,
    securityType: 'NS' | '3D',
    installment: number,
    callbackUrl?: string
  ): Record<string, any> {
    const transactionAmount = formatParamposAmount(request.price);
    const totalAmount = formatParamposAmount(request.paidPrice ?? request.price);
    const hash = generateParamposPaymentHash(
      this.config.clientCode,
      this.config.guid,
      installment,
      transactionAmount,
      totalAmount,
      orderId
    );

    return {
      ...this.credentials,
      KK_Sahibi: request.paymentCard.cardHolderName,
      KK_No: request.paymentCard.cardNumber,
      KK_SK_Ay: formatParamposExpiryMonth(request.paymentCard.expireMonth),
      KK_SK_Yil: formatParamposExpiryYear(request.paymentCard.expireYear),
      KK_CVC: request.paymentCard.cvc,
      // Optional per docs, but the service rejects requests without the element
      KK_Sahibi_GSM: formatParamposGsm(request.buyer?.gsmNumber),
      Hata_URL: callbackUrl ?? '',
      Basarili_URL: callbackUrl ?? '',
      Siparis_ID: orderId,
      Siparis_Aciklama: request.basketId ?? '',
      Taksit: installment,
      Islem_Tutar: transactionAmount,
      Toplam_Tutar: totalAmount,
      Islem_Hash: hash,
      Islem_Guvenlik_Tip: securityType,
      Islem_ID: orderId,
      IPAdr: request.buyer.ip,
      Ref_URL: '',
      Data1: '',
      Data2: '',
      Data3: '',
      Data4: '',
      Data5: '',
    };
  }

  /**
   * TP_WMD_UCD only supports TRY. Foreign currency payments require a different
   * service (TP_Islem_Odeme_WD) which is not implemented yet.
   */
  private assertTry(currency: string | undefined): void {
    const value = (currency || 'TRY').toUpperCase();
    if (value !== 'TRY' && value !== 'TL') {
      throw new Error(
        `Parampos provider currently supports only TRY payments (received ${currency})`
      );
    }
  }

  /**
   * Direct (non-3D) payment
   *
   * `price` is Islem_Tutar and `paidPrice` is Toplam_Tutar (amount charged to the
   * card, including any installment commission). For installments, calculate
   * `paidPrice` from the rates configured on your Param account.
   */
  async createPayment(
    request: PaymentRequest & { installment?: number }
  ): Promise<PaymentResponse> {
    const orderId = request.conversationId || generateOrderId();
    try {
      this.assertTry(request.currency);
      const installment = Math.max(1, request.installment ?? 1);
      const fields = this.buildPaymentFields(request, orderId, 'NS', installment);
      const result = await this.sendSoapRequest('TP_WMD_UCD', fields);

      const approved = isParamposSuccess(result.Sonuc) && Number(result.Islem_ID) > 0;

      return {
        status: approved ? PaymentStatus.SUCCESS : PaymentStatus.FAILURE,
        paymentId: orderId,
        conversationId: orderId,
        errorCode: approved ? undefined : result.Sonuc,
        errorMessage: approved ? undefined : result.Sonuc_Str || result.Bank_HostMsg,
        rawResponse: result,
      };
    } catch (error) {
      return this.failure<PaymentResponse>(error, 'Payment failed', {
        paymentId: orderId,
        conversationId: orderId,
      });
    }
  }

  /**
   * Initialize 3D Secure payment (TP_WMD_UCD, Islem_Guvenlik_Tip = 3D)
   *
   * Render `threeDSHtmlContent` in the browser. Param POSTs the result to
   * `callbackUrl`; pass that POST body to completeThreeDSPayment().
   */
  async initThreeDSPayment(request: ThreeDSPaymentRequest): Promise<ThreeDSInitResponse> {
    const orderId = request.conversationId || generateOrderId();
    try {
      this.assertTry(request.currency);
      if (!request.callbackUrl) {
        throw new Error('callbackUrl is required for 3D Secure payments');
      }
      const installment = Math.max(1, request.installment ?? 1);
      const fields = this.buildPaymentFields(
        request,
        orderId,
        '3D',
        installment,
        request.callbackUrl
      );
      const result = await this.sendSoapRequest('TP_WMD_UCD', fields);

      if (!isParamposSuccess(result.Sonuc) || !result.UCD_HTML || result.UCD_HTML === 'NONSECURE') {
        return {
          status: PaymentStatus.FAILURE,
          paymentId: orderId,
          conversationId: orderId,
          errorCode: result.Sonuc,
          errorMessage: result.Sonuc_Str || '3D Secure form could not be created',
          rawResponse: result,
        };
      }

      return {
        status: PaymentStatus.PENDING,
        threeDSHtmlContent: result.UCD_HTML,
        paymentId: orderId,
        conversationId: orderId,
        rawResponse: result,
      };
    } catch (error) {
      return this.failure<ThreeDSInitResponse>(error, '3D Secure initialization failed', {
        paymentId: orderId,
        conversationId: orderId,
      });
    }
  }

  /**
   * Complete 3D Secure payment
   *
   * 1. Verifies islemHash with the configured GUID (callback values are untrusted).
   * 2. Requires mdStatus = 1 (full 3D authentication).
   * 3. Finalizes the payment with TP_WMD_Pay. The payment is only successful
   *    when TP_WMD_Pay returns Sonuc > 0 and a Dekont_ID.
   */
  async completeThreeDSPayment(callbackData: Parampos3DSCallbackData): Promise<PaymentResponse> {
    const orderId = callbackData?.orderId;
    try {
      if (!verifyParampos3DSCallback(callbackData ?? {}, this.config.guid)) {
        return {
          status: PaymentStatus.FAILURE,
          paymentId: orderId,
          conversationId: orderId,
          errorCode: 'INVALID_HASH',
          errorMessage: 'Invalid 3D Secure callback signature',
          rawResponse: callbackData,
        };
      }

      if (callbackData.mdStatus !== '1') {
        return {
          status: PaymentStatus.FAILURE,
          paymentId: orderId,
          conversationId: orderId,
          errorCode: `MD_STATUS_${callbackData.mdStatus}`,
          errorMessage: callbackData.bankResult || '3D Secure authentication failed',
          rawResponse: callbackData,
        };
      }

      const result = await this.sendSoapRequest('TP_WMD_Pay', {
        ...this.credentials,
        UCD_MD: callbackData.md,
        Islem_GUID: callbackData.islemGUID,
        Siparis_ID: callbackData.orderId,
      });

      const approved = isParamposSuccess(result.Sonuc) && Number(result.Dekont_ID) > 0;

      return {
        status: approved ? PaymentStatus.SUCCESS : PaymentStatus.FAILURE,
        paymentId: orderId,
        conversationId: orderId,
        errorCode: approved ? undefined : result.Sonuc,
        errorMessage: approved
          ? undefined
          : result.Sonuc_Ack || result.Sonuc_Str || result.Bank_HostMsg,
        rawResponse: { callback: callbackData, payment: result },
      };
    } catch (error) {
      return this.failure<PaymentResponse>(error, '3D Secure completion failed', {
        paymentId: orderId,
        conversationId: orderId,
      });
    }
  }

  private async cancelOrRefund(
    action: 'IADE' | 'IPTAL',
    orderId: string,
    amount: string
  ): Promise<ParamposResult> {
    return this.sendSoapRequest('TP_Islem_Iptal_Iade_Kismi2', {
      ...this.credentials,
      Durum: action,
      Siparis_ID: orderId,
      Tutar: formatParamposRefundAmount(amount),
    });
  }

  /**
   * Refund (full or partial). `paymentId` is the order id (Siparis_ID).
   */
  async refund(request: RefundRequest): Promise<RefundResponse> {
    try {
      const result = await this.cancelOrRefund('IADE', request.paymentId, request.price);
      const approved = isParamposSuccess(result.Sonuc);

      return {
        status: approved ? PaymentStatus.SUCCESS : PaymentStatus.FAILURE,
        refundId: approved ? result.Bank_Trans_ID || request.paymentId : undefined,
        conversationId: request.conversationId,
        errorCode: approved ? undefined : result.Sonuc,
        errorMessage: approved ? undefined : result.Sonuc_Str,
        rawResponse: result,
      };
    } catch (error) {
      return this.failure<RefundResponse>(error, 'Refund failed', {
        conversationId: request.conversationId,
      });
    }
  }

  /**
   * Cancel (void) a same-day payment. `paymentId` is the order id (Siparis_ID).
   * Param requires the full amount; when `price` is not given it is read with
   * a status query first.
   */
  async cancel(request: CancelRequest): Promise<CancelResponse> {
    try {
      let amount = request.price;
      if (!amount) {
        const status = await this.queryOrder(request.paymentId);
        const total = parseParamposAmount(status.Toplam_Tutar);
        if (!isParamposSuccess(status.Sonuc) || total === undefined) {
          return {
            status: PaymentStatus.FAILURE,
            conversationId: request.conversationId,
            errorMessage:
              status.Sonuc_Str || 'Could not determine payment amount for cancellation; pass price',
            rawResponse: status,
          };
        }
        amount = total.toFixed(2);
      }

      const result = await this.cancelOrRefund('IPTAL', request.paymentId, amount);
      const approved = isParamposSuccess(result.Sonuc);

      return {
        status: approved ? PaymentStatus.SUCCESS : PaymentStatus.FAILURE,
        transactionId: approved ? result.Bank_Trans_ID : undefined,
        conversationId: request.conversationId,
        errorCode: approved ? undefined : result.Sonuc,
        errorMessage: approved ? undefined : result.Sonuc_Str,
        rawResponse: result,
      };
    } catch (error) {
      return this.failure<CancelResponse>(error, 'Cancellation failed', {
        conversationId: request.conversationId,
      });
    }
  }

  private queryOrder(orderId: string): Promise<ParamposResult> {
    return this.sendSoapRequest(
      'TP_Islem_Sorgulama4',
      {
        ...this.credentials,
        Dekont_ID: '',
        Siparis_ID: orderId,
        Islem_ID: '',
      },
      { retryable: true }
    );
  }

  /**
   * Payment status by order id (Siparis_ID)
   */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const result = await this.queryOrder(paymentId);

      if (!isParamposSuccess(result.Sonuc)) {
        return {
          status: PaymentStatus.FAILURE,
          paymentId,
          conversationId: paymentId,
          errorCode: result.Sonuc,
          errorMessage: result.Sonuc_Str,
          rawResponse: result,
        };
      }

      return {
        status: mapParamposOrderStatus(result.Durum as ParamposOrderStatus | undefined),
        paymentId: result.Siparis_ID || paymentId,
        conversationId: result.Siparis_ID || paymentId,
        errorMessage: result.Durum === 'SUCCESS' ? undefined : result.Odeme_Sonuc_Aciklama,
        rawResponse: result,
      };
    } catch (error) {
      return this.failure<PaymentResponse>(error, 'Payment inquiry failed', { paymentId });
    }
  }

  /**
   * BIN query (BIN_SanalPos)
   */
  async binCheck(binNumber: string): Promise<BinCheckResponse> {
    const result = await this.sendSoapRequest(
      'BIN_SanalPos',
      { ...this.credentials, BIN: binNumber },
      { retryable: true }
    );

    if (!isParamposSuccess(result.Sonuc) || !result.BIN) {
      throw new Error(result.Sonuc_Str || `BIN ${binNumber} not found`);
    }

    return {
      binNumber: result.BIN,
      cardType: result.Kart_Tip || '',
      cardAssociation: result.Kart_Org || '',
      cardFamily: result.Kart_Tip || '',
      bankName: result.Kart_Banka || '',
      bankCode: Number(result.Banka_Kodu) || 0,
      commercial: result.Ticari_Kart === '1' || /ticari/i.test(result.Kart_Tip || ''),
      rawResponse: result,
    };
  }
}

/**
 * Maps Param `Durum` to the unified payment status
 */
export function mapParamposOrderStatus(durum: ParamposOrderStatus | undefined): PaymentStatus {
  switch (durum) {
    case 'SUCCESS':
    case 'PARTIAL_REFUND':
      return PaymentStatus.SUCCESS;
    case 'CANCEL':
    case 'REFUND':
      return PaymentStatus.CANCELLED;
    case 'FAIL':
    case 'BANK_FAIL':
      return PaymentStatus.FAILURE;
    default:
      return PaymentStatus.PENDING;
  }
}
