import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  generatePayTRHash,
  verifyPayTRCallback,
  formatPayTRBasket,
  convertToKurus,
  generatePayTRToken,
  generateBinDetailToken,
  createPayTRFormData,
} from '../../../../src/providers/paytr/utils';

describe('PayTR Utils', () => {
  const MERCHANT_ID = 'MERCHANT123';
  const MERCHANT_SALT = 'test-salt-value';

  describe('generatePayTRHash', () => {
    it('should generate a base64 HMAC-SHA256 hash', () => {
      const hash = generatePayTRHash(
        MERCHANT_ID,
        '127.0.0.1',
        'ORDER-001',
        'user@example.com',
        '10000',
        'W1siUHJvZHVjdCIsIjEwMC4wMCIsMV1d',
        '0',
        '0',
        'TL',
        '1',
        MERCHANT_SALT
      );
      expect(typeof hash).toBe('string');
      // Base64 pattern
      expect(hash).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should produce consistent results for same inputs', () => {
      const args = [MERCHANT_ID, '1.2.3.4', 'ORD-1', 'a@b.com', '5000', '[]', '0', '0', 'TL', '0', MERCHANT_SALT] as const;
      expect(generatePayTRHash(...args)).toBe(generatePayTRHash(...args));
    });

    it('should produce different results for different inputs', () => {
      const h1 = generatePayTRHash(MERCHANT_ID, '1.1.1.1', 'ORD-1', 'a@b.com', '5000', '[]', '0', '0', 'TL', '0', MERCHANT_SALT);
      const h2 = generatePayTRHash(MERCHANT_ID, '2.2.2.2', 'ORD-2', 'a@b.com', '5000', '[]', '0', '0', 'TL', '0', MERCHANT_SALT);
      expect(h1).not.toBe(h2);
    });
  });

  describe('verifyPayTRCallback', () => {
    it('should return true for a valid hash', () => {
      const merchantOid = 'ORDER-001';
      const status = 'success';
      const totalAmount = '10000';
      const hash = crypto
        .createHmac('sha256', MERCHANT_SALT)
        .update(`${merchantOid}${MERCHANT_SALT}${status}${totalAmount}`)
        .digest('base64');

      expect(verifyPayTRCallback(merchantOid, MERCHANT_SALT, status, totalAmount, hash)).toBe(true);
    });

    it('should return false for a tampered hash', () => {
      expect(verifyPayTRCallback('ORD-1', MERCHANT_SALT, 'success', '10000', 'INVALID_HASH==')).toBe(false);
    });

    it('should return false for wrong status', () => {
      const merchantOid = 'ORD-1';
      const hash = crypto
        .createHmac('sha256', MERCHANT_SALT)
        .update(`${merchantOid}${MERCHANT_SALT}success10000`)
        .digest('base64');
      expect(verifyPayTRCallback(merchantOid, MERCHANT_SALT, 'failed', '10000', hash)).toBe(false);
    });
  });

  describe('formatPayTRBasket', () => {
    it('should encode basket as JSON array of arrays', () => {
      const basket = [{ name: 'Item A', price: '50.00', quantity: 2 }];
      const result = formatPayTRBasket(basket);
      expect(JSON.parse(result)).toEqual([['Item A', '50.00', 2]]);
    });

    it('should handle multiple items', () => {
      const basket = [
        { name: 'A', price: '10.00', quantity: 1 },
        { name: 'B', price: '20.00', quantity: 3 },
      ];
      const result = JSON.parse(formatPayTRBasket(basket));
      expect(result).toHaveLength(2);
      expect(result[1]).toEqual(['B', '20.00', 3]);
    });
  });

  describe('convertToKurus', () => {
    it('should convert TL to kurus (x100)', () => {
      expect(convertToKurus('100.00')).toBe('10000');
      expect(convertToKurus('1.50')).toBe('150');
      expect(convertToKurus('99.99')).toBe('9999');
    });

    it('should round floating point correctly', () => {
      expect(convertToKurus('0.01')).toBe('1');
    });
  });

  describe('generatePayTRToken', () => {
    it('should produce a base64 string', () => {
      const token = generatePayTRToken(MERCHANT_ID, 'ORD-001', '10000', MERCHANT_SALT);
      expect(token).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should be deterministic', () => {
      const t1 = generatePayTRToken(MERCHANT_ID, 'ORD-1', '5000', MERCHANT_SALT);
      const t2 = generatePayTRToken(MERCHANT_ID, 'ORD-1', '5000', MERCHANT_SALT);
      expect(t1).toBe(t2);
    });
  });

  describe('generateBinDetailToken', () => {
    it('should produce a base64 string', () => {
      const token = generateBinDetailToken(MERCHANT_ID, '454360', MERCHANT_SALT);
      expect(token).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    it('should differ for different BIN numbers', () => {
      const t1 = generateBinDetailToken(MERCHANT_ID, '454360', MERCHANT_SALT);
      const t2 = generateBinDetailToken(MERCHANT_ID, '411111', MERCHANT_SALT);
      expect(t1).not.toBe(t2);
    });
  });

  describe('createPayTRFormData', () => {
    it('should encode key=value pairs separated by &', () => {
      const result = createPayTRFormData({ a: '1', b: '2' });
      expect(result).toBe('a=1&b=2');
    });

    it('should URL-encode special characters', () => {
      const result = createPayTRFormData({ email: 'user@example.com' });
      expect(result).toBe('email=user%40example.com');
    });
  });
});
