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
  CheckoutFormRequest,
  CheckoutFormInitResponse,
  CheckoutFormRetrieveResponse,
  BinCheckResponse,
  PWIPaymentRequest,
  PWIPaymentInitResponse,
  PWIPaymentRetrieveResponse,
  InstallmentInfoRequest,
  InstallmentInfoResponse,
} from '../../types';
import { createIyzicoHeaders } from './utils';
import {
  IyzicoPaymentRequest,
  IyzicoPaymentResponse,
  IyzicoThreeDSInitResponse,
  IyzicoRefundResponse,
  IyzicoCancelResponse,
  IyzicoCheckoutFormRequest,
  IyzicoCheckoutFormInitResponse,
  IyzicoCheckoutFormRetrieveResponse,
  IyzicoBinCheckRequest,
  IyzicoBinCheckResponse,
  IyzicoPWIPaymentRequest,
  IyzicoPWIPaymentInitResponse,
  IyzicoPWIPaymentRetrieveResponse,
  IyzicoInstallmentInfoRequest,
  IyzicoInstallmentInfoResponse,
} from './types';

/**
 * İyzico ödeme sağlayıcısı
 */
export class Iyzico extends PaymentProvider {
  private client: AxiosInstance;

  constructor(config: PaymentProviderConfig) {
    super(config);
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 30000,
    });
  }

  /**
   * İyzico status'ünü PaymentStatus'e çevir
   */
  private mapStatus(iyzicoStatus: string): PaymentStatus {
    switch (iyzicoStatus) {
      case 'success':
        return PaymentStatus.SUCCESS;
      case 'failure':
        return PaymentStatus.FAILURE;
      default:
        return PaymentStatus.PENDING;
    }
  }

  /**
   * Genel request gönderme metodu
   */
  private async sendRequest<T>(endpoint: string, data: any): Promise<T> {
    const requestBody = JSON.stringify(data);
    const headers = createIyzicoHeaders(
      this.config.apiKey,
      this.config.secretKey,
      endpoint,
      requestBody
    );

    // İmza için kullanılan body ile gönderilen body'nin aynı olması gerekiyor
    const response = await this.client.post<T>(endpoint, requestBody, {
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  }

  /**
   * Uygulama request'ini İyzico formatına çevir
   */
  private mapToIyzicoRequest(request: PaymentRequest): IyzicoPaymentRequest {
    return {
      locale: this.config.locale || 'tr',
      conversationId: request.conversationId,
      price: request.price,
      paidPrice: request.paidPrice,
      currency: request.currency,
      installment: 1,
      basketId: request.basketId,
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      paymentCard: {
        cardHolderName: request.paymentCard.cardHolderName,
        cardNumber: request.paymentCard.cardNumber,
        expireMonth: request.paymentCard.expireMonth,
        expireYear: request.paymentCard.expireYear,
        cvc: request.paymentCard.cvc,
        registerCard: request.paymentCard.registerCard ? 1 : 0,
      },
      buyer: {
        id: request.buyer.id,
        name: request.buyer.name,
        surname: request.buyer.surname,
        gsmNumber: request.buyer.gsmNumber,
        email: request.buyer.email,
        identityNumber: request.buyer.identityNumber,
        registrationAddress: request.buyer.registrationAddress,
        ip: request.buyer.ip,
        city: request.buyer.city,
        country: request.buyer.country,
        zipCode: request.buyer.zipCode,
      },
      shippingAddress: {
        contactName: request.shippingAddress.contactName,
        city: request.shippingAddress.city,
        country: request.shippingAddress.country,
        address: request.shippingAddress.address,
        zipCode: request.shippingAddress.zipCode,
      },
      billingAddress: {
        contactName: request.billingAddress.contactName,
        city: request.billingAddress.city,
        country: request.billingAddress.country,
        address: request.billingAddress.address,
        zipCode: request.billingAddress.zipCode,
      },
      basketItems: request.basketItems.map((item) => ({
        id: item.id,
        name: item.name,
        category1: item.category1,
        category2: item.category2,
        itemType: item.itemType,
        price: item.price,
      })),
    };
  }

  /**
   * Checkout Form request'ini İyzico formatına çevir
   */
  private mapToIyzicoCheckoutFormRequest(request: CheckoutFormRequest): IyzicoCheckoutFormRequest {
    return {
      locale: this.config.locale || 'tr',
      conversationId: request.conversationId,
      price: request.price,
      paidPrice: request.paidPrice,
      currency: request.currency,
      basketId: request.basketId,
      paymentGroup: 'PRODUCT',
      paymentChannel: 'WEB',
      callbackUrl: request.callbackUrl,
      enabledInstallments: request.enabledInstallments,
      buyer: {
        id: request.buyer.id,
        name: request.buyer.name,
        surname: request.buyer.surname,
        gsmNumber: request.buyer.gsmNumber,
        email: request.buyer.email,
        identityNumber: request.buyer.identityNumber,
        registrationAddress: request.buyer.registrationAddress,
        ip: request.buyer.ip,
        city: request.buyer.city,
        country: request.buyer.country,
        zipCode: request.buyer.zipCode,
      },
      shippingAddress: {
        contactName: request.shippingAddress.contactName,
        city: request.shippingAddress.city,
        country: request.shippingAddress.country,
        address: request.shippingAddress.address,
        zipCode: request.shippingAddress.zipCode,
      },
      billingAddress: {
        contactName: request.billingAddress.contactName,
        city: request.billingAddress.city,
        country: request.billingAddress.country,
        address: request.billingAddress.address,
        zipCode: request.billingAddress.zipCode,
      },
      basketItems: request.basketItems.map((item) => ({
        id: item.id,
        name: item.name,
        category1: item.category1,
        category2: item.category2,
        itemType: item.itemType,
        price: item.price,
      })),
    };
  }

  /**
   * Direkt ödeme (3D Secure olmadan)
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const iyzicoRequest = this.mapToIyzicoRequest(request);
      const response = await this.sendRequest<IyzicoPaymentResponse>(
        '/payment/auth',
        iyzicoRequest
      );

      return {
        status: this.mapStatus(response.status),
        paymentId: response.paymentId,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        errorGroup: response.errorGroup,
        rawResponse: response,
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
      const iyzicoRequest = {
        ...this.mapToIyzicoRequest(request),
        callbackUrl: request.callbackUrl,
      };

      const response = await this.sendRequest<IyzicoThreeDSInitResponse>(
        '/payment/3dsecure/initialize',
        iyzicoRequest
      );

      // İyzico threeDSHtmlContent'i Base64 encoded olarak döndürür, decode edelim
      let decodedHtmlContent: string | undefined;
      if (response.threeDSHtmlContent) {
        try {
          decodedHtmlContent = Buffer.from(response.threeDSHtmlContent, 'base64').toString('utf-8');
        } catch (decodeError) {
          // Eğer decode edilemezse, raw halini kullan
          decodedHtmlContent = response.threeDSHtmlContent;
        }
      }

      return {
        status: this.mapStatus(response.status),
        threeDSHtmlContent: decodedHtmlContent,
        paymentId: response.paymentId,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        rawResponse: response,
      };
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
  async completeThreeDSPayment(callbackData: any): Promise<PaymentResponse> {
    try {
      // Callback'ten gelen token ve conversationId ile ödemeyi tamamla
      const response = await this.sendRequest<IyzicoPaymentResponse>('/payment/3dsecure/auth', {
        locale: this.config.locale || 'tr',
        conversationId: callbackData.conversationId,
        paymentId: callbackData.paymentId,
        conversationData: callbackData.conversationData,
      });

      return {
        status: this.mapStatus(response.status),
        paymentId: response.paymentId,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        errorGroup: response.errorGroup,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || '3DS completion failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * İade işlemi
   */
  async refund(request: RefundRequest): Promise<RefundResponse> {
    try {
      const response = await this.sendRequest<IyzicoRefundResponse>('/payment/refund', {
        locale: this.config.locale || 'tr',
        conversationId: request.conversationId,
        paymentTransactionId: request.paymentId,
        price: request.price,
        currency: request.currency,
        ip: request.ip,
      });

      return {
        status: this.mapStatus(response.status),
        refundId: response.paymentTransactionId,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        rawResponse: response,
      };
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
      const response = await this.sendRequest<IyzicoCancelResponse>('/payment/cancel', {
        locale: this.config.locale || 'tr',
        conversationId: request.conversationId,
        paymentId: request.paymentId,
        ip: request.ip,
      });

      return {
        status: this.mapStatus(response.status),
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        rawResponse: response,
      };
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
      const response = await this.sendRequest<IyzicoPaymentResponse>('/payment/detail', {
        locale: this.config.locale || 'tr',
        paymentId: paymentId,
      });

      return {
        status: this.mapStatus(response.status),
        paymentId: response.paymentId,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        errorGroup: response.errorGroup,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Get payment failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * Checkout Form başlat
   */
  async initCheckoutForm(request: CheckoutFormRequest): Promise<CheckoutFormInitResponse> {
    try {
      const iyzicoRequest = this.mapToIyzicoCheckoutFormRequest(request);

      const response = await this.sendRequest<IyzicoCheckoutFormInitResponse>(
        '/payment/iyzipos/checkoutform/initialize/auth/ecom',
        iyzicoRequest
      );

      return {
        status: this.mapStatus(response.status),
        checkoutFormContent: response.checkoutFormContent,
        paymentPageUrl: response.paymentPageUrl,
        token: response.token,
        tokenExpireTime: response.tokenExpireTime,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Checkout form initialization failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * Checkout Form sonucunu sorgula
   */
  async retrieveCheckoutForm(
    token: string,
    conversationId?: string
  ): Promise<CheckoutFormRetrieveResponse> {
    try {
      const response = await this.sendRequest<IyzicoCheckoutFormRetrieveResponse>(
        '/payment/iyzipos/checkoutform/auth/ecom/detail',
        {
          locale: this.config.locale || 'tr',
          conversationId: conversationId,
          token: token,
        }
      );

      return {
        status: this.mapStatus(response.status),
        paymentId: response.paymentId,
        paymentStatus: response.paymentStatus,
        price: response.price,
        paidPrice: response.paidPrice,
        currency: response.currency,
        basketId: response.basketId,
        installment: response.installment,
        binNumber: response.binNumber,
        lastFourDigits: response.lastFourDigits,
        cardType: response.cardType,
        cardAssociation: response.cardAssociation,
        cardFamily: response.cardFamily,
        cardToken: response.cardToken,
        cardUserKey: response.cardUserKey,
        fraudStatus: response.fraudStatus,
        merchantCommissionRate: response.merchantCommissionRate,
        merchantCommissionRateAmount: response.merchantCommissionRateAmount,
        iyziCommissionRateAmount: response.iyziCommissionRateAmount,
        iyziCommissionFee: response.iyziCommissionFee,
        paymentTransactionId: response.paymentTransactionId,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Retrieve checkout form failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * ===================
   * SUBSCRIPTION METHODS
   * ===================
   */

  /**
   * Abonelik başlat (NON3D)
   */
  async initializeSubscription(
    request: import('../../types').SubscriptionInitializeRequest
  ): Promise<import('../../types').SubscriptionInitializeResponse> {
    try {
      const iyzicoRequest = {
        locale: request.locale || this.config.locale || 'tr',
        conversationId: request.conversationId,
        pricingPlanReferenceCode: request.pricingPlanReferenceCode,
        subscriptionInitialStatus: request.subscriptionInitialStatus,
        customer: {
          name: request.customer.name,
          surname: request.customer.surname,
          email: request.customer.email,
          gsmNumber: request.customer.gsmNumber,
          identityNumber: request.customer.identityNumber,
          billingAddress: {
            contactName: request.customer.billingAddress.contactName,
            city: request.customer.billingAddress.city,
            country: request.customer.billingAddress.country,
            address: request.customer.billingAddress.address,
            zipCode: request.customer.billingAddress.zipCode,
          },
          shippingAddress: request.customer.shippingAddress
            ? {
                contactName: request.customer.shippingAddress.contactName,
                city: request.customer.shippingAddress.city,
                country: request.customer.shippingAddress.country,
                address: request.customer.shippingAddress.address,
                zipCode: request.customer.shippingAddress.zipCode,
              }
            : undefined,
        },
        paymentCard: {
          cardHolderName: request.paymentCard.cardHolderName,
          cardNumber: request.paymentCard.cardNumber,
          expireMonth: request.paymentCard.expireMonth,
          expireYear: request.paymentCard.expireYear,
          cvc: request.paymentCard.cvc,
        },
      };

      const response = await this.sendRequest<any>('/v2/subscription/initialize', iyzicoRequest);

      return response;
    } catch (error: any) {
      return {
        status: 'failure',
        errorMessage: error.message || 'Subscription initialization failed',
        errorCode: error.response?.data?.errorCode,
      };
    }
  }

  /**
   * Aboneliği iptal et
   */
  async cancelSubscription(
    request: import('../../types').SubscriptionCancelRequest
  ): Promise<import('../../types').SubscriptionCancelResponse> {
    try {
      const response = await this.sendRequest<any>(
        `/v2/subscription/subscriptions/${request.subscriptionReferenceCode}/cancel`,
        {}
      );

      return response;
    } catch (error: any) {
      return {
        status: 'failure',
        errorMessage: error.message || 'Subscription cancellation failed',
        errorCode: error.response?.data?.errorCode,
      };
    }
  }

  /**
   * Aboneliği yükselt/güncelle
   */
  async upgradeSubscription(
    request: import('../../types').SubscriptionUpgradeRequest
  ): Promise<import('../../types').SubscriptionUpgradeResponse> {
    try {
      const iyzicoRequest = {
        newPricingPlanReferenceCode: request.newPricingPlanReferenceCode,
        useTrial: request.useTrial,
        resetRecurrenceCount: request.resetRecurrenceCount,
      };

      const response = await this.sendRequest<any>(
        `/v2/subscription/subscriptions/${request.subscriptionReferenceCode}/upgrade`,
        iyzicoRequest
      );

      return response;
    } catch (error: any) {
      return {
        status: 'failure',
        errorMessage: error.message || 'Subscription upgrade failed',
        errorCode: error.response?.data?.errorCode,
      };
    }
  }

  /**
   * Abonelik detaylarını getir
   */
  async retrieveSubscription(
    request: import('../../types').SubscriptionRetrieveRequest
  ): Promise<import('../../types').SubscriptionRetrieveResponse> {
    try {
      const response = await this.sendRequest<any>(
        `/v2/subscription/subscriptions/${request.subscriptionReferenceCode}`,
        {}
      );

      return response;
    } catch (error: any) {
      return {
        status: 'failure',
        errorMessage: error.message || 'Subscription retrieve failed',
        errorCode: error.response?.data?.errorCode,
      };
    }
  }

  /**
   * Abonelik kartı güncelle (Checkout Form ile)
   */
  async updateSubscriptionCard(
    request: import('../../types').SubscriptionCardUpdateRequest
  ): Promise<import('../../types').SubscriptionCardUpdateResponse> {
    try {
      const iyzicoRequest = {
        locale: request.locale || this.config.locale || 'tr',
        conversationId: request.conversationId,
        subscriptionReferenceCode: request.subscriptionReferenceCode,
        callbackUrl: request.callbackUrl,
      };

      const response = await this.sendRequest<any>(
        '/v2/subscription/card-update/checkoutform/initialize',
        iyzicoRequest
      );

      return response;
    } catch (error: any) {
      return {
        status: 'failure',
        errorMessage: error.message || 'Card update initialization failed',
        errorCode: error.response?.data?.errorCode,
      };
    }
  }

  /**
   * Abonelik ürünü oluştur
   */
  async createSubscriptionProduct(
    request: import('../../types').SubscriptionProductCreateRequest
  ): Promise<import('../../types').SubscriptionProductResponse> {
    try {
      const iyzicoRequest = {
        locale: request.locale || this.config.locale || 'tr',
        conversationId: request.conversationId,
        name: request.name,
        description: request.description,
      };

      const response = await this.sendRequest<any>('/v2/subscription/products', iyzicoRequest);

      return response;
    } catch (error: any) {
      return {
        status: 'failure',
        errorMessage: error.message || 'Product creation failed',
        errorCode: error.response?.data?.errorCode,
      };
    }
  }

  /**
   * Fiyatlandırma planı oluştur
   */
  async createPricingPlan(
    request: import('../../types').PricingPlanCreateRequest
  ): Promise<import('../../types').PricingPlanResponse> {
    try {
      const iyzicoRequest = {
        locale: request.locale || this.config.locale || 'tr',
        conversationId: request.conversationId,
        productReferenceCode: request.productReferenceCode,
        name: request.name,
        price: request.price,
        currency: request.currency || 'TRY',
        paymentInterval: request.paymentInterval,
        paymentIntervalCount: request.paymentIntervalCount,
        trialPeriodDays: request.trialPeriodDays,
        recurrenceCount: request.recurrenceCount,
      };

      const response = await this.sendRequest<any>(
        `/v2/subscription/products/${request.productReferenceCode}/pricing-plans`,
        iyzicoRequest
      );

      return response;
    } catch (error: any) {
      return {
        status: 'failure',
        errorMessage: error.message || 'Pricing plan creation failed',
        errorCode: error.response?.data?.errorCode,
      };
    }
  }

  /**
   * BIN sorgulama
   */
  async binCheck(binNumber: string): Promise<BinCheckResponse> {
    const request: IyzicoBinCheckRequest = {
      locale: this.config.locale,
      conversationId: '123456789',
      binNumber: binNumber,
    };

    const response = await this.sendRequest<IyzicoBinCheckResponse>('/payment/bin/check', request);

    if (response.status !== 'success') {
      throw new Error(response.errorMessage || 'BIN check failed');
    }

    return {
      binNumber: response.binNumber || binNumber,
      cardType: response.cardType || '',
      cardAssociation: response.cardAssociation || '',
      cardFamily: response.cardFamily || '',
      bankName: response.bankName || '',
      bankCode: response.bankCode || 0,
      commercial: response.commercial === 1,
      rawResponse: response,
    };
  }

  /**
   * ===================
   * PWI (Payment With IBAN - Korumalı Havale/EFT) METHODS
   * ===================
   */

  /**
   * PWI request'ini İyzico formatına çevir
   */
  private mapToPWIRequest(request: PWIPaymentRequest): IyzicoPWIPaymentRequest {
    return {
      locale: this.config.locale || 'tr',
      conversationId: request.conversationId,
      price: request.price,
      paidPrice: request.paidPrice,
      currency: request.currency,
      basketId: request.basketId,
      paymentGroup: 'PRODUCT',
      callbackUrl: request.callbackUrl,
      buyer: {
        id: request.buyer.id,
        name: request.buyer.name,
        surname: request.buyer.surname,
        gsmNumber: request.buyer.gsmNumber,
        email: request.buyer.email,
        identityNumber: request.buyer.identityNumber,
        registrationAddress: request.buyer.registrationAddress,
        ip: request.buyer.ip,
        city: request.buyer.city,
        country: request.buyer.country,
        zipCode: request.buyer.zipCode,
      },
      shippingAddress: {
        contactName: request.shippingAddress.contactName,
        city: request.shippingAddress.city,
        country: request.shippingAddress.country,
        address: request.shippingAddress.address,
        zipCode: request.shippingAddress.zipCode,
      },
      billingAddress: {
        contactName: request.billingAddress.contactName,
        city: request.billingAddress.city,
        country: request.billingAddress.country,
        address: request.billingAddress.address,
        zipCode: request.billingAddress.zipCode,
      },
      basketItems: request.basketItems.map((item) => ({
        id: item.id,
        name: item.name,
        category1: item.category1,
        category2: item.category2,
        itemType: item.itemType,
        price: item.price,
      })),
    };
  }

  /**
   * PWI Ödeme Başlat
   *
   * Korumalı havale/EFT ile ödeme başlatır. Kullanıcıya IBAN numarası ve ödeme bilgileri gösterilir.
   * Kullanıcı havale yaptıktan sonra, ödeme onaylandığında satıcıya aktarılır.
   *
   * @param request - PWI ödeme isteği parametreleri
   * @returns PWI ödeme başlatma yanıtı (HTML içeriği, token, ödeme sayfası URL'i)
   *
   * @example
   * ```typescript
   * const result = await iyzico.initPWIPayment({
   *   price: '100.00',
   *   paidPrice: '100.00',
   *   currency: Currency.TRY,
   *   basketId: 'B67832',
   *   callbackUrl: 'https://your-site.com/payment/callback',
   *   buyer: { ... },
   *   shippingAddress: { ... },
   *   billingAddress: { ... },
   *   basketItems: [ ... ]
   * });
   *
   * if (result.status === 'success') {
   *   // Option 1: HTML içeriğini göster
   *   document.body.innerHTML = result.htmlContent;
   *
   *   // Option 2: Ödeme sayfasına yönlendir
   *   window.location.href = result.paymentPageUrl;
   * }
   * ```
   */
  async initPWIPayment(request: PWIPaymentRequest): Promise<PWIPaymentInitResponse> {
    try {
      const iyzicoRequest = this.mapToPWIRequest(request);

      const response = await this.sendRequest<IyzicoPWIPaymentInitResponse>(
        '/payment/iyzipos/item/initialize',
        iyzicoRequest
      );

      return {
        status: this.mapStatus(response.status),
        htmlContent: response.htmlContent,
        token: response.token,
        tokenExpireTime: response.tokenExpireTime,
        paymentPageUrl: response.paymentPageUrl,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'PWI payment initialization failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * PWI Ödeme Sorgula
   *
   * Başlatılmış PWI ödemesinin durumunu sorgular.
   * Havale yapıldıysa ödeme bilgilerini, yapılmadıysa IBAN ve banka bilgilerini döndürür.
   *
   * @param token - PWI ödeme token'ı (initPWIPayment metodundan döner)
   * @param conversationId - Opsiyonel conversation ID
   * @returns PWI ödeme durumu ve detayları
   *
   * @example
   * ```typescript
   * const result = await iyzico.retrievePWIPayment(token);
   *
   * if (result.status === 'success') {
   *   if (result.paymentStatus === 'SUCCESS') {
   *     console.log('Ödeme başarılı:', result.paymentId);
   *   } else if (result.paymentStatus === 'WAITING') {
   *     console.log('Havale bekleniyor');
   *     console.log('IBAN:', result.iban);
   *     console.log('Banka:', result.bankName);
   *   }
   * }
   * ```
   */
  async retrievePWIPayment(
    token: string,
    conversationId?: string
  ): Promise<PWIPaymentRetrieveResponse> {
    try {
      const response = await this.sendRequest<IyzicoPWIPaymentRetrieveResponse>(
        '/payment/iyzipos/item/detail',
        {
          locale: this.config.locale || 'tr',
          conversationId: conversationId,
          token: token,
        }
      );

      return {
        status: this.mapStatus(response.status),
        token: response.token,
        callbackUrl: response.callbackUrl,
        paymentStatus: response.paymentStatus,
        paymentId: response.paymentId,
        price: response.price,
        paidPrice: response.paidPrice,
        currency: response.currency,
        basketId: response.basketId,
        merchantCommissionRate: response.merchantCommissionRate,
        merchantCommissionRateAmount: response.merchantCommissionRateAmount,
        iyziCommissionRateAmount: response.iyziCommissionRateAmount,
        iyziCommissionFee: response.iyziCommissionFee,
        iban: response.iban,
        bankName: response.bankName,
        buyerName: response.buyerName,
        buyerSurname: response.buyerSurname,
        buyerEmail: response.buyerEmail,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'PWI payment retrieve failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * ===================
   * INSTALLMENT (Taksit) METHODS
   * ===================
   */

  /**
   * Taksit Sorgulama
   *
   * Belirli bir BIN numarası ve tutar için kullanılabilir taksit seçeneklerini sorgular.
   * Her banka için farklı taksit oranlarını ve toplam tutarları gösterir.
   *
   * @param request - Taksit sorgulama isteği (BIN numarası ve tutar)
   * @returns Taksit seçenekleri ve detayları
   *
   * @example
   * ```typescript
   * const result = await iyzico.installmentInfo({
   *   binNumber: '552879',
   *   price: '100.00'
   * });
   *
   * if (result.status === 'success' && result.installmentDetails) {
   *   result.installmentDetails.forEach(detail => {
   *     console.log(`Banka: ${detail.bankName}`);
   *     console.log(`Kart Ailesi: ${detail.cardFamilyName}`);
   *     detail.installmentPrices.forEach(installment => {
   *       console.log(`${installment.installmentNumber} taksit: ${installment.totalPrice} TL (Taksit başına: ${installment.installmentPrice} TL)`);
   *     });
   *   });
   * }
   * ```
   */
  async installmentInfo(request: InstallmentInfoRequest): Promise<InstallmentInfoResponse> {
    try {
      const iyzicoRequest: IyzicoInstallmentInfoRequest = {
        locale: this.config.locale || 'tr',
        conversationId: request.conversationId,
        binNumber: request.binNumber,
        price: request.price,
      };

      const response = await this.sendRequest<IyzicoInstallmentInfoResponse>(
        '/payment/iyzipos/installment',
        iyzicoRequest
      );

      return {
        status: this.mapStatus(response.status),
        installmentDetails: response.installmentDetails,
        conversationId: response.conversationId,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Installment info request failed',
        rawResponse: error.response?.data,
      };
    }
  }
}
