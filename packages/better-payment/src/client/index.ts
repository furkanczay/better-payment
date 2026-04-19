import {
  PaymentRequest,
  PaymentResponse,
  ThreeDSPaymentRequest,
  ThreeDSInitResponse,
  RefundRequest,
  RefundResponse,
  CancelRequest,
  CancelResponse,
} from '../types';
import { ProviderType } from '../core/BetterPayConfig';

/**
 * Client configuration
 */
export interface BetterPayClientConfig {
  /**
   * Base URL for API endpoints
   * @example '/api/pay'
   * @example 'https://api.example.com/pay'
   */
  baseUrl: string;

  /**
   * Custom fetch implementation (opsiyonel)
   * @default globalThis.fetch
   */
  fetch?: typeof fetch;

  /**
   * Default headers for all requests
   */
  headers?: Record<string, string>;
}

/**
 * Provider client for making payment requests
 */
class ProviderClient {
  constructor(
    private provider: ProviderType,
    private config: BetterPayClientConfig
  ) {}

  /**
   * Get fetch implementation
   */
  private get fetch(): typeof fetch {
    return this.config.fetch || globalThis.fetch;
  }

  /**
   * Build full URL for endpoint
   */
  private buildUrl(path: string): string {
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const cleanPath = path.replace(/^\//, '');
    return `${baseUrl}/${this.provider}/${cleanPath}`;
  }

  /**
   * Make HTTP request
   */
  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    const url = this.buildUrl(path);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await this.fetch(url, options);

    if (!response.ok) {
      const error: any = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json() as Promise<T>;
  }

  /**
   * Create payment
   *
   * @example
   * ```typescript
   * const result = await client.iyzico.createPayment({
   *   price: '1.00',
   *   paidPrice: '1.00',
   *   currency: 'TRY',
   *   // ... other fields
   * });
   * ```
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return this.request<PaymentResponse>('POST', 'payment', request);
  }

  /**
   * Initialize 3D Secure payment
   *
   * @example
   * ```typescript
   * const result = await client.iyzico.initThreeDSPayment({
   *   price: '1.00',
   *   paidPrice: '1.00',
   *   currency: 'TRY',
   *   callbackUrl: 'https://example.com/callback',
   *   // ... other fields
   * });
   *
   * // Render 3DS HTML content
   * document.getElementById('threeds-container').innerHTML = result.threeDSHtmlContent;
   * ```
   */
  async initThreeDSPayment(request: ThreeDSPaymentRequest): Promise<ThreeDSInitResponse> {
    return this.request<ThreeDSInitResponse>('POST', 'payment/init-3ds', request);
  }

  /**
   * Complete 3D Secure payment (callback handler)
   *
   * @example
   * ```typescript
   * // In your callback page:
   * const callbackData = { ... }; // Data from provider
   * const result = await client.iyzico.completeThreeDSPayment(callbackData);
   * ```
   */
  async completeThreeDSPayment(callbackData: any): Promise<PaymentResponse> {
    return this.request<PaymentResponse>('POST', 'payment/complete-3ds', callbackData);
  }

  /**
   * Refund payment
   *
   * @example
   * ```typescript
   * const result = await client.iyzico.refund({
   *   paymentTransactionId: '123456',
   *   price: '0.50',
   *   currency: 'TRY',
   * });
   * ```
   */
  async refund(request: RefundRequest): Promise<RefundResponse> {
    return this.request<RefundResponse>('POST', 'refund', request);
  }

  /**
   * Cancel payment
   *
   * @example
   * ```typescript
   * const result = await client.iyzico.cancel({
   *   paymentId: '123456',
   * });
   * ```
   */
  async cancel(request: CancelRequest): Promise<CancelResponse> {
    return this.request<CancelResponse>('POST', 'cancel', request);
  }

  /**
   * Get payment details
   *
   * @example
   * ```typescript
   * const payment = await client.iyzico.getPayment('payment-id-123');
   * ```
   */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    return this.request<PaymentResponse>('GET', `payment/${paymentId}`);
  }
}

