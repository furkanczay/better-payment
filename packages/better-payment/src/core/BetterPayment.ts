import { PaymentProvider, PaymentProviderConfig } from './PaymentProvider';
import { BetterPaymentConfig, ProviderType, ProviderInstances, PROVIDER_DEFAULT_URLS } from './BetterPaymentConfig';
import { ProviderNotEnabledError } from './errors';
import { Iyzico } from '../providers/iyzico';
import { PayTR } from '../providers/paytr';
import { Akbank } from '../providers/akbank';
import { Parampos } from '../providers/parampos';
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
import { BetterPaymentHandler } from './BetterPaymentHandler';

/**
 * BetterPayment - Merkezi ödeme yönetim sınıfı
 *
 * Config dosyası ile tüm payment provider'ları tek yerden yönetmenizi sağlar.
 *
 * @example
 * ```typescript
 * const betterPay = new BetterPayment({
 *   providers: {
 *     iyzico: {
 *       enabled: true,
 *       config: {
 *         apiKey: 'your-api-key',
 *         secretKey: 'your-secret-key',
 *         baseUrl: 'https://sandbox-api.iyzipay.com'
 *       }
 *     },
 *     paytr: {
 *       enabled: true,
 *       config: {
 *         merchantId: 'your-merchant-id',
 *         merchantKey: 'your-merchant-key',
 *         merchantSalt: 'your-merchant-salt',
 *         baseUrl: 'https://www.paytr.com'
 *       }
 *     }
 *   },
 *   defaultProvider: 'iyzico'
 * });
 *
 * // Kullanım şekilleri:
 *
 * // 1. Default provider kullanarak (defaultProvider: 'iyzico' olarak ayarlanmış)
 * const result = await betterPay.createPayment({ ... });
 *
 * // 2. Belirli bir provider kullanarak (use metodu)
 * const result = await betterPay.use('paytr').createPayment({ ... });
 *
 * // 3. Provider'a doğrudan erişim (önerilen yöntem)
 * const iyzicoResult = await betterPay.iyzico.createPayment({ ... });
 * const paytrResult = await betterPay.paytr.createPayment({ ... });
 *
 * // 4. Multi-provider kullanımı (aynı uygulamada farklı provider'lar)
 * const payment1 = await betterPay.iyzico.initThreeDSPayment({ ... });
 * const payment2 = await betterPay.paytr.initThreeDSPayment({ ... });
 * ```
 */
export class BetterPayment {
  private config: BetterPaymentConfig;
  private providers: ProviderInstances = {};
  private defaultProvider?: ProviderType;
  private _handler: BetterPaymentHandler;

  constructor(config: BetterPaymentConfig) {
    this.config = config;
    this.defaultProvider = config.defaultProvider;
    this.initializeProviders();
    this._handler = new BetterPaymentHandler(this);
  }

  /**
   * HTTP handler for creating API endpoints
   */
  get handler(): BetterPaymentHandler {
    return this._handler;
  }

  private applyDefaultBaseUrl<T extends PaymentProviderConfig>(providerType: ProviderType, config: T): T {
    const mode = this.config.mode || 'production';
    const defaults = PROVIDER_DEFAULT_URLS[providerType];
    const baseUrl = config.baseUrl ?? (defaults ? (defaults[mode] ?? defaults['production']) : undefined);
    return {
      ...config,
      baseUrl,
      logger: config.logger ?? this.config.logger,
      retry: config.retry ?? this.config.retry,
    };
  }

