import { describe, it, expect } from 'vitest';
import {
  BetterPaymentError,
  ProviderNotEnabledError,
  PaymentFailedError,
  ValidationError,
  ConfigurationError,
} from '../../../src/core/errors';

describe('Error Classes', () => {
  describe('BetterPaymentError', () => {
    it('should set message, code, and name', () => {
      const err = new BetterPaymentError('test message', 'TEST_CODE');
      expect(err.message).toBe('test message');
      expect(err.code).toBe('TEST_CODE');
      expect(err.name).toBe('BetterPaymentError');
    });

    it('should set optional provider field', () => {
      const err = new BetterPaymentError('msg', 'CODE', 'iyzico');
      expect(err.provider).toBe('iyzico');
    });

    it('should pass instanceof check', () => {
      const err = new BetterPaymentError('msg', 'CODE');
      expect(err instanceof BetterPaymentError).toBe(true);
      expect(err instanceof Error).toBe(true);
    });
  });

  describe('ProviderNotEnabledError', () => {
    it('should format message with provider name', () => {
      const err = new ProviderNotEnabledError('paytr');
      expect(err.message).toBe("Provider 'paytr' is not enabled or configured");
      expect(err.code).toBe('PROVIDER_NOT_ENABLED');
      expect(err.provider).toBe('paytr');
      expect(err.name).toBe('ProviderNotEnabledError');
    });

    it('should pass instanceof checks', () => {
      const err = new ProviderNotEnabledError('iyzico');
      expect(err instanceof ProviderNotEnabledError).toBe(true);
      expect(err instanceof BetterPaymentError).toBe(true);
      expect(err instanceof Error).toBe(true);
    });
  });

  describe('PaymentFailedError', () => {
    it('should set code to PAYMENT_FAILED', () => {
      const err = new PaymentFailedError('Payment declined');
      expect(err.code).toBe('PAYMENT_FAILED');
      expect(err.message).toBe('Payment declined');
      expect(err.name).toBe('PaymentFailedError');
    });

    it('should set optional errorCode and rawResponse', () => {
      const raw = { status: 'failure' };
      const err = new PaymentFailedError('declined', 'ERR_001', raw, 'akbank');
      expect(err.errorCode).toBe('ERR_001');
      expect(err.rawResponse).toBe(raw);
      expect(err.provider).toBe('akbank');
    });

    it('should pass instanceof checks', () => {
      const err = new PaymentFailedError('failed');
      expect(err instanceof PaymentFailedError).toBe(true);
      expect(err instanceof BetterPaymentError).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should set code to VALIDATION_ERROR', () => {
      const err = new ValidationError('invalid price');
      expect(err.code).toBe('VALIDATION_ERROR');
      expect(err.name).toBe('ValidationError');
    });

    it('should pass instanceof checks', () => {
      const err = new ValidationError('bad input');
      expect(err instanceof ValidationError).toBe(true);
      expect(err instanceof BetterPaymentError).toBe(true);
    });
  });

  describe('ConfigurationError', () => {
    it('should set code to CONFIGURATION_ERROR', () => {
      const err = new ConfigurationError('missing apiKey');
      expect(err.code).toBe('CONFIGURATION_ERROR');
      expect(err.name).toBe('ConfigurationError');
    });

    it('should pass instanceof checks', () => {
      const err = new ConfigurationError('bad config', 'iyzico');
      expect(err instanceof ConfigurationError).toBe(true);
      expect(err instanceof BetterPaymentError).toBe(true);
      expect(err.provider).toBe('iyzico');
    });
  });
});
