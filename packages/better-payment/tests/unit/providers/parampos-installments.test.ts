import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Parampos } from '../../../src/providers/parampos';
import {
  calculateParamposTotalMinor,
  parseParamposDataSetRows,
  paramposRatesOf,
} from '../../../src/providers/parampos/utils';
import { PaymentErrorCode } from '../../../src/core/error-codes';
import { ValidationError } from '../../../src/core/errors';
import { PaymentStatus } from '../../../src/types';
import { PARAMPOS_RATES_RESPONSE, paramposBinResponse } from '../../fixtures/parampos-installments';

describe('Parampos installment helpers', () => {
  it('parses every DataSet row', () => {
    const rows = parseParamposDataSetRows(PARAMPOS_RATES_RESPONSE, 'DT_Ozel_Oranlar_SK');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      SanalPOS_ID: '1029',
      Kredi_Karti_Banka: 'Axess',
      MO_01: '1.7500',
    });
    expect(rows[1].Kredi_Karti_Banka).toBe('Diğer Banka Kartları');
  });

  it('drops negative (unavailable) rates', () => {
    const [row] = parseParamposDataSetRows(PARAMPOS_RATES_RESPONSE, 'DT_Ozel_Oranlar_SK');
    expect(Object.fromEntries(paramposRatesOf(row))).toEqual({ 1: 1.75, 2: 3.2, 3: 4.1, 6: 7.9 });
  });

  it('computes Toplam_Tutar = price + price × rate / 100, rounded half up', () => {
    expect(calculateParamposTotalMinor(10000, 1.75)).toBe(10175); // 100.00 → 101.75
    expect(calculateParamposTotalMinor(3333, 3.2)).toBe(3440); // 33.33 × 1.032 = 34.39656
    expect(calculateParamposTotalMinor(50, 1)).toBe(51); // 0.505 rounds up
    expect(calculateParamposTotalMinor(12345, 0)).toBe(12345);
    expect(calculateParamposTotalMinor(99_999_999_999, 7.9)).toBe(107_899_999_999); // no float drift
  });
});

describe('Parampos installmentInfo / calculatePaidPrice', () => {
  let parampos: Parampos;
  let post: ReturnType<typeof vi.fn>;

  const respondWith = (bin: string) =>
    post.mockImplementation(
      async (_url: string, _body: string, config: { headers: Record<string, string> }) => ({
        data: config.headers.SOAPAction.endsWith('BIN_SanalPos') ? bin : PARAMPOS_RATES_RESPONSE,
      })
    );

  beforeEach(() => {
    parampos = new Parampos({
      clientCode: '10738',
      clientUsername: 'Test',
      clientPassword: 'Test',
      guid: '0c13d406-873b-403b-9c09-a5766840d98c',
      baseUrl: 'https://test-dmz.param.com.tr/turkpos.ws/service_turkpos_test.asmx',
    });
    post = vi.fn();
    (parampos as any).client.post = post;
  });

  it('returns the available installments of the card program with totals', async () => {
    respondWith(paramposBinResponse('1029', '0'));

    const result = await parampos.installmentInfo({ binNumber: '435508', price: '100.00' });

    expect(result.status).toBe(PaymentStatus.SUCCESS);
    const [detail] = result.installmentDetails!;
    expect(detail).toMatchObject({
      binNumber: '435508',
      bankName: 'AKBANK T.A.Ş.',
      cardFamilyName: 'Axess',
    });
    expect(detail.installmentPrices).toEqual([
      { installmentNumber: 1, totalPrice: 101.75, installmentPrice: 101.75, commissionRate: 1.75 },
      { installmentNumber: 2, totalPrice: 103.2, installmentPrice: 51.6, commissionRate: 3.2 },
      { installmentNumber: 3, totalPrice: 104.1, installmentPrice: 34.7, commissionRate: 4.1 },
      { installmentNumber: 6, totalPrice: 107.9, installmentPrice: 17.98, commissionRate: 7.9 },
    ]);
  });

  it('sends read-only queries as retryable SOAP calls', async () => {
    respondWith(paramposBinResponse('1029', '0'));
    await parampos.installmentInfo({ binNumber: '435508', price: '100.00' });
    const actions = post.mock.calls.map((c) => c[2].headers.SOAPAction);
    expect(actions).toEqual(
      expect.arrayContaining([
        'https://turkpos.com.tr/BIN_SanalPos',
        'https://turkpos.com.tr/TP_Ozel_Oran_SK_Liste',
      ])
    );
    expect(post.mock.calls.every((c) => c[2].retryable === true)).toBe(true);
    expect(post.mock.calls.find((c) => c[2].headers.SOAPAction.endsWith('Liste'))![1]).toContain(
      '<GUID>0c13d406-873b-403b-9c09-a5766840d98c</GUID>'
    );
  });

  it('uses the "other bank cards" rates when Param routes the BIN there (DKK=1)', async () => {
    respondWith(paramposBinResponse('9999', '1'));
    const result = await parampos.installmentInfo({ binNumber: '435508', price: '100.00' });
    expect(result.installmentDetails![0].installmentPrices).toEqual([
      { installmentNumber: 1, totalPrice: 101.99, installmentPrice: 101.99, commissionRate: 1.99 },
    ]);
  });

  it('returns no installments when no rate row matches', async () => {
    respondWith(paramposBinResponse('9999', '0'));
    const result = await parampos.installmentInfo({ binNumber: '435508', price: '100.00' });
    expect(result.status).toBe(PaymentStatus.SUCCESS);
    expect(result.installmentDetails![0].installmentPrices).toEqual([]);
  });

  it('rejects an invalid price without calling Param', async () => {
    const result = await parampos.installmentInfo({ binNumber: '435508', price: 'abc' });
    expect(post).not.toHaveBeenCalled();
    expect(result.code).toBe(PaymentErrorCode.INVALID_REQUEST);
  });

  it('calculatePaidPrice returns the total to send as paidPrice', async () => {
    respondWith(paramposBinResponse('1029', '0'));
    await expect(
      parampos.calculatePaidPrice({ binNumber: '435508', price: '250.00', installment: 3 })
    ).resolves.toBe('260.25');
    await expect(
      parampos.calculatePaidPrice({ binNumber: '435508', price: '250.00' })
    ).resolves.toBe('254.38'); // 250 × 1.0175 = 254.375 → 254.38
  });

  it('calculatePaidPrice rejects an unavailable installment count', async () => {
    respondWith(paramposBinResponse('1029', '0'));
    await expect(
      parampos.calculatePaidPrice({ binNumber: '435508', price: '250.00', installment: 4 })
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
