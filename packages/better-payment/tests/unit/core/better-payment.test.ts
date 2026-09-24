import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BetterPayment } from '../../../src/core/BetterPayment';
import { ProviderType } from '../../../src/core/BetterPaymentConfig';
import { ProviderNotEnabledError } from '../../../src/core/errors';

// Mock axios so providers don't make real HTTP calls
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      post: vi.fn(),
      get: vi.fn(),
    })),
  },
}));

const iyzicoConfig = {
  iyzico: {
    enabled: true,
    config: { apiKey: 'test-key', secretKey: 'test-secret' },
  },
};

const paytrConfig = {
  paytr: {
    enabled: true,
    config: {
      merchantId: 'MERCHANT_ID',
      merchantKey: 'MERCHANT_KEY',
      merchantSalt: 'MERCHANT_SALT',
    },
  },
};

describe('BetterPayment', () => {
  describe('initialization', () => {
    it('should initialize with iyzico provider', () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      expect(bp.isProviderEnabled(ProviderType.IYZICO)).toBe(true);
    });

    it('should set mode defaults — sandbox uses sandbox baseUrl', () => {
      const bp = new BetterPayment({ providers: iyzicoConfig, mode: 'sandbox' });
      // Just check it initializes without error
      expect(bp.isProviderEnabled(ProviderType.IYZICO)).toBe(true);
    });

    it('should set single provider as default', () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      // When only one provider, it becomes default — createPayment should not throw
      expect(() => (bp as any).getDefaultProvider()).not.toThrow();
    });

    it('should throw when configured defaultProvider is disabled', () => {
      expect(() =>
        new BetterPayment({
          providers: iyzicoConfig,
          defaultProvider: ProviderType.PAYTR,
        })
      ).toThrow();
    });

    it('should throw when iyzico missing apiKey', () => {
      expect(() =>
        new BetterPayment({
          providers: {
            iyzico: { enabled: true, config: { apiKey: '', secretKey: 'sec' } },
          },
        })
      ).toThrow();
    });

    it('should throw when paytr missing merchantId', () => {
      expect(() =>
        new BetterPayment({
          providers: {
            paytr: {
              enabled: true,
              config: { merchantId: '', merchantKey: 'k', merchantSalt: 'salt' },
            },
          },
        })
      ).toThrow();
    });
  });

  describe('use()', () => {
    it('should return iyzico provider when use("iyzico")', () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      expect(() => bp.use('iyzico')).not.toThrow();
    });

    it('should throw ProviderNotEnabledError for disabled provider', () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      expect(() => bp.use('paytr')).toThrow(ProviderNotEnabledError);
    });

    it('should throw ProviderNotEnabledError for unknown string', () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      expect(() => bp.use('stripe' as any)).toThrow(ProviderNotEnabledError);
    });
  });

  describe('getters', () => {
    it('should return iyzico via .iyzico getter', () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      expect(bp.iyzico).toBeDefined();
    });

    it('should throw ProviderNotEnabledError via .paytr getter when disabled', () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      expect(() => bp.paytr).toThrow(ProviderNotEnabledError);
    });

    it('should return paytr via .paytr getter when enabled', () => {
      const bp = new BetterPayment({ providers: paytrConfig });
      expect(bp.paytr).toBeDefined();
    });
  });

  describe('getEnabledProviders()', () => {
    it('should list only enabled providers', () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      const providers = bp.getEnabledProviders();
      expect(providers).toContain(ProviderType.IYZICO);
      expect(providers).not.toContain(ProviderType.PAYTR);
    });

    it('should list multiple enabled providers', () => {
      const bp = new BetterPayment({ providers: { ...iyzicoConfig, ...paytrConfig } });
      const providers = bp.getEnabledProviders();
      expect(providers).toContain(ProviderType.IYZICO);
      expect(providers).toContain(ProviderType.PAYTR);
    });
  });

  describe('isProviderEnabled()', () => {
    it('should return true for enabled provider', () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      expect(bp.isProviderEnabled(ProviderType.IYZICO)).toBe(true);
    });

    it('should return false for disabled provider', () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      expect(bp.isProviderEnabled(ProviderType.PAYTR)).toBe(false);
    });
  });

  describe('default provider delegation', () => {
    it('should throw when no default and calling createPayment', async () => {
      const bp = new BetterPayment({
        providers: { ...iyzicoConfig, ...paytrConfig },
        defaultProvider: undefined,
      });
      await expect(bp.createPayment({} as any)).rejects.toThrow();
    });
  });

  describe('handler', () => {
    it('should expose a handler via .handler getter', () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      expect(bp.handler).toBeDefined();
      expect(typeof bp.handler.handle).toBe('function');
    });
  });

  describe('akbank getter', () => {
    it('should return akbank provider when enabled', () => {
      const bp = new BetterPayment({
        providers: {
          akbank: {
            enabled: true,
            config: {
              merchantSafeId: 'M',
              terminalSafeId: 'T',
              secretKey: 'SK',
            },
          },
        },
      });
      expect(bp.akbank).toBeDefined();
    });

    it('should throw ProviderNotEnabledError when akbank disabled', () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      expect(() => bp.akbank).toThrow(ProviderNotEnabledError);
    });
  });

  describe('parampos getter', () => {
    it('should return parampos provider when enabled', () => {
      const bp = new BetterPayment({
        providers: {
          parampos: {
            enabled: true,
            config: {
              clientCode: 'CC',
              clientUsername: 'user',
              clientPassword: 'pass',
              guid: 'guid',
            },
          },
        },
      });
      expect(bp.parampos).toBeDefined();
    });

    it('should throw ProviderNotEnabledError when parampos disabled', () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      expect(() => bp.parampos).toThrow(ProviderNotEnabledError);
    });
  });

  describe('default provider delegation', () => {
    it('should delegate createPayment to iyzico (single provider)', async () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      const spy = vi.spyOn(bp.iyzico, 'createPayment').mockResolvedValue({ status: 'success' } as any);
      await bp.createPayment({} as any);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should delegate initThreeDSPayment to default provider', async () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      const spy = vi.spyOn(bp.iyzico, 'initThreeDSPayment').mockResolvedValue({ status: 'pending' } as any);
      await bp.initThreeDSPayment({} as any);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should delegate completeThreeDSPayment to default provider', async () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      const spy = vi.spyOn(bp.iyzico, 'completeThreeDSPayment').mockResolvedValue({ status: 'success' } as any);
      await bp.completeThreeDSPayment({});
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should delegate refund to default provider', async () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      const spy = vi.spyOn(bp.iyzico, 'refund').mockResolvedValue({ status: 'success' } as any);
      await bp.refund({} as any);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should delegate cancel to default provider', async () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      const spy = vi.spyOn(bp.iyzico, 'cancel').mockResolvedValue({ status: 'success' } as any);
      await bp.cancel({} as any);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should delegate getPayment to default provider', async () => {
      const bp = new BetterPayment({ providers: iyzicoConfig });
      const spy = vi.spyOn(bp.iyzico, 'getPayment').mockResolvedValue({ status: 'success' } as any);
      await bp.getPayment('PMT-1');
      expect(spy).toHaveBeenCalledWith('PMT-1');
    });

    it('should throw when multiple providers and no defaultProvider set', async () => {
      const bp = new BetterPayment({
        providers: { ...iyzicoConfig, ...paytrConfig },
      });
      await expect(bp.createPayment({} as any)).rejects.toThrow(/No default provider/);
    });

    it('should use explicit defaultProvider when set', async () => {
      const bp = new BetterPayment({
        providers: { ...iyzicoConfig, ...paytrConfig },
        defaultProvider: ProviderType.IYZICO,
      });
      const spy = vi.spyOn(bp.iyzico, 'createPayment').mockResolvedValue({ status: 'success' } as any);
      await bp.createPayment({} as any);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});

describe('BetterPayment mode and defaults', () => {
  it('sandbox mode enables PayTR test mode and sandbox URLs', () => {
    const bp = new BetterPayment({
      mode: 'sandbox',
      providers: {
        paytr: { enabled: true, config: { merchantId: 'M', merchantKey: 'K', merchantSalt: 'S' } },
        akbank: { enabled: true, config: { merchantSafeId: 'M', terminalSafeId: 'T', secretKey: 'K' } },
        parampos: {
          enabled: true,
          config: { clientCode: '1', clientUsername: 'u', clientPassword: 'p', guid: 'g' },
        },
      },
    });
    expect((bp.paytr as any).config.testMode).toBe(true);
    expect((bp.akbank as any).config.testMode).toBe(true);
    expect((bp.akbank as any).config.baseUrl).toBe('https://apipre.akbank.com/api/v1/payment/virtualpos');
    expect((bp.parampos as any).config.baseUrl).toBe(
      'https://test-dmz.param.com.tr/turkpos.ws/service_turkpos_test.asmx'
    );
  });

  it('production mode keeps test mode off unless configured', () => {
    const bp = new BetterPayment({
      providers: { paytr: { enabled: true, config: { merchantId: 'M', merchantKey: 'K', merchantSalt: 'S' } } },
    });
    expect((bp.paytr as any).config.testMode).toBe(false);
  });

  it('explicit baseUrl wins over mode defaults', () => {
    const bp = new BetterPayment({
      mode: 'sandbox',
      providers: {
        iyzico: { enabled: true, config: { apiKey: 'a', secretKey: 's', baseUrl: 'https://custom' } },
      },
    });
    expect((bp.iyzico as any).config.baseUrl).toBe('https://custom');
  });

  it('throws ConfigurationError with the missing field names', async () => {
    const { ConfigurationError } = await import('../../../src/core/errors');
    try {
      new BetterPayment({
        providers: { paytr: { enabled: true, config: { merchantId: 'M', merchantKey: '', merchantSalt: '' } } },
      });
      expect.unreachable();
    } catch (error: any) {
      expect(error).toBeInstanceOf(ConfigurationError);
      expect(error.message).toContain('merchantKey');
      expect(error.message).toContain('merchantSalt');
    }
  });

  it('handler uses config.handler options', () => {
    expect(
      () =>
        new BetterPayment({
          providers: { iyzico: { enabled: true, config: { apiKey: 'a', secretKey: 's' } } },
          handler: { allowedActions: ['refund'] },
        }).handler
    ).toThrow(/authorize/);
  });
});
