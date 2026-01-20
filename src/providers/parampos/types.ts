/**
 * Parampos API Types
 *
 * Parampos uses SOAP-based API with specific Turkish field names
 */

/**
 * Base response interface for all Parampos API responses
 */
export interface ParamposBaseResponse {
  /**
   * Transaction result code (Success: "1", Failure: "0" or error codes)
   */
  Sonuc: string;

  /**
   * Response/error message in Turkish
   */
  Sonuc_Str: string;

  /**
   * Error code if transaction fails
   */
  Hata_Kod?: string;

  /**
   * Conversation/order ID
   */
  Siparis_ID?: string;
}

/**
 * Security credentials object required for all Parampos requests
 */
export interface ParamposSecurityCredentials {
  /**
   * Merchant client code
   */
  CLIENT_CODE: string;

  /**
   * Merchant client username
   */
  CLIENT_USERNAME: string;

  /**
   * Merchant client password
   */
  CLIENT_PASSWORD: string;

  /**
   * Merchant unique identifier (GUID)
   */
  GUID: string;
}

/**
 * Payment card information for Parampos
 */
export interface ParamposCard {
  /**
   * Card holder name
   */
  KK_Sahibi: string;

  /**
   * Card number
   */
  KK_No: string;

  /**
   * Card expiry month (MM)
   */
  KK_SK_Ay: string;

  /**
   * Card expiry year (YYYY)
   */
  KK_SK_Yil: string;

  /**
   * Card CVV code
   */
  KK_CVC: string;

  /**
   * Save card for future use (0: No, 1: Yes)
   */
  KK_Saklama_Durumu?: '0' | '1';
}

/**
 * Payment request for Parampos API
 */
export interface ParamposPaymentRequest {
  /**
   * Security credentials
   */
  G: ParamposSecurityCredentials;

  /**
   * Card information
   */
  KK_Bilgi: ParamposCard;

  /**
   * Number of installments (1 for single payment)
   */
  Taksit: number;

  /**
   * Transaction amount (decimal as string, e.g., "100.00")
   */
  Islem_Tutar: string;

  /**
   * Total amount including installment fees (decimal as string)
   */
  Toplam_Tutar: string;

  /**
   * Order/Basket ID (unique identifier)
   */
  Siparis_ID: string;

  /**
   * Order description
   */
  Siparis_Aciklama?: string;

  /**
   * Transaction hash (SHA256 Base64 encoded)
   */
  Islem_Hash: string;

  /**
   * Transaction ID (optional, auto-generated if not provided)
   */
  Islem_ID?: string;

  /**
   * Client IP address
   */
  IPAdr: string;

  /**
   * Reference number (optional)
   */
  Ref_No?: string;

  /**
   * Transaction type (optional, default: "Sale")
   */
  Islem_Turu?: string;

  /**
   * Currency code (TRY, USD, EUR, etc.)
   */
  Doviz_Kodu?: string;
}

/**
 * 3D Secure payment initialization request
 */
export interface Parampos3DSPaymentRequest {
  /**
   * Security credentials
   */
  G: ParamposSecurityCredentials;

  /**
   * Card information
   */
  KK_Bilgi: ParamposCard;

  /**
   * Number of installments
   */
  Taksit: number;

  /**
   * Transaction amount
   */
  Islem_Tutar: string;

  /**
   * Total amount
   */
  Toplam_Tutar: string;

  /**
   * Order ID
   */
  Siparis_ID: string;

  /**
   * Order description
   */
  Siparis_Aciklama?: string;

  /**
   * Transaction hash
   */
  Islem_Hash: string;

  /**
   * Client IP address
   */
  IPAdr: string;

  /**
   * Return URL for 3D Secure callback
   */
  Data1?: string;

  /**
   * Additional data 2
   */
  Data2?: string;

  /**
   * Additional data 3
   */
  Data3?: string;

  /**
   * Success URL (callback after successful 3DS)
   */
  SUCCESS_URL: string;

  /**
   * Failure URL (callback after failed 3DS)
   */
  FAIL_URL: string;

  /**
   * Currency code
   */
  Doviz_Kodu?: string;
}

/**
 * Response from payment request
 */
export interface ParamposPaymentResponse extends ParamposBaseResponse {
  /**
   * Transaction GUID
   */
  Islem_GUID?: string;

  /**
   * Transaction ID
   */
  Islem_ID?: string;

  /**
   * Bank response code
   */
  Banka_Sonuc_Kod?: string;

  /**
   * Bank response message
   */
  Banka_Sonuc_Str?: string;

  /**
   * Authorization code from bank
   */
  Otorizasyon_Kodu?: string;

  /**
   * Masked card number
   */
  Kredi_Karti_No?: string;

  /**
   * Transaction date
   */
  Tarih?: string;

  /**
   * Transaction amount
   */
  Tutar?: string;

  /**
   * Reference number
   */
  Ref_No?: string;
}

/**
 * Response from 3D Secure initialization
 */
export interface Parampos3DSInitResponse extends ParamposBaseResponse {
  /**
   * 3D Secure HTML content (Base64 encoded form)
   */
  UCD_HTML?: string;

  /**
   * Transaction GUID for verification
   */
  Islem_GUID?: string;

  /**
   * Session ID for 3DS
   */
  Session_ID?: string;
}

/**
 * 3D Secure callback data from bank
 */