  /**
   * Provider'ları başlat
   */
  private initializeProviders(): void {
    // İyzico provider'ı başlat
    if (this.config.providers[ProviderType.IYZICO]?.enabled) {
      const iyzicoConfig = this.applyDefaultBaseUrl(ProviderType.IYZICO, this.config.providers[ProviderType.IYZICO].config);
      this.validateIyzicoConfig(iyzicoConfig);
      this.providers[ProviderType.IYZICO] = new Iyzico(iyzicoConfig);
    }

    // PayTR provider'ı başlat
    if (this.config.providers[ProviderType.PAYTR]?.enabled) {
      const paytrConfig = this.applyDefaultBaseUrl(ProviderType.PAYTR, this.config.providers[ProviderType.PAYTR].config);
      this.validatePayTRConfig(paytrConfig);
      this.providers[ProviderType.PAYTR] = new PayTR(paytrConfig as any);
    }

    // Akbank provider'ı başlat
    if (this.config.providers[ProviderType.AKBANK]?.enabled) {
      const akbankConfig = this.applyDefaultBaseUrl(ProviderType.AKBANK, this.config.providers[ProviderType.AKBANK].config);
      this.validateAkbankConfig(akbankConfig);
      this.providers[ProviderType.AKBANK] = new Akbank(akbankConfig as any);
    }

    // Parampos provider'ı başlat
    if (this.config.providers[ProviderType.PARAMPOS]?.enabled) {
      const paramposConfig = this.applyDefaultBaseUrl(ProviderType.PARAMPOS, this.config.providers[ProviderType.PARAMPOS].config);
      this.validateParamposConfig(paramposConfig);
      this.providers[ProviderType.PARAMPOS] = new Parampos(paramposConfig as any);
    }

    // Default provider kontrolü
    if (this.defaultProvider && !this.providers[this.defaultProvider]) {
      throw new Error(`Default provider '${this.defaultProvider}' is not enabled or configured`);
    }

    // Eğer sadece bir provider varsa onu default yap
    if (!this.defaultProvider) {
      const enabledProviders = Object.keys(this.providers) as ProviderType[];
      if (enabledProviders.length === 1) {
        this.defaultProvider = enabledProviders[0];
      }
    }
  }

  /**
   * İyzico config validation
   */
  private validateIyzicoConfig(config: PaymentProviderConfig): void {
    const missingFields: string[] = [];

    if (!config.apiKey) missingFields.push('apiKey (IYZICO_API_KEY)');
    if (!config.secretKey) missingFields.push('secretKey (IYZICO_SECRET_KEY)');

    if (missingFields.length > 0) {
      throw new Error(
        `Iyzico provider configuration is missing required fields:\n` +
          `  - ${missingFields.join('\n  - ')}\n\n` +
          `Please add these to your BetterPayment config or set mode: 'sandbox' | 'production' for default URLs.`
      );
    }
  }

  private validatePayTRConfig(
    config: PaymentProviderConfig & { merchantId: string; merchantSalt: string }
  ): void {
    const missingFields: string[] = [];

    if (!config.merchantId) missingFields.push('merchantId (PAYTR_MERCHANT_ID)');
    if (!config.secretKey) missingFields.push('merchantKey (PAYTR_MERCHANT_KEY)');
    if (!config.merchantSalt) missingFields.push('merchantSalt (PAYTR_MERCHANT_SALT)');

    if (missingFields.length > 0) {
      throw new Error(
        `PayTR provider configuration is missing required fields:\n` +
          `  - ${missingFields.join('\n  - ')}`
      );
    }
  }

  private validateAkbankConfig(
    config: PaymentProviderConfig & {
      merchantId: string;
      terminalId: string;
      storeKey: string;
      secure3DStoreKey?: string;
    }
  ): void {
    const missingFields: string[] = [];

    if (!config.merchantId) missingFields.push('merchantId (AKBANK_MERCHANT_ID)');
    if (!config.terminalId) missingFields.push('terminalId (AKBANK_TERMINAL_ID)');
    if (!config.storeKey) missingFields.push('storeKey (AKBANK_STORE_KEY)');

    if (missingFields.length > 0) {
      throw new Error(
        `Akbank provider configuration is missing required fields:\n` +
          `  - ${missingFields.join('\n  - ')}`
      );
    }
  }

  private validateParamposConfig(
    config: PaymentProviderConfig & {
      clientCode: string;
      clientUsername: string;
      clientPassword: string;
      guid: string;
    }
  ): void {
    const missingFields: string[] = [];

    if (!config.clientCode) missingFields.push('clientCode (PARAMPOS_CLIENT_CODE)');
    if (!config.clientUsername) missingFields.push('clientUsername (PARAMPOS_CLIENT_USERNAME)');
    if (!config.clientPassword) missingFields.push('clientPassword (PARAMPOS_CLIENT_PASSWORD)');
    if (!config.guid) missingFields.push('guid (PARAMPOS_GUID)');

    if (missingFields.length > 0) {
      throw new Error(
        `Parampos provider configuration is missing required fields:\n` +
          `  - ${missingFields.join('\n  - ')}`
      );
    }
  }

