import { describe, it, expect, vi } from 'vitest';
import {
  PaymentErrorCode,
  ISO8583_ERROR_CODES,
  resolveErrorCode,
} from '../../../src/core/error-codes';
import { IYZICO_ERROR_CODES } from '../../../src/providers/iyzico/error-codes';
import { PAYTR_ERROR_CODES } from '../../../src/providers/paytr/error-codes';
import { Iyzico } from '../../../src/providers/iyzico';
import { PayTR } from '../../../src/providers/paytr';
import { Parampos } from '../../../src/providers/parampos';
import { Akbank } from '../../../src/providers/akbank';
import { PaymentStatus } from '../../../src/types';
import { mockPaymentRequest, mockThreeDSPaymentRequest } from '../../fixtures/payment-data';
import { AKBANK_TEST } from '../../fixtures/akbank';

const iyzico = () => {
  const provider = new Iyzico({ apiKey: 'k', secretKey: 's', baseUrl: 'https://sandbox-api.iyzipay.com' });
  const request = vi.fn();
  (provider as any).client.request = request;
  return { provider, request };
};

const paytr = () => {
  const provider = new PayTR({
    merchantId: '123456',
    merchantKey: 'key',
    merchantSalt: 'salt',
    baseUrl: 'https://www.paytr.com',
  });
  const post = vi.fn();
  (provider as any).client.post = post;
  return { provider, post };
};

const akbank = () => {
  const provider = new Akbank({ ...AKBANK_TEST, baseUrl: 'https://apipre.akbank.com/api/v1/payment/virtualpos' });
  const post = vi.fn();
  (provider as any).client.post = post;
  return { provider, post };
};

describe('resolveErrorCode', () => {
  it('returns UNKNOWN when there is no code', () => {
    expect(resolveErrorCode(undefined)).toBe(PaymentErrorCode.UNKNOWN);
    expect(resolveErrorCode('')).toBe(PaymentErrorCode.UNKNOWN);
  });

  it('maps codes set by better-payment itself', () => {
    expect(resolveErrorCode('NETWORK_ERROR')).toBe(PaymentErrorCode.NETWORK_ERROR);
    expect(resolveErrorCode('INVALID_HASH')).toBe(PaymentErrorCode.INVALID_HASH);
    expect(resolveErrorCode('VALIDATION_ERROR')).toBe(PaymentErrorCode.INVALID_REQUEST);
    expect(resolveErrorCode('MD_STATUS_0')).toBe(PaymentErrorCode.THREEDS_FAILED);
  });

  it('uses the provider table and falls back to UNKNOWN', () => {
    expect(resolveErrorCode('10051', IYZICO_ERROR_CODES)).toBe(PaymentErrorCode.INSUFFICIENT_FUNDS);
    expect(resolveErrorCode(6 as unknown as string, PAYTR_ERROR_CODES)).toBe(
      PaymentErrorCode.CANCELLED_BY_CUSTOMER
    );
    expect(resolveErrorCode('99999', IYZICO_ERROR_CODES)).toBe(PaymentErrorCode.UNKNOWN);
  });

  it('only maps to known enum values', () => {
    const values = new Set(Object.values(PaymentErrorCode));
    for (const table of [IYZICO_ERROR_CODES, PAYTR_ERROR_CODES, ISO8583_ERROR_CODES]) {
      for (const code of Object.values(table)) expect(values.has(code)).toBe(true);
    }
  });
});

