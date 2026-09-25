import { describe, it, expect } from 'vitest';
import { HttpClient } from '../../../src/core/http';
import type { RetryConfig } from '../../../src/core/retry';

function client(retry: RetryConfig | undefined, fetchImpl: typeof fetch): HttpClient {
  return new HttpClient({
    provider: 'test',
    baseURL: 'https://api.example.com',
    timeout: 1000,
    retry,
    fetch: fetchImpl,
  });
}

function networkErrorFetch(calls: { count: number }): typeof fetch {
  return async () => {
    calls.count++;
    throw new TypeError('fetch failed', {
      cause: Object.assign(new Error('socket hang up'), { code: 'ECONNRESET' }),
    });
  };
}

describe('HttpClient retry', () => {
  const retry: RetryConfig = { attempts: 3, delay: 1 };

  it('never retries POST requests (payments, refunds)', async () => {
    const calls = { count: 0 };
    await expect(client(retry, networkErrorFetch(calls)).post('/payment', '{}')).rejects.toThrow();
    expect(calls.count).toBe(1);
  });

  it('retries GET requests on network errors', async () => {
    const calls = { count: 0 };
    await expect(client(retry, networkErrorFetch(calls)).get('/status')).rejects.toThrow();
    expect(calls.count).toBe(3);
  });

  it('retries POST requests explicitly marked retryable (read-only queries)', async () => {
    const calls = { count: 0 };
    await expect(
      client(retry, networkErrorFetch(calls)).post('/query', '{}', { retryable: true })
    ).rejects.toThrow();
    expect(calls.count).toBe(3);
  });

  it('retries on configured status codes only', async () => {
    let count = 0;
    const fetchImpl: typeof fetch = async () => {
      count++;
      return new Response('{}', { status: count === 1 ? 503 : 400 });
    };
    await expect(
      client({ attempts: 5, delay: 1, statusCodes: [503] }, fetchImpl).get('/status')
    ).rejects.toThrow('400');
    expect(count).toBe(2);
  });

  it('returns the response of a successful retry', async () => {
    let count = 0;
    const fetchImpl: typeof fetch = async () => {
      count++;
      if (count === 1) throw new TypeError('fetch failed');
      return new Response('{"ok":true}');
    };
    const res = await client(retry, fetchImpl).get('/status');
    expect(res.data).toEqual({ ok: true });
    expect(count).toBe(2);
  });

  it('does nothing when retry is not configured', async () => {
    const calls = { count: 0 };
    await expect(client(undefined, networkErrorFetch(calls)).get('/status')).rejects.toThrow();
    expect(calls.count).toBe(1);
  });
});
