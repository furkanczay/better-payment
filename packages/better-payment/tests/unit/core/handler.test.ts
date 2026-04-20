import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BetterPaymentHandler } from '../../../src/core/BetterPaymentHandler';
import { BetterPayment } from '../../../src/core/BetterPayment';
import { ProviderType } from '../../../src/core/BetterPaymentConfig';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      post: vi.fn().mockResolvedValue({ data: {} }),
      get: vi.fn().mockResolvedValue({ data: {} }),
    })),
  },
}));

function buildMockPayment(overrides: Partial<Record<string, any>> = {}) {
  const mockProvider = {
    createPayment: vi.fn().mockResolvedValue({ status: 'success', paymentId: 'PMT-1' }),
    initThreeDSPayment: vi.fn().mockResolvedValue({ status: 'pending', threeDSHtmlContent: '<form>' }),
    completeThreeDSPayment: vi.fn().mockResolvedValue({ status: 'success', paymentId: 'PMT-1' }),
    refund: vi.fn().mockResolvedValue({ status: 'success' }),
    cancel: vi.fn().mockResolvedValue({ status: 'success' }),
    getPayment: vi.fn().mockResolvedValue({ status: 'success', paymentId: 'PMT-1' }),
    binCheck: vi.fn().mockResolvedValue({ binNumber: '454360' }),
    installmentInfo: vi.fn().mockResolvedValue({ installments: [] }),
    ...overrides,
  };

  const payment: any = {
    isProviderEnabled: vi.fn().mockReturnValue(true),
    getEnabledProviders: vi.fn().mockReturnValue([ProviderType.IYZICO, ProviderType.PAYTR]),
    use: vi.fn().mockReturnValue(mockProvider),
    ...overrides,
  };

  return { payment, mockProvider };
}

function makeRequest(method: string, url: string, body?: any) {
  return {
    method,
    url,
    headers: { 'content-type': 'application/json' },
    body: body ?? {},
  };
}

