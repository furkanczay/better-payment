import { describe, it, expect, vi } from 'vitest';
import axios, { AxiosInstance } from 'axios';
import { PaymentProvider } from '../../../src/core/PaymentProvider';
import type { RetryConfig } from '../../../src/core/retry';

class TestProvider extends PaymentProvider {
  client: AxiosInstance;
  constructor(retry: RetryConfig | undefined, adapter: any) {
    super({ retry });
    this.client = axios.create({ adapter });
    this.setupAxiosRetry(this.client);
  }
  createPayment = vi.fn();
  initThreeDSPayment = vi.fn();
  completeThreeDSPayment = vi.fn();
  refund = vi.fn();
  cancel = vi.fn();
  getPayment = vi.fn();
}

function networkErrorAdapter(calls: { count: number }) {
  return async (config: any) => {
    calls.count++;
    const error: any = new Error('socket hang up');
    error.isAxiosError = true;
    error.config = config;
    error.request = {};
    throw error;
  };
}

describe('PaymentProvider retry', () => {
  const retry: RetryConfig = { attempts: 3, delay: 1 };

  it('never retries POST requests (payments, refunds)', async () => {
    const calls = { count: 0 };
    const provider = new TestProvider(retry, networkErrorAdapter(calls));
    await expect(provider.client.post('/payment', '{}')).rejects.toThrow();
    expect(calls.count).toBe(1);
  });

  it('retries GET requests on network errors', async () => {
    const calls = { count: 0 };
    const provider = new TestProvider(retry, networkErrorAdapter(calls));
    await expect(provider.client.get('/status')).rejects.toThrow();
    expect(calls.count).toBe(3);
  });

  it('retries POST requests explicitly marked retryable (read-only queries)', async () => {
    const calls = { count: 0 };
    const provider = new TestProvider(retry, networkErrorAdapter(calls));
    await expect(provider.client.post('/query', '{}', { retryable: true } as any)).rejects.toThrow();
    expect(calls.count).toBe(3);
  });

  it('retries on configured status codes only', async () => {
    let count = 0;
    const adapter = async (config: any) => {
      count++;
      const error: any = new Error('unavailable');
      error.isAxiosError = true;
      error.config = config;
      error.response = { status: count === 1 ? 503 : 400, data: {}, headers: {}, config };
      throw error;
    };
    const provider = new TestProvider({ attempts: 5, delay: 1, statusCodes: [503] }, adapter);
    await expect(provider.client.get('/status')).rejects.toThrow();
    expect(count).toBe(2);
  });

  it('does nothing when retry is not configured', async () => {
    const calls = { count: 0 };
    const provider = new TestProvider(undefined, networkErrorAdapter(calls));
    await expect(provider.client.get('/status')).rejects.toThrow();
    expect(calls.count).toBe(1);
  });
});
