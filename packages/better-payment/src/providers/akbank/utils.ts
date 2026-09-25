import { safeEqual, formatDecimal } from '../../core/utils';
import { hmac, randomHex, toBase64 } from '../../core/crypto';
import { ValidationError } from '../../core/errors';

export const AKBANK_API_VERSION = '1.00';

export const AKBANK_SUCCESS_CODE = 'VPS-0000';

export const AKBANK_TXN_CODES = {
  SALE: '1000',
  REFUND: '1002',
  VOID: '1003',
  PRE_AUTH: '1004',
  POST_AUTH: '1005',
  ORDER_HISTORY: '1010',
  SECURE_SALE: '3000',
  SECURE_PRE_AUTH: '3004',
} as const;

export const AKBANK_3D_GATEWAYS = {
  test: 'https://virtualpospaymentgatewaypre.akbank.com/securepay',
  production: 'https://virtualpospaymentgateway.akbank.com/securepay',
};

/**
 * base64(HMAC-SHA512(data, secretKey))
 */
export async function akbankSign(data: string, secretKey: string): Promise<string> {
  return toBase64(await hmac('SHA-512', secretKey, data));
}

/**
 * Fields signed for the 3D form, in this exact order
 */
export const AKBANK_3D_HASH_FIELDS = [
  'paymentModel',
  'txnCode',
  'merchantSafeId',
  'terminalSafeId',
  'orderId',
  'lang',
  'amount',
  'ccbRewardAmount',
  'pcbRewardAmount',
  'xcbRewardAmount',
  'currencyCode',
  'installCount',
  'okUrl',
  'failUrl',
  'emailAddress',
  'subMerchantId',
  'creditCard',
  'expiredDate',
  'cvv',
  'randomNumber',
  'requestDateTime',
  'b2bIdentityNumber',
] as const;

export function createAkbank3DFormHash(
  fields: Record<string, string | undefined>,
  secretKey: string
): Promise<string> {
  const data = AKBANK_3D_HASH_FIELDS.map((key) => fields[key] ?? '').join('');
  return akbankSign(data, secretKey);
}

/**
 * Fields that must be covered by the callback signature for the result to be trusted
 */
const REQUIRED_CALLBACK_HASH_FIELDS = [
  'responseCode',
  'orderId',
  'merchantSafeId',
  'terminalSafeId',
];

/**
 * Verifies the okUrl/failUrl callback: hash = base64(HMAC-SHA512(values of hashParams, secretKey))
 */
export async function verifyAkbank3DCallback(
  data: Record<string, string | undefined>,
  secretKey: string
): Promise<boolean> {
  if (!data || !data.hash || !data.hashParams) return false;
  const params = data.hashParams.split('+').filter(Boolean);
  if (!REQUIRED_CALLBACK_HASH_FIELDS.every((field) => params.includes(field))) return false;
  const expected = await akbankSign(params.map((key) => data[key] ?? '').join(''), secretKey);
  return safeEqual(expected, data.hash);
}

/**
 * 128 hex chars (uppercase)
 */
export function generateAkbankRandomNumber(): string {
  return randomHex(64).toUpperCase();
}

/**
 * requestDateTime: Europe/Istanbul local time, "YYYY-MM-DDTHH:mm:ss.000"
 */
export function formatAkbankDateTime(date: Date = new Date()): string {
  // Turkey is UTC+3 all year (no DST since 2016)
  const local = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  return local.toISOString().slice(0, 19) + '.000';
}

/**
 * Amount with 2 decimals ("1.10")
 */
export function formatAkbankAmount(amount: string | number): string {
  return formatDecimal(amount);
}

/**
 * Card expiry MMYY
 */
export function formatAkbankExpiry(month: string, year: string): string {
  const mm = month.padStart(2, '0');
  const yy = year.length === 4 ? year.slice(-2) : year.padStart(2, '0');
  if (!/^\d{2}$/.test(mm) || Number(mm) < 1 || Number(mm) > 12 || !/^\d{2}$/.test(yy)) {
    throw new ValidationError(`Invalid card expiry: ${month}/${year}`);
  }
  return `${mm}${yy}`;
}

/**
 * ISO 4217 numeric currency code
 */
export function getAkbankCurrencyCode(currency: string | undefined): number {
  const map: Record<string, number> = {
    TRY: 949,
    TL: 949,
    USD: 840,
    EUR: 978,
    GBP: 826,
    JPY: 392,
    RUB: 643,
  };
  const code = map[(currency || 'TRY').toUpperCase()];
  if (!code) {
    throw new ValidationError(`Currency ${currency} is not supported by Akbank`);
  }
  return code;
}
