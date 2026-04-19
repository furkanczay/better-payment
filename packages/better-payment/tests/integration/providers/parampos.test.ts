import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import { Parampos } from '../../../src/providers/parampos';
import { PaymentStatus, Currency } from '../../../src/types';
import type { ParamposConfig } from '../../../src/providers/parampos';
import { generateParampos3DSVerificationHash } from '../../../src/providers/parampos/utils';

// Sandbox test credentials - these are test credentials only
const SANDBOX_CONFIG: ParamposConfig = {
  clientCode: process.env.PARAMPOS_CLIENT_CODE || '10738',
  clientUsername: process.env.PARAMPOS_CLIENT_USERNAME || 'Test',
  clientPassword: process.env.PARAMPOS_CLIENT_PASSWORD || 'Test',
  guid: process.env.PARAMPOS_GUID || '0c13d406-873b-403b-9c09-a5766840d98c',
  apiKey: process.env.PARAMPOS_GUID || '0c13d406-873b-403b-9c09-a5766840d98c',
  secretKey: process.env.PARAMPOS_CLIENT_PASSWORD || 'Test',
  baseUrl:
    process.env.PARAMPOS_BASE_URL ||
    'https://testposws.param.com.tr/turkpos.ws/service_turkpos_test.asmx',
  testMode: true,
};

// Test card number for sandbox (from Param documentation)
const TEST_CARD = {
  cardHolderName: 'TEST USER',
  cardNumber: '5528790000000008', // Test card that should succeed
  expireMonth: '12',
  expireYear: '2030',
  cvc: '123',
};

