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
  generatePayTRHash,
  verifyPayTRCallback,
  formatPayTRBasket,
  convertToKurus,
  generatePayTRToken,
  createPayTRFormData,
} from './utils';
import type {
  PayTRIframeResponse,
  PayTRCallbackData,
  PayTRRefundResponse,
  PayTRBasketItem,
} from './types';

/**
 * PayTR ödeme sağlayıcısı
 */
export class PayTR extends PaymentProvider {
  private client: AxiosInstance;
  private merchantId: string;
  private merchantKey: string;
  private merchantSalt: string;

  constructor(config: PaymentProviderConfig & { merchantId: string; merchantSalt: string }) {
    // Önce merchant bilgilerini validate et
    if (!config.merchantId) {
      throw new Error('Merchant ID is required');
    }
    if (!config.merchantSalt) {
      throw new Error('Merchant Salt is required');
    }

    // Parent constructor'ı çağır
    super(config);

    // Merchant bilgilerini ata
    this.merchantId = config.merchantId;
    this.merchantKey = config.apiKey; // apiKey = merchant_key
    this.merchantSalt = config.merchantSalt;

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * PayTR status'ünü PaymentStatus'e çevir
   */
  private mapStatus(paytrStatus: string): PaymentStatus {
    switch (paytrStatus) {
      case 'success':
        return PaymentStatus.SUCCESS;
      case 'failed':
        return PaymentStatus.FAILURE;
      default:
        return PaymentStatus.PENDING;
    }
  }

  /**
   * Sepet itemlerini PayTR formatına çevir
   */
  private convertBasketItems(basketItems: any[]): PayTRBasketItem[] {
    return basketItems.map((item) => ({
      name: item.name,
      price: convertToKurus(item.price),
      quantity: 1,
    }));
  }

  /**
   * Direkt ödeme (PayTR'da iframe ile)
   * NOT: PayTR direkt ödeme yerine iframe kullanır
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // PayTR direkt ödeme desteklemiyor, 3DS başlatıyoruz
      const threeDSResponse = await this.initThreeDSPayment({
        ...request,
        callbackUrl: request.callbackUrl || 'https://example.com/callback',
      });

      return {
        status: threeDSResponse.status,
        paymentId: threeDSResponse.paymentId,
        conversationId: threeDSResponse.conversationId,
        errorCode: threeDSResponse.errorCode,
        errorMessage: threeDSResponse.errorMessage,
        rawResponse: {
          ...threeDSResponse.rawResponse,
          note: 'PayTR does not support direct payment, initiated 3DS payment instead',
        },
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
   * 3D Secure ödeme başlat (iframe)
   */
  async initThreeDSPayment(request: ThreeDSPaymentRequest): Promise<ThreeDSInitResponse> {
    try {
      const basketItems = this.convertBasketItems(request.basketItems);
      const userBasket = formatPayTRBasket(basketItems);
      const paymentAmountKurus = convertToKurus(request.price);

      const noInstallment = '0'; // Taksit açık
      const maxInstallment = '0'; // Maksimum taksit yok
      const currency = request.currency || 'TL';
      const testMode = this.config.baseUrl.includes('sandbox') ? '1' : '0';

      const merchantOid = request.conversationId || `ORDER-${Date.now()}`;

      // Hash oluştur
      const paymentHash = generatePayTRHash(
        this.merchantId,
        request.buyer.ip,
        merchantOid,
        request.buyer.email,
        paymentAmountKurus,
        userBasket,
        noInstallment,
        maxInstallment,
        currency,
        testMode,
        this.merchantSalt
      );

      const paytrRequest: Record<string, string> = {
        merchant_id: this.merchantId,
        merchant_key: this.merchantKey,
        merchant_salt: this.merchantSalt,
        email: request.buyer.email,
        payment_amount: paymentAmountKurus,
        merchant_oid: merchantOid,
        user_name: `${request.buyer.name} ${request.buyer.surname}`,
        user_address: request.shippingAddress.address,
        user_phone: request.buyer.gsmNumber || '05001234567',
        merchant_ok_url: request.callbackUrl,
        merchant_fail_url: request.callbackUrl,
        user_basket: userBasket,
        user_ip: request.buyer.ip,
        timeout_limit: '30',
        debug_on: '0',
        test_mode: testMode,
        no_installment: noInstallment,
        max_installment: maxInstallment,
        currency: currency,
        lang: this.config.locale || 'tr',
        paytr_token: paymentHash,
      };

      const formData = createPayTRFormData(paytrRequest);

      const response = await this.client.post<PayTRIframeResponse>(
        '/odeme/api/get-token',
        formData
      );

      if (response.data.status === 'success' && response.data.token) {
        const iframeUrl = `https://www.paytr.com/odeme/guvenli/${response.data.token}`;

        // HTML iframe oluştur
        const iframeHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PayTR Ödeme</title>
    <style>
        body { margin: 0; padding: 0; overflow: hidden; }
        iframe { width: 100%; height: 100vh; border: none; }
    </style>
</head>
<body>
    <iframe src="${iframeUrl}"></iframe>
</body>
</html>`;

        return {
          status: PaymentStatus.PENDING,
          threeDSHtmlContent: iframeHtml,
          paymentId: response.data.token,
          conversationId: merchantOid,
          rawResponse: response.data,
        };
      } else {
        return {
          status: PaymentStatus.FAILURE,
          errorMessage: response.data.reason || 'Payment initialization failed',
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
  async completeThreeDSPayment(callbackData: PayTRCallbackData): Promise<PaymentResponse> {
    try {
      // Hash doğrulama
      const isValid = verifyPayTRCallback(
        callbackData.merchant_oid,
        this.merchantSalt,
        callbackData.status,
        callbackData.total_amount,
        callbackData.hash
      );

      if (!isValid) {
        return {
          status: PaymentStatus.FAILURE,
          errorMessage: 'Invalid callback signature',
          rawResponse: callbackData,
        };
      }

      return {
        status: this.mapStatus(callbackData.status),
        paymentId: callbackData.merchant_oid,
        conversationId: callbackData.merchant_oid,
        errorCode: callbackData.failed_reason_code,
        errorMessage: callbackData.failed_reason_msg,
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
      const returnAmount = convertToKurus(request.price);

      const refundToken = generatePayTRToken(
        this.merchantId,
        request.paymentId,
        returnAmount,
        this.merchantSalt
      );

      const refundRequest: Record<string, string> = {
        merchant_id: this.merchantId,
        merchant_oid: request.paymentId,
        return_amount: returnAmount,
        merchant_key: this.merchantKey,
        merchant_salt: this.merchantSalt,
        paytr_token: refundToken,
      };

      const formData = createPayTRFormData(refundRequest);

      const response = await this.client.post<PayTRRefundResponse>('/odeme/iade', formData);

      if (response.data.status === 'success') {
        return {
          status: PaymentStatus.SUCCESS,
          refundId: response.data.merchant_oid,
          conversationId: request.conversationId,
          rawResponse: response.data,
        };
      } else {
        return {
          status: PaymentStatus.FAILURE,
          errorCode: response.data.error_no,
          errorMessage: response.data.error_message,
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
   * İptal işlemi (PayTR'da iade ile aynı)
   */
  async cancel(request: CancelRequest): Promise<CancelResponse> {
    try {
      // PayTR'da cancel ve refund aynı endpoint'i kullanır
      const refundResult = await this.refund({
        paymentId: request.paymentId,
        price: '0', // Tam iade için sıfır gönderilir
        currency: 'TRY',
        ip: request.ip,
        conversationId: request.conversationId,
      });

      return {
        status: refundResult.status,
        conversationId: refundResult.conversationId,
        errorCode: refundResult.errorCode,
        errorMessage: refundResult.errorMessage,
        rawResponse: refundResult.rawResponse,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Cancel failed',
        rawResponse: error,
      };
    }
  }

  /**
   * Ödeme sorgulama
   * NOT: PayTR API'si ödeme sorgulama endpoint'i sunmuyor
   * Callback data'yı kullanarak durum kontrol edilmeli
   */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    return {
      status: PaymentStatus.PENDING,
      paymentId: paymentId,
      errorMessage:
        'PayTR does not provide payment query endpoint. Use callback data to verify payment status.',
      rawResponse: {
        note: 'Use completeThreeDSPayment with callback data to get payment status',
      },
    };
  }
}
