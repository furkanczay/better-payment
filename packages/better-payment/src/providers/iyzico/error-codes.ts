import { PaymentErrorCode } from '../../core/error-codes';

/**
 * iyzico payment error codes (the codes returned for iyzico's documented
 * sandbox test cards). Validation codes of the API are not listed; they
 * resolve to UNKNOWN and keep the raw code in `errorCode`.
 */
export const IYZICO_ERROR_CODES: Record<string, PaymentErrorCode> = {
  '10051': PaymentErrorCode.INSUFFICIENT_FUNDS, // not sufficient funds
  '10005': PaymentErrorCode.CARD_DECLINED, // do not honour
  '10012': PaymentErrorCode.CARD_DECLINED, // invalid transaction
  '10041': PaymentErrorCode.FRAUD_SUSPECTED, // lost card
  '10043': PaymentErrorCode.FRAUD_SUSPECTED, // stolen card
  '10054': PaymentErrorCode.EXPIRED_CARD, // expired card
  '10084': PaymentErrorCode.INVALID_CVC, // invalid CVC2
  '10057': PaymentErrorCode.CARD_DECLINED, // not permitted to cardholder
  '10058': PaymentErrorCode.PROVIDER_ERROR, // not permitted to terminal
  '10034': PaymentErrorCode.FRAUD_SUSPECTED, // fraud suspect
  '10093': PaymentErrorCode.CARD_DECLINED, // card blocked for online payments
  '10201': PaymentErrorCode.CARD_DECLINED, // card not permitted
  '10204': PaymentErrorCode.PROVIDER_ERROR, // general payment error
  '10206': PaymentErrorCode.INVALID_CVC, // invalid CVC length
  '10207': PaymentErrorCode.CARD_DECLINED, // refer to issuer
  '10208': PaymentErrorCode.PROVIDER_ERROR, // invalid merchant category code
  '10209': PaymentErrorCode.CARD_DECLINED, // blocked card
  '10210': PaymentErrorCode.THREEDS_FAILED, // invalid CAVV
  '10211': PaymentErrorCode.THREEDS_FAILED, // invalid ECI
  '10213': PaymentErrorCode.INVALID_CARD, // BIN not found
  '10214': PaymentErrorCode.PROVIDER_ERROR, // communication or system error
  '10215': PaymentErrorCode.INVALID_CARD, // invalid card number
  '10216': PaymentErrorCode.INVALID_CARD, // no such issuer
  '10217': PaymentErrorCode.CARD_DECLINED, // debit cards require 3D Secure
  '10219': PaymentErrorCode.PROVIDER_ERROR, // request to the bank timed out
  '10222': PaymentErrorCode.PROVIDER_ERROR, // terminal not configured for installments
  '10223': PaymentErrorCode.PROVIDER_ERROR, // end of day processing required
  '10225': PaymentErrorCode.CARD_DECLINED, // restricted card
  '10226': PaymentErrorCode.LIMIT_EXCEEDED, // PIN tries exceeded
  '10227': PaymentErrorCode.CARD_DECLINED, // invalid PIN
  '10228': PaymentErrorCode.PROVIDER_ERROR, // issuer or switch inoperative
  '10229': PaymentErrorCode.EXPIRED_CARD, // invalid expiry date
  '10232': PaymentErrorCode.INVALID_REQUEST, // invalid amount
};
