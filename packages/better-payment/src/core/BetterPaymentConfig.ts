import type { BetterPaymentLogger } from './logger';
import type { RetryConfig } from './retry';
export type { RetryConfig } from './retry';
import type { Iyzico, IyzicoConfig } from '../providers/iyzico';
import type { PayTR } from '../providers/paytr';
import type { PayTRConfig } from '../providers/paytr/types';
import type { Akbank } from '../providers/akbank';
import type { AkbankConfig } from '../providers/akbank/types';
import type { Parampos, ParamposConfig } from '../providers/parampos';
import type { BetterPaymentHandlerOptions } from './BetterPaymentHandler';

/**
 * Provider türleri
 */
export enum ProviderType {
  IYZICO = 'iyzico',
  PAYTR = 'paytr',
  AKBANK = 'akbank',
  PARAMPOS = 'parampos',
}

/**
 * İyzico provider config
 */
export interface IyzicoProviderConfig {
  enabled: boolean;
  config: IyzicoConfig;
}

/**
 * PayTR provider config
 */
export interface PayTRProviderConfig {
  enabled: boolean;
  config: PayTRConfig;
}

/**
 * Akbank provider config
 */
export interface AkbankProviderConfig {
  enabled: boolean;
  config: AkbankConfig;
}

/**
 * Parampos provider config
 */
export interface ParamposProviderConfig {
  enabled: boolean;
  config: ParamposConfig;
}

/**
 * Herhangi bir provider için config
 */
export type ProviderConfig =
  | IyzicoProviderConfig
  | PayTRProviderConfig
  | AkbankProviderConfig
  | ParamposProviderConfig;

export interface BetterPaymentConfig {
  providers: {
    [ProviderType.IYZICO]?: IyzicoProviderConfig;
    [ProviderType.PAYTR]?: PayTRProviderConfig;
    [ProviderType.AKBANK]?: AkbankProviderConfig;
    [ProviderType.PARAMPOS]?: ParamposProviderConfig;
  };
  defaultProvider?: ProviderType;
  /**
   * 'sandbox' selects test URLs and turns on provider test modes (PayTR
   * test_mode, Akbank test gateways). Defaults to 'production'.
   */
  mode?: 'sandbox' | 'production';
  logger?: BetterPaymentLogger;
  retry?: RetryConfig;
  /** Options for `betterPayment.handler` */
  handler?: BetterPaymentHandlerOptions;
}

export const PROVIDER_DEFAULT_URLS: Record<ProviderType, { sandbox: string; production: string }> =
  {
    [ProviderType.IYZICO]: {
      sandbox: 'https://sandbox-api.iyzipay.com',
      production: 'https://api.iyzipay.com',
    },
    [ProviderType.PAYTR]: {
      // PayTR has a single host; test transactions are selected with test_mode=1
      sandbox: 'https://www.paytr.com',
      production: 'https://www.paytr.com',
    },
    [ProviderType.AKBANK]: {
      sandbox: 'https://apipre.akbank.com/api/v1/payment/virtualpos',
      production: 'https://api.akbank.com/api/v1/payment/virtualpos',
    },
    [ProviderType.PARAMPOS]: {
      sandbox: 'https://test-dmz.param.com.tr/turkpos.ws/service_turkpos_test.asmx',
      production: 'https://posws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx',
    },
  };

/**
 * Provider instance map
 */
export interface ProviderInstances {
  [ProviderType.IYZICO]?: Iyzico;
  [ProviderType.PAYTR]?: PayTR;
  [ProviderType.AKBANK]?: Akbank;
  [ProviderType.PARAMPOS]?: Parampos;
}
