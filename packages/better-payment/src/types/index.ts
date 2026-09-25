export { PaymentStatus } from './common';
export type { PaymentCard, Address } from './common';
import { PaymentStatus, PaymentCard, Address } from './common';

/**
 * Para birimi
 */
export enum Currency {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

/**
 * Alıcı bilgileri
 */
export interface Buyer {
  id: string;
  name: string;
  surname: string;
  email: string;
  identityNumber: string;
  registrationAddress: string;
  city: string;
  country: string;
  zipCode?: string;
  ip: string;
  gsmNumber: string;
}

/**
 * Sepet item tipi
 */
export enum BasketItemType {
  PHYSICAL = 'PHYSICAL',
  VIRTUAL = 'VIRTUAL',
}

/**
 * Sepet item
 */
export interface BasketItem {
  id: string;
  name: string;
  category1: string;
  category2?: string;
  itemType: BasketItemType | string;
  price: string;
}

/**
 * Ödeme isteği parametreleri
 */
export interface PaymentRequest {
  price: string;
  paidPrice: string;
  currency: Currency | string;
  basketId: string;
  paymentCard: PaymentCard;
  buyer: Buyer;
  shippingAddress: Address;
  billingAddress: Address;
  basketItems: BasketItem[];
  callbackUrl?: string;
  /**
   * Sipariş/işlem numarası. Banka ve PayTR entegrasyonlarında sipariş numarası
   * olarak kullanılır; verilmezse otomatik (alfanümerik) üretilir ve yanıtta döner.
   */
  conversationId?: string;
  /** Taksit sayısı (1 = tek çekim) */
  installment?: number;
}

/**
 * Ödeme yanıtı
 */
export interface PaymentResponse {
  status: PaymentStatus;
  paymentId?: string;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
  rawResponse?: unknown;
}

/**
 * 3D Secure ödeme isteği
 */
export interface ThreeDSPaymentRequest extends PaymentRequest {
  callbackUrl: string;
}

/**
 * 3D Secure ödeme başlatma yanıtı
 */
export interface ThreeDSInitResponse {
  status: PaymentStatus;
  /** HTML to render in the customer's browser (3D form, iframe page or auto-submit form) */
  threeDSHtmlContent?: string;
  /** Payment page URL when the provider supports redirecting instead of rendering HTML */
  redirectUrl?: string;
  paymentId?: string;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

/**
 * İade isteği
 */
export interface RefundRequest {
  paymentId: string;
  price: string;
  currency: Currency | string;
  ip: string;
  conversationId?: string;
}

/**
 * İade yanıtı
 */
export interface RefundResponse {
  status: PaymentStatus;
  refundId?: string;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

/**
 * İptal isteği
 */
export interface CancelRequest {
  paymentId: string;
  ip: string;
  conversationId?: string;
  /**
   * İşlemin toplam tutarı. İptal için tutar isteyen sağlayıcılarda (Parampos,
   * Akbank) kullanılır; verilmezse mümkünse sorgulanır.
   */
  price?: string;
  currency?: Currency | string;
}

/**
 * İptal yanıtı
 */
export interface CancelResponse {
  status: PaymentStatus;
  transactionId?: string;
  voidId?: string;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

/**
 * BIN sorgulama yanıtı
 */
export interface BinCheckResponse {
  binNumber: string;
  cardType: string;
  cardAssociation: string;
  cardFamily: string;
  bankName: string;
  bankCode: number;
  commercial: boolean;
  rawResponse?: unknown;
}

/**
 * Checkout Form isteği
 */
export interface CheckoutFormRequest {
  price: string;
  paidPrice: string;
  currency: Currency | string;
  basketId: string;
  callbackUrl: string;
  enabledInstallments?: number[];
  buyer: Buyer;
  shippingAddress: Address;
  billingAddress: Address;
  basketItems: BasketItem[];
  conversationId?: string;
}

/**
 * Checkout Form başlatma yanıtı
 */
export interface CheckoutFormInitResponse {
  status: PaymentStatus;
  checkoutFormContent?: string;
  paymentPageUrl?: string;
  token?: string;
  tokenExpireTime?: number;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

/**
 * Checkout Form sonuç yanıtı
 */
export interface CheckoutFormRetrieveResponse {
  status: PaymentStatus;
  paymentId?: string;
  paymentStatus?: string;
  price?: number;
  paidPrice?: number;
  currency?: string;
  basketId?: string;
  installment?: number;
  binNumber?: string;
  lastFourDigits?: string;
  cardType?: string;
  cardAssociation?: string;
  cardFamily?: string;
  cardToken?: string;
  cardUserKey?: string;
  fraudStatus?: number;
  merchantCommissionRate?: number;
  merchantCommissionRateAmount?: number;
  iyziCommissionRateAmount?: number;
  iyziCommissionFee?: number;
  paymentTransactionId?: string;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

/**
 * PWI (Payment With IBAN - Korumalı Havale/EFT) İsteği
 */
export interface PWIPaymentRequest {
  price: string;
  paidPrice: string;
  currency: Currency | string;
  basketId: string;
  callbackUrl: string;
  buyer: Buyer;
  shippingAddress: Address;
  billingAddress: Address;
  basketItems: BasketItem[];
  conversationId?: string;
}

/**
 * PWI Ödeme Başlatma Yanıtı
 */
export interface PWIPaymentInitResponse {
  status: PaymentStatus;
  htmlContent?: string; // Müşteriye gösterilecek HTML içeriği
  token?: string;
  tokenExpireTime?: number;
  paymentPageUrl?: string; // Ödeme sayfası URL'i
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

/**
 * PWI Ödeme Durumu
 */
export enum PWIPaymentStatus {
  WAITING = 'WAITING', // Havale bekleniyor
  SUCCESS = 'SUCCESS', // Havale başarılı
  FAILURE = 'FAILURE', // Havale başarısız/iptal edildi
}

/**
 * PWI Ödeme Sorgulama Yanıtı
 */
export interface PWIPaymentRetrieveResponse {
  status: PaymentStatus;
  token?: string;
  callbackUrl?: string;
  paymentStatus?: PWIPaymentStatus | string;
  paymentId?: string;
  price?: number;
  paidPrice?: number;
  currency?: string;
  basketId?: string;
  merchantCommissionRate?: number;
  merchantCommissionRateAmount?: number;
  iyziCommissionRateAmount?: number;
  iyziCommissionFee?: number;
  iban?: string; // Havale yapılacak IBAN
  bankName?: string; // Banka adı
  buyerName?: string;
  buyerSurname?: string;
  buyerEmail?: string;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

/**
 * Taksit Detay Bilgisi
 */
export interface InstallmentDetail {
  installmentNumber: number; // Taksit sayısı (1 = tek çekim)
  totalPrice: number; // Toplam tutar
  installmentPrice: number; // Taksit başına tutar
}

/**
 * Taksit Bilgisi (Banka Bazında)
 */
export interface InstallmentPrice {
  binNumber: string; // Kart BIN numarası
  price: number; // Fiyat
  cardType: string; // Kart tipi (CREDIT_CARD, DEBIT_CARD)
  cardAssociation: string; // Kart kuruluşu (VISA, MASTER_CARD, TROY, AMEX)
  cardFamilyName: string; // Kart ailesi adı (Bonus, Maximum, Axess, World, vb.)
  force3ds?: number; // 3DS zorunluluğu (0: hayır, 1: evet)
  bankCode: number; // Banka kodu
  bankName: string; // Banka adı
  forceCvc?: number; // CVC zorunluluğu (0: hayır, 1: evet)
  commercial: number; // Ticari kart mı (0: hayır, 1: evet)
  installmentPrices: InstallmentDetail[]; // Taksit detayları
}

/**
 * Taksit Sorgulama İsteği
 */
export interface InstallmentInfoRequest {
  binNumber: string; // Kredi kartı BIN numarası (ilk 6-8 hane)
  price: string; // Ödeme tutarı
  conversationId?: string; // İsteğe bağlı conversation ID
}

/**
 * Taksit Sorgulama Yanıtı
 */
export interface InstallmentInfoResponse {
  status: PaymentStatus;
  installmentDetails?: InstallmentPrice[]; // Taksit detayları
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: unknown;
}

// Export subscription types
export * from './subscription';