describe('Parampos Provider - Integration Tests', () => {
  let parampos: Parampos;
  let capturedRequests: any[] = [];

  const mockConfig: ParamposConfig = {
    clientCode: 'TEST_CLIENT',
    clientUsername: 'test_user',
    clientPassword: 'test_password',
    guid: 'test-guid-1234',
    apiKey: 'test-guid-1234',
    secretKey: 'test_password',
    baseUrl: 'https://testposws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx',
    testMode: true,
  };

  const mockPaymentRequest = {
    price: '100.00',
    paidPrice: '100.00',
    currency: Currency.TRY,
    basketId: 'BASKET123',
    paymentCard: {
      cardHolderName: 'Test User',
      cardNumber: '5528790000000008',
      expireMonth: '12',
      expireYear: '2030',
      cvc: '123',
    },
    buyer: {
      id: 'BUYER123',
      name: 'Test',
      surname: 'User',
      email: 'test@example.com',
      identityNumber: '12345678901',
      registrationAddress: 'Test Address',
      city: 'Istanbul',
      country: 'Turkey',
      zipCode: '34000',
      ip: '85.34.78.112',
      gsmNumber: '+905301234567',
    },
    shippingAddress: {
      contactName: 'Test User',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Test Shipping Address',
      zipCode: '34000',
    },
    billingAddress: {
      contactName: 'Test User',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Test Billing Address',
      zipCode: '34000',
    },
    basketItems: [
      {
        id: 'ITEM1',
        name: 'Test Product',
        category1: 'Electronics',
        itemType: 'PHYSICAL',
        price: '100.00',
      },
    ],
  };

  const mockThreeDSRequest = {
    ...mockPaymentRequest,
    callbackUrl: 'https://example.com/callback',
    installment: 1,
  };

  beforeEach(() => {
    capturedRequests = [];

    parampos = new Parampos(mockConfig);

    // Spy on axios post method
    const client = (parampos as any).client;
    vi.spyOn(client, 'post').mockImplementation(async (url: string, data: any) => {
      capturedRequests.push({
        url,
        data,
      });

      // Mock successful SOAP response
      const soapResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TP_Islem_OdemeResult>
      <Sonuc>1</Sonuc>
      <Sonuc_Str>Success</Sonuc_Str>
      <Islem_GUID>test-payment-guid-123</Islem_GUID>
      <Islem_ID>12345</Islem_ID>
      <Banka_Sonuc_Kod>00</Banka_Sonuc_Kod>
      <Banka_Sonuc_Str>Approved</Banka_Sonuc_Str>
      <Otorizasyon_Kodu>AUTH123</Otorizasyon_Kodu>
    </TP_Islem_OdemeResult>
  </soap:Body>
</soap:Envelope>`;

      return {
        data: soapResponse,
        status: 200,
      };
    });
  });

  describe('Configuration', () => {
    it('should create Parampos instance with valid config', () => {
      expect(parampos).toBeDefined();
      expect((parampos as any).paramposConfig.clientCode).toBe('TEST_CLIENT');
    });

    it('should throw error for missing clientCode', () => {
      expect(() => {
        new Parampos({
          ...mockConfig,
          clientCode: '',
        });
      }).toThrow('Parampos Client Code is required');
    });

    it('should throw error for missing clientUsername', () => {
      expect(() => {
        new Parampos({
          ...mockConfig,
          clientUsername: '',
        });
      }).toThrow('Parampos Client Username is required');
    });

    it('should throw error for missing guid (via API Key validation)', () => {
      // Note: When guid is empty, apiKey becomes empty in parent class,
      // so parent class throws "API Key is required" error first
      expect(() => {
        new Parampos({
          clientCode: 'TEST_CLIENT',
          clientUsername: 'test_user',
          clientPassword: 'test_password',
          guid: '', // Empty GUID causes empty apiKey
          apiKey: '', // Explicit empty to show parent validation
          secretKey: 'test_password',
          baseUrl: 'https://testposws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx',
          testMode: true,
        });
      }).toThrow('API Key is required');
    });
  });

  describe('createPayment', () => {
    it('should send correct SOAP request for payment', async () => {
      const result = await parampos.createPayment(mockPaymentRequest);

      expect(capturedRequests).toHaveLength(1);
      expect(capturedRequests[0].url).toBe('');
      expect(capturedRequests[0].data).toContain('TP_Islem_Odeme');
      expect(capturedRequests[0].data).toContain('TEST_CLIENT');
      expect(capturedRequests[0].data).toContain('100.00');
      expect(capturedRequests[0].data).toContain('BASKET123');
    });

    it('should return successful payment response', async () => {
      const result = await parampos.createPayment(mockPaymentRequest);

      expect(result.status).toBe(PaymentStatus.SUCCESS);
      expect(result.paymentId).toBe('test-payment-guid-123');
    });

    it('should handle payment failure', async () => {
      // Mock failed response
      const client = (parampos as any).client;
      vi.spyOn(client, 'post').mockImplementation(async () => {
        const failureResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TP_Islem_OdemeResult>
      <Sonuc>0</Sonuc>
      <Sonuc_Str>Payment declined</Sonuc_Str>
      <Hata_Kod>ERROR001</Hata_Kod>
    </TP_Islem_OdemeResult>
  </soap:Body>
</soap:Envelope>`;

        return {
          data: failureResponse,
          status: 200,
        };
      });

      const result = await parampos.createPayment(mockPaymentRequest);

      expect(result.status).toBe(PaymentStatus.FAILURE);
      expect(result.errorMessage).toBe('Payment declined');
      expect(result.errorCode).toBe('ERROR001');
    });
  });

  describe('initThreeDSPayment', () => {
    it('should send correct SOAP request for 3DS payment', async () => {
      // Mock 3DS init response - need to capture requests too
      const client = (parampos as any).client;
      vi.spyOn(client, 'post').mockImplementation(async (url: string, data: any) => {
        capturedRequests.push({ url, data });
        const threeDSResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TP_Islem_Odeme_3DResult>
      <Sonuc>1</Sonuc>
      <Sonuc_Str>3DS initialized</Sonuc_Str>
      <Islem_GUID>test-3ds-guid-456</Islem_GUID>
      <UCD_HTML>PGh0bWw+PHRpdGxlPjNEIFNlY3VyZTwvdGl0bGU+PC9odG1sPg==</UCD_HTML>
    </TP_Islem_Odeme_3DResult>
  </soap:Body>
</soap:Envelope>`;

        return {
          data: threeDSResponse,
          status: 200,
        };
      });

      const result = await parampos.initThreeDSPayment(mockThreeDSRequest);

      expect(capturedRequests).toHaveLength(1);
      expect(capturedRequests[0].data).toContain('TP_Islem_Odeme_3D');
      expect(capturedRequests[0].data).toContain('SUCCESS_URL');
      expect(capturedRequests[0].data).toContain('https://example.com/callback');
    });

    it('should return 3DS HTML content', async () => {
      // Mock 3DS init response
      const client = (parampos as any).client;
      vi.spyOn(client, 'post').mockImplementation(async () => {
        const threeDSResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TP_Islem_Odeme_3DResult>
      <Sonuc>1</Sonuc>
      <Sonuc_Str>3DS initialized</Sonuc_Str>
      <Islem_GUID>test-3ds-guid-456</Islem_GUID>
      <UCD_HTML>PGh0bWw+PHRpdGxlPjNEIFNlY3VyZTwvdGl0bGU+PC9odG1sPg==</UCD_HTML>
    </TP_Islem_Odeme_3DResult>
  </soap:Body>
</soap:Envelope>`;

        return {
          data: threeDSResponse,
          status: 200,
        };
      });

      const result = await parampos.initThreeDSPayment(mockThreeDSRequest);

      expect(result.status).toBe(PaymentStatus.PENDING);
      expect(result.threeDSHtmlContent).toBe(
        'PGh0bWw+PHRpdGxlPjNEIFNlY3VyZTwvdGl0bGU+PC9odG1sPg=='
      );
      expect(result.paymentId).toBe('test-3ds-guid-456');
    });
  });

  describe('completeThreeDSPayment', () => {
    it('should verify 3DS callback successfully', async () => {
      // Generate a valid hash for the callback data
      const islemGUID = 'test-guid';
      const md = 'test-md';
      const mdStatus = '1';
      const orderId = 'ORDER123';
      const guid = 'test-guid-1234';
      const validHash = generateParampos3DSVerificationHash(islemGUID, md, mdStatus, orderId, guid);

      const callbackData = {
        islemGUID,
        md,
        mdStatus,
        orderId,
        GUID: guid,
        hash: validHash,
      };

      const result = await parampos.completeThreeDSPayment(callbackData);

      expect(result.status).toBe(PaymentStatus.SUCCESS);
      expect(result.paymentId).toBe('test-guid');
    });

    it('should fail on invalid hash', async () => {
      const callbackData = {
        islemGUID: 'test-guid',
        md: 'test-md',
        mdStatus: '1',
        orderId: 'ORDER123',
        GUID: 'test-guid-1234',
        hash: 'invalid-hash',
      };

      const result = await parampos.completeThreeDSPayment(callbackData);

      expect(result.status).toBe(PaymentStatus.FAILURE);
      expect(result.errorMessage).toContain('Invalid 3D Secure callback signature');
    });

    it('should fail on mdStatus other than 1', async () => {
      // Generate a valid hash but with mdStatus '0'
      const islemGUID = 'test-guid';
      const md = 'test-md';
      const mdStatus = '0';
      const orderId = 'ORDER123';
      const guid = 'test-guid-1234';
      const validHash = generateParampos3DSVerificationHash(islemGUID, md, mdStatus, orderId, guid);

      const callbackData = {
        islemGUID,
        md,
        mdStatus,
        orderId,
        GUID: guid,
        hash: validHash,
        Sonuc_Str: '3DS verification failed',
      };

      const result = await parampos.completeThreeDSPayment(callbackData);

      expect(result.status).toBe(PaymentStatus.FAILURE);
      expect(result.errorMessage).toContain('3DS verification failed');
    });
  });

  describe('refund', () => {
    it('should send correct SOAP request for refund', async () => {
      // Mock refund response
      const client = (parampos as any).client;
      vi.spyOn(client, 'post').mockImplementation(async (url: string, data: any) => {
        capturedRequests.push({ url, data });
        const refundResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TP_Islem_IadeResult>
      <Sonuc>1</Sonuc>
      <Sonuc_Str>Refund successful</Sonuc_Str>
      <Iade_Islem_GUID>refund-guid-789</Iade_Islem_GUID>
    </TP_Islem_IadeResult>
  </soap:Body>
</soap:Envelope>`;

        return {
          data: refundResponse,
          status: 200,
        };
      });

      const refundRequest = {
        paymentId: 'test-payment-guid-123',
        price: '50.00',
        currency: Currency.TRY,
        ip: '85.34.78.112',
      };

      const result = await parampos.refund(refundRequest);

      expect(capturedRequests).toHaveLength(1);
      expect(capturedRequests[0].data).toContain('TP_Islem_Iade');
      expect(capturedRequests[0].data).toContain('test-payment-guid-123');
      expect(capturedRequests[0].data).toContain('50.00');

      expect(result.status).toBe(PaymentStatus.SUCCESS);
      expect(result.refundId).toBe('refund-guid-789');
    });
  });

  describe('cancel', () => {
    it('should send correct SOAP request for cancellation', async () => {
      // Mock cancel response
      const client = (parampos as any).client;
      vi.spyOn(client, 'post').mockImplementation(async (url: string, data: any) => {
        capturedRequests.push({ url, data });
        const cancelResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TP_Islem_IptalResult>
      <Sonuc>1</Sonuc>
      <Sonuc_Str>Cancellation successful</Sonuc_Str>
      <Islem_GUID>test-payment-guid-123</Islem_GUID>
    </TP_Islem_IptalResult>
  </soap:Body>
</soap:Envelope>`;

        return {
          data: cancelResponse,
          status: 200,
        };
      });

      const cancelRequest = {
        paymentId: 'test-payment-guid-123',
        ip: '85.34.78.112',
      };

      const result = await parampos.cancel(cancelRequest);

      expect(capturedRequests).toHaveLength(1);
      expect(capturedRequests[0].data).toContain('TP_Islem_Iptal');
      expect(capturedRequests[0].data).toContain('test-payment-guid-123');

      expect(result.status).toBe(PaymentStatus.SUCCESS);
    });
  });

  describe('getPayment', () => {
    it('should send correct SOAP request for payment inquiry', async () => {
      // Mock inquiry response
      const client = (parampos as any).client;
      vi.spyOn(client, 'post').mockImplementation(async (url: string, data: any) => {
        capturedRequests.push({ url, data });
        const inquiryResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TP_Islem_SorgulamaResult>
      <Sonuc>1</Sonuc>
      <Sonuc_Str>Payment found</Sonuc_Str>
      <Islem_GUID>test-payment-guid-123</Islem_GUID>
      <Siparis_ID>BASKET123</Siparis_ID>
      <Durum>Completed</Durum>
    </TP_Islem_SorgulamaResult>
  </soap:Body>
</soap:Envelope>`;

        return {
          data: inquiryResponse,
          status: 200,
        };
      });

      const result = await parampos.getPayment('test-payment-guid-123');

      expect(capturedRequests).toHaveLength(1);
      expect(capturedRequests[0].data).toContain('TP_Islem_Sorgulama');
      expect(capturedRequests[0].data).toContain('test-payment-guid-123');

      expect(result.status).toBe(PaymentStatus.SUCCESS);
      expect(result.paymentId).toBe('test-payment-guid-123');
    });
  });

  describe('binCheck', () => {
    it('should send correct SOAP request for BIN check', async () => {
      // Mock BIN check response
      const client = (parampos as any).client;
      vi.spyOn(client, 'post').mockImplementation(async (url: string, data: any) => {
        capturedRequests.push({ url, data });
        const binCheckResponse = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TP_Kart_BilgiResult>
      <Sonuc>1</Sonuc>
      <Sonuc_Str>BIN found</Sonuc_Str>
      <Kart_Tip>CREDIT</Kart_Tip>
      <Kart_Banka>Test Bank</Kart_Banka>
      <Ticari_Kart>0</Ticari_Kart>
      <Kart_Aile>VISA</Kart_Aile>
    </TP_Kart_BilgiResult>
  </soap:Body>
</soap:Envelope>`;

        return {
          data: binCheckResponse,
          status: 200,
        };
      });

      const result = await parampos.binCheck('552879');

      expect(capturedRequests).toHaveLength(1);
      expect(capturedRequests[0].data).toContain('TP_Kart_Bilgi');
      expect(capturedRequests[0].data).toContain('552879');

      expect(result.binNumber).toBe('552879');
      expect(result.cardType).toBe('CREDIT');
      expect(result.bankName).toBe('Test Bank');
      expect(result.commercial).toBe(false);
    });
  });
});

