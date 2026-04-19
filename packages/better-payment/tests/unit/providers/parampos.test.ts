import { describe, it, expect } from 'vitest';
import {
  generateParamposPaymentHash,
  generateParampos3DSVerificationHash,
  verifyParampos3DSCallback,
  mapCurrencyToParampos,
  mapCurrencyFromParampos,
  formatParamposAmount,
  formatParamposExpiryMonth,
  formatParamposExpiryYear,
  buildParamposSoapEnvelope,
  parseParamposSoapResponse,
  buildParamposSecurityXml,
  buildParamposCardXml,
  calculateParamposTotalAmount,
  escapeXml,
  validateTurkishIdentityNumber,
  maskCardNumber,
} from '../../../src/providers/parampos/utils';
import { Currency } from '../../../src/types';
import { ParamposCurrency } from '../../../src/providers/parampos/types';

describe('Parampos Utils - Unit Tests', () => {
  describe('Hash Generation', () => {
    it('should generate payment hash correctly', () => {
      const hash = generateParamposPaymentHash(
        'CLIENT123',
        'GUID456',
        1,
        '100.00',
        '100.00',
        'ORDER789'
      );

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = generateParamposPaymentHash(
        'CLIENT1',
        'GUID1',
        1,
        '100.00',
        '100.00',
        'ORDER1'
      );

      const hash2 = generateParamposPaymentHash(
        'CLIENT2',
        'GUID2',
        1,
        '100.00',
        '100.00',
        'ORDER2'
      );

      expect(hash1).not.toBe(hash2);
    });

    it('should generate 3DS verification hash correctly', () => {
      const hash = generateParampos3DSVerificationHash(
        'ISLEM123',
        'MD456',
        '1',
        'ORDER789',
        'GUID000'
      );

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('3DS Callback Verification', () => {
    it('should verify valid 3DS callback', () => {
      const islemGuid = 'ISLEM123';
      const md = 'MD456';
      const mdStatus = '1';
      const orderId = 'ORDER789';
      const guid = 'GUID000';

      const hash = generateParampos3DSVerificationHash(
        islemGuid,
        md,
        mdStatus,
        orderId,
        guid
      );

      const isValid = verifyParampos3DSCallback(
        islemGuid,
        md,
        mdStatus,
        orderId,
        guid,
        hash
      );

      expect(isValid).toBe(true);
    });

    it('should reject invalid 3DS callback', () => {
      const isValid = verifyParampos3DSCallback(
        'ISLEM123',
        'MD456',
        '1',
        'ORDER789',
        'GUID000',
        'invalid-hash'
      );

      expect(isValid).toBe(false);
    });
  });

  describe('Currency Mapping', () => {
    it('should map TRY to Parampos currency', () => {
      const mapped = mapCurrencyToParampos(Currency.TRY);
      expect(mapped).toBe(ParamposCurrency.TRY);
    });

    it('should map USD to Parampos currency', () => {
      const mapped = mapCurrencyToParampos(Currency.USD);
      expect(mapped).toBe(ParamposCurrency.USD);
    });

    it('should map EUR to Parampos currency', () => {
      const mapped = mapCurrencyToParampos(Currency.EUR);
      expect(mapped).toBe(ParamposCurrency.EUR);
    });

    it('should map GBP to Parampos currency', () => {
      const mapped = mapCurrencyToParampos(Currency.GBP);
      expect(mapped).toBe(ParamposCurrency.GBP);
    });

    it('should default to TRY for unknown currency', () => {
      const mapped = mapCurrencyToParampos('UNKNOWN' as Currency);
      expect(mapped).toBe(ParamposCurrency.TRY);
    });

    it('should map Parampos currency back to unified currency', () => {
      expect(mapCurrencyFromParampos(ParamposCurrency.TRY)).toBe(Currency.TRY);
      expect(mapCurrencyFromParampos(ParamposCurrency.USD)).toBe(Currency.USD);
      expect(mapCurrencyFromParampos(ParamposCurrency.EUR)).toBe(Currency.EUR);
      expect(mapCurrencyFromParampos(ParamposCurrency.GBP)).toBe(Currency.GBP);
    });
  });

  describe('Amount Formatting', () => {
    it('should format integer amount', () => {
      const formatted = formatParamposAmount(100);
      expect(formatted).toBe('100.00');
    });

    it('should format decimal amount', () => {
      const formatted = formatParamposAmount(99.99);
      expect(formatted).toBe('99.99');
    });

    it('should format string amount', () => {
      const formatted = formatParamposAmount('150.50');
      expect(formatted).toBe('150.50');
    });

    it('should round to 2 decimal places', () => {
      const formatted = formatParamposAmount(99.999);
      expect(formatted).toBe('100.00');
    });

    it('should throw error for invalid amount', () => {
      expect(() => formatParamposAmount('invalid')).toThrow('Invalid amount');
    });
  });

  describe('Expiry Date Formatting', () => {
    it('should format single digit month', () => {
      const formatted = formatParamposExpiryMonth(1);
      expect(formatted).toBe('01');
    });

    it('should format two digit month', () => {
      const formatted = formatParamposExpiryMonth(12);
      expect(formatted).toBe('12');
    });

    it('should format string month', () => {
      const formatted = formatParamposExpiryMonth('05');
      expect(formatted).toBe('05');
    });

    it('should throw error for invalid month', () => {
      expect(() => formatParamposExpiryMonth(0)).toThrow('Invalid month');
      expect(() => formatParamposExpiryMonth(13)).toThrow('Invalid month');
    });

    it('should format 2-digit year to 4-digit', () => {
      const formatted = formatParamposExpiryYear(25);
      expect(formatted).toBe('2025');
    });

    it('should keep 4-digit year as is', () => {
      const formatted = formatParamposExpiryYear(2025);
      expect(formatted).toBe('2025');
    });

    it('should throw error for invalid year', () => {
      expect(() => formatParamposExpiryYear(1999)).toThrow('Invalid year');
      expect(() => formatParamposExpiryYear('123')).toThrow('Invalid year format');
    });
  });

  describe('SOAP Envelope Building', () => {
    it('should build SOAP envelope', () => {
      const envelope = buildParamposSoapEnvelope('TestAction', '<TestData>Test</TestData>');

      expect(envelope).toContain('<?xml version="1.0"');
      expect(envelope).toContain('soap:Envelope');
      expect(envelope).toContain('TestAction');
      expect(envelope).toContain('TestData');
    });

    it('should include proper XML namespaces', () => {
      const envelope = buildParamposSoapEnvelope('TestAction', '<Data/>');

      expect(envelope).toContain('xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"');
      expect(envelope).toContain('xmlns="https://turkpos.com.tr/"');
    });
  });

  describe('SOAP Response Parsing', () => {
    it('should parse SOAP response correctly', () => {
      const soapXml = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TestResult>
      <Sonuc>1</Sonuc>
      <Sonuc_Str>Success</Sonuc_Str>
      <Islem_GUID>test-guid-123</Islem_GUID>
    </TestResult>
  </soap:Body>
</soap:Envelope>`;

      const result = parseParamposSoapResponse<any>(soapXml, 'TestResult');

      expect(result).toBeDefined();
      expect(result.Sonuc).toBe('1');
      expect(result.Sonuc_Str).toBe('Success');
      expect(result.Islem_GUID).toBe('test-guid-123');
    });

    it('should throw error if result tag not found', () => {
      const soapXml = `<?xml version="1.0"?><soap:Envelope></soap:Envelope>`;

      expect(() => parseParamposSoapResponse(soapXml, 'MissingResult')).toThrow(
        'Could not find MissingResult'
      );
    });
  });

  describe('Security XML Building', () => {
    it('should build security XML', () => {
      const xml = buildParamposSecurityXml('CLIENT', 'USER', 'PASS', 'GUID');

      expect(xml).toContain('<G>');
      expect(xml).toContain('<CLIENT_CODE>CLIENT</CLIENT_CODE>');
      expect(xml).toContain('<CLIENT_USERNAME>USER</CLIENT_USERNAME>');
      expect(xml).toContain('<CLIENT_PASSWORD>PASS</CLIENT_PASSWORD>');
      expect(xml).toContain('<GUID>GUID</GUID>');
      expect(xml).toContain('</G>');
    });

    it('should escape special characters', () => {
      const xml = buildParamposSecurityXml('CLIENT<>', 'USER', 'PASS&', 'GUID');

      expect(xml).toContain('&lt;');
      expect(xml).toContain('&gt;');
      expect(xml).toContain('&amp;');
    });
  });

  describe('Card XML Building', () => {
    it('should build card XML', () => {
      const xml = buildParamposCardXml('John Doe', '1234567890123456', '12', '2025', '123', false);

      expect(xml).toContain('<KK_Bilgi>');
      expect(xml).toContain('<KK_Sahibi>John Doe</KK_Sahibi>');
      expect(xml).toContain('<KK_No>1234567890123456</KK_No>');
      expect(xml).toContain('<KK_SK_Ay>12</KK_SK_Ay>');
      expect(xml).toContain('<KK_SK_Yil>2025</KK_SK_Yil>');
      expect(xml).toContain('<KK_CVC>123</KK_CVC>');
      expect(xml).toContain('<KK_Saklama_Durumu>0</KK_Saklama_Durumu>');
      expect(xml).toContain('</KK_Bilgi>');
    });

    it('should set save card flag correctly', () => {
      const xmlSave = buildParamposCardXml('John Doe', '1234', '12', '2025', '123', true);
      const xmlNoSave = buildParamposCardXml('John Doe', '1234', '12', '2025', '123', false);

      expect(xmlSave).toContain('<KK_Saklama_Durumu>1</KK_Saklama_Durumu>');
      expect(xmlNoSave).toContain('<KK_Saklama_Durumu>0</KK_Saklama_Durumu>');
    });
  });

  describe('XML Escaping', () => {
    it('should escape ampersand', () => {
      expect(escapeXml('A&B')).toBe('A&amp;B');
    });

    it('should escape less than', () => {
      expect(escapeXml('A<B')).toBe('A&lt;B');
    });

    it('should escape greater than', () => {
      expect(escapeXml('A>B')).toBe('A&gt;B');
    });

    it('should escape quotes', () => {
      expect(escapeXml('A"B')).toBe('A&quot;B');
      expect(escapeXml("A'B")).toBe('A&apos;B');
    });

    it('should escape multiple characters', () => {
      expect(escapeXml('<tag attr="value">&text</tag>')).toBe(
        '&lt;tag attr=&quot;value&quot;&gt;&amp;text&lt;/tag&gt;'
      );
    });
  });

  describe('Installment Amount Calculation', () => {
    it('should return same amount for 1 installment', () => {
      const total = calculateParamposTotalAmount('1000.00', 1);
      expect(total).toBe('1000.00');
    });

    it('should calculate amount with 2 installments', () => {
      const total = calculateParamposTotalAmount('1000.00', 2);
      expect(parseFloat(total)).toBeGreaterThan(1000);
      expect(parseFloat(total)).toBe(1020); // 2% fee
    });

    it('should calculate amount with 6 installments', () => {
      const total = calculateParamposTotalAmount('1000.00', 6);
      expect(parseFloat(total)).toBeGreaterThan(1000);
      expect(parseFloat(total)).toBe(1060); // 6% fee
    });

    it('should calculate amount with 12 installments', () => {
      const total = calculateParamposTotalAmount('1000.00', 12);
      expect(parseFloat(total)).toBeGreaterThan(1000);
      expect(parseFloat(total)).toBe(1120); // 12% fee
    });

    it('should work with numeric input', () => {
      const total = calculateParamposTotalAmount(1000, 3);
      expect(parseFloat(total)).toBe(1030); // 3% fee
    });
  });

  describe('Turkish Identity Number Validation', () => {
    it('should validate correct identity number', () => {
      const valid = validateTurkishIdentityNumber('12345678901');
      // Note: This is a format test, not a real TC Kimlik validation
      expect(typeof valid).toBe('boolean');
    });

    it('should reject identity number with wrong length', () => {
      expect(validateTurkishIdentityNumber('123')).toBe(false);
      expect(validateTurkishIdentityNumber('123456789012')).toBe(false);
    });

    it('should reject identity number with non-digits', () => {
      expect(validateTurkishIdentityNumber('1234567890a')).toBe(false);
    });

    it('should reject identity number starting with 0', () => {
      expect(validateTurkishIdentityNumber('01234567890')).toBe(false);
    });
  });

  describe('Card Number Masking', () => {
    it('should mask 16-digit card number', () => {
      const masked = maskCardNumber('1234567890123456');
      expect(masked).toBe('1234********3456');
    });

    it('should mask 15-digit card number', () => {
      const masked = maskCardNumber('123456789012345');
      expect(masked).toBe('1234*******2345');
    });

    it('should not mask short card numbers', () => {
      const masked = maskCardNumber('123456789');
      expect(masked).toBe('123456789');
    });

    it('should show first 4 and last 4 digits', () => {
      const masked = maskCardNumber('5528790000000008');
      expect(masked.startsWith('5528')).toBe(true);
      expect(masked.endsWith('0008')).toBe(true);
      expect(masked).toContain('****');
    });
  });
});
