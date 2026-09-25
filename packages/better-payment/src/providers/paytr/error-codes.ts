import { PaymentErrorCode } from '../../core/error-codes';

/**
 * PayTR `failed_reason_code` values sent with failed payment notifications.
 * Code 0 carries a free-text reason in `failed_reason_msg` and is not mapped.
 */
export const PAYTR_ERROR_CODES: Record<string, PaymentErrorCode> = {
  '1': PaymentErrorCode.THREEDS_FAILED, // authentication not completed
  '2': PaymentErrorCode.THREEDS_FAILED, // authentication failed
  '3': PaymentErrorCode.FRAUD_SUSPECTED, // not approved after security check
  '6': PaymentErrorCode.CANCELLED_BY_CUSTOMER, // customer left the payment page
  '8': PaymentErrorCode.CARD_DECLINED, // installments not allowed for this card
  '9': PaymentErrorCode.CARD_DECLINED, // card not permitted for this transaction
  '10': PaymentErrorCode.CARD_DECLINED, // 3D Secure required for this transaction
  '11': PaymentErrorCode.FRAUD_SUSPECTED, // security warning
  '99': PaymentErrorCode.PROVIDER_ERROR, // technical integration error
};
