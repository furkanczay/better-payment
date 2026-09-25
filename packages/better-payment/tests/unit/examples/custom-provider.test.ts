import { it, expect, vi } from 'vitest';
import { betterPayment, PaymentErrorCode } from 'better-payment';
import { myPos } from '../../../examples/custom-provider';
import { mockPaymentRequest as order } from '../../fixtures/payment-data';

// The custom provider example of the docs ("Custom providers") works as described
it('the custom provider example charges, validates and maps error codes', async () => {
  const fetch = vi.fn(async () => Response.json({ approved: true, transactionId: 'T-1' }));
  const payment = betterPayment({
    providers: { mypos: myPos({ terminalId: 'T1', secretKey: 'secret', fetch }) },
  });
  expect(await payment.createPayment(order)).toMatchObject({ status: 'success', paymentId: 'T-1' });
  expect(fetch).toHaveBeenCalledWith('https://api.mypos.example/payments', expect.anything());

  const invalid = await payment.createPayment({
    ...order,
    paymentCard: { ...order.paymentCard!, cardNumber: '1' },
  });
  expect(invalid.code).toBe(PaymentErrorCode.INVALID_REQUEST);
  expect(fetch).toHaveBeenCalledTimes(1);

  const declined = betterPayment({
    providers: {
      mypos: myPos({
        terminalId: 'T1',
        secretKey: 's',
        fetch: async () => Response.json({ approved: false, responseCode: '51' }),
      }),
    },
  });
  expect((await declined.createPayment(order)).code).toBe(PaymentErrorCode.INSUFFICIENT_FUNDS);
});
