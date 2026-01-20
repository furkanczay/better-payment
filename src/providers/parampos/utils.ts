/**
 * Parampos Utility Functions
 *
 * Hash generation, verification, and formatting utilities for Parampos API
 */

import * as crypto from 'crypto';
import { ParamposCurrency } from './types';
import { Currency } from '../../types';

/**
 * Generate SHA256 hash and encode as Base64 for payment requests
 *
 * Formula: CLIENT_CODE & GUID & Taksit & Islem_Tutar & Toplam_Tutar & Siparis_ID
 *
 * @param clientCode Merchant client code
 * @param guid Merchant GUID
 * @param installment Number of installments
 * @param transactionAmount Transaction amount
 * @param totalAmount Total amount (with installment fees)
 * @param orderId Order/basket ID
 * @returns Base64 encoded SHA256 hash
 */
export function generateParamposPaymentHash(
  clientCode: string,
  guid: string,
  installment: number,
  transactionAmount: string,
  totalAmount: string,
  orderId: string
): string {
  const hashString = `${clientCode}${guid}${installment}${transactionAmount}${totalAmount}${orderId}`;

  return crypto.createHash('sha256').update(hashString, 'utf8').digest('base64');
}

/**
 * Generate SHA1 hash for 3D Secure callback verification
 *
 * Formula: islemGUID + md + mdStatus + orderId + GUID
 *
 * @param islemGuid Transaction GUID
 * @param md MD parameter from 3DS
 * @param mdStatus MD status from 3DS
 * @param orderId Order ID
 * @param guid Merchant GUID
 * @returns Base64 encoded SHA1 hash
 */
export function generateParampos3DSVerificationHash(
  islemGuid: string,
  md: string,
  mdStatus: string,
  orderId: string,
  guid: string
): string {
  const hashString = `${islemGuid}${md}${mdStatus}${orderId}${guid}`;

  return crypto.createHash('sha1').update(hashString, 'utf8').digest('base64');
}

/**
 * Verify 3D Secure callback hash
 *
 * @param islemGuid Transaction GUID from callback
 * @param md MD parameter from callback
 * @param mdStatus MD status from callback
 * @param orderId Order ID from callback
 * @param guid Merchant GUID
 * @param receivedHash Hash received in callback
 * @returns True if hash is valid, false otherwise
 */
export function verifyParampos3DSCallback(
  islemGuid: string,
  md: string,
  mdStatus: string,
  orderId: string,
  guid: string,
  receivedHash: string
): boolean {
  const expectedHash = generateParampos3DSVerificationHash(
    islemGuid,
    md,
    mdStatus,
    orderId,
    guid
  );

  return expectedHash === receivedHash;
}

/**
 * Convert unified Currency enum to Parampos currency code
 *
 * @param currency Unified currency enum value
 * @returns Parampos currency code
 */
export function mapCurrencyToParampos(currency: Currency | string): string {
  const currencyMap: Record<string, string> = {
    [Currency.TRY]: ParamposCurrency.TRY,
    [Currency.USD]: ParamposCurrency.USD,
    [Currency.EUR]: ParamposCurrency.EUR,
    [Currency.GBP]: ParamposCurrency.GBP,
  };

  return currencyMap[currency] || ParamposCurrency.TRY;
}

/**
 * Convert Parampos currency code to unified Currency enum
 *
 * @param paramposCurrency Parampos currency code
 * @returns Unified currency enum value
 */
export function mapCurrencyFromParampos(paramposCurrency: string): Currency {
  const currencyMap: Record<string, Currency> = {
    [ParamposCurrency.TRY]: Currency.TRY,
    [ParamposCurrency.USD]: Currency.USD,
    [ParamposCurrency.EUR]: Currency.EUR,
    [ParamposCurrency.GBP]: Currency.GBP,
  };

  return currencyMap[paramposCurrency] || Currency.TRY;
}

/**
 * Format amount to Parampos format (2 decimal places, e.g., "100.00")
 *
 * @param amount Amount as string or number
 * @returns Formatted amount string
 */
export function formatParamposAmount(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  return numAmount.toFixed(2);
}

/**
 * Format card expiry month to MM format
 *
 * @param month Month (1-12 or "01"-"12")
 * @returns Formatted month string (MM)
 */
export function formatParamposExpiryMonth(month: string | number): string {
  const monthStr = month.toString().padStart(2, '0');

  const monthNum = parseInt(monthStr, 10);
  if (monthNum < 1 || monthNum > 12) {
    throw new Error(`Invalid month: ${month}`);
  }

  return monthStr;
}

/**
 * Format card expiry year to YYYY format
 *
 * @param year Year (2 or 4 digits)
 * @returns Formatted year string (YYYY)
 */
export function formatParamposExpiryYear(year: string | number): string {
  const yearStr = year.toString();

  // If 2-digit year, convert to 4-digit
  if (yearStr.length === 2) {
    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    const yearNum = parseInt(yearStr, 10);

    // Assume years 00-50 are 2000-2050, 51-99 are 2051-2099
    return (currentCentury + yearNum).toString();
  }

  if (yearStr.length === 4) {
    const yearNum = parseInt(yearStr, 10);
    if (yearNum < 2000 || yearNum > 2100) {
      throw new Error(`Invalid year: ${year}`);
    }
    return yearStr;
  }

  throw new Error(`Invalid year format: ${year}`);
}

/**
 * Build SOAP envelope for Parampos API request
 *
 * @param soapAction SOAP action name
 * @param soapBody SOAP body content
 * @returns Complete SOAP envelope XML string
 */
