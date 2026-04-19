import { describe, it, expect } from 'vitest';
import {
  createAkbankHash,
  createAkbank3DHash,
  verifyAkbank3DHash,
  formatAmount,
  parseAmount,
} from '../../../../src/providers/akbank/utils';
import * as crypto from 'crypto';

describe('Akbank Utils - Unit Tests', () => {
  describe('createAkbankHash', () => {
    it('should create correct hash', () => {
      const params = {
        merchantId: 'MERCHANT',
        terminalId: 'TERMINAL',
        orderId: 'ORDER123',
        amount: '10000',
        currency: '949',
        storeKey: 'STOREKEY',
        txnType: 'Auth',
      };

      const expectedData = 'MERCHANT|TERMINAL|ORDER123|10000|949|Auth|STOREKEY';
      const expectedHash = crypto
        .createHash('sha512')
        .update(expectedData, 'utf8')
        .digest('base64');

      const result = createAkbankHash(params);
      expect(result).toBe(expectedHash);
    });
  });

  describe('createAkbank3DHash', () => {
    it('should create correct 3D hash', () => {
      const params = {
        merchantId: 'MERCHANT',
        terminalId: 'TERMINAL',
        orderId: 'ORDER123',
        amount: '10000',
        currency: '949',
        successUrl: 'https://success.com',
        errorUrl: 'https://error.com',
        secure3DStoreKey: '3DSTOREKEY',
        txnType: 'Auth',
      };

      const expectedData =
        'MERCHANT|TERMINAL|ORDER123|10000|949|https://success.com|https://error.com|Auth|3DSTOREKEY';
      const expectedHash = crypto
        .createHash('sha512')
        .update(expectedData, 'utf8')
        .digest('base64');

      const result = createAkbank3DHash(params);
      expect(result).toBe(expectedHash);
    });
  });

  describe('verifyAkbank3DHash', () => {
    it('should verify correct hash', () => {
      const params = {
        merchantId: 'MERCHANT',
        terminalId: 'TERMINAL',
        orderId: 'ORDER123',
        amount: '10000',
        currency: '949',
        secure3DStoreKey: '3DSTOREKEY',
      };

      const hashData = 'MERCHANT|TERMINAL|ORDER123|10000|949|3DSTOREKEY';
      const secure3DHash = crypto.createHash('sha512').update(hashData, 'utf8').digest('base64');

      const result = verifyAkbank3DHash({
        ...params,
        secure3DHash,
      });

      expect(result).toBe(true);
    });

    it('should fail incorrect hash', () => {
      const params = {
        merchantId: 'MERCHANT',
        terminalId: 'TERMINAL',
        orderId: 'ORDER123',
        amount: '10000',
        currency: '949',
        secure3DStoreKey: '3DSTOREKEY',
        secure3DHash: 'WRONG_HASH',
      };

      const result = verifyAkbank3DHash(params);
      expect(result).toBe(false);
    });
  });

  describe('formatAmount', () => {
    it('should format amount correctly', () => {
      expect(formatAmount(100)).toBe('10000');
      expect(formatAmount(100.5)).toBe('10050');
      expect(formatAmount(100.55)).toBe('10055');
    });
  });

  describe('parseAmount', () => {
    it('should parse amount correctly', () => {
      expect(parseAmount('10000')).toBe(100);
      expect(parseAmount('10050')).toBe(100.5);
      expect(parseAmount('10055')).toBe(100.55);
    });
  });
});
