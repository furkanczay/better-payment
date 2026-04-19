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
} from '../types';

/**
 * Ödeme sağlayıcısı yapılandırması
 */
export interface PaymentProviderConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  locale?: string;
}

/**
 * Tüm ödeme sağlayıcıları için temel abstract sınıf
 */
export abstract class PaymentProvider {
  protected config: PaymentProviderConfig;

  constructor(config: PaymentProviderConfig) {
    this.config = {
      locale: 'tr',
      ...config,
    };
    this.validateConfig();
  }

  /**
   * Yapılandırmayı doğrula
   */
  protected validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('API Key is required');
    }
    if (!this.config.secretKey) {
      throw new Error('Secret Key is required');
    }
    if (!this.config.baseUrl) {
      throw new Error('Base URL is required');
    }
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
  abstract completeThreeDSPayment(callbackData: any): Promise<PaymentResponse>;

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
   * BIN sorgulama
   */
  async binCheck(binNumber: string): Promise<BinCheckResponse> {
    throw new Error(`BIN check for ${binNumber} not supported by this provider`);
  }
}
