/**
 * Mock responses from payment providers
 * These are ONLY for unit tests - DO NOT use in integration tests
 */

// Iyzico Mock Responses
export const mockIyzicoSuccessResponse = {
  status: 'success',
  locale: 'tr',
  systemTime: Date.now(),
  conversationId: '123456789',
  paymentId: '12345678',
  price: 1,
  paidPrice: 1.2,
  currency: 'TRY',
  basketId: 'B67832',
  binNumber: '552879',
  lastFourDigits: '0008',
  cardType: 'CREDIT_CARD',
  cardAssociation: 'MASTER_CARD',
  cardFamily: 'Bonus',
  installment: 1,
  merchantCommissionRate: 0,
  merchantCommissionRateAmount: 0,
  iyziCommissionRateAmount: 0,
  iyziCommissionFee: 0.25,
  authCode: '123456',
};

export const mockIyzicoFailureResponse = {
  status: 'failure',
  locale: 'tr',
  systemTime: Date.now(),
  errorCode: '5001',
  errorMessage: 'Kart numarası geçersiz',
  errorGroup: 'VALIDATION_ERROR',
};

export const mockIyzico3DSInitResponse = {
  status: 'success',
  locale: 'tr',
  systemTime: Date.now(),
  conversationId: '123456789',
  threeDSHtmlContent: Buffer.from(
    '<html><body><form>3DS Form</form></body></html>',
  ).toString('base64'),
};

export const mockIyzicoCheckoutFormInitResponse = {
  status: 'success',
  locale: 'tr',
  systemTime: Date.now(),
  conversationId: '123456789',
  token: 'mock-checkout-token',
  checkoutFormContent: '<html><body>Checkout Form</body></html>',
  tokenExpireTime: Date.now() + 3600000,
  paymentPageUrl: 'https://sandbox-api.iyzipay.com/payment/iyzipos/checkoutform/auth/ecom/detail/mock-checkout-token',
};

export const mockIyzicoCheckoutFormRetrieveResponse = {
  status: 'success',
  locale: 'tr',
  systemTime: Date.now(),
  conversationId: '123456789',
  paymentId: '12345678',
  paymentStatus: 'SUCCESS',
  price: 1,
  paidPrice: 1.2,
  currency: 'TRY',
  basketId: 'B67832',
  binNumber: '552879',
  lastFourDigits: '0008',
  cardType: 'CREDIT_CARD',
  cardAssociation: 'MASTER_CARD',
  cardFamily: 'Bonus',
  installment: 1,
  fraudStatus: 1,
  merchantCommissionRate: 0,
  iyziCommissionFee: 0.25,
};

// PayTR Mock Responses
export const mockPayTRSuccessTokenResponse = {
  status: 'success',
  token: 'mock-paytr-token-12345',
};

export const mockPayTRFailureTokenResponse = {
  status: 'failed',
  reason: 'KULLANICI_HATASI: Merchant bilgileri hatalı',
};

export const mockPayTRCallbackData = {
  merchant_oid: 'B67832',
  status: 'success',
  total_amount: '120',
  hash: 'mock-hash-value',
  failed_reason_code: '',
  failed_reason_msg: '',
  test_mode: '1',
  payment_type: 'card',
  currency: 'TL',
  payment_amount: '120',
};

export const mockPayTRRefundResponse = {
  status: 'success',
};
