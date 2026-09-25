import { describe, it, expect } from 'vitest';
import {
  generatePayTRIframeToken,
  generatePayTRDirectToken,
  generatePayTRRefundToken,
  generatePayTRStatusToken,
  generatePayTRBinToken,
  generatePayTRInstallmentRatesToken,
  verifyPayTRCallback,
  formatPayTRBasket,
  convertToKurus,
  convertFromKurus,
  formatPayTRAmount,
  mapPayTRCurrency,
  assertPayTRMerchantOid,
  createPayTRFormData,
  buildAutoSubmitForm,
} from '../../../../src/providers/paytr/utils';

// Reference credentials/vectors (mews/pos PayTR test-suite):
// HMAC key = merchant_key, merchant_salt appended to the signed string
const SALT = 'YEUaNcdHXqyt7hjt';
const KEY = 'wWwU8buJp6jo1r25';

describe('PayTR signatures', () => {
  it('iFrame token', async () => {
    expect(
      await generatePayTRIframeToken(
        {
          merchantId: '123456',
          userIp: '127.0.0.1',
          merchantOid: 'order-123',
          email: 'test@example.com',
          paymentAmount: '10050',
          userBasket: 'W1siUHJvZHVjdCIsIjEwLjUwIiwxXV0=',
          noInstallment: '0',
          maxInstallment: '0',
          currency: 'TL',
          testMode: '1',
        },
        SALT,
        KEY
      )
    ).toBe('O5CaLankrigiiPDh3G75lLWdRX6wrEXGbLRjt37tuzY=');
  });

  it('Direct API token', async () => {
    expect(
      await generatePayTRDirectToken(
        {
          merchantId: '123456',
          userIp: '127.0.0.1',
          merchantOid: 'order-456',
          email: 'test@example.com',
          paymentAmount: '5000',
          paymentType: 'card',
          installmentCount: '0',
          currency: 'TL',
          testMode: '1',
          non3d: '1',
        },
        SALT,
        KEY
      )
    ).toBe('guwHEsodarZg3KTuihE7fpb+qAdKI0IQMUkrGFWZDO0=');
  });

  it('refund, status, BIN and installment-rate tokens', async () => {
    expect(await generatePayTRRefundToken('123456', 'order-789', '5000', SALT, KEY)).toBe(
      '7ZqQEds0nem2gCqpLltwuNlmV9f7KHVlc73qeiNjwMg='
    );
    expect(await generatePayTRStatusToken('123456', 'order-999', SALT, KEY)).toBe(
      'mIFJNpzMuo/gd9pcPNBinujmMVlEkR3DHZ6stLoQo/s='
    );
    expect(await generatePayTRBinToken('415956', '123456', SALT, KEY)).toBe('lAB6uLq369TxD4S7VDGIzOYt6Fy3XKicfn15Xy1TiBM=');
    expect(await generatePayTRInstallmentRatesToken('123456', 'REQ12345', SALT, KEY)).toBe(
      'dx7O59UIbRaErFkP72oGXtQb/TgwFs8l/Qznl06iLls='
    );
  });

  describe('verifyPayTRCallback', () => {
    const callback = {
      merchant_oid: '202606234E4E',
      status: 'success',
      total_amount: '1001',
      hash: 'ZDVOQUw4aDJhNR5dWYBC5bD95bLtSOtj9DzzSQ9sUHs=',
    };

    it('accepts a genuine notification', async () => {
      expect(await verifyPayTRCallback(callback, SALT, KEY)).toBe(true);
    });

    it('rejects tampered status/amount', async () => {
      expect(await verifyPayTRCallback({ ...callback, status: 'failed' }, SALT, KEY)).toBe(false);
      expect(await verifyPayTRCallback({ ...callback, total_amount: '1' }, SALT, KEY)).toBe(false);
    });

    it('rejects a hash made with the salt as key (old, wrong algorithm)', async () => {
      expect(await verifyPayTRCallback(callback, KEY, SALT)).toBe(false);
    });

    it('rejects missing fields', async () => {
      expect(await verifyPayTRCallback({ ...callback, hash: undefined }, SALT, KEY)).toBe(false);
      expect(await verifyPayTRCallback({}, SALT, KEY)).toBe(false);
    });
  });
});

describe('PayTR formatting', () => {
  it('encodes the basket as base64 JSON with TL prices', async () => {
    const basket = formatPayTRBasket([{ name: 'Product', price: '10.50', quantity: 1 }]);
    expect(basket).toBe('W1siUHJvZHVjdCIsIjEwLjUwIiwxXV0=');
    expect(JSON.parse(Buffer.from(basket, 'base64').toString())).toEqual([['Product', '10.50', 1]]);
  });

  it('converts amounts', async () => {
    expect(convertToKurus('100.50')).toBe('10050');
    expect(convertToKurus('0.29')).toBe('29');
    expect(convertToKurus(1.005)).toBe('101');
    expect(convertFromKurus('1001')).toBe('10.01');
    expect(formatPayTRAmount('5')).toBe('5.00');
    expect(() => convertToKurus('abc')).toThrow();
  });

  it('maps currencies and rejects unsupported ones', async () => {
    expect(mapPayTRCurrency('TRY')).toBe('TL');
    expect(mapPayTRCurrency(undefined)).toBe('TL');
    expect(mapPayTRCurrency('usd')).toBe('USD');
    expect(() => mapPayTRCurrency('CHF')).toThrow(/not supported/);
  });

  it('merchant_oid must be alphanumeric', async () => {
    expect(() => assertPayTRMerchantOid('ORDER123')).not.toThrow();
    expect(() => assertPayTRMerchantOid('ORDER-123')).toThrow();
    expect(() => assertPayTRMerchantOid('')).toThrow();
  });

  it('creates form data and escaped auto-submit forms', async () => {
    expect(createPayTRFormData({ a: '1 2', b: 'x&y' })).toBe('a=1%202&b=x%26y');
    const html = buildAutoSubmitForm('https://www.paytr.com/odeme', { user_name: '"><script>' });
    expect(html).toContain('value="&quot;&gt;&lt;script&gt;"');
    expect(html).toContain('action="https://www.paytr.com/odeme"');
  });
});
