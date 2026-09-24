import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Akbank, mapAkbankTxnStatus } from '../../../../src/providers/akbank';
import { akbankSign } from '../../../../src/providers/akbank/utils';
import { PaymentStatus } from '../../../../src/types';
import { mockPaymentRequest, mockThreeDSPaymentRequest } from '../../../fixtures/payment-data';
import { AKBANK_TEST, AKBANK_3DPAY_CALLBACK } from '../../../fixtures/akbank';

describe('Akbank provider', () => {
  let akbank: Akbank;
  let post: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    akbank = new Akbank({ ...AKBANK_TEST, baseUrl: 'https://apipre.akbank.com/api/v1/payment/virtualpos', testMode: true });
    post = vi.fn();
    (akbank as any).client.post = post;
  });

  const sent = (call = 0) => ({
    url: post.mock.calls[call][0] as string,
    body: JSON.parse(post.mock.calls[call][1]),
    raw: post.mock.calls[call][1] as string,
    config: post.mock.calls[call][2],
  });

  it.each(['merchantSafeId', 'terminalSafeId', 'secretKey'])('requires %s', (field) => {
    expect(() => new Akbank({ ...AKBANK_TEST, baseUrl: 'https://x', [field]: '' })).toThrow(field);
  });

  it('createPayment sends a signed txnCode 1000 request', async () => {
    post.mockResolvedValue({ data: { responseCode: 'VPS-0000', order: { orderId: 'ORDER1' } } });

    const result = await akbank.createPayment({ ...mockPaymentRequest, conversationId: 'ORDER1' });

    const { url, body, raw, config } = sent();
    expect(url).toBe('/transaction/process');
    expect(config.headers['auth-hash']).toBe(akbankSign(raw, AKBANK_TEST.secretKey));
    expect(config.retryable).toBe(false);
    expect(body).toMatchObject({
      version: '1.00',
      txnCode: '1000',
      terminal: { merchantSafeId: AKBANK_TEST.merchantSafeId, terminalSafeId: AKBANK_TEST.terminalSafeId },
      card: { cardNumber: '5528790000000008', cvv2: '123', expireDate: '1230' },
      transaction: { amount: '1.20', currencyCode: 949, motoInd: 0, installCount: 1 },
      customer: { ipAddress: '85.34.78.112' },
      order: { orderId: 'ORDER1' },
    });
    expect(body.randomNumber).toMatch(/^[0-9A-F]{128}$/);
    expect(body.requestDateTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.000$/);
    expect(result.status).toBe(PaymentStatus.SUCCESS);
    expect(result.paymentId).toBe('ORDER1');
  });

  it('createPayment maps declines', async () => {
    post.mockResolvedValue({ data: { responseCode: 'VPS-1073', responseMessage: 'Red', hostMessage: 'YETERSIZ BAKIYE' } });
    const result = await akbank.createPayment(mockPaymentRequest);
    expect(result.status).toBe(PaymentStatus.FAILURE);
    expect(result.errorCode).toBe('VPS-1073');
    expect(result.errorMessage).toBe('YETERSIZ BAKIYE');
  });

  it('initThreeDSPayment returns a signed 3D_PAY form to the test gateway', async () => {
    const result = await akbank.initThreeDSPayment({ ...mockThreeDSPaymentRequest, conversationId: 'ORDER3D' });

    expect(post).not.toHaveBeenCalled();
    expect(result.status).toBe(PaymentStatus.PENDING);
    const html = result.threeDSHtmlContent!;
    expect(html).toContain('action="https://virtualpospaymentgatewaypre.akbank.com/securepay"');
    expect(html).toContain('name="paymentModel" value="3D_PAY"');
    expect(html).toContain('name="txnCode" value="3000"');
    expect(html).toContain('name="orderId" value="ORDER3D"');
    expect(html).toContain('name="amount" value="1.20"');
    expect(html).toMatch(/name="hash" value="[^"]+"/);
  });

  it('uses the production gateway when testMode is off', async () => {
    const prod = new Akbank({ ...AKBANK_TEST, baseUrl: 'https://api.akbank.com/api/v1/payment/virtualpos' });
    const result = await prod.initThreeDSPayment(mockThreeDSPaymentRequest);
    expect(result.threeDSHtmlContent).toContain('https://virtualpospaymentgateway.akbank.com/securepay');
  });

  describe('completeThreeDSPayment', () => {
    it('accepts a correctly signed successful callback', async () => {
      const result = await akbank.completeThreeDSPayment(AKBANK_3DPAY_CALLBACK);
      expect(result.status).toBe(PaymentStatus.SUCCESS);
      expect(result.paymentId).toBe('2024041811DA');
    });

    it('rejects an unsigned/forged callback', async () => {
      const result = await akbank.completeThreeDSPayment({ ...AKBANK_3DPAY_CALLBACK, hash: 'forged' });
      expect(result.status).toBe(PaymentStatus.FAILURE);
      expect(result.errorCode).toBe('INVALID_HASH');
    });

    it('does not default to success when responseCode is missing', async () => {
      const { responseCode: _drop, ...rest } = AKBANK_3DPAY_CALLBACK;
      const result = await akbank.completeThreeDSPayment(rest);
      expect(result.status).toBe(PaymentStatus.FAILURE);
    });

    it('rejects callbacks for another terminal', async () => {
      const other = new Akbank({ ...AKBANK_TEST, terminalSafeId: 'OTHER', baseUrl: 'https://x' });
      const result = await other.completeThreeDSPayment(AKBANK_3DPAY_CALLBACK);
      expect(result.status).toBe(PaymentStatus.FAILURE);
      expect(result.errorCode).toBe('TERMINAL_MISMATCH');
    });
  });

  it('refund sends txnCode 1002 with amount', async () => {
    post.mockResolvedValue({ data: { responseCode: 'VPS-0000', transaction: { rrn: 'R1' } } });
    const result = await akbank.refund({ paymentId: 'ORDER1', price: '5', currency: 'TRY', ip: '1.1.1.1' });
    expect(sent().body).toMatchObject({
      txnCode: '1002',
      transaction: { amount: '5.00', currencyCode: 949 },
      order: { orderId: 'ORDER1' },
    });
    expect(result.status).toBe(PaymentStatus.SUCCESS);
    expect(result.refundId).toBe('R1');
  });

  it('cancel sends txnCode 1003', async () => {
    post.mockResolvedValue({ data: { responseCode: 'VPS-0000' } });
    const result = await akbank.cancel({ paymentId: 'ORDER1', ip: '1.1.1.1' });
    expect(sent().body).toMatchObject({ txnCode: '1003', order: { orderId: 'ORDER1' } });
    expect(result.status).toBe(PaymentStatus.SUCCESS);
  });

  it('getPayment uses order history (1010) and is retryable', async () => {
    post.mockResolvedValue({
      data: {
        responseCode: 'VPS-0000',
        txnDetailList: [{ txnCode: '1000', responseCode: 'VPS-0000', txnStatus: 'V', orderId: 'ORDER1' }],
      },
    });
    const result = await akbank.getPayment('ORDER1');
    expect(sent().body).toMatchObject({ txnCode: '1010', order: { orderId: 'ORDER1' } });
    expect(sent().config.retryable).toBe(true);
    expect(result.status).toBe(PaymentStatus.CANCELLED);
  });

  it('maps txnStatus values', () => {
    expect(mapAkbankTxnStatus({ responseCode: 'VPS-0000', txnStatus: 'N' })).toBe(PaymentStatus.SUCCESS);
    expect(mapAkbankTxnStatus({ responseCode: 'VPS-0000', txnStatus: 'R' })).toBe(PaymentStatus.CANCELLED);
    expect(mapAkbankTxnStatus({ responseCode: 'VPS-1005' })).toBe(PaymentStatus.FAILURE);
    expect(mapAkbankTxnStatus(undefined)).toBe(PaymentStatus.PENDING);
  });

  it('BIN and installment queries are explicitly unsupported', async () => {
    await expect(akbank.binCheck('415956')).rejects.toThrow(/not supported/);
    await expect(akbank.installmentInfo({ binNumber: '415956', price: '1' })).rejects.toThrow(/not supported/);
  });

  it('reports timeouts as PENDING', async () => {
    post.mockRejectedValue({ isAxiosError: true, code: 'ECONNABORTED', request: {} });
    const result = await akbank.createPayment(mockPaymentRequest);
    expect(result.status).toBe(PaymentStatus.PENDING);
  });
});
