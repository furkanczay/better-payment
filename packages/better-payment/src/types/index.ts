/**
 * Ödeme durumu enum'u
 */
export enum PaymentStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

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
 * Ödeme kartı bilgileri
 */
export interface PaymentCard {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  registerCard?: boolean;
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
 * Adres bilgileri
 */
export interface Address {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
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
  conversationId?: string;
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
  rawResponse?: any;
}

/**
 * 3D Secure ödeme isteği
 */
export interface ThreeDSPaymentRequest extends PaymentRequest {
  callbackUrl: string;
  installment?: number;
}

/**
 * 3D Secure ödeme başlatma yanıtı
 */
export interface ThreeDSInitResponse {
  status: PaymentStatus;
  threeDSHtmlContent?: string;
  paymentId?: string;
  conversationId?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: any;
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
  rawResponse?: any;
}

/**
 * İptal isteği
 */
export interface CancelRequest {
  paymentId: string;
  ip: string;
  conversationId?: string;
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
  rawResponse: unknown;
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
  rawResponse?: any;
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
  rawResponse?: any;
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
  rawResponse?: any;
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
  rawResponse?: any;
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
  rawResponse?: any;
}

// Export subscription types
export * from './subscription';
