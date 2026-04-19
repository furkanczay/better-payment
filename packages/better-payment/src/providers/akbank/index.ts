import axios, { AxiosInstance } from 'axios';
import { PaymentProvider, PaymentProviderConfig } from '../../core/PaymentProvider';
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
} from '../../types';
import {
  createAkbankHash,
  createAkbank3DHash,
  verifyAkbank3DHash,
  formatAmount,
  formatExpiry,
  getCurrencyCode,
} from './utils';
import {
  AkbankConfig,
  AkbankResponse,
  Akbank3DSInitResponse,
  Akbank3DSCallbackRequest,
  AkbankRefundResponse,
  AkbankCancelResponse,
} from './types';

/**
 * Akbank Sanal POS sağlayıcısı
 */
export class Akbank extends PaymentProvider {
  private client: AxiosInstance;
  private merchantId: string;
  private terminalId: string;
  private storeKey: string;
  private secure3DStoreKey?: string;

  constructor(config: PaymentProviderConfig & AkbankConfig) {
    // Önce Akbank özel alanlarını validate et
    if (!config.merchantId) {
      throw new Error('Merchant ID is required');
    }
    if (!config.terminalId) {
      throw new Error('Terminal ID is required');
    }
    if (!config.storeKey) {
      throw new Error('Store Key is required');
    }

    // Parent constructor'ı çağır
    super(config);

    // Akbank bilgilerini ata
    this.merchantId = config.merchantId;
    this.terminalId = config.terminalId;
    this.storeKey = config.storeKey;
    this.secure3DStoreKey = config.secure3DStoreKey;

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Akbank status'ünü PaymentStatus'e çevir
   */
  private mapStatus(akbankCode: string): PaymentStatus {
    // Akbank için: 00 = başarılı, diğerleri hata
    if (akbankCode === '00' || akbankCode === 'Success') {
      return PaymentStatus.SUCCESS;
    } else if (akbankCode === 'Declined' || akbankCode === 'Error') {
      return PaymentStatus.FAILURE;
    }
    return PaymentStatus.PENDING;
  }

  /**
   * Form data oluştur
   */
  private createFormData(data: Record<string, string>): string {
    return Object.entries(data)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }

  /**
   * Direkt ödeme (3D Secure olmadan)
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const amount = formatAmount(parseFloat(request.price));
      const currency = getCurrencyCode(request.currency || 'TRY');
      const orderId = request.conversationId || `ORDER-${Date.now()}`;

      // Hash oluştur
      const hash = createAkbankHash({
        merchantId: this.merchantId,
        terminalId: this.terminalId,
        orderId,
        amount,
        currency,
        storeKey: this.storeKey,
        txnType: 'Auth',
      });

      const akbankRequest: Record<string, string> = {
        MERCHANTID: this.merchantId,
        TERMINALID: this.terminalId,
        AMOUNT: amount,
        CURRENCY: currency,
        ORDERID: orderId,
        TXNTYPE: 'Auth',
        PAN: request.paymentCard.cardNumber,
        EXPIRY: formatExpiry(request.paymentCard.expireMonth, request.paymentCard.expireYear),
        CVV: request.paymentCard.cvc,
        CARDOWNER: request.paymentCard.cardHolderName,
        HASH: hash,
      };

      const formData = this.createFormData(akbankRequest);
      const response = await this.client.post<AkbankResponse>('/servlet/PaymentGateway', formData);

      return {
        status: this.mapStatus(response.data.ProcReturnCode),
        paymentId: response.data.OrderId,
        conversationId: orderId,
        errorCode: response.data.ErrMsg,
        errorMessage: response.data.Response,
        rawResponse: response.data,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Payment failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * 3D Secure ödeme başlat
   */
  async initThreeDSPayment(request: ThreeDSPaymentRequest): Promise<ThreeDSInitResponse> {
    try {
      if (!this.secure3DStoreKey) {
        throw new Error('3D Secure Store Key is required for 3DS payments');
      }

      const amount = formatAmount(parseFloat(request.price));
      const currency = getCurrencyCode(request.currency || 'TRY');
      const orderId = request.conversationId || `ORDER-${Date.now()}`;

      // 3D Hash oluştur
      const hash = createAkbank3DHash({
        merchantId: this.merchantId,
        terminalId: this.terminalId,
        orderId,
        amount,
        currency,
        successUrl: request.callbackUrl,
        errorUrl: request.callbackUrl,
        secure3DStoreKey: this.secure3DStoreKey,
        txnType: 'Auth',
      });

      const akbankRequest: Record<string, string> = {
        MERCHANTID: this.merchantId,
        TERMINALID: this.terminalId,
        AMOUNT: amount,
        CURRENCY: currency,
        ORDERID: orderId,
        TXNTYPE: 'Auth',
        SUCCESSURL: request.callbackUrl,
        ERRORURL: request.callbackUrl,
        PAN: request.paymentCard.cardNumber,
        EXPIRY: formatExpiry(request.paymentCard.expireMonth, request.paymentCard.expireYear),
        CVV: request.paymentCard.cvc,
        CARDOWNER: request.paymentCard.cardHolderName,
        EMAIL: request.buyer.email,
        HASH: hash,
      };

      if (request.installment && request.installment > 1) {
        akbankRequest.INSTALLMENT_COUNT = request.installment.toString();
      }

      const formData = this.createFormData(akbankRequest);
      const response = await this.client.post<Akbank3DSInitResponse>('/servlet/3DGate', formData);

      if (response.data.ProcReturnCode === 'Success' && response.data.Message) {
        return {
          status: PaymentStatus.PENDING,
          threeDSHtmlContent: response.data.Message,
          paymentId: response.data.OrderId,
          conversationId: orderId,
          rawResponse: response.data,
        };
      } else {
        return {
          status: PaymentStatus.FAILURE,
          errorCode: response.data.ErrMsg,
          errorMessage: response.data.Response,
          rawResponse: response.data,
        };
      }
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || '3DS initialization failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * 3D Secure ödeme tamamla
   */
  async completeThreeDSPayment(callbackData: Akbank3DSCallbackRequest): Promise<PaymentResponse> {
    try {
      if (!this.secure3DStoreKey) {
        throw new Error('3D Secure Store Key is required for 3DS payments');
      }

      // Hash doğrulama
      const isValid = verifyAkbank3DHash({
        merchantId: callbackData.MERCHANTID,
        terminalId: callbackData.TERMINALID,
        orderId: callbackData.ORDERID,
        secure3DHash: callbackData.SECURE3DHASH,
        secure3DStoreKey: this.secure3DStoreKey,
        amount: callbackData.AMOUNT,
        currency: callbackData.CURRENCY,
      });

      if (!isValid) {
        return {
          status: PaymentStatus.FAILURE,
          errorMessage: 'Invalid 3D Secure hash',
          rawResponse: callbackData,
        };
      }

      // mdStatus kontrolü (1, 2, 3, 4 başarılı sayılır)
      const successMdStatuses = ['1', '2', '3', '4'];
      if (callbackData.mdStatus && !successMdStatuses.includes(callbackData.mdStatus)) {
        return {
          status: PaymentStatus.FAILURE,
          errorMessage: `3D Authentication failed with mdStatus: ${callbackData.mdStatus}`,
          rawResponse: callbackData,
        };
      }

      return {
        status: this.mapStatus(callbackData.ProcReturnCode || 'Success'),
        paymentId: callbackData.ORDERID,
        conversationId: callbackData.ORDERID,
        errorMessage: callbackData.Response,
        rawResponse: callbackData,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || '3DS completion failed',
        rawResponse: error,
      };
    }
  }

  /**
   * İade işlemi
   */
  async refund(request: RefundRequest): Promise<RefundResponse> {
    try {
      const amount = formatAmount(parseFloat(request.price));
      const currency = getCurrencyCode(request.currency || 'TRY');

      const hash = createAkbankHash({
        merchantId: this.merchantId,
        terminalId: this.terminalId,
        orderId: request.paymentId,
        amount,
        currency,
        storeKey: this.storeKey,
        txnType: 'Refund',
      });

      const akbankRequest: Record<string, string> = {
        MERCHANTID: this.merchantId,
        TERMINALID: this.terminalId,
        ORDERID: request.paymentId,
        AMOUNT: amount,
        CURRENCY: currency,
        TXNTYPE: 'Refund',
        HASH: hash,
      };

      const formData = this.createFormData(akbankRequest);
      const response = await this.client.post<AkbankRefundResponse>(
        '/servlet/PaymentGateway',
        formData
      );

      if (response.data.ProcReturnCode === 'Success' || response.data.ProcReturnCode === '00') {
        return {
          status: PaymentStatus.SUCCESS,
          refundId: response.data.RefundId || response.data.OrderId,
          conversationId: request.conversationId,
          rawResponse: response.data,
        };
      } else {
        return {
          status: PaymentStatus.FAILURE,
          errorCode: response.data.ErrMsg,
          errorMessage: response.data.Response,
          rawResponse: response.data,
        };
      }
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Refund failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * İptal işlemi
   */
  async cancel(request: CancelRequest): Promise<CancelResponse> {
    try {
      const hash = createAkbankHash({
        merchantId: this.merchantId,
        terminalId: this.terminalId,
        orderId: request.paymentId,
        amount: '0',
        currency: '949',
        storeKey: this.storeKey,
        txnType: 'Void',
      });

      const akbankRequest: Record<string, string> = {
        MERCHANTID: this.merchantId,
        TERMINALID: this.terminalId,
        ORDERID: request.paymentId,
        TXNTYPE: 'Void',
        HASH: hash,
      };

      const formData = this.createFormData(akbankRequest);
      const response = await this.client.post<AkbankCancelResponse>(
        '/servlet/PaymentGateway',
        formData
      );

      if (response.data.ProcReturnCode === 'Success' || response.data.ProcReturnCode === '00') {
        return {
          status: PaymentStatus.SUCCESS,
          conversationId: request.conversationId,
          rawResponse: response.data,
        };
      } else {
        return {
          status: PaymentStatus.FAILURE,
          errorCode: response.data.ErrMsg,
          errorMessage: response.data.Response,
          rawResponse: response.data,
        };
      }
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Cancel failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * Ödeme sorgulama
   */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const hash = createAkbankHash({
        merchantId: this.merchantId,
        terminalId: this.terminalId,
        orderId: paymentId,
        amount: '0',
        currency: '949',
        storeKey: this.storeKey,
        txnType: 'StatusInquiry',
      });

      const akbankRequest: Record<string, string> = {
        MERCHANTID: this.merchantId,
        TERMINALID: this.terminalId,
        ORDERID: paymentId,
        TXNTYPE: 'StatusInquiry',
        HASH: hash,
      };

      const formData = this.createFormData(akbankRequest);
      const response = await this.client.post<AkbankResponse>('/servlet/PaymentGateway', formData);

      return {
        status: this.mapStatus(response.data.ProcReturnCode),
        paymentId: response.data.OrderId,
        conversationId: response.data.OrderId,
        errorCode: response.data.ErrMsg,
        errorMessage: response.data.Response,
        rawResponse: response.data,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Get payment failed',
        rawResponse: error.response?.data,
      };
    }
  }
}
