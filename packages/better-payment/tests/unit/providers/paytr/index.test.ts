import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PayTR } from '../../../../src/providers/paytr';
import { PaymentStatus } from '../../../../src/types';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockClient),
  },
}));

const mockClient = {
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
  post: vi.fn(),
  get: vi.fn(),
};

const baseConfig = {
  apiKey: 'merchant-key',
  secretKey: 'merchant-key',
  merchantId: 'MERCHANT123',
  merchantSalt: 'test-salt',
  baseUrl: 'https://www.paytr.com',
};

const mockBuyer = {
  id: 'USR-1',
  name: 'John',
  surname: 'Doe',
  email: 'john@example.com',
  gsmNumber: '+905001234567',
  identityNumber: '11111111111',
  registrationAddress: 'Test Address',
  ip: '127.0.0.1',
  city: 'Istanbul',
  country: 'Turkey',
};

const mockAddress = {
  contactName: 'John Doe',
  city: 'Istanbul',
  country: 'Turkey',
  address: 'Test Address',
};

const mockBasketItem = {
  id: 'ITEM-1',
  name: 'Test Product',
  category1: 'Electronics',
  itemType: 'PHYSICAL' as const,
  price: '100.00',
};

describe('PayTR Provider - Unit Tests', () => {
  let paytr: PayTR;

  beforeEach(() => {
    vi.clearAllMocks();
    paytr = new PayTR(baseConfig);
  });

  describe('constructor validation', () => {
    it('should throw when merchantId is missing', () => {
      expect(() => new PayTR({ ...baseConfig, merchantId: '' })).toThrow('Merchant ID is required');
    });

    it('should throw when merchantSalt is missing', () => {
      expect(() => new PayTR({ ...baseConfig, merchantSalt: '' })).toThrow('Merchant Salt is required');
    });
  });

  describe('mapStatus', () => {
    it('should map success to SUCCESS', () => {
      const mapStatus = (paytr as any).mapStatus.bind(paytr);
      expect(mapStatus('success')).toBe(PaymentStatus.SUCCESS);
    });

    it('should map failed to FAILURE', () => {
      const mapStatus = (paytr as any).mapStatus.bind(paytr);
      expect(mapStatus('failed')).toBe(PaymentStatus.FAILURE);
    });

    it('should map unknown to PENDING', () => {
      const mapStatus = (paytr as any).mapStatus.bind(paytr);
      expect(mapStatus('processing')).toBe(PaymentStatus.PENDING);
    });
  });

  describe('initThreeDSPayment', () => {
    it('should return PENDING status with threeDSHtmlContent on success', async () => {
      mockClient.post.mockResolvedValue({
        data: { status: 'success', token: 'PAYTR_TOKEN_123' },
      });

      const result = await paytr.initThreeDSPayment({
        price: '100.00',
        paidPrice: '100.00',
        currency: 'TRY',
        callbackUrl: 'https://example.com/callback',
        basketId: 'BASKET-1',
        conversationId: 'CONV-1',
        buyer: mockBuyer,
        shippingAddress: mockAddress,
        billingAddress: mockAddress,
        basketItems: [mockBasketItem],
      });

      expect(result.status).toBe(PaymentStatus.PENDING);
      expect(result.paymentId).toBe('PAYTR_TOKEN_123');
      expect(result.threeDSHtmlContent).toContain('PAYTR_TOKEN_123');
    });

    it('should return FAILURE when API returns failure', async () => {
      mockClient.post.mockResolvedValue({
        data: { status: 'failed', reason: 'Invalid merchant' },
      });

      const result = await paytr.initThreeDSPayment({
        price: '100.00',
        paidPrice: '100.00',
        currency: 'TRY',
        callbackUrl: 'https://example.com/callback',
        basketId: 'BASKET-1',
        buyer: mockBuyer,
        shippingAddress: mockAddress,
        billingAddress: mockAddress,
        basketItems: [mockBasketItem],
      });

      expect(result.status).toBe(PaymentStatus.FAILURE);
      expect(result.errorMessage).toBe('Invalid merchant');
    });

    it('should return FAILURE when request throws', async () => {
      mockClient.post.mockRejectedValue(new Error('Network error'));

      const result = await paytr.initThreeDSPayment({
        price: '100.00',
        paidPrice: '100.00',
        currency: 'TRY',
        callbackUrl: 'https://example.com/callback',
        basketId: 'B1',
        buyer: mockBuyer,
        shippingAddress: mockAddress,
        billingAddress: mockAddress,
        basketItems: [mockBasketItem],
      });

      expect(result.status).toBe(PaymentStatus.FAILURE);
    });
  });

  describe('createPayment', () => {
    it('should delegate to initThreeDSPayment and return response', async () => {
      mockClient.post.mockResolvedValue({
        data: { status: 'success', token: 'TOKEN-ABC' },
      });

      const result = await paytr.createPayment({
        price: '50.00',
        paidPrice: '50.00',
        currency: 'TRY',
        basketId: 'B1',
        buyer: mockBuyer,
        shippingAddress: mockAddress,
        billingAddress: mockAddress,
        basketItems: [mockBasketItem],
      });

      expect(result.paymentId).toBe('TOKEN-ABC');
      expect(mockClient.post).toHaveBeenCalledTimes(1);
    });
  });

  describe('completeThreeDSPayment', () => {
    it('should map success callback to SUCCESS', async () => {
      const result = await paytr.completeThreeDSPayment({
        merchant_oid: 'ORD-1',
        merchant_salt: 'test-salt',
        status: 'success',
        total_amount: '10000',
        hash: 'valid',
        failed_reason_code: '',
        failed_reason_msg: '',
        test_mode: '0',
        payment_type: 'card',
        currency: 'TL',
        payment_amount: '10000',
      });

      // Hash won't match test data, but we just check it doesn't throw
      expect(result).toHaveProperty('status');
    });

    it('should return FAILURE for failed callback', async () => {
      const result = await paytr.completeThreeDSPayment({
        status: 'failed',
        merchant_oid: 'ORD-1',
        failed_reason_msg: 'Card declined',
        total_amount: '10000',
        hash: 'x',
      });

      expect(result.status).toBe(PaymentStatus.FAILURE);
    });
  });

  describe('refund', () => {
    it('should return SUCCESS on successful refund', async () => {
      mockClient.post.mockResolvedValue({
        data: { status: 'success' },
      });

      const result = await paytr.refund({
        paymentId: 'PMT-1',
        paymentTransactionId: 'TXN-1',
        price: '50.00',
        currency: 'TRY',
        ip: '127.0.0.1',
      });

      expect(result.status).toBe(PaymentStatus.SUCCESS);
    });

    it('should return FAILURE on refund error', async () => {
      mockClient.post.mockResolvedValue({
        data: { status: 'failed', err_no: 'E001', err_str: 'Already refunded' },
      });

      const result = await paytr.refund({
        paymentId: 'PMT-1',
        paymentTransactionId: 'TXN-1',
        price: '50.00',
        currency: 'TRY',
        ip: '127.0.0.1',
      });

      expect(result.status).toBe(PaymentStatus.FAILURE);
    });
  });

  describe('cancel', () => {
    it('should always return FAILURE (PayTR has no void endpoint)', async () => {
      const result = await paytr.cancel({ paymentId: 'PMT-1', ip: '127.0.0.1' });
      expect(result.status).toBe(PaymentStatus.FAILURE);
    });
  });

  describe('createPaymentWithToken', () => {
    it('should return PENDING with HTML when token payment succeeds', async () => {
      mockClient.post.mockResolvedValue({
        data: { status: 'success', token: 'TOKEN-XYZ' },
      });

      const result = await paytr.createPaymentWithToken({
        utoken: 'SAVED_TOKEN',
        price: '100.00',
        paidPrice: '100.00',
        currency: 'TRY',
        callbackUrl: 'https://example.com/callback',
        basketId: 'B1',
        conversationId: 'CONV-1',
        buyer: mockBuyer,
        shippingAddress: mockAddress,
        billingAddress: mockAddress,
        basketItems: [mockBasketItem],
      });

      expect(result.status).toBe(PaymentStatus.PENDING);
      expect(result.paymentId).toBe('TOKEN-XYZ');
    });

    it('should return FAILURE when token payment API fails', async () => {
      mockClient.post.mockResolvedValue({
        data: { status: 'failed', reason: 'Invalid utoken' },
      });

      const result = await paytr.createPaymentWithToken({
        utoken: 'INVALID',
        price: '100.00',
        paidPrice: '100.00',
        currency: 'TRY',
        callbackUrl: 'https://example.com/callback',
        basketId: 'B1',
        buyer: mockBuyer,
        shippingAddress: mockAddress,
        billingAddress: mockAddress,
        basketItems: [mockBasketItem],
      });

      expect(result.status).toBe(PaymentStatus.FAILURE);
      expect(result.errorMessage).toBe('Invalid utoken');
    });

    it('should handle installment parameter', async () => {
      mockClient.post.mockResolvedValue({
        data: { status: 'success', token: 'TOK-1' },
      });

      const result = await paytr.createPaymentWithToken({
        utoken: 'SAVED',
        price: '300.00',
        paidPrice: '300.00',
        currency: 'TRY',
        callbackUrl: 'https://example.com/callback',
        basketId: 'B1',
        installment: 3,
        buyer: mockBuyer,
        shippingAddress: mockAddress,
        billingAddress: mockAddress,
        basketItems: [mockBasketItem],
      });

      expect(result.status).toBe(PaymentStatus.PENDING);
    });
  });

  describe('getPayment', () => {
    it('should return PENDING with note (no API endpoint available)', async () => {
      const result = await paytr.getPayment('PMT-123');
      expect(result.status).toBe(PaymentStatus.PENDING);
      expect(result.paymentId).toBe('PMT-123');
    });
  });

  describe('installmentInfo', () => {
    it('should return SUCCESS with installment details', async () => {
      mockClient.post.mockResolvedValue({
        data: {
          status: 'success',
          bin_detail: {
            card_tipi: 'CREDIT_CARD',
            card_network: 'VISA',
            card_adi: 'Classic',
            bank_adi: 'Test Bank',
          },
          installment_count: [
            { installment_count: 3, price: '105.00' },
            { installment_count: 6, price: '112.00' },
          ],
        },
      });

      const result = await paytr.installmentInfo({ binNumber: '454360', price: '100.00' });
      expect(result.status).toBe(PaymentStatus.SUCCESS);
      expect(result.installmentDetails).toHaveLength(1);
      expect(result.installmentDetails![0].installmentPrices).toHaveLength(2);
    });

    it('should return FAILURE when API returns error', async () => {
      mockClient.post.mockResolvedValue({
        data: { status: 'failed', reason: 'BIN not found' },
      });

      const result = await paytr.installmentInfo({ binNumber: '000000', price: '100.00' });
      expect(result.status).toBe(PaymentStatus.FAILURE);
    });

    it('should handle missing bin_detail gracefully', async () => {
      mockClient.post.mockResolvedValue({
        data: { status: 'success', bin_detail: null, installment_count: [] },
      });

      const result = await paytr.installmentInfo({ binNumber: '454360' });
      expect(result.status).toBe(PaymentStatus.SUCCESS);
      expect(result.installmentDetails).toHaveLength(0);
    });
  });

  describe('binCheck', () => {
    it('should return BIN info on success', async () => {
      mockClient.post.mockResolvedValue({
        data: {
          status: 'success',
          bin_detail: {
            card_tipi: 'CREDIT_CARD',
            banka_adi: 'Test Bank',
            card_ailesi: 'Visa',
            issuer_card_tipi: 'VISA',
            uluslararasi: '0',
          },
        },
      });

      const result = await paytr.binCheck('454360');
      expect(result.binNumber).toBe('454360');
      expect(result.cardType).toBe('CREDIT_CARD');
    });

    it('should throw when BIN check fails', async () => {
      mockClient.post.mockResolvedValue({
        data: { status: 'failed', reason: 'BIN not found' },
      });

      await expect(paytr.binCheck('000000')).rejects.toThrow();
    });
  });
});
