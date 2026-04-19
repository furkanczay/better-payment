import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Akbank } from '../../../../src/providers/akbank';
import { PaymentStatus } from '../../../../src/types';

describe('Akbank Provider - Unit Tests', () => {
  let akbank: Akbank;

  beforeEach(() => {
    akbank = new Akbank({
      apiKey: 'test-api-key',
      secretKey: 'test-secret-key',
      baseUrl: 'https://test-api.akbank.com',
      locale: 'tr',
      merchantId: 'TEST_MERCHANT',
      terminalId: 'TEST_TERMINAL',
      storeKey: 'TEST_STORE_KEY',
      secure3DStoreKey: 'TEST_3D_STORE_KEY',
    });
  });

  describe('mapStatus', () => {
    it('should map Success to PaymentStatus.SUCCESS', () => {
      const mapStatus = (akbank as any).mapStatus.bind(akbank);
      expect(mapStatus('Success')).toBe(PaymentStatus.SUCCESS);
    });

    it('should map Declined to PaymentStatus.FAILURE', () => {
      const mapStatus = (akbank as any).mapStatus.bind(akbank);
      expect(mapStatus('Declined')).toBe(PaymentStatus.FAILURE);
    });

    it('should map Error to PaymentStatus.FAILURE', () => {
      const mapStatus = (akbank as any).mapStatus.bind(akbank);
      expect(mapStatus('Error')).toBe(PaymentStatus.FAILURE);
    });

    it('should map unknown status to PaymentStatus.PENDING', () => {
      const mapStatus = (akbank as any).mapStatus.bind(akbank);
      expect(mapStatus('Unknown')).toBe(PaymentStatus.PENDING);
    });
  });
});