export function buildParamposSoapEnvelope(
  soapAction: string,
  soapBody: string
): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${soapAction} xmlns="https://turkpos.com.tr/">
      ${soapBody}
    </${soapAction}>
  </soap:Body>
</soap:Envelope>`;
}

/**
 * Parse SOAP response and extract result
 *
 * @param soapXml SOAP response XML
 * @param resultTagName Tag name of the result object
 * @returns Parsed result object
 */
export function parseParamposSoapResponse<T>(
  soapXml: string,
  resultTagName: string
): T {
  // Simple XML parsing - extract content between result tags
  // In production, you might want to use a proper XML parser like 'fast-xml-parser'

  const resultRegex = new RegExp(
    `<${resultTagName}[^>]*>([\\s\\S]*?)</${resultTagName}>`,
    'i'
  );
  const resultMatch = soapXml.match(resultRegex);

  if (!resultMatch) {
    throw new Error(`Could not find ${resultTagName} in SOAP response`);
  }

  const resultContent = resultMatch[1];
  const result: any = {};

  // Extract all XML tags and their values
  const tagRegex = /<(\w+)>([^<]*)<\/\1>/g;
  let match;

  while ((match = tagRegex.exec(resultContent)) !== null) {
    const [, tagName, tagValue] = match;
    result[tagName] = tagValue;
  }

  return result as T;
}

/**
 * Build security credentials XML for SOAP requests
 *
 * @param clientCode Merchant client code
 * @param clientUsername Merchant username
 * @param clientPassword Merchant password
 * @param guid Merchant GUID
 * @returns XML string for security credentials
 */
export function buildParamposSecurityXml(
  clientCode: string,
  clientUsername: string,
  clientPassword: string,
  guid: string
): string {
  return `<G>
    <CLIENT_CODE>${escapeXml(clientCode)}</CLIENT_CODE>
    <CLIENT_USERNAME>${escapeXml(clientUsername)}</CLIENT_USERNAME>
    <CLIENT_PASSWORD>${escapeXml(clientPassword)}</CLIENT_PASSWORD>
    <GUID>${escapeXml(guid)}</GUID>
  </G>`;
}

/**
 * Build card information XML for SOAP requests
 *
 * @param cardHolderName Card holder name
 * @param cardNumber Card number
 * @param expiryMonth Expiry month (MM)
 * @param expiryYear Expiry year (YYYY)
 * @param cvc CVC code
 * @param saveCard Save card for future use (default: false)
 * @returns XML string for card information
 */
export function buildParamposCardXml(
  cardHolderName: string,
  cardNumber: string,
  expiryMonth: string,
  expiryYear: string,
  cvc: string,
  saveCard: boolean = false
): string {
  return `<KK_Bilgi>
    <KK_Sahibi>${escapeXml(cardHolderName)}</KK_Sahibi>
    <KK_No>${escapeXml(cardNumber)}</KK_No>
    <KK_SK_Ay>${escapeXml(expiryMonth)}</KK_SK_Ay>
    <KK_SK_Yil>${escapeXml(expiryYear)}</KK_SK_Yil>
    <KK_CVC>${escapeXml(cvc)}</KK_CVC>
    <KK_Saklama_Durumu>${saveCard ? '1' : '0'}</KK_Saklama_Durumu>
  </KK_Bilgi>`;
}

/**
 * Escape XML special characters
 *
 * @param text Text to escape
 * @returns Escaped text
 */
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Calculate total amount with installment fees
 *
 * For demonstration purposes, this uses a simple installment rate calculation.
 * In production, you should fetch actual installment rates from Parampos API.
 *
 * @param amount Base amount
 * @param installments Number of installments
 * @returns Total amount with fees
 */
export function calculateParamposTotalAmount(
  amount: string | number,
  installments: number
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (installments <= 1) {
    return formatParamposAmount(numAmount);
  }

  // Simple installment fee calculation (example rates)
  // In production, fetch real rates from bank
  const installmentRates: Record<number, number> = {
    2: 0.02, // 2%
    3: 0.03, // 3%
    4: 0.04, // 4%
    5: 0.05, // 5%
    6: 0.06, // 6%
    7: 0.07, // 7%
    8: 0.08, // 8%
    9: 0.09, // 9%
    10: 0.10, // 10%
    11: 0.11, // 11%
    12: 0.12, // 12%
  };

  const rate = installmentRates[installments] || 0;
  const totalAmount = numAmount * (1 + rate);

  return formatParamposAmount(totalAmount);
}

/**
 * Validate Turkish identity number (TC Kimlik No)
 *
 * @param identityNumber 11-digit Turkish identity number
 * @returns True if valid, false otherwise
 */
export function validateTurkishIdentityNumber(identityNumber: string): boolean {
  if (!/^\d{11}$/.test(identityNumber)) {
    return false;
  }

  const digits = identityNumber.split('').map(Number);

  // First digit cannot be 0
  if (digits[0] === 0) {
    return false;
  }

  // 10th digit validation
  const sum1 =
    (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7;
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
  const tenth = (sum1 - sum2) % 10;

  if (tenth !== digits[9]) {
    return false;
  }

  // 11th digit validation
  const sum3 = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  const eleventh = sum3 % 10;

  return eleventh === digits[10];
}

/**
 * Mask card number for display
 *
 * @param cardNumber Full card number
 * @returns Masked card number (e.g., "1234********5678")
 */
export function maskCardNumber(cardNumber: string): string {
  if (cardNumber.length < 10) {
    return cardNumber;
  }

  const first4 = cardNumber.slice(0, 4);
  const last4 = cardNumber.slice(-4);
  const masked = '*'.repeat(cardNumber.length - 8);

  return `${first4}${masked}${last4}`;
}
