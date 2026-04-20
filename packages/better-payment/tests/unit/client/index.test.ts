import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BetterPaymentClient, createBetterPaymentClient } from '../../../src/client';

function mockFetch(data: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
  });
}

describe('BetterPaymentClient', () => {
  let capturedUrl: string;
  let capturedOptions: RequestInit;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockImplementation((url: string, options: RequestInit) => {
      capturedUrl = url;
      capturedOptions = options;
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({ status: 'success' }),
      });
    });
  });

  describe('URL building', () => {
    it('should build correct URL for iyzico payment', async () => {
      const client = new BetterPaymentClient({ baseUrl: '/api/pay', fetch: fetchMock });
      await client.iyzico.createPayment({} as any);
      expect(capturedUrl).toBe('/api/pay/iyzico/payment');
    });

    it('should build correct URL for paytr 3DS init', async () => {
      const client = new BetterPaymentClient({ baseUrl: '/api/pay', fetch: fetchMock });
      await client.paytr.initThreeDSPayment({} as any);
      expect(capturedUrl).toBe('/api/pay/paytr/payment/init-3ds');
    });

    it('should strip trailing slash from baseUrl', async () => {
      const client = new BetterPaymentClient({ baseUrl: '/api/pay/', fetch: fetchMock });
      await client.akbank.createPayment({} as any);
      expect(capturedUrl).toBe('/api/pay/akbank/payment');
    });

    it('should build correct URL for refund', async () => {
      const client = new BetterPaymentClient({ baseUrl: '/api/pay', fetch: fetchMock });
      await client.parampos.refund({} as any);
      expect(capturedUrl).toBe('/api/pay/parampos/refund');
    });

    it('should build correct URL for getPayment with ID', async () => {
      const client = new BetterPaymentClient({ baseUrl: '/api/pay', fetch: fetchMock });
      await client.iyzico.getPayment('PMT-123');
      expect(capturedUrl).toBe('/api/pay/iyzico/payment/PMT-123');
    });

    it('should build correct URL for binCheck', async () => {
      const client = new BetterPaymentClient({ baseUrl: '/api/pay', fetch: fetchMock });
      await client.iyzico.binCheck('454360');
      expect(capturedUrl).toBe('/api/pay/iyzico/bin-check');
    });

    it('should build correct URL for installmentInfo', async () => {
      const client = new BetterPaymentClient({ baseUrl: '/api/pay', fetch: fetchMock });
      await client.iyzico.installmentInfo({ binNumber: '454360', price: '100.00' });
      expect(capturedUrl).toBe('/api/pay/iyzico/installment');
    });
  });

  describe('request options', () => {
    it('should set Content-Type to application/json', async () => {
      const client = new BetterPaymentClient({ baseUrl: '/api/pay', fetch: fetchMock });
      await client.iyzico.createPayment({} as any);
      const headers = capturedOptions.headers as Record<string, string>;
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should merge custom headers', async () => {
      const client = new BetterPaymentClient({
        baseUrl: '/api/pay',
        fetch: fetchMock,
        headers: { 'X-Custom': 'test-value' },
      });
      await client.iyzico.createPayment({} as any);
      const headers = capturedOptions.headers as Record<string, string>;
      expect(headers['X-Custom']).toBe('test-value');
    });

    it('should POST with serialized body', async () => {
      const client = new BetterPaymentClient({ baseUrl: '/api/pay', fetch: fetchMock });
      const body = { price: '100.00' };
      await client.iyzico.createPayment(body as any);
      expect(capturedOptions.method).toBe('POST');
      expect(capturedOptions.body).toBe(JSON.stringify(body));
    });

    it('should GET without body for getPayment', async () => {
      const client = new BetterPaymentClient({ baseUrl: '/api/pay', fetch: fetchMock });
      await client.iyzico.getPayment('PMT-1');
      expect(capturedOptions.method).toBe('GET');
      expect(capturedOptions.body).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should throw when response is not ok', async () => {
      const client = new BetterPaymentClient({
        baseUrl: '/api/pay',
        fetch: mockFetch({ message: 'Payment failed' }, 400),
      });
      await expect(client.iyzico.createPayment({} as any)).rejects.toThrow('Payment failed');
    });

    it('should throw with HTTP status when JSON parse fails', async () => {
      const client = new BetterPaymentClient({
        baseUrl: '/api/pay',
        fetch: vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.reject(new Error('not json')),
        }),
      });
      await expect(client.iyzico.createPayment({} as any)).rejects.toThrow('HTTP 500');
    });
  });

  describe('health check', () => {
    it('should call /health endpoint', async () => {
      const client = new BetterPaymentClient({ baseUrl: '/api/pay', fetch: fetchMock });
      await client.health();
      expect(capturedUrl).toBe('/api/pay/health');
      expect(capturedOptions.method).toBe('GET');
    });

    it('should throw when health check fails', async () => {
      const client = new BetterPaymentClient({
        baseUrl: '/api/pay',
        fetch: mockFetch({}, 503),
      });
      await expect(client.health()).rejects.toThrow('Health check failed');
    });
  });

  describe('createBetterPaymentClient', () => {
    it('should return a BetterPaymentClient instance', () => {
      const client = createBetterPaymentClient({ baseUrl: '/api/pay' });
      expect(client).toBeInstanceOf(BetterPaymentClient);
    });

    it('should expose all four provider clients', () => {
      const client = createBetterPaymentClient({ baseUrl: '/api/pay' });
      expect(client.iyzico).toBeDefined();
      expect(client.paytr).toBeDefined();
      expect(client.akbank).toBeDefined();
      expect(client.parampos).toBeDefined();
    });
  });
});
