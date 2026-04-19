import {
  SubscriptionInitializeRequest,
  SubscriptionCancelRequest,
  SubscriptionUpgradeRequest,
  SubscriptionRetrieveRequest,
  SubscriptionCardUpdateRequest,
  SubscriptionProductCreateRequest,
  PricingPlanCreateRequest,
  SubscriptionStatus,
  PaymentInterval,
} from '../../src/types';
import { mockPaymentCard } from './payment-data';

/**
 * Mock subscription customer data
 */
export const mockSubscriptionCustomer = {
  name: 'John',
  surname: 'Doe',
  email: 'john.doe@example.com',
  gsmNumber: '+905350000000',
  identityNumber: '11111111111',
  billingAddress: {
    contactName: 'John Doe',
    city: 'Istanbul',
    country: 'Turkey',
    address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
    zipCode: '34732',
  },
};

/**
 * Mock subscription product create request
 */
export const mockSubscriptionProductRequest: SubscriptionProductCreateRequest = {
  locale: 'tr',
  conversationId: 'product-test-001',
  name: 'Test Premium Membership',
  description: 'Monthly premium membership package',
};

/**
 * Mock pricing plan create request
 */
export const mockPricingPlanRequest: PricingPlanCreateRequest = {
  locale: 'tr',
  conversationId: 'plan-test-001',
  productReferenceCode: 'test-product-ref-code',
  name: 'Monthly Plan',
  price: 99.90,
  currency: 'TRY',
  paymentInterval: PaymentInterval.MONTHLY,
  paymentIntervalCount: 1,
  trialPeriodDays: 7,
  recurrenceCount: 12,
};

/**
 * Mock subscription initialize request
 */
export const mockSubscriptionInitializeRequest: SubscriptionInitializeRequest = {
  locale: 'tr',
  conversationId: 'subscription-test-001',
  pricingPlanReferenceCode: 'test-plan-ref-code',
  subscriptionInitialStatus: SubscriptionStatus.ACTIVE,
  customer: mockSubscriptionCustomer,
  paymentCard: mockPaymentCard,
};

/**
 * Mock subscription cancel request
 */
export const mockSubscriptionCancelRequest: SubscriptionCancelRequest = {
  subscriptionReferenceCode: 'test-subscription-ref-code',
};

/**
 * Mock subscription upgrade request
 */
export const mockSubscriptionUpgradeRequest: SubscriptionUpgradeRequest = {
  subscriptionReferenceCode: 'test-subscription-ref-code',
  newPricingPlanReferenceCode: 'new-plan-ref-code',
  useTrial: false,
  resetRecurrenceCount: true,
};

/**
 * Mock subscription retrieve request
 */
export const mockSubscriptionRetrieveRequest: SubscriptionRetrieveRequest = {
  subscriptionReferenceCode: 'test-subscription-ref-code',
};

/**
 * Mock subscription card update request
 */
export const mockSubscriptionCardUpdateRequest: SubscriptionCardUpdateRequest = {
  locale: 'tr',
  conversationId: 'card-update-test-001',
  subscriptionReferenceCode: 'test-subscription-ref-code',
  callbackUrl: 'https://example.com/subscription/card-update/callback',
};
