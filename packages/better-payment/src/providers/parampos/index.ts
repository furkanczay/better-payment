/**
 * Parampos Payment Provider
 *
 * SOAP-based payment gateway integration for Turkish banks via Parampos
 */

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
  BinCheckResponse,
  PaymentStatus,
} from '../../types';
import {
  ParamposPaymentResponse,
  Parampos3DSInitResponse,
  Parampos3DSCallbackData,
  ParamposRefundResponse,
  ParamposCancelResponse,
  ParamposInquiryResponse,
  ParamposBinCheckResponse,
  ParamposStatus,
} from './types';
import {
  generateParamposPaymentHash,
  verifyParampos3DSCallback,
  mapCurrencyToParampos,
  formatParamposAmount,
  formatParamposExpiryMonth,
  formatParamposExpiryYear,
  buildParamposSoapEnvelope,
  parseParamposSoapResponse,
  buildParamposSecurityXml,
  buildParamposCardXml,
  calculateParamposTotalAmount,
  escapeXml,
} from './utils';

/**
 * Extended configuration for Parampos provider
 */
export interface ParamposConfig extends PaymentProviderConfig {
  /**
   * Merchant client code
   */
  clientCode: string;

  /**
   * Merchant client username
   */
  clientUsername: string;

  /**
   * Merchant client password (used as secretKey)
   */
  clientPassword: string;

  /**
   * Merchant GUID (used as apiKey)
   */
  guid: string;

  /**
   * Test mode flag
   */
  testMode?: boolean;
}

/**
 * Parampos Payment Provider
 *
 * Implements payment operations using Parampos SOAP API
 */
export class Parampos extends PaymentProvider {
  private client: AxiosInstance;
  private paramposConfig: ParamposConfig;

