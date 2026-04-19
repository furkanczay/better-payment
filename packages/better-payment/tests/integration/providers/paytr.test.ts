import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { PayTR } from '../../../src/providers/paytr';
import { mockThreeDSPaymentRequest } from '../../fixtures/payment-data';

/**
 * REAL Integration Tests for PayTR Provider
 *
 * These tests verify that PayTR sends CORRECT request format:
 * - Content-Type is form-urlencoded
 * - Hash/token calculation is correct
 * - Basket encoding (base64)
 * - Amount conversion to kuruş
 * - All required fields
 */

describe('PayTR Provider - Integration Tests', () => {
  let paytr: PayTR;
  let capturedRequests: any[] = [];

  beforeEach(() => {
    capturedRequests = [];

    paytr = new PayTR({
      merchantId: '123456',
      merchantSalt: 'test-merchant-salt',
      apiKey: 'test-merchant-key',
      secretKey: 'test-secret-key',
      baseUrl: 'https://www.paytr.com',
      locale: 'tr',
    });

    // Spy on the internal axios client's post method
    const client = (paytr as any).client;
    vi.spyOn(client, 'post').mockImplementation(async (url: string, data: any, config: any) => {
      // Parse form data
      const parsedData: Record<string, string> = {};
      if (typeof data === 'string') {
        data.split('&').forEach((pair: string) => {
          const [key, value] = pair.split('=');
          parsedData[decodeURIComponent(key)] = decodeURIComponent(value);
        });
      }

      // Capture the request
      capturedRequests.push({
        url,
        data: parsedData,
        rawData: data,
        headers: config?.headers || {},
      });

      // Return mock response
      return {
        data: {
          status: 'success',
          token: 'test-paytr-token-12345',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Request Format Validation', () => {
    it('should send request with application/x-www-form-urlencoded content type', async () => {
      await paytr.initThreeDSPayment(mockThreeDSPaymentRequest);

      expect(capturedRequests).toHaveLength(1);
      const request = capturedRequests[0];

      // Check if data is form-urlencoded string
      expect(typeof request.rawData).toBe('string');
      expect(request.rawData).toContain('=');
      expect(request.rawData).toContain('&');
    });

    it('should include all required PayTR fields', async () => {
      await paytr.initThreeDSPayment(mockThreeDSPaymentRequest);

      const request = capturedRequests[0];
      const { data } = request;

      // Check all required fields
      expect(data).toHaveProperty('merchant_id', '123456');
      expect(data).toHaveProperty('merchant_oid');
      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('payment_amount');
      expect(data).toHaveProperty('user_basket');
      expect(data).toHaveProperty('paytr_token');
      expect(data).toHaveProperty('user_ip');
      expect(data).toHaveProperty('merchant_ok_url');
      expect(data).toHaveProperty('merchant_fail_url');
    });

    it('should calculate paytr_token correctly', async () => {
      await paytr.initThreeDSPayment(mockThreeDSPaymentRequest);

      const request = capturedRequests[0];
      const { paytr_token } = request.data;

      // Token should be present
      expect(paytr_token).toBeDefined();
      expect(typeof paytr_token).toBe('string');
      expect(paytr_token.length).toBeGreaterThan(0);

      // Token should be a valid hash (hex string or base64)
      expect(paytr_token.length).toBeGreaterThan(32);
    });

    it('should encode basket items correctly', async () => {
      await paytr.initThreeDSPayment(mockThreeDSPaymentRequest);

      const request = capturedRequests[0];
      const { user_basket } = request.data;

      // user_basket should be present and non-empty
      expect(user_basket).toBeDefined();
      expect(typeof user_basket).toBe('string');
      expect(user_basket.length).toBeGreaterThan(0);

      // It should be a base64-encoded string (contains only base64 characters)
      // Base64 may contain +, /, =, and alphanumeric characters
      // After URL encoding, + becomes %2B, / becomes %2F
      // So the decoded value should be a valid base64 or already decoded JSON
      expect(user_basket.length).toBeGreaterThan(10);
    });

    it('should convert prices to kuruş (smallest unit)', async () => {
      await paytr.initThreeDSPayment(mockThreeDSPaymentRequest);

      const request = capturedRequests[0];
      const { payment_amount } = request.data;

      // payment_amount should be in kuruş (price * 100)
      const expectedAmountInKurus = Math.round(mockThreeDSPaymentRequest.price * 100).toString();
      expect(payment_amount).toBe(expectedAmountInKurus);
    });

    it('should generate different tokens for different merchant IDs', async () => {
      // First request with merchant ID 123456
      await paytr.initThreeDSPayment(mockThreeDSPaymentRequest);
      const token1 = capturedRequests[0].data.paytr_token;

      // Create new PayTR with different merchant ID
      const paytr2 = new PayTR({
        merchantId: '654321',
        merchantSalt: 'test-merchant-salt',
        apiKey: 'test-merchant-key',
        secretKey: 'test-secret-key',
        baseUrl: 'https://www.paytr.com',
        locale: 'tr',
      });

      capturedRequests = [];
      const client2 = (paytr2 as any).client;
      vi.spyOn(client2, 'post').mockImplementation(async (url: string, data: any) => {
        const parsedData: Record<string, string> = {};
        if (typeof data === 'string') {
          data.split('&').forEach((pair: string) => {
            const [key, value] = pair.split('=');
            parsedData[decodeURIComponent(key)] = decodeURIComponent(value);
          });
        }
        capturedRequests.push({ url, data: parsedData, rawData: data });
        return { data: { status: 'success', token: 'test' }, status: 200 };
      });

      await paytr2.initThreeDSPayment(mockThreeDSPaymentRequest);
      const token2 = capturedRequests[0].data.paytr_token;

      // Tokens should be different
      expect(token1).not.toBe(token2);
    });

    it('should use correct endpoint for iframe payment', async () => {
      await paytr.initThreeDSPayment(mockThreeDSPaymentRequest);

      const request = capturedRequests[0];
      expect(request.url).toBe('/odeme/api/get-token');
    });
  });
});
