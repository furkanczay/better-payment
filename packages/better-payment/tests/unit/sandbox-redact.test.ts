import { describe, it, expect } from 'vitest';
import { redact } from '../sandbox/setup';

describe('sandbox fixture redaction', () => {
  it('masks secrets, personal data and card numbers, keeping the shape', () => {
    const raw = {
      status: 'success',
      paymentId: '12345',
      token: 'abc',
      buyer: { name: 'John', email: 'john@example.com', gsmNumber: '+905350000000' },
      binNumber: '552879',
      lastFourDigits: '0008',
      note: 'card 5528790000000008 declined',
      itemTransactions: [{ paymentTransactionId: '777', price: 0.3 }],
      hash: 'x',
    };

    expect(redact(raw)).toEqual({
      status: 'success',
      paymentId: '12345',
      token: '<redacted>',
      buyer: '<redacted>',
      binNumber: '552879',
      lastFourDigits: '0008',
      note: 'card <pan> declined',
      itemTransactions: [{ paymentTransactionId: '777', price: 0.3 }],
      hash: '<redacted>',
    });
  });
});