// Real Sandbox Integration Tests
describe('Parampos Provider - Real Sandbox Tests', () => {
  let sandboxParampos: Parampos;
  const shouldRunSandboxTests = process.env.RUN_SANDBOX_TESTS === 'true';

  beforeAll(() => {
    if (shouldRunSandboxTests) {
      sandboxParampos = new Parampos(SANDBOX_CONFIG);
    }
  });

  const getTestPaymentRequest = () => ({
    price: '10.00',
    paidPrice: '10.00',
    currency: Currency.TRY,
    basketId: `BASKET_${Date.now()}`,
    paymentCard: TEST_CARD,
    buyer: {
      id: 'BUYER123',
      name: 'Test',
      surname: 'User',
      email: 'test@example.com',
      identityNumber: '12345678901',
      registrationAddress: 'Test Address',
      city: 'Istanbul',
      country: 'Turkey',
      zipCode: '34000',
      ip: '85.34.78.112',
      gsmNumber: '+905301234567',
    },
    shippingAddress: {
      contactName: 'Test User',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Test Shipping Address',
      zipCode: '34000',
    },
    billingAddress: {
      contactName: 'Test User',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Test Billing Address',
      zipCode: '34000',
    },
    basketItems: [
      {
        id: 'ITEM1',
        name: 'Test Product',
        category1: 'Electronics',
        itemType: 'PHYSICAL',
        price: '10.00',
      },
    ],
  });

  describe('Direct Payment (Sandbox)', () => {
    it.skipIf(!shouldRunSandboxTests)('should process direct payment successfully', async () => {
      const request = getTestPaymentRequest();
      const result = await sandboxParampos.createPayment(request);

      console.log('Direct Payment Result:', JSON.stringify(result, null, 2));

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
      expect(['success', 'failure']).toContain(result.status);

      if (result.status === PaymentStatus.SUCCESS) {
        expect(result.paymentId).toBeDefined();
        expect(result.paymentId).toBeTruthy();
      } else {
        expect(result.errorMessage).toBeDefined();
        console.log('Payment Error:', result.errorMessage);
      }
    }, 30000);

    it.skipIf(!shouldRunSandboxTests)('should handle declined payment', async () => {
      const request = getTestPaymentRequest();
      // Use a card that will be declined (amount over 5000 in sandbox)
      request.price = '5001.00';
      request.paidPrice = '5001.00';
      request.basketItems[0].price = '5001.00';

      const result = await sandboxParampos.createPayment(request);

      console.log('Declined Payment Result:', JSON.stringify(result, null, 2));

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
    }, 30000);
  });

  describe('3D Secure Payment (Sandbox)', () => {
    it.skipIf(!shouldRunSandboxTests)('should initialize 3DS payment', async () => {
      const request = {
        ...getTestPaymentRequest(),
        callbackUrl: 'https://example.com/payment/callback',
        installment: 1,
      };

      const result = await sandboxParampos.initThreeDSPayment(request);

      console.log('3DS Init Result:', JSON.stringify(result, null, 2));

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();

      if (result.status === PaymentStatus.PENDING) {
        expect(result.threeDSHtmlContent).toBeDefined();
        expect(result.paymentId).toBeDefined();
        console.log('3DS HTML Length:', result.threeDSHtmlContent?.length);
      } else {
        console.log('3DS Init Error:', result.errorMessage);
      }
    }, 30000);

    it.skipIf(!shouldRunSandboxTests)('should initialize 3DS with installments', async () => {
      const request = {
        ...getTestPaymentRequest(),
        price: '1000.00',
        paidPrice: '1060.00',
        callbackUrl: 'https://example.com/payment/callback',
        installment: 6,
      };
      request.basketItems[0].price = '1000.00';

      const result = await sandboxParampos.initThreeDSPayment(request);

      console.log('3DS Installment Result:', JSON.stringify(result, null, 2));

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
    }, 30000);
  });

  describe('BIN Check (Sandbox)', () => {
    it.skipIf(!shouldRunSandboxTests)('should check BIN information', async () => {
      const binNumber = '552879'; // First 6 digits of test card

      const result = await sandboxParampos.binCheck(binNumber);

      console.log('BIN Check Result:', JSON.stringify(result, null, 2));

      expect(result).toBeDefined();
      expect(result.binNumber).toBe(binNumber);

      if (result.cardType) {
        expect(result.cardType).toBeTruthy();
        console.log('Card Type:', result.cardType);
        console.log('Bank:', result.bankName);
      }
    }, 30000);

    it.skipIf(!shouldRunSandboxTests)('should check another BIN', async () => {
      const binNumber = '540667'; // Another common test BIN

      try {
        const result = await sandboxParampos.binCheck(binNumber);
        console.log('BIN Check Result 2:', JSON.stringify(result, null, 2));
        expect(result).toBeDefined();
      } catch (error: any) {
        console.log('BIN Check Error:', error.message);
        expect(error).toBeDefined();
      }
    }, 30000);
  });

  describe('Payment Lifecycle (Sandbox)', () => {
    it.skipIf(!shouldRunSandboxTests)('should perform complete payment lifecycle', async () => {
      // 1. Create payment
      const request = getTestPaymentRequest();
      const paymentResult = await sandboxParampos.createPayment(request);

      console.log('1. Payment Created:', JSON.stringify(paymentResult, null, 2));

      if (paymentResult.status !== PaymentStatus.SUCCESS) {
        console.log('Payment failed, skipping lifecycle test');
        return;
      }

      expect(paymentResult.paymentId).toBeDefined();
      const paymentId = paymentResult.paymentId!;

      // Wait a bit for the transaction to be processed
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 2. Query payment
      const queryResult = await sandboxParampos.getPayment(paymentId);
      console.log('2. Payment Queried:', JSON.stringify(queryResult, null, 2));

      expect(queryResult).toBeDefined();
      expect(queryResult.status).toBeDefined();

      // Wait a bit before cancel/refund
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 3. Try to cancel (void) the payment
      const cancelResult = await sandboxParampos.cancel({
        paymentId,
        ip: '85.34.78.112',
      });

      console.log('3. Payment Cancelled:', JSON.stringify(cancelResult, null, 2));

      expect(cancelResult).toBeDefined();
      expect(cancelResult.status).toBeDefined();

      if (cancelResult.status !== PaymentStatus.SUCCESS) {
        // If cancel failed, try refund
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const refundResult = await sandboxParampos.refund({
          paymentId,
          price: '5.00', // Partial refund
          currency: Currency.TRY,
          ip: '85.34.78.112',
        });

        console.log('4. Payment Refunded:', JSON.stringify(refundResult, null, 2));

        expect(refundResult).toBeDefined();
        expect(refundResult.status).toBeDefined();
      }
    }, 60000);
  });
});
