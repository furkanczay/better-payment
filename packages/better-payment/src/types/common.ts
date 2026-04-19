/**
 * Common types used across the library
 */

export interface PaymentCard {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  registerCard?: boolean | number;
}

export interface Address {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
}

/**
 * Payment status for tracking transaction states
 * @beta This is a beta feature
 */
export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Beta feature: Enhanced payment metadata
 * @beta
 */
export interface PaymentMetadata {
  /** Unique transaction identifier */
  transactionId?: string;
  /** Customer IP address */
  customerIp?: string;
  /** Additional custom data */
  customData?: Record<string, unknown>;
}
