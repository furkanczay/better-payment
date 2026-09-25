import { describe, it, expect } from 'vitest';
import {
  akbankSign,
  createAkbank3DFormHash,
  verifyAkbank3DCallback,
  generateAkbankRandomNumber,
  formatAkbankDateTime,
  formatAkbankAmount,
  formatAkbankExpiry,
  getAkbankCurrencyCode,
} from '../../../../src/providers/akbank/utils';

import { AKBANK_TEST, AKBANK_3DPAY_CALLBACK } from '../../../fixtures/akbank';

describe('Akbank utils', () => {
  it('3D form hash matches the reference vector', async () => {
    const hash = await createAkbank3DFormHash(
      {
        paymentModel: '3D',
        txnCode: '3000',
        merchantSafeId: AKBANK_TEST.merchantSafeId,
        terminalSafeId: AKBANK_TEST.terminalSafeId,
        orderId: '20240404A4B0',
        lang: 'TR',
        amount: '1.01',
        ccbRewardAmount: '1.00',
        pcbRewardAmount: '1.00',
        xcbRewardAmount: '1.00',
        currencyCode: '949',
        installCount: '1',
        okUrl: 'http://localhost/akbankpos/3d/response.php',
        failUrl: 'http://localhost/akbankpos/3d/response.php',
        emailAddress: 'test@test.com',
        randomNumber:
          'AEDDD8688E11A3DC588DAB2ED59B2F64D45E798761CEFF17F4DB47581072697890180C4195986250F89C2C67A04A3B96F0AC66AE99B49BB7BEE618FBD621C4CD',
        requestDateTime: '2024-04-04T21:11:41.000',
        creditCard: '4355093000315232',
        expiredDate: '1135',
        cvv: '665',
      },
      AKBANK_TEST.secretKey
    );
    expect(hash).toBe('ilR2mCExklKEti+2x61A8pcOfzJ5z5M6xMYmmU8ClaKaDuxKooFuH3v7XW/ba25xlTDqGN1H//i0zTiJl5YnfA==');
  });

  describe('verifyAkbank3DCallback', () => {
    it('accepts the reference 3D_PAY callback', async () => {
      expect(await verifyAkbank3DCallback(AKBANK_3DPAY_CALLBACK, AKBANK_TEST.secretKey)).toBe(true);
    });

    it('rejects a tampered responseCode', async () => {
      expect(await verifyAkbank3DCallback({ ...AKBANK_3DPAY_CALLBACK, responseCode: 'VPS-1005' }, AKBANK_TEST.secretKey)).toBe(
        false
      );
    });

    it('rejects a wrong key', async () => {
      expect(await verifyAkbank3DCallback(AKBANK_3DPAY_CALLBACK, 'other-key')).toBe(false);
    });

    it('rejects a hashParams list that does not cover responseCode/orderId', async () => {
      const data = { orderId: 'X', responseCode: 'VPS-0000', hashParams: 'orderId' };
      const forged = { ...data, hash: await akbankSign('X', AKBANK_TEST.secretKey) };
      expect(await verifyAkbank3DCallback(forged, AKBANK_TEST.secretKey)).toBe(false);
    });

    it('rejects missing hash', async () => {
      expect(await verifyAkbank3DCallback({ ...AKBANK_3DPAY_CALLBACK, hash: undefined }, AKBANK_TEST.secretKey)).toBe(false);
    });
  });

  it('random number is 128 hex chars', async () => {
    expect(generateAkbankRandomNumber()).toMatch(/^[0-9A-F]{128}$/);
  });

  it('formats request date in Istanbul time', async () => {
    expect(formatAkbankDateTime(new Date('2024-04-04T18:11:41.123Z'))).toBe('2024-04-04T21:11:41.000');
  });

  it('formats amounts, expiry and currency', async () => {
    expect(formatAkbankAmount('1.1')).toBe('1.10');
    expect(formatAkbankExpiry('1', '2035')).toBe('0135');
    expect(formatAkbankExpiry('11', '35')).toBe('1135');
    expect(() => formatAkbankExpiry('13', '35')).toThrow();
    expect(getAkbankCurrencyCode('TRY')).toBe(949);
    expect(getAkbankCurrencyCode('usd')).toBe(840);
    expect(() => getAkbankCurrencyCode('CHF')).toThrow(/not supported/);
  });
});
