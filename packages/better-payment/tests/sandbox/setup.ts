import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { PaymentCard, PaymentRequest, ThreeDSPaymentRequest } from '../../src/types';
import { PaymentStatus } from '../../src/types';
import {
  mockBasketItems,
  mockBillingAddress,
  mockBuyer,
  mockShippingAddress,
} from '../fixtures/payment-data';

/**
 * Sandbox tests call the providers' real test environments. Each suite is
 * skipped unless its credentials are set, so `pnpm test:sandbox` is safe to
 * run anywhere. See CONTRIBUTING.md for the variables.
 */

/** Returns the named variables, or undefined when any of them is missing */
export function requireEnv<K extends string>(...names: K[]): Record<K, string> | undefined {
  const values = {} as Record<K, string>;
  for (const name of names) {
    const value = process.env[name];
    if (!value) return undefined;
    values[name] = value;
  }
  return values;
}

/** Reads `<PREFIX>_CARD_NUMBER` etc., falling back to the given test card */
export function sandboxCard(prefix: string, fallback?: PaymentCard): PaymentCard | undefined {
  const number = process.env[`${prefix}_CARD_NUMBER`];
  if (!number) return fallback;
  return {
    cardHolderName: process.env[`${prefix}_CARD_HOLDER`] || 'Test User',
    cardNumber: number,
    expireMonth: process.env[`${prefix}_CARD_EXPIRE_MONTH`] || '12',
    expireYear: process.env[`${prefix}_CARD_EXPIRE_YEAR`] || '2030',
    cvc: process.env[`${prefix}_CARD_CVC`] || '000',
  };
}

/** Alphanumeric order id, unique per run (PayTR accepts only [A-Za-z0-9]) */
export function orderId(tag: string): string {
  return `BPSBX${tag}${Date.now()}${crypto.randomBytes(3).toString('hex')}`.toUpperCase();
}

export const CALLBACK_URL = 'https://example.com/api/pay/callback';

/** Order fields shared by payment and checkout-form requests (1 TRY basket) */
export function order() {
  return {
    price: '1',
    paidPrice: '1',
    currency: 'TRY',
    basketId: 'BPSANDBOX',
    buyer: mockBuyer,
    shippingAddress: mockShippingAddress,
    billingAddress: mockBillingAddress,
    basketItems: mockBasketItems,
  };
}

export function paymentRequest(
  card: PaymentCard,
  overrides: Partial<PaymentRequest> = {}
): PaymentRequest {
  return { ...order(), paymentCard: card, ...overrides };
}

export function threeDSRequest(
  card: PaymentCard,
  overrides: Partial<ThreeDSPaymentRequest> = {}
): ThreeDSPaymentRequest {
  return { ...paymentRequest(card), callbackUrl: CALLBACK_URL, ...overrides };
}

/**
 * Sandbox environments sometimes reset connections (ECONNRESET). The library
 * correctly reports that as pending + NETWORK_ERROR and never retries a
 * payment; the sandbox suite retries once so a flaky test host does not hide
 * real provider regressions. Never do this with real money: check the outcome
 * with getPayment() instead.
 */
export async function withSandboxRetry<T extends { errorCode?: string }>(
  attempt: () => Promise<T>,
  retries = 1
): Promise<T> {
  let result = await attempt();
  for (let i = 0; i < retries && result.errorCode === 'NETWORK_ERROR'; i++) {
    console.warn('sandbox: retrying after NETWORK_ERROR', result);
    result = await attempt();
  }
  return result;
}

/** Readable assertion message: includes the provider error when the status is wrong */
export function describeResult(result: {
  status: PaymentStatus;
  errorCode?: string;
  errorMessage?: string;
}): string {
  return `status=${result.status} errorCode=${result.errorCode ?? '-'} errorMessage=${
    result.errorMessage ?? '-'
  }`;
}

const SENSITIVE_KEY =
  /card(number|holder)|^cvc$|cvv|token|hash|secret|password|apikey|merchantkey|salt|guid|identity|gsm|email|^ip$|user_ip|buyer|surname|contactname|address/i;
const PAN = /\b\d{13,19}\b/g;

/** Masks secrets and personal data so a response can be committed as a fixture */
export function redact(value: unknown, key = ''): unknown {
  if (key && SENSITIVE_KEY.test(key) && value !== null && value !== undefined) {
    return '<redacted>';
  }
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, redact(v, k)])
    );
  }
  if (typeof value === 'string') return value.replace(PAN, '<pan>');
  return value;
}

/**
 * With SANDBOX_RECORD=1, writes the redacted raw provider response to
 * tests/fixtures/recorded/<provider>/<name>.json for contract tests.
 */
export function record(provider: string, name: string, rawResponse: unknown): void {
  if (process.env.SANDBOX_RECORD !== '1' || rawResponse === undefined) return;
  const dir = path.resolve(__dirname, '../fixtures/recorded', provider);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    path.join(dir, `${name}.json`),
    JSON.stringify(redact(rawResponse), null, 2) + '\n'
  );
}
