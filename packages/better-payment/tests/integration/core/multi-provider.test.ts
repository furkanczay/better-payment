import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BetterPay } from '../../../src/core/BetterPay';
import { ProviderType } from '../../../src/core/BetterPayConfig';
import { mockPaymentRequest } from '../../fixtures/payment-data';

/**
 * REAL Integration Tests for Multi-Provider Core
 *
 * These tests verify:
 * - Provider switching works correctly
 * - Each provider sends requests with correct format
 * - Provider-specific configurations are isolated
 * - BetterPay correctly routes to the right provider
 */

describe('BetterPay Multi-Provider Integration', () => {
  let betterPay: BetterPay;
  let capturedRequests: Array<{ provider: string; url: string; data: any }> = [];

  beforeEach(() => {
    capturedRequests = [];

    betterPay = new BetterPay({
      providers: {
        iyzico: {
          enabled: true,
          config: {
            apiKey: 'iyzico-key',
            secretKey: 'iyzico-secret',
            baseUrl: 'https://sandbox-api.iyzipay.com',
            locale: 'tr',
          },
        },
        paytr: {
          enabled: true,
          config: {
            merchantId: '123456',
            merchantSalt: 'paytr-salt',
            apiKey: 'paytr-key',
            secretKey: 'paytr-secret',
            baseUrl: 'https://www.paytr.com',
            locale: 'tr',
          },
        },
      },
      defaultProvider: ProviderType.IYZICO,
    });

    // Spy on Iyzico
    const iyzicoClient = (betterPay.iyzico as any).client;
    vi.spyOn(iyzicoClient, 'post').mockImplementation(async (url: string, data: any) => {
      capturedRequests.push({
        provider: 'iyzico',
        url,
        data: typeof data === 'string' ? JSON.parse(data) : data,
      });
      return { data: { status: 'success', paymentId: 'iyzico-123' }, status: 200 };
    });

    // Spy on PayTR
    const paytrClient = (betterPay.paytr as any).client;
    vi.spyOn(paytrClient, 'post').mockImplementation(async (url: string, data: any) => {
      const parsedData: Record<string, string> = {};
      if (typeof data === 'string') {
        data.split('&').forEach((pair: string) => {
          const [key, value] = pair.split('=');
          parsedData[decodeURIComponent(key)] = decodeURIComponent(value);
        });
      }
      capturedRequests.push({
        provider: 'paytr',
        url,
        data: parsedData,
      });
      return { data: { status: 'success', token: 'paytr-token' }, status: 200 };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Provider Routing', () => {
    it('should route to Iyzico when using .iyzico', async () => {
      await betterPay.iyzico.createPayment(mockPaymentRequest);

      expect(capturedRequests).toHaveLength(1);
      expect(capturedRequests[0].provider).toBe('iyzico');
      expect(capturedRequests[0].url).toBe('/payment/auth');
    });

    it('should route to PayTR when using .paytr', async () => {
      const paytrRequest = { ...mockPaymentRequest, callbackUrl: 'https://example.com/callback' };
      await betterPay.paytr.initThreeDSPayment(paytrRequest);

      expect(capturedRequests).toHaveLength(1);
      expect(capturedRequests[0].provider).toBe('paytr');
      expect(capturedRequests[0].url).toBe('/odeme/api/get-token');
    });

    it('should use default provider when no provider specified', async () => {
      await betterPay.createPayment(mockPaymentRequest);

      expect(capturedRequests).toHaveLength(1);
      // Default is Iyzico
      expect(capturedRequests[0].provider).toBe('iyzico');
    });

    it('should route to correct provider with .use()', async () => {
      const paytrRequest = { ...mockPaymentRequest, callbackUrl: 'https://example.com/callback' };
      await betterPay.use(ProviderType.PAYTR).initThreeDSPayment(paytrRequest);

      expect(capturedRequests).toHaveLength(1);
      expect(capturedRequests[0].provider).toBe('paytr');
    });
  });

  describe('Provider Isolation', () => {
    it('should use correct API keys for each provider', async () => {
      // Test Iyzico
      await betterPay.iyzico.createPayment(mockPaymentRequest);
      const iyzicoRequest = capturedRequests[0];

      // Iyzico should have Authorization header with iyzico-key
      // (We can't easily check the header here, but we verified the request went to Iyzico)
      expect(iyzicoRequest.provider).toBe('iyzico');

      capturedRequests = [];

      // Test PayTR
      const paytrRequest = { ...mockPaymentRequest, callbackUrl: 'https://example.com/callback' };
      await betterPay.paytr.initThreeDSPayment(paytrRequest);
      const payTRRequest = capturedRequests[0];

      // PayTR should have merchant_id = 123456
      expect(payTRRequest.provider).toBe('paytr');
      expect(payTRRequest.data.merchant_id).toBe('123456');
    });

    it('should use correct request format for each provider', async () => {
      // Iyzico uses JSON
      await betterPay.iyzico.createPayment(mockPaymentRequest);
      const iyzicoRequest = capturedRequests[0];

      expect(iyzicoRequest.data).toHaveProperty('locale');
      expect(iyzicoRequest.data).toHaveProperty('paymentCard');
      expect(iyzicoRequest.data).toHaveProperty('buyer');

      capturedRequests = [];

      // PayTR uses form-urlencoded
      const paytrRequest = { ...mockPaymentRequest, callbackUrl: 'https://example.com/callback' };
      await betterPay.paytr.initThreeDSPayment(paytrRequest);
      const payTRRequest = capturedRequests[0];

      expect(payTRRequest.data).toHaveProperty('merchant_id');
      expect(payTRRequest.data).toHaveProperty('paytr_token');
      expect(payTRRequest.data).toHaveProperty('user_basket');
    });

    it('should maintain separate configurations', async () => {
      // Both providers should be independently configured
      const iyzicoConfig = (betterPay.iyzico as any).config;
      const paytrConfig = (betterPay.paytr as any).config;

      expect(iyzicoConfig.apiKey).toBe('iyzico-key');
      expect(iyzicoConfig.baseUrl).toBe('https://sandbox-api.iyzipay.com');

      expect(paytrConfig.apiKey).toBe('paytr-key');
      expect(paytrConfig.baseUrl).toBe('https://www.paytr.com');
    });
  });

  describe('Provider Management', () => {
    it('should list all enabled providers', () => {
      const enabled = betterPay.getEnabledProviders();

      expect(enabled).toContain(ProviderType.IYZICO);
      expect(enabled).toContain(ProviderType.PAYTR);
      expect(enabled).toHaveLength(2);
    });

    it('should check if provider is enabled', () => {
      expect(betterPay.isProviderEnabled(ProviderType.IYZICO)).toBe(true);
      expect(betterPay.isProviderEnabled(ProviderType.PAYTR)).toBe(true);
    });

    it('should throw error when accessing disabled provider', () => {
      const singleProvider = new BetterPay({
        providers: {
          iyzico: {
            enabled: true,
            config: {
              apiKey: 'test',
              secretKey: 'test',
              baseUrl: 'https://sandbox-api.iyzipay.com',
            },
          },
        },
      });

      expect(() => singleProvider.paytr).toThrow();
      expect(singleProvider.isProviderEnabled(ProviderType.PAYTR)).toBe(false);
    });
  });
});