  constructor(config: ParamposConfig) {
    // Map Parampos-specific config to base config
    super({
      apiKey: config.guid,
      secretKey: config.clientPassword,
      baseUrl: config.baseUrl,
      locale: config.locale,
    });

    this.paramposConfig = config;
    this.validateParamposConfig();

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 60000, // SOAP requests can take longer
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
      },
    });
  }

  /**
   * Validate Parampos-specific configuration
   */
  private validateParamposConfig(): void {
    if (!this.paramposConfig.clientCode) {
      throw new Error('Parampos Client Code is required');
    }
    if (!this.paramposConfig.clientUsername) {
      throw new Error('Parampos Client Username is required');
    }
    if (!this.paramposConfig.clientPassword) {
      throw new Error('Parampos Client Password is required');
    }
    if (!this.paramposConfig.guid) {
      throw new Error('Parampos GUID is required');
    }
  }


  /**
   * Map Parampos status to unified PaymentStatus
   */
  private mapStatus(paramposStatus: string): PaymentStatus {
    switch (paramposStatus) {
      case ParamposStatus.SUCCESS:
      case '1':
        return PaymentStatus.SUCCESS;
      case ParamposStatus.FAILURE:
      case '0':
        return PaymentStatus.FAILURE;
      default:
        return PaymentStatus.FAILURE;
    }
  }

  /**
   * Send SOAP request to Parampos API
   */
  private async sendSoapRequest<T>(
    soapAction: string,
    soapBody: string,
    resultTagName: string
  ): Promise<T> {
    try {
      const envelope = buildParamposSoapEnvelope(soapAction, soapBody);

      const response = await this.client.post('', envelope, {
        headers: {
          SOAPAction: `https://turkpos.com.tr/${soapAction}`,
        },
      });

      const result = parseParamposSoapResponse<T>(
        response.data,
        resultTagName
      );

      return result;
    } catch (error: any) {
      throw new Error(
        `Parampos SOAP request failed: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Create direct payment (without 3D Secure)
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const installment = 1; // Single payment
      const transactionAmount = formatParamposAmount(request.price);
      const totalAmount = formatParamposAmount(request.paidPrice);

      // Generate transaction hash
      const hash = generateParamposPaymentHash(
        this.paramposConfig.clientCode,
        this.paramposConfig.guid,
        installment,
        transactionAmount,
        totalAmount,
        request.basketId
      );

      // Build SOAP body
      const securityXml = buildParamposSecurityXml(
        this.paramposConfig.clientCode,
        this.paramposConfig.clientUsername,
        this.paramposConfig.clientPassword,
        this.paramposConfig.guid
      );

      const cardXml = buildParamposCardXml(
        request.paymentCard.cardHolderName,
        request.paymentCard.cardNumber,
        formatParamposExpiryMonth(request.paymentCard.expireMonth),
        formatParamposExpiryYear(request.paymentCard.expireYear),
        request.paymentCard.cvc,
        request.paymentCard.registerCard || false
      );

      const currencyCode = mapCurrencyToParampos(request.currency);

      const soapBody = `${securityXml}
  ${cardXml}
  <Taksit>${installment}</Taksit>
  <Islem_Tutar>${escapeXml(transactionAmount)}</Islem_Tutar>
  <Toplam_Tutar>${escapeXml(totalAmount)}</Toplam_Tutar>
  <Siparis_ID>${escapeXml(request.basketId)}</Siparis_ID>
  <Siparis_Aciklama>${escapeXml(request.basketId)}</Siparis_Aciklama>
  <Islem_Hash>${escapeXml(hash)}</Islem_Hash>
  <IPAdr>${escapeXml(request.buyer.ip)}</IPAdr>
  <Doviz_Kodu>${escapeXml(currencyCode)}</Doviz_Kodu>`;

      const response = await this.sendSoapRequest<ParamposPaymentResponse>(
        'TP_Islem_Odeme',
        soapBody,
        'TP_Islem_OdemeResult'
      );

      return {
        status: this.mapStatus(response.Sonuc),
        paymentId: response.Islem_GUID,
        conversationId: request.conversationId,
        errorCode: response.Hata_Kod,
        errorMessage:
          response.Sonuc === ParamposStatus.SUCCESS
            ? undefined
            : response.Sonuc_Str,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        conversationId: request.conversationId,
        errorMessage: error.message || 'Payment failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * Initialize 3D Secure payment
   */
  async initThreeDSPayment(
    request: ThreeDSPaymentRequest
  ): Promise<ThreeDSInitResponse> {
    try {
      const installment = request.installment || 1;
      const transactionAmount = formatParamposAmount(request.price);
      const totalAmount =
        installment > 1
          ? calculateParamposTotalAmount(request.price, installment)
          : formatParamposAmount(request.paidPrice);

      // Generate transaction hash
      const hash = generateParamposPaymentHash(
        this.paramposConfig.clientCode,
        this.paramposConfig.guid,
        installment,
        transactionAmount,
        totalAmount,
        request.basketId
      );

      // Build SOAP body
      const securityXml = buildParamposSecurityXml(
        this.paramposConfig.clientCode,
        this.paramposConfig.clientUsername,
        this.paramposConfig.clientPassword,
        this.paramposConfig.guid
      );

      const cardXml = buildParamposCardXml(
        request.paymentCard.cardHolderName,
        request.paymentCard.cardNumber,
        formatParamposExpiryMonth(request.paymentCard.expireMonth),
        formatParamposExpiryYear(request.paymentCard.expireYear),
        request.paymentCard.cvc,
        request.paymentCard.registerCard || false
      );

      const currencyCode = mapCurrencyToParampos(request.currency);

      const soapBody = `${securityXml}
  ${cardXml}
  <Taksit>${installment}</Taksit>
  <Islem_Tutar>${escapeXml(transactionAmount)}</Islem_Tutar>
  <Toplam_Tutar>${escapeXml(totalAmount)}</Toplam_Tutar>
  <Siparis_ID>${escapeXml(request.basketId)}</Siparis_ID>
  <Siparis_Aciklama>${escapeXml(request.basketId)}</Siparis_Aciklama>
  <Islem_Hash>${escapeXml(hash)}</Islem_Hash>
  <IPAdr>${escapeXml(request.buyer.ip)}</IPAdr>
  <SUCCESS_URL>${escapeXml(request.callbackUrl)}</SUCCESS_URL>
  <FAIL_URL>${escapeXml(request.callbackUrl)}</FAIL_URL>
  <Doviz_Kodu>${escapeXml(currencyCode)}</Doviz_Kodu>`;

      const response = await this.sendSoapRequest<Parampos3DSInitResponse>(
        'TP_Islem_Odeme_3D',
        soapBody,
        'TP_Islem_Odeme_3DResult'
      );

      if (response.Sonuc !== ParamposStatus.SUCCESS) {
        return {
          status: PaymentStatus.FAILURE,
          conversationId: request.conversationId,
          errorCode: response.Hata_Kod,
          errorMessage: response.Sonuc_Str,
          rawResponse: response,
        };
      }

      return {
        status: PaymentStatus.PENDING,
        threeDSHtmlContent: response.UCD_HTML,
        paymentId: response.Islem_GUID,
        conversationId: request.conversationId,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        conversationId: request.conversationId,
        errorMessage: error.message || '3D Secure initialization failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * Complete 3D Secure payment after callback
   */
  async completeThreeDSPayment(
    callbackData: Parampos3DSCallbackData
  ): Promise<PaymentResponse> {
    try {
      // Verify callback hash
      const isValid = verifyParampos3DSCallback(
        callbackData.islemGUID,
        callbackData.md,
        callbackData.mdStatus,
        callbackData.orderId,
        callbackData.GUID || this.paramposConfig.guid,
        callbackData.hash
      );

      if (!isValid) {
        return {
          status: PaymentStatus.FAILURE,
          errorMessage: 'Invalid 3D Secure callback signature',
          rawResponse: callbackData,
        };
      }

      // Check MD status (1 = success, others = failure)
      if (callbackData.mdStatus !== '1') {
        return {
          status: PaymentStatus.FAILURE,
          paymentId: callbackData.islemGUID,
          errorMessage: callbackData.Sonuc_Str || '3D Secure verification failed',
          rawResponse: callbackData,
        };
      }

      // Payment was successful after 3DS
      return {
        status: PaymentStatus.SUCCESS,
        paymentId: callbackData.islemGUID,
        rawResponse: callbackData,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || '3D Secure completion failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * Refund a payment
   */
  async refund(request: RefundRequest): Promise<RefundResponse> {
    try {
      const refundAmount = formatParamposAmount(request.price);

      // Build SOAP body
      const securityXml = buildParamposSecurityXml(
        this.paramposConfig.clientCode,
        this.paramposConfig.clientUsername,
        this.paramposConfig.clientPassword,
        this.paramposConfig.guid
      );

      const soapBody = `${securityXml}
  <Islem_GUID>${escapeXml(request.paymentId)}</Islem_GUID>
  <Iade_Tutar>${escapeXml(refundAmount)}</Iade_Tutar>
  <IPAdr>${escapeXml(request.ip)}</IPAdr>`;

      const response = await this.sendSoapRequest<ParamposRefundResponse>(
        'TP_Islem_Iade',
        soapBody,
        'TP_Islem_IadeResult'
      );

      return {
        status: this.mapStatus(response.Sonuc),
        refundId: response.Iade_Islem_GUID,
        conversationId: request.conversationId,
        errorCode: response.Hata_Kod,
        errorMessage:
          response.Sonuc === ParamposStatus.SUCCESS
            ? undefined
            : response.Sonuc_Str,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        conversationId: request.conversationId,
        errorMessage: error.message || 'Refund failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * Cancel a payment (void)
   */
  async cancel(request: CancelRequest): Promise<CancelResponse> {
    try {
      // Build SOAP body
      const securityXml = buildParamposSecurityXml(
        this.paramposConfig.clientCode,
        this.paramposConfig.clientUsername,
        this.paramposConfig.clientPassword,
        this.paramposConfig.guid
      );

      const soapBody = `${securityXml}
  <Islem_GUID>${escapeXml(request.paymentId)}</Islem_GUID>
  <IPAdr>${escapeXml(request.ip)}</IPAdr>`;

      const response = await this.sendSoapRequest<ParamposCancelResponse>(
        'TP_Islem_Iptal',
        soapBody,
        'TP_Islem_IptalResult'
      );

      return {
        status: this.mapStatus(response.Sonuc),
        conversationId: request.conversationId,
        errorCode: response.Hata_Kod,
        errorMessage:
          response.Sonuc === ParamposStatus.SUCCESS
            ? undefined
            : response.Sonuc_Str,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        conversationId: request.conversationId,
        errorMessage: error.message || 'Cancellation failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * Get payment details by ID
   */
  async getPayment(paymentId: string): Promise<PaymentResponse> {
    try {
      // Build SOAP body
      const securityXml = buildParamposSecurityXml(
        this.paramposConfig.clientCode,
        this.paramposConfig.clientUsername,
        this.paramposConfig.clientPassword,
        this.paramposConfig.guid
      );

      const soapBody = `${securityXml}
  <Islem_GUID>${escapeXml(paymentId)}</Islem_GUID>
  <IPAdr>127.0.0.1</IPAdr>`;

      const response = await this.sendSoapRequest<ParamposInquiryResponse>(
        'TP_Islem_Sorgulama',
        soapBody,
        'TP_Islem_SorgulamaResult'
      );

      return {
        status: this.mapStatus(response.Sonuc),
        paymentId: response.Islem_GUID,
        conversationId: response.Siparis_ID,
        errorCode: response.Hata_Kod,
        errorMessage:
          response.Sonuc === ParamposStatus.SUCCESS
            ? undefined
            : response.Sonuc_Str,
        rawResponse: response,
      };
    } catch (error: any) {
      return {
        status: PaymentStatus.FAILURE,
        errorMessage: error.message || 'Payment inquiry failed',
        rawResponse: error.response?.data,
      };
    }
  }

  /**
   * BIN check (card information inquiry)
   */
  async binCheck(binNumber: string): Promise<BinCheckResponse> {
    try {
      // Build SOAP body
      const securityXml = buildParamposSecurityXml(
        this.paramposConfig.clientCode,
        this.paramposConfig.clientUsername,
        this.paramposConfig.clientPassword,
        this.paramposConfig.guid
      );

      const soapBody = `${securityXml}
  <Bin>${escapeXml(binNumber)}</Bin>`;

      const response = await this.sendSoapRequest<ParamposBinCheckResponse>(
        'TP_Kart_Bilgi',
        soapBody,
        'TP_Kart_BilgiResult'
      );

      if (response.Sonuc !== ParamposStatus.SUCCESS) {
        throw new Error(response.Sonuc_Str || 'BIN check failed');
      }

      return {
        binNumber,
        cardType: response.Kart_Tip || '',
        cardAssociation: response.Kart_Aile || '',
        cardFamily: response.Kart_Aile || '',
        bankName: response.Kart_Banka || '',
        bankCode: 0,
        commercial: response.Ticari_Kart === '1',
        rawResponse: response,
      };
    } catch (error: any) {
      throw new Error(`BIN check for ${binNumber} not supported by this provider`);
    }
  }
}
