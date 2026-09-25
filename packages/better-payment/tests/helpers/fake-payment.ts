import { vi } from 'vitest';
import { betterPayment, PayTR, ProviderType, type PaymentProvider } from '../../src';

/**
 * A payment object whose providers (every built-in id) are the given fake
 * provider, for handler tests. Under the `paytr` id the fake reports PayTR as its
 * class, so PayTR notifications are answered with plain `OK`.
 */
export function fakePayment(provider: Record<string, any>, { enabled = true } = {}) {
  provider.createPayment ??= vi.fn().mockResolvedValue({ status: 'success' });
  const providers: Record<string, PaymentProvider> = {};
  if (enabled) {
    for (const id of Object.values(ProviderType)) {
      providers[id] = (
        id === ProviderType.PAYTR
          ? new Proxy(provider, { getPrototypeOf: () => PayTR.prototype })
          : provider
      ) as PaymentProvider;
    }
  }
  return betterPayment({ providers });
}