  use(provider: ProviderType.IYZICO | 'iyzico'): Iyzico;
  use(provider: ProviderType.PAYTR | 'paytr'): PayTR;
  use(provider: ProviderType.AKBANK | 'akbank'): Akbank;
  use(provider: ProviderType.PARAMPOS | 'parampos'): Parampos;
  use(provider: ProviderType | string): PaymentProvider;
  use(providerType: ProviderType | string): PaymentProvider {
    const provider = this.providers[providerType as ProviderType];
    if (!provider) {
      throw new ProviderNotEnabledError(providerType);
    }
    return provider;
  }

  /**
   * Default provider'ı getir
   */
  private getDefaultProvider(): PaymentProvider {
    if (!this.defaultProvider) {
      throw new Error(
        'No default provider set. Please specify a provider using .use() method ' +
          'or set defaultProvider in configuration.'
      );
    }
    return this.use(this.defaultProvider);
  }

  /**
   * Aktif provider'ları listele
   */
  getEnabledProviders(): ProviderType[] {
    return Object.keys(this.providers) as ProviderType[];
  }

  /**
   * Belirli bir provider'ın aktif olup olmadığını kontrol et
   */
  isProviderEnabled(providerType: ProviderType): boolean {
    return !!this.providers[providerType];
  }

  /**
   * Default provider ile ödeme oluştur
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return this.getDefaultProvider().createPayment(request);
  }

  /**
   * Default provider ile 3DS ödeme başlat
   */
  async initThreeDSPayment(request: ThreeDSPaymentRequest): Promise<ThreeDSInitResponse> {
    return this.getDefaultProvider().initThreeDSPayment(request);
  }

  /**
   * Default provider ile 3DS ödeme tamamla
   */
  async completeThreeDSPayment(callbackData: any): Promise<PaymentResponse> {
    return this.getDefaultProvider().completeThreeDSPayment(callbackData);
  }

  /**
   * Default provider ile iade yap
   */
  async refund(request: RefundRequest): Promise<RefundResponse> {
    return this.getDefaultProvider().refund(request);
  }

  /**
   * Default provider ile ödeme iptal et
   */
  async cancel(request: CancelRequest): Promise<CancelResponse> {
    return this.getDefaultProvider().cancel(request);
  }

  /**
   * Default provider ile ödeme sorgula
   */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    return this.getDefaultProvider().getPayment(paymentId);
  }

  /**
   * İyzico provider'ına doğrudan erişim
   *
   * @example
   * ```typescript
   * const result = await betterPay.iyzico.createPayment({ ... });
   * const checkout = await betterPay.iyzico.initCheckoutForm({ ... });
   * ```
   *
   * @throws Error if Iyzico provider is not enabled or configured
   */
  get iyzico(): Iyzico {
    const provider = this.providers[ProviderType.IYZICO];
    if (!provider) throw new ProviderNotEnabledError('iyzico');
    return provider as Iyzico;
  }

  /**
   * PayTR provider'ına doğrudan erişim
   *
   * @example
   * ```typescript
   * const result = await betterPay.paytr.createPayment({ ... });
   * ```
   *
   * @throws Error if PayTR provider is not enabled or configured
   */
  get paytr(): PayTR {
    const provider = this.providers[ProviderType.PAYTR];
    if (!provider) throw new ProviderNotEnabledError('paytr');
    return provider as PayTR;
  }

  /**
   * Akbank provider'ına doğrudan erişim
   *
   * @example
   * ```typescript
   * const result = await betterPay.akbank.createPayment({ ... });
   * const threeDSResult = await betterPay.akbank.initThreeDSPayment({ ... });
   * ```
   *
   * @throws Error if Akbank provider is not enabled or configured
   */
  get akbank(): Akbank {
    const provider = this.providers[ProviderType.AKBANK];
    if (!provider) throw new ProviderNotEnabledError('akbank');
    return provider as Akbank;
  }

  /**
   * Parampos provider'ına doğrudan erişim
   *
   * @example
   * ```typescript
   * const result = await betterPay.parampos.createPayment({ ... });
   * const threeDSResult = await betterPay.parampos.initThreeDSPayment({ ... });
   * ```
   *
   * @throws Error if Parampos provider is not enabled or configured
   */
  get parampos(): Parampos {
    const provider = this.providers[ProviderType.PARAMPOS];
    if (!provider) throw new ProviderNotEnabledError('parampos');
    return provider as Parampos;
  }
}
