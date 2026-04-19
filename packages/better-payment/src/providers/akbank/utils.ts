import * as crypto from 'crypto';

/**
 * Akbank hash oluştur
 */
export function createAkbankHash(params: {
  merchantId: string;
  terminalId: string;
  orderId: string;
  amount: string;
  currency: string;
  storeKey: string;
  txnType?: string;
}): string {
  const { merchantId, terminalId, orderId, amount, currency, storeKey, txnType = 'Auth' } = params;

  // Hash formatı: MERCHANTID|TERMINALID|ORDERID|AMOUNT|CURRENCY|TXNTYPE|STOREKEY
  const hashData = `${merchantId}|${terminalId}|${orderId}|${amount}|${currency}|${txnType}|${storeKey}`;

  return crypto.createHash('sha512').update(hashData, 'utf8').digest('base64');
}

/**
 * Akbank 3D Secure hash oluştur
 */
export function createAkbank3DHash(params: {
  merchantId: string;
  terminalId: string;
  orderId: string;
  amount: string;
  currency: string;
  successUrl: string;
  errorUrl: string;
  secure3DStoreKey: string;
  txnType?: string;
}): string {
  const {
    merchantId,
    terminalId,
    orderId,
    amount,
    currency,
    successUrl,
    errorUrl,
    secure3DStoreKey,
    txnType = 'Auth',
  } = params;

  // Hash formatı: MERCHANTID|TERMINALID|ORDERID|AMOUNT|CURRENCY|SUCCESSURL|ERRORURL|TXNTYPE|STOREKEY
  const hashData = `${merchantId}|${terminalId}|${orderId}|${amount}|${currency}|${successUrl}|${errorUrl}|${txnType}|${secure3DStoreKey}`;

  return crypto.createHash('sha512').update(hashData, 'utf8').digest('base64');
}

/**
 * Akbank 3D callback hash doğrula
 */
export function verifyAkbank3DHash(params: {
  merchantId: string;
  terminalId: string;
  orderId: string;
  secure3DHash: string;
  secure3DStoreKey: string;
  amount?: string;
  currency?: string;
}): boolean {
  const { merchantId, terminalId, orderId, secure3DHash, secure3DStoreKey, amount, currency } =
    params;

  let hashData: string;
  if (amount && currency) {
    hashData = `${merchantId}|${terminalId}|${orderId}|${amount}|${currency}|${secure3DStoreKey}`;
  } else {
    hashData = `${merchantId}|${terminalId}|${orderId}|${secure3DStoreKey}`;
  }

  const calculatedHash = crypto.createHash('sha512').update(hashData, 'utf8').digest('base64');

  return calculatedHash === secure3DHash;
}

/**
 * Tutarı kuruş cinsine çevir
 */
export function formatAmount(amount: number): string {
  return Math.round(amount * 100).toString();
}

/**
 * Kuruşu TL'ye çevir
 */
export function parseAmount(amount: string): number {
  return parseInt(amount, 10) / 100;
}

/**
 * Kart son kullanma tarihini formatla (YYMM)
 */
export function formatExpiry(month: string, year: string): string {
  const yearStr = year.length === 4 ? year.slice(-2) : year;
  const monthStr = month.padStart(2, '0');
  return `${yearStr}${monthStr}`;
}

/**
 * Para birimi kodunu getir (949 = TRY)
 */
export function getCurrencyCode(currency: string): string {
  const currencyMap: Record<string, string> = {
    TRY: '949',
    USD: '840',
    EUR: '978',
    GBP: '826',
  };

  return currencyMap[currency.toUpperCase()] || '949';
}
