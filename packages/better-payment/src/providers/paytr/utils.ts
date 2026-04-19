import crypto from 'crypto';
import type { PayTRBasketItem } from './types';

/**
 * PayTR için hash oluşturur
 */
export function generatePayTRHash(
  merchantId: string,
  userIp: string,
  merchantOid: string,
  email: string,
  paymentAmount: string,
  userBasket: string,
  noInstallment: string,
  maxInstallment: string,
  currency: string,
  testMode: string,
  merchantSalt: string
): string {
  const hashStr = `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${userBasket}${noInstallment}${maxInstallment}${currency}${testMode}${merchantSalt}`;
  return crypto.createHmac('sha256', merchantSalt).update(hashStr).digest('base64');
}

/**
 * PayTR callback hash'ini doğrular
 */
export function verifyPayTRCallback(
  merchantOid: string,
  merchantSalt: string,
  status: string,
  totalAmount: string,
  hash: string
): boolean {
  const calculatedHash = crypto
    .createHmac('sha256', merchantSalt)
    .update(`${merchantOid}${merchantSalt}${status}${totalAmount}`)
    .digest('base64');

  return calculatedHash === hash;
}

/**
 * Sepet itemlerini PayTR formatına çevirir
 */
export function formatPayTRBasket(items: PayTRBasketItem[]): string {
  const basketArray = items.map((item) => [item.name, item.price, item.quantity]);
  return JSON.stringify(basketArray);
}

/**
 * TL'yi kuruşa çevirir
 */
export function convertToKurus(amount: string): string {
  const amountFloat = parseFloat(amount);
  return Math.round(amountFloat * 100).toString();
}

/**
 * Kuruşu TL'ye çevirir
 */
export function convertFromKurus(kurus: string): string {
  const kurusInt = parseInt(kurus, 10);
  return (kurusInt / 100).toFixed(2);
}

/**
 * PayTR token oluşturur
 */
export function generatePayTRToken(
  merchantId: string,
  merchantOid: string,
  returnAmount: string,
  merchantSalt: string
): string {
  const tokenStr = `${merchantId}${merchantOid}${returnAmount}${merchantSalt}`;
  return crypto.createHmac('sha256', merchantSalt).update(tokenStr).digest('base64');
}

/**
 * PayTR form data oluşturur
 */
export function createPayTRFormData(data: Record<string, string>): string {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}