describe('normalized error codes on provider results', () => {
  it('iyzico: maps the payment error and keeps the raw code', async () => {
    const { provider, request } = iyzico();
    request.mockResolvedValue({
      data: { status: 'failure', errorCode: '10051', errorMessage: 'Kart limiti yetersiz' },
    });

    const result = await provider.createPayment(mockPaymentRequest);

    expect(result.status).toBe(PaymentStatus.FAILURE);
    expect(result.code).toBe(PaymentErrorCode.INSUFFICIENT_FUNDS);
    expect(result.errorCode).toBe('10051');
  });

  it('iyzico: unmapped codes become UNKNOWN', async () => {
    const { provider, request } = iyzico();
    request.mockResolvedValue({ data: { status: 'failure', errorCode: '5001' } });

    const result = await provider.createPayment(mockPaymentRequest);

    expect(result.code).toBe(PaymentErrorCode.UNKNOWN);
    expect(result.errorCode).toBe('5001');
  });

  it('iyzico: failed 3D authentication is THREEDS_FAILED', async () => {
    const { provider } = iyzico();
    const result = await provider.completeThreeDSPayment({
      status: 'success',
      paymentId: '1',
      mdStatus: '0',
    });
    expect(result.code).toBe(PaymentErrorCode.THREEDS_FAILED);
  });

  it('successful results have no code', async () => {
    const { provider, request } = iyzico();
    request.mockResolvedValue({ data: { status: 'success', paymentId: '1' } });

    const result = await provider.createPayment(mockPaymentRequest);

    expect(result.status).toBe(PaymentStatus.SUCCESS);
    expect(result.code).toBeUndefined();
  });

  it('timeouts are pending with NETWORK_ERROR', async () => {
    const { provider, request } = iyzico();
    request.mockRejectedValue({ isAxiosError: true, code: 'ECONNABORTED', request: {} });

    const result = await provider.createPayment(mockPaymentRequest);

    expect(result.status).toBe(PaymentStatus.PENDING);
    expect(result.code).toBe(PaymentErrorCode.NETWORK_ERROR);
  });

  it('PayTR: maps failed_reason_code', async () => {
    const { provider, post } = paytr();
    post.mockResolvedValue({
      data: { status: 'failed', failed_reason_code: '2', failed_reason_msg: '3D failed' },
    });

    const result = await provider.createPayment(mockPaymentRequest);

    expect(result.code).toBe(PaymentErrorCode.THREEDS_FAILED);
    expect(result.errorCode).toBe('2');
  });

  it('PayTR: a forged notification is INVALID_HASH', async () => {
    const { provider } = paytr();
    const result = await provider.completeThreeDSPayment({
      merchant_oid: 'ORDER1',
      status: 'success',
      total_amount: '100',
      hash: 'forged',
    } as any);
    expect(result.code).toBe(PaymentErrorCode.INVALID_HASH);
  });

  it('request validation errors are INVALID_REQUEST and never reach the provider', async () => {
    const { provider, post } = paytr();

    const result = await provider.initThreeDSPayment({ ...mockThreeDSPaymentRequest, callbackUrl: '' });

    expect(post).not.toHaveBeenCalled();
    expect(result.status).toBe(PaymentStatus.FAILURE);
    expect(result.code).toBe(PaymentErrorCode.INVALID_REQUEST);
    expect(result.errorCode).toBe('VALIDATION_ERROR');
  });

  it('Parampos: unsupported currency is INVALID_REQUEST', async () => {
    const parampos = new Parampos({
      clientCode: '10738',
      clientUsername: 'Test',
      clientPassword: 'Test',
      guid: '0c13d406-873b-403b-9c09-a5766840d98c',
      baseUrl: 'https://test-dmz.param.com.tr/turkpos.ws/service_turkpos_test.asmx',
    });

    const result = await parampos.createPayment({ ...mockPaymentRequest, currency: 'USD' });

    expect(result.code).toBe(PaymentErrorCode.INVALID_REQUEST);
  });

  it('Akbank: uses the ISO 8583 host response code', async () => {
    const { provider, post } = akbank();
    post.mockResolvedValue({
      data: {
        responseCode: 'VPS-1005',
        responseMessage: 'Declined',
        hostResponseCode: '51',
        hostMessage: 'YETERSIZ BAKIYE',
      },
    });

    const result = await provider.createPayment({ ...mockPaymentRequest, conversationId: 'ORDER1' });

    expect(result.status).toBe(PaymentStatus.FAILURE);
    expect(result.code).toBe(PaymentErrorCode.INSUFFICIENT_FUNDS);
    expect(result.errorCode).toBe('VPS-1005');
  });

  it('Akbank: falls back to UNKNOWN without a known host code', async () => {
    const { provider, post } = akbank();
    post.mockResolvedValue({ data: { responseCode: 'VPS-1234', responseMessage: 'Error' } });

    const result = await provider.createPayment({ ...mockPaymentRequest, conversationId: 'ORDER1' });

    expect(result.code).toBe(PaymentErrorCode.UNKNOWN);
  });
});
