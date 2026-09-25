import { PaymentProvider, PaymentProviderConfig } from './PaymentProvider';
import {
  BetterPaymentConfig,
  ProviderType,
  ProviderInstances,
  PROVIDER_DEFAULT_URLS,
} from './BetterPaymentConfig';
import { ProviderNotEnabledError, ConfigurationError } from './errors';
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
  CaptureRequest,
  VoidAuthorizationRequest,
  SaveCardRequest,
  SaveCardResponse,
  ListCardsResponse,
  DeleteCardRequest,
  DeleteCardResponse,
} from '../types';
import { BetterPaymentHandler, BetterPaymentHandlerOptions } from './BetterPaymentHandler';

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
 *       }
 *     },
 *     paytr: {
 *       enabled: true,
 *       config: {
 *         merchantId: 'your-merchant-id',
 *         merchantKey: 'your-merchant-key',
 *         merchantSalt: 'your-merchant-salt',
 *       }
 *     }
 *   },
 *   defaultProvider: ProviderType.IYZICO,
 *   mode: 'sandbox',
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
  private _handler?: BetterPaymentHandler;

  constructor(config: BetterPaymentConfig) {
    this.config = config;
    this.defaultProvider = config.defaultProvider;
    this.initializeProviders();
  }

  /**
   * HTTP handler configured with `config.handler` options.
   * Created lazily; see BetterPaymentHandlerOptions for the security defaults.
   */
  get handler(): BetterPaymentHandler {
    if (!this._handler) {
      this._handler = new BetterPaymentHandler(this, this.config.handler);
    }
    return this._handler;
  }

  /**
   * Creates an additional HTTP handler with its own options
   * (e.g. a public handler and an authenticated admin handler).
   */
  createHandler(options: BetterPaymentHandlerOptions = {}): BetterPaymentHandler {
    return new BetterPaymentHandler(this, options);
  }

  private withDefaults<T extends PaymentProviderConfig>(providerType: ProviderType, config: T): T {
    const mode = this.config.mode || 'production';
    const defaults = PROVIDER_DEFAULT_URLS[providerType];
    return {
      ...config,
      baseUrl: config.baseUrl ?? defaults[mode],
      logger: config.logger ?? this.config.logger,
      retry: config.retry ?? this.config.retry,
      fetch: config.fetch ?? this.config.fetch,
      validate: config.validate ?? this.config.validate,
    };
  }

  /**
   * Provider'ları başlat. Eksik/hatalı yapılandırmada provider constructor'ı
   * ConfigurationError fırlatır.
   */
  private initializeProviders(): void {
    const { providers } = this.config;
    const sandbox = this.config.mode === 'sandbox';

    if (providers[ProviderType.IYZICO]?.enabled) {
      this.providers[ProviderType.IYZICO] = new Iyzico(
        this.withDefaults(ProviderType.IYZICO, providers[ProviderType.IYZICO].config)
      );
    }

    if (providers[ProviderType.PAYTR]?.enabled) {
      const config = this.withDefaults(ProviderType.PAYTR, providers[ProviderType.PAYTR].config);
      this.providers[ProviderType.PAYTR] = new PayTR({
        ...config,
        testMode: config.testMode ?? sandbox,
      });
    }

    if (providers[ProviderType.AKBANK]?.enabled) {
      const config = this.withDefaults(ProviderType.AKBANK, providers[ProviderType.AKBANK].config);
      this.providers[ProviderType.AKBANK] = new Akbank({
        ...config,
        testMode: config.testMode ?? sandbox,
      });
    }

    if (providers[ProviderType.PARAMPOS]?.enabled) {
      this.providers[ProviderType.PARAMPOS] = new Parampos(
        this.withDefaults(ProviderType.PARAMPOS, providers[ProviderType.PARAMPOS].config)
      );
    }

    if (this.defaultProvider && !this.providers[this.defaultProvider]) {
      throw new ConfigurationError(
        `Default provider '${this.defaultProvider}' is not enabled or configured`
      );
    }

    // Eğer sadece bir provider varsa onu default yap
    if (!this.defaultProvider) {
      const enabledProviders = Object.keys(this.providers) as ProviderType[];
      if (enabledProviders.length === 1) {
        this.defaultProvider = enabledProviders[0];
      }
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
      throw new ConfigurationError(
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
  async completeThreeDSPayment(callbackData: unknown): Promise<PaymentResponse> {
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
  /** Pre-authorization with the default provider */
  async authorize(request: PaymentRequest): Promise<PaymentResponse> {
    return this.getDefaultProvider().authorize(request);
  }

  /** 3D Secure pre-authorization with the default provider */
  async initThreeDSAuthorize(request: ThreeDSPaymentRequest): Promise<ThreeDSInitResponse> {
    return this.getDefaultProvider().initThreeDSAuthorize(request);
  }

  /** Captures a pre-authorization with the default provider */
  async capture(request: CaptureRequest): Promise<PaymentResponse> {
    return this.getDefaultProvider().capture(request);
  }

  /** Voids a pre-authorization with the default provider */
  async voidAuthorization(request: VoidAuthorizationRequest): Promise<CancelResponse> {
    return this.getDefaultProvider().voidAuthorization(request);
  }

  /** Saves a card with the default provider */
  async saveCard(request: SaveCardRequest): Promise<SaveCardResponse> {
    return this.getDefaultProvider().saveCard(request);
  }

  /** Lists a customer's saved cards with the default provider */
  async listCards(request: { customerToken: string }): Promise<ListCardsResponse> {
    return this.getDefaultProvider().listCards(request);
  }

  /** Deletes a saved card with the default provider */
  async deleteCard(request: DeleteCardRequest): Promise<DeleteCardResponse> {
    return this.getDefaultProvider().deleteCard(request);
  }

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