export interface Parampos3DSCallbackData {
  /**
   * Transaction GUID
   */
  islemGUID: string;

  /**
   * MD parameter from 3DS
   */
  md: string;

  /**
   * MD status code
   */
  mdStatus: string;

  /**
   * Order ID
   */
  orderId: string;

  /**
   * Merchant GUID
   */
  GUID: string;

  /**
   * Hash value for verification (SHA1 Base64)
   */
  hash: string;

  /**
   * Bank response code
   */
  Sonuc?: string;

  /**
   * Bank response message
   */
  Sonuc_Str?: string;
}

/**
 * Refund request
 */
export interface ParamposRefundRequest {
  /**
   * Security credentials
   */
  G: ParamposSecurityCredentials;

  /**
   * Original transaction GUID to refund
   */
  Islem_GUID: string;

  /**
   * Refund amount (decimal as string)
   */
  Iade_Tutar: string;

  /**
   * Client IP address
   */
  IPAdr: string;

  /**
   * Refund reason/description
   */
  Aciklama?: string;
}

/**
 * Refund response
 */
export interface ParamposRefundResponse extends ParamposBaseResponse {
  /**
   * Refund transaction GUID
   */
  Iade_Islem_GUID?: string;

  /**
   * Original transaction GUID
   */
  Islem_GUID?: string;

  /**
   * Refund amount
   */
  Iade_Tutar?: string;

  /**
   * Refund date
   */
  Tarih?: string;
}

/**
 * Cancel (void) request
 */
export interface ParamposCancelRequest {
  /**
   * Security credentials
   */
  G: ParamposSecurityCredentials;

  /**
   * Transaction GUID to cancel
   */
  Islem_GUID: string;

  /**
   * Client IP address
   */
  IPAdr: string;

  /**
   * Cancellation reason/description
   */
  Aciklama?: string;
}

/**
 * Cancel response
 */
export interface ParamposCancelResponse extends ParamposBaseResponse {
  /**
   * Cancelled transaction GUID
   */
  Islem_GUID?: string;

  /**
   * Cancellation date
   */
  Tarih?: string;
}

/**
 * Transaction inquiry request
 */
export interface ParamposInquiryRequest {
  /**
   * Security credentials
   */
  G: ParamposSecurityCredentials;

  /**
   * Transaction GUID to query
   */
  Islem_GUID?: string;

  /**
   * Order ID to query (alternative to Islem_GUID)
   */
  Siparis_ID?: string;

  /**
   * Client IP address
   */
  IPAdr: string;
}

/**
 * Transaction inquiry response
 */
export interface ParamposInquiryResponse extends ParamposBaseResponse {
  /**
   * Transaction GUID
   */
  Islem_GUID?: string;

  /**
   * Order ID
   */
  Siparis_ID?: string;

  /**
   * Transaction status
   */
  Durum?: string;

  /**
   * Transaction amount
   */
  Tutar?: string;

  /**
   * Transaction date
   */
  Tarih?: string;

  /**
   * Authorization code
   */
  Otorizasyon_Kodu?: string;

  /**
   * Bank response code
   */
  Banka_Sonuc_Kod?: string;

  /**
   * Masked card number
   */
  Kredi_Karti_No?: string;
}

/**
 * BIN check request (card information inquiry)
 */
export interface ParamposBinCheckRequest {
  /**
   * Security credentials
   */
  G: ParamposSecurityCredentials;

  /**
   * BIN number (first 6 digits of card)
   */
  Bin: string;
}

/**
 * BIN check response
 */
export interface ParamposBinCheckResponse extends ParamposBaseResponse {
  /**
   * Card type (CREDIT, DEBIT, PREPAID)
   */
  Kart_Tip?: string;

  /**
   * Card brand (VISA, MASTERCARD, AMEX, etc.)
   */
  Kart_Banka?: string;

  /**
   * Is commercial card (0: No, 1: Yes)
   */
  Ticari_Kart?: '0' | '1';

  /**
   * Card family/program
   */
  Kart_Aile?: string;
}

/**
 * Installment inquiry request
 */
export interface ParamposInstallmentRequest {
  /**
   * Security credentials
   */
  G: ParamposSecurityCredentials;

  /**
   * BIN number (first 6 digits)
   */
  Bin: string;

  /**
   * Transaction amount
   */
  Tutar: string;
}

/**
 * Single installment detail
 */
export interface ParamposInstallmentDetail {
  /**
   * Number of installments
   */
  Taksit_Sayisi: number;

  /**
   * Installment amount per month
   */
  Taksit_Tutari: string;

  /**
   * Total amount with installment fees
   */
  Toplam_Tutar: string;

  /**
   * Installment fee rate
   */
  Oran: string;
}

/**
 * Installment inquiry response
 */
export interface ParamposInstallmentResponse extends ParamposBaseResponse {
  /**
   * List of available installment options
   */
  Taksit_Bilgileri?: ParamposInstallmentDetail[];

  /**
   * Card brand
   */
  Kart_Banka?: string;
}

/**
 * Parampos status codes
 */
export enum ParamposStatus {
  SUCCESS = '1',
  FAILURE = '0',
  ERROR = '-1',
}

/**
 * Parampos currency codes
 */
export enum ParamposCurrency {
  TRY = 'TL',
  USD = 'US',
  EUR = 'EU',
  GBP = 'GB',
}
