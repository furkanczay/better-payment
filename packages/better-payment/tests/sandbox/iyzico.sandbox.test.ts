import { describe, it, expect } from 'vitest';
import { BetterPayment } from '../../src';
import { PaymentStatus } from '../../src/types';
import {
  CALLBACK_URL,
  describeResult,
  order,
  orderId,
  paymentRequest,
  record,
  requireEnv,
  sandboxCard,
  threeDSRequest,
} from './setup';

const env = requireEnv('IYZICO_SANDBOX_API_KEY', 'IYZICO_SANDBOX_SECRET_KEY');

// Published iyzico sandbox test cards
const card = sandboxCard('IYZICO_SANDBOX', {
  cardHolderName: 'John Doe',
  cardNumber: '5528790000000008',
  expireMonth: '12',
  expireYear: '2030',
  cvc: '123',
})!;
const insufficientFundsCard = { ...card, cardNumber: '4111111111111129' };

describe.skipIf(!env)('iyzico sandbox', () => {
  const iyzico = !env
    ? (undefined as never)
    : new BetterPayment({
        mode: 'sandbox',
        providers: {
          iyzico: {
            enabled: true,
            config: {
              apiKey: env!.IYZICO_SANDBOX_API_KEY,
              secretKey: env!.IYZICO_SANDBOX_SECRET_KEY,
            },
          },
        },
      }).iyzico;

  it('charges, looks up and partially refunds a payment', async () => {
    const payment = await iyzico.createPayment(
      paymentRequest(card, { conversationId: orderId('IYZ') })
    );
    record('iyzico', 'create-payment', payment.rawResponse);
    expect(payment.status, describeResult(payment)).toBe(PaymentStatus.SUCCESS);
    expect(payment.paymentId).toBeTruthy();

    const lookup = await iyzico.getPayment(payment.paymentId!);
    record('iyzico', 'get-payment', lookup.rawResponse);
    expect(lookup.status, describeResult(lookup)).toBe(PaymentStatus.SUCCESS);
    expect(lookup.paymentId).toBe(payment.paymentId);

    const raw = payment.rawResponse as { itemTransactions?: { paymentTransactionId: string }[] };
    const transactionId = raw.itemTransactions?.[0]?.paymentTransactionId;
    expect(transactionId).toBeTruthy();

    const refund = await iyzico.refund({
      paymentId: transactionId!,
      price: '0.1',
      currency: 'TRY',
      ip: '85.34.78.112',
    });
    record('iyzico', 'refund', refund.rawResponse);
    expect(refund.status, describeResult(refund)).toBe(PaymentStatus.SUCCESS);
  });

  it('cancels a payment', async () => {
    const payment = await iyzico.createPayment(
      paymentRequest(card, { conversationId: orderId('IYZ') })
    );
    expect(payment.status, describeResult(payment)).toBe(PaymentStatus.SUCCESS);

    const cancel = await iyzico.cancel({ paymentId: payment.paymentId!, ip: '85.34.78.112' });
    record('iyzico', 'cancel', cancel.rawResponse);
    expect(cancel.status, describeResult(cancel)).toBe(PaymentStatus.SUCCESS);
  });

  it('reports a declined card as failure with the provider error', async () => {
    const payment = await iyzico.createPayment(
      paymentRequest(insufficientFundsCard, { conversationId: orderId('IYZ') })
    );
    record('iyzico', 'create-payment-declined', payment.rawResponse);
    expect(payment.status).toBe(PaymentStatus.FAILURE);
    expect(payment.errorCode).toBeTruthy();
  });

  it('starts a 3D Secure payment and returns the bank form', async () => {
    const result = await iyzico.initThreeDSPayment(
      threeDSRequest(card, { conversationId: orderId('IYZ') })
    );
    record('iyzico', 'init-3ds', result.rawResponse);
    expect(result.status, describeResult(result)).not.toBe(PaymentStatus.FAILURE);
    expect(result.threeDSHtmlContent).toMatch(/<form|<html/i);
  });

  it('initializes a checkout form', async () => {
    const result = await iyzico.initCheckoutForm({
      ...order(),
      conversationId: orderId('IYZ'),
      callbackUrl: CALLBACK_URL,
    });
    record('iyzico', 'checkout-form-init', result.rawResponse);
    expect(result.status, describeResult(result)).toBe(PaymentStatus.SUCCESS);
    expect(result.token).toBeTruthy();
  });

  it('looks up BIN and installment information', async () => {
    const bin = await iyzico.binCheck(card.cardNumber.slice(0, 6));
    record('iyzico', 'bin-check', bin.rawResponse);
    expect(bin.bankName).toBeTruthy();

    const installments = await iyzico.installmentInfo({
      binNumber: card.cardNumber.slice(0, 6),
      price: '100',
    });
    record('iyzico', 'installment-info', installments.rawResponse);
    expect(installments.status, describeResult(installments)).toBe(PaymentStatus.SUCCESS);
    expect(installments.installmentDetails?.length).toBeGreaterThan(0);
  });
});
