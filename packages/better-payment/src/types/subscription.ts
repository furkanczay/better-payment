/**
 * Subscription Types
 *
 * İyzico abonelik ödeme sistemi için type tanımları
 */

import { Address, PaymentCard } from './common';

/**
 * Abonelik durumları
 */
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  UNPAID = 'UNPAID',
}

/**
 * Ödeme aralığı türleri
 */
export enum PaymentInterval {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

/**
 * Abonelik müşteri bilgileri
 */
export interface SubscriptionCustomer {
  name: string;
  surname: string;
  email: string;
  gsmNumber: string;
  identityNumber: string;
  billingAddress: Address;
  shippingAddress?: Address;
}

/**
 * Abonelik başlatma isteği
 */
export interface SubscriptionInitializeRequest {
  locale?: string;
  conversationId?: string;
  pricingPlanReferenceCode: string;
  subscriptionInitialStatus: SubscriptionStatus.ACTIVE | SubscriptionStatus.PENDING;
  customer: SubscriptionCustomer;
  paymentCard: PaymentCard;
}

/**
 * Abonelik başlatma yanıtı
 */
export interface SubscriptionInitializeResponse {
  status: 'success' | 'failure';
  systemTime?: number;
  errorCode?: string;
  errorMessage?: string;
  data?: {
    referenceCode: string;
    parentReferenceCode?: string;
    pricingPlanReferenceCode: string;
    customerReferenceCode: string;
    subscriptionStatus: SubscriptionStatus;
    trialDays?: number;
    trialStartDate?: number;
    trialEndDate?: number;
    createdDate: number;
    startDate: number;
    endDate?: number;
  };
}

/**
 * Abonelik iptal isteği
 */
export interface SubscriptionCancelRequest {
  subscriptionReferenceCode: string;
}

/**
 * Abonelik iptal yanıtı
 */
export interface SubscriptionCancelResponse {
  status: 'success' | 'failure';
  systemTime?: number;
  errorCode?: string;
  errorMessage?: string;
  data?: {
    referenceCode: string;
    subscriptionStatus: SubscriptionStatus;
  };
}

/**
 * Abonelik yükseltme isteği
 */
export interface SubscriptionUpgradeRequest {
  subscriptionReferenceCode: string;
  newPricingPlanReferenceCode: string;
  useTrial?: boolean;
  resetRecurrenceCount?: boolean;
}

/**
 * Abonelik yükseltme yanıtı
 */
export interface SubscriptionUpgradeResponse {
  status: 'success' | 'failure';
  systemTime?: number;
  errorCode?: string;
  errorMessage?: string;
  data?: {
    referenceCode: string;
    pricingPlanReferenceCode: string;
    subscriptionStatus: SubscriptionStatus;
  };
}

/**
 * Abonelik detay sorgulama isteği
 */
export interface SubscriptionRetrieveRequest {
  subscriptionReferenceCode: string;
}

/**
 * Abonelik detay sorgulama yanıtı
 */
export interface SubscriptionRetrieveResponse {
  status: 'success' | 'failure';
  systemTime?: number;
  errorCode?: string;
  errorMessage?: string;
  data?: {
    referenceCode: string;
    parentReferenceCode?: string;
    pricingPlanReferenceCode: string;
    pricingPlanName: string;
    customerReferenceCode: string;
    subscriptionStatus: SubscriptionStatus;
    trialDays?: number;
    trialStartDate?: number;
    trialEndDate?: number;
    createdDate: number;
    startDate: number;
    endDate?: number;
  };
}

/**
 * Kart güncelleme isteği (Checkout Form ile)
 */
export interface SubscriptionCardUpdateRequest {
  locale?: string;
  conversationId?: string;
  subscriptionReferenceCode: string;
  callbackUrl: string;
}

/**
 * Kart güncelleme yanıtı
 */
export interface SubscriptionCardUpdateResponse {
  status: 'success' | 'failure';
  systemTime?: number;
  errorCode?: string;
  errorMessage?: string;
  token?: string;
  checkoutFormContent?: string;
  tokenExpireTime?: number;
  paymentPageUrl?: string;
}

/**
 * Abonelik ürünü oluşturma isteği
 */
export interface SubscriptionProductCreateRequest {
  locale?: string;
  conversationId?: string;
  name: string;
  description?: string;
}

/**
 * Abonelik ürünü yanıtı
 */
export interface SubscriptionProductResponse {
  status: 'success' | 'failure';
  systemTime?: number;
  errorCode?: string;
  errorMessage?: string;
  data?: {
    referenceCode: string;
    name: string;
    description?: string;
    createdDate: number;
  };
}

/**
 * Fiyatlandırma planı oluşturma isteği
 */
export interface PricingPlanCreateRequest {
  locale?: string;
  conversationId?: string;
  productReferenceCode: string;
  name: string;
  price: number;
  currency?: string;
  paymentInterval: PaymentInterval;
  paymentIntervalCount: number;
  trialPeriodDays?: number;
  recurrenceCount?: number;
}

/**
 * Fiyatlandırma planı yanıtı
 */
export interface PricingPlanResponse {
  status: 'success' | 'failure';
  systemTime?: number;
  errorCode?: string;
  errorMessage?: string;
  data?: {
    referenceCode: string;
    productReferenceCode: string;
    name: string;
    price: number;
    currency: string;
    paymentInterval: PaymentInterval;
    paymentIntervalCount: number;
    trialPeriodDays?: number;
    recurrenceCount?: number;
    createdDate: number;
  };
}