/**
 * BetterPay client for frontend applications
 *
 * Better-auth tarzı client library. Frontend'den otomatik olarak API endpoint'lerini
 * çağırmak için kullanılır.
 *
 * @example
 * ```typescript
 * import { createBetterPayClient } from 'better-pay/client';
 *
 * const client = createBetterPayClient({
 *   baseUrl: '/api/pay',
 * });
 *
 * // İyzico ile ödeme oluştur
 * const result = await client.iyzico.createPayment({
 *   price: '100.00',
 *   paidPrice: '100.00',
 *   currency: 'TRY',
 *   basketId: 'B67832',
 *   paymentCard: {
 *     cardHolderName: 'John Doe',
 *     cardNumber: '5528790000000008',
 *     expireMonth: '12',
 *     expireYear: '2030',
 *     cvc: '123',
 *   },
 *   buyer: {
 *     id: 'BY789',
 *     name: 'John',
 *     surname: 'Doe',
 *     gsmNumber: '+905350000000',
 *     email: 'email@email.com',
 *     identityNumber: '74300864791',
 *     registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah.',
 *     ip: '85.34.78.112',
 *     city: 'Istanbul',
 *     country: 'Turkey',
 *   },
 *   shippingAddress: {
 *     contactName: 'Jane Doe',
 *     city: 'Istanbul',
 *     country: 'Turkey',
 *     address: 'Nidakule Göztepe, Merdivenköy Mah.',
 *   },
 *   billingAddress: {
 *     contactName: 'Jane Doe',
 *     city: 'Istanbul',
 *     country: 'Turkey',
 *     address: 'Nidakule Göztepe, Merdivenköy Mah.',
 *   },
 *   basketItems: [
 *     {
 *       id: 'BI101',
 *       name: 'Product 1',
 *       category1: 'Electronics',
 *       itemType: 'PHYSICAL',
 *       price: '100.00',
 *     },
 *   ],
 * });
 *
 * // PayTR ile 3DS ödeme başlat
 * const threeds = await client.paytr.initThreeDSPayment({
 *   price: '100.00',
 *   paidPrice: '100.00',
 *   currency: 'TRY',
 *   callbackUrl: 'https://example.com/callback',
 *   // ... other fields
 * });
 *
 * // 3DS HTML'i render et
 * document.getElementById('payment-iframe').innerHTML = threeds.threeDSHtmlContent;
 * ```
 */
export class BetterPayClient {
  /**
   * İyzico provider client
   */
  readonly iyzico: ProviderClient;

  /**
   * PayTR provider client
   */
  readonly paytr: ProviderClient;

  constructor(private config: BetterPayClientConfig) {
    this.iyzico = new ProviderClient(ProviderType.IYZICO, config);
    this.paytr = new ProviderClient(ProviderType.PAYTR, config);
  }

  /**
   * Health check endpoint
   *
   * @example
   * ```typescript
   * const health = await client.health();
   * console.log(health.status); // 'ok'
   * console.log(health.providers); // ['iyzico', 'paytr']
   * ```
   */
  async health(): Promise<{
    status: string;
    service: string;
    version: string;
    providers: string[];
    timestamp: string;
  }> {
    const fetch = this.config.fetch || globalThis.fetch;
    const url = `${this.config.baseUrl.replace(/\/$/, '')}/health`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json() as Promise<{
      status: string;
      service: string;
      version: string;
      providers: string[];
      timestamp: string;
    }>;
  }
}

/**
 * Create a BetterPay client instance
 *
 * @param config - Client configuration
 * @returns BetterPayClient instance
 *
 * @example
 * ```typescript
 * const client = createBetterPayClient({
 *   baseUrl: '/api/pay',
 * });
 * ```
 */
export function createBetterPayClient(config: BetterPayClientConfig): BetterPayClient {
  return new BetterPayClient(config);
}
