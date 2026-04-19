import { PaymentProviderConfig } from './PaymentProvider';
import type { Iyzico } from '../providers/iyzico';
import type { PayTR } from '../providers/paytr';
import type { Akbank } from '../providers/akbank';
import type { Parampos } from '../providers/parampos';

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
  config: PaymentProviderConfig;
}

/**
 * PayTR provider config (ek alanlar gerekiyor)
 */
export interface PayTRProviderConfig {
  enabled: boolean;
  config: PaymentProviderConfig & {
    merchantId: string;
    merchantSalt: string;
  };
}

/**
 * Akbank provider config (ek alanlar gerekiyor)
 */
export interface AkbankProviderConfig {
  enabled: boolean;
  config: PaymentProviderConfig & {
    merchantId: string;
    terminalId: string;
    storeKey: string;
    secure3DStoreKey?: string;
    testMode?: boolean;
  };
}

/**
 * Parampos provider config (ek alanlar gerekiyor)
 */
export interface ParamposProviderConfig {
  enabled: boolean;
  config: PaymentProviderConfig & {
    clientCode: string;
    clientUsername: string;
    clientPassword: string;
    guid: string;
    testMode?: boolean;
  };
}

/**
 * Her provider için config (generic type)
 */
export interface ProviderConfig {
  enabled: boolean;
  config:
    | PaymentProviderConfig
    | (PaymentProviderConfig & { merchantId: string; merchantSalt: string })
    | (PaymentProviderConfig & {
        merchantId: string;
        terminalId: string;
        storeKey: string;
        secure3DStoreKey?: string;
        testMode?: boolean;
      })
    | (PaymentProviderConfig & {
        clientCode: string;
        clientUsername: string;
        clientPassword: string;
        guid: string;
        testMode?: boolean;
      });
}

export interface BetterPaymentConfig {
  providers: {
    [ProviderType.IYZICO]?: IyzicoProviderConfig;
    [ProviderType.PAYTR]?: PayTRProviderConfig;
    [ProviderType.AKBANK]?: AkbankProviderConfig;
    [ProviderType.PARAMPOS]?: ParamposProviderConfig;
  };
  defaultProvider?: ProviderType;
}

/**
 * Provider instance map
 */
export interface ProviderInstances {
  [ProviderType.IYZICO]?: Iyzico;
  [ProviderType.PAYTR]?: PayTR;
  [ProviderType.AKBANK]?: Akbank;
  [ProviderType.PARAMPOS]?: Parampos;
}