describe('BetterPaymentHandler', () => {
  describe('health check', () => {
    it('should return 200 on /health', async () => {
      const { payment } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('GET', '/api/pay/health'));
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('should return 200 on /ok', async () => {
      const { payment } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('GET', '/api/pay/ok'));
      expect(res.status).toBe(200);
    });
  });

  describe('route parsing — not found', () => {
    it('should return 404 for unknown routes', async () => {
      const { payment } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('POST', '/api/unknown/path'));
      expect(res.status).toBe(404);
    });

    it('should return 404 for invalid provider', async () => {
      const { payment } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('POST', '/api/pay/stripe/payment'));
      expect(res.status).toBe(404);
    });
  });

  describe('provider not enabled', () => {
    it('should return 400 when provider is disabled', async () => {
      const { payment } = buildMockPayment();
      payment.isProviderEnabled.mockReturnValue(false);
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('POST', '/api/pay/iyzico/payment'));
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('not enabled');
    });
  });

  describe('createPayment route', () => {
    it('should call createPayment and return 200', async () => {
      const { payment, mockProvider } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const body = { price: '100.00', currency: 'TRY' };
      const res = await handler.handle(makeRequest('POST', '/api/pay/iyzico/payment', body));
      expect(res.status).toBe(200);
      expect(mockProvider.createPayment).toHaveBeenCalledWith(body);
    });
  });

  describe('initThreeDSPayment route', () => {
    it('should call initThreeDSPayment and return 200', async () => {
      const { payment, mockProvider } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('POST', '/api/pay/paytr/payment/init-3ds', {}));
      expect(res.status).toBe(200);
      expect(mockProvider.initThreeDSPayment).toHaveBeenCalled();
    });
  });

  describe('callback / completeThreeDS route', () => {
    it('should handle JSON callback', async () => {
      const { payment, mockProvider } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('POST', '/api/pay/iyzico/callback', { paymentId: 'PMT-1' }));
      expect(res.status).toBe(200);
      expect(mockProvider.completeThreeDSPayment).toHaveBeenCalled();
    });

    it('should parse form-encoded callback body', async () => {
      const { payment, mockProvider } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle({
        method: 'POST',
        url: '/api/pay/paytr/callback',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: 'merchant_oid=ORD-1&status=success&total_amount=10000',
      });
      expect(res.status).toBe(200);
      expect(mockProvider.completeThreeDSPayment).toHaveBeenCalledWith(
        expect.objectContaining({ merchant_oid: 'ORD-1', status: 'success' })
      );
    });
  });

  describe('refund route', () => {
    it('should call refund and return 200', async () => {
      const { payment, mockProvider } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('POST', '/api/pay/iyzico/refund', { paymentId: 'PMT-1' }));
      expect(res.status).toBe(200);
      expect(mockProvider.refund).toHaveBeenCalled();
    });
  });

  describe('cancel route', () => {
    it('should call cancel and return 200', async () => {
      const { payment, mockProvider } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('POST', '/api/pay/akbank/cancel', {}));
      expect(res.status).toBe(200);
      expect(mockProvider.cancel).toHaveBeenCalled();
    });
  });

  describe('getPayment route', () => {
    it('should call getPayment with paymentId', async () => {
      const { payment, mockProvider } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('GET', '/api/pay/iyzico/payment/PMT-123'));
      expect(res.status).toBe(200);
      expect(mockProvider.getPayment).toHaveBeenCalledWith('PMT-123');
    });
  });

  describe('binCheck route', () => {
    it('should call binCheck and return 200', async () => {
      const { payment, mockProvider } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('POST', '/api/pay/iyzico/bin-check', { binNumber: '454360' }));
      expect(res.status).toBe(200);
      expect(mockProvider.binCheck).toHaveBeenCalledWith('454360');
    });
  });

  describe('installment route', () => {
    it('should call installmentInfo and return 200', async () => {
      const { payment, mockProvider } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('POST', '/api/pay/iyzico/installment', { binNumber: '454360', price: '100.00' }));
      expect(res.status).toBe(200);
      expect(mockProvider.installmentInfo).toHaveBeenCalled();
    });
  });

  describe('unknown action', () => {
    it('should return 404 for unknown action', async () => {
      const { payment } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('POST', '/api/pay/iyzico/nonexistent'));
      expect(res.status).toBe(404);
    });
  });

  describe('error handling', () => {
    it('should return 500 when provider method throws', async () => {
      const { payment } = buildMockPayment({
        createPayment: vi.fn().mockRejectedValue(new Error('Network error')),
      });
      const mockProvider = payment.use();
      mockProvider.createPayment = vi.fn().mockRejectedValue(new Error('Network error'));
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('POST', '/api/pay/iyzico/payment'));
      expect(res.status).toBe(500);
    });
  });

  describe('iyzico-specific routes — non-iyzico provider returns 400', () => {
    it('should return 400 for checkout/init when provider is not iyzico', async () => {
      const { payment } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('POST', '/api/pay/iyzico/checkout/init', {}));
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('iyzico');
    });

    it('should return 400 for subscription/initialize when provider is not iyzico', async () => {
      const { payment } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('POST', '/api/pay/iyzico/subscription/initialize', {}));
      expect(res.status).toBe(400);
    });
  });

  describe('iyzico-specific routes — real Iyzico provider', () => {
    let bp: BetterPayment;

    beforeEach(() => {
      bp = new BetterPayment({
        providers: {
          iyzico: { enabled: true, config: { apiKey: 'key', secretKey: 'secret' } },
        },
      });
    });

    it('should call initCheckoutForm for checkout/init', async () => {
      const spy = vi.spyOn(bp.iyzico, 'initCheckoutForm').mockResolvedValue({ checkoutFormContent: '<form>' } as any);
      const res = await bp.handler.handle(makeRequest('POST', '/api/pay/iyzico/checkout/init', {}));
      expect(res.status).toBe(200);
      expect(spy).toHaveBeenCalled();
    });

    it('should call retrieveCheckoutForm for checkout/retrieve', async () => {
      const spy = vi.spyOn(bp.iyzico, 'retrieveCheckoutForm').mockResolvedValue({ paymentStatus: 'success' } as any);
      const res = await bp.handler.handle(makeRequest('POST', '/api/pay/iyzico/checkout/retrieve', { token: 'T1' }));
      expect(res.status).toBe(200);
      expect(spy).toHaveBeenCalled();
    });

    it('should call initPWIPayment for pwi/init', async () => {
      const spy = vi.spyOn(bp.iyzico, 'initPWIPayment').mockResolvedValue({ status: 'pending' } as any);
      const res = await bp.handler.handle(makeRequest('POST', '/api/pay/iyzico/pwi/init', {}));
      expect(res.status).toBe(200);
      expect(spy).toHaveBeenCalled();
    });

    it('should call retrievePWIPayment for pwi/retrieve', async () => {
      const spy = vi.spyOn(bp.iyzico, 'retrievePWIPayment').mockResolvedValue({ status: 'success' } as any);
      const res = await bp.handler.handle(makeRequest('POST', '/api/pay/iyzico/pwi/retrieve', { token: 'T1' }));
      expect(res.status).toBe(200);
      expect(spy).toHaveBeenCalled();
    });

    it('should call initializeSubscription for subscription/initialize', async () => {
      const spy = vi.spyOn(bp.iyzico, 'initializeSubscription').mockResolvedValue({ subscriptionReferenceCode: 'SUB-1' } as any);
      const res = await bp.handler.handle(makeRequest('POST', '/api/pay/iyzico/subscription/initialize', {}));
      expect(res.status).toBe(200);
      expect(spy).toHaveBeenCalled();
    });

    it('should call cancelSubscription for subscription/cancel', async () => {
      const spy = vi.spyOn(bp.iyzico, 'cancelSubscription').mockResolvedValue({ status: 'success' } as any);
      const res = await bp.handler.handle(makeRequest('POST', '/api/pay/iyzico/subscription/cancel', {}));
      expect(res.status).toBe(200);
      expect(spy).toHaveBeenCalled();
    });

    it('should call upgradeSubscription for subscription/upgrade', async () => {
      const spy = vi.spyOn(bp.iyzico, 'upgradeSubscription').mockResolvedValue({ status: 'success' } as any);
      const res = await bp.handler.handle(makeRequest('POST', '/api/pay/iyzico/subscription/upgrade', {}));
      expect(res.status).toBe(200);
      expect(spy).toHaveBeenCalled();
    });

    it('should call retrieveSubscription for subscription/retrieve', async () => {
      const spy = vi.spyOn(bp.iyzico, 'retrieveSubscription').mockResolvedValue({ status: 'success' } as any);
      const res = await bp.handler.handle(makeRequest('POST', '/api/pay/iyzico/subscription/retrieve', {}));
      expect(res.status).toBe(200);
      expect(spy).toHaveBeenCalled();
    });

    it('should call updateSubscriptionCard for subscription/card-update', async () => {
      const spy = vi.spyOn(bp.iyzico, 'updateSubscriptionCard').mockResolvedValue({ status: 'success' } as any);
      const res = await bp.handler.handle(makeRequest('POST', '/api/pay/iyzico/subscription/card-update', {}));
      expect(res.status).toBe(200);
      expect(spy).toHaveBeenCalled();
    });

    it('should call createSubscriptionProduct for subscription/product', async () => {
      const spy = vi.spyOn(bp.iyzico, 'createSubscriptionProduct').mockResolvedValue({ name: 'Plan' } as any);
      const res = await bp.handler.handle(makeRequest('POST', '/api/pay/iyzico/subscription/product', {}));
      expect(res.status).toBe(200);
      expect(spy).toHaveBeenCalled();
    });

    it('should call createPricingPlan for subscription/pricing-plan', async () => {
      const spy = vi.spyOn(bp.iyzico, 'createPricingPlan').mockResolvedValue({ name: 'Plan' } as any);
      const res = await bp.handler.handle(makeRequest('POST', '/api/pay/iyzico/subscription/pricing-plan', {}));
      expect(res.status).toBe(200);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('payment/token route', () => {
    it('should return 400 when provider does not support token payments', async () => {
      const { payment } = buildMockPayment();
      const mockProvider = payment.use();
      delete mockProvider.createPaymentWithToken;
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('POST', '/api/pay/paytr/payment/token', {}));
      expect(res.status).toBe(400);
    });

    it('should call createPaymentWithToken when supported', async () => {
      const { payment } = buildMockPayment();
      const mockProvider = payment.use();
      mockProvider.createPaymentWithToken = vi.fn().mockResolvedValue({ status: 'pending' });
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('POST', '/api/pay/paytr/payment/token', {}));
      expect(res.status).toBe(200);
      expect(mockProvider.createPaymentWithToken).toHaveBeenCalled();
    });
  });

  describe('query string handling', () => {
    it('should ignore query string when routing', async () => {
      const { payment } = buildMockPayment();
      const handler = new BetterPaymentHandler(payment);
      const res = await handler.handle(makeRequest('GET', '/api/pay/health?foo=bar'));
      expect(res.status).toBe(200);
    });
  });
});
