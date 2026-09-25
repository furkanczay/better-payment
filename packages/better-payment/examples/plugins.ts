/**
 * Plugins and events. Also a type test: CI typechecks the examples, so the
 * `@ts-expect-error` lines below fail the build if the types get looser.
 */
import {
  betterPayment,
  definePlugin,
  defineProvider,
  iyzico,
  paytr,
  Iyzico,
  PaymentProvider,
  PaymentStatus,
  type PaymentRequest,
  type PaymentResponse,
  type ThreeDSPaymentRequest,
  type ThreeDSInitResponse,
  type RefundRequest,
  type RefundResponse,
  type CancelRequest,
  type CancelResponse,
  type PaymentProviderConfig,
} from 'better-payment';
import { MockProvider } from 'better-payment/testing';

// A plugin that sends every payment above a limit to PayTR and adds `payment.limits`
const paytrAbove = (limit: number) =>
  definePlugin({
    id: 'paytr-above',
    hooks: {
      before: [
        {
          matcher: (ctx) => ctx.operation === 'createPayment' && ctx.routable,
          handler: (ctx) => {
            if (ctx.operation !== 'createPayment') return;
            return Number(ctx.request.paidPrice) > limit ? { provider: 'paytr' } : undefined;
          },
        },
      ],
    },
    methods: () => ({ limits: { paytrAbove: limit } }),
    $ERROR_CODES: { LIMIT_NOT_SET: 'No limit configured' },
  });

// A plugin that only listens to events
const auditLog = definePlugin({
  id: 'audit-log',
  events: {
    '*': (event) => console.log(event.type, event.provider, event.paymentId),
    'refund.failed': (event) => console.error('refund failed', event.code),
  },
});

// A custom provider
interface MyPosConfig extends PaymentProviderConfig {
  terminalId: string;
}

class MyPos extends PaymentProvider<MyPosConfig> {
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return { status: PaymentStatus.SUCCESS, conversationId: request.conversationId };
  }
  async initThreeDSPayment(_request: ThreeDSPaymentRequest): Promise<ThreeDSInitResponse> {
    return { status: PaymentStatus.FAILURE, errorMessage: 'not implemented' };
  }
  async completeThreeDSPayment(_callbackData: unknown): Promise<PaymentResponse> {
    return { status: PaymentStatus.FAILURE };
  }
  async refund(_request: RefundRequest): Promise<RefundResponse> {
    return { status: PaymentStatus.FAILURE };
  }
  async cancel(_request: CancelRequest): Promise<CancelResponse> {
    return { status: PaymentStatus.FAILURE };
  }
  async getPayment(_paymentId: string): Promise<PaymentResponse> {
    return { status: PaymentStatus.FAILURE };
  }
  get terminal(): string {
    return this.config.terminalId;
  }
}

const myPos = (config: MyPosConfig) =>
  defineProvider((ctx) => new MyPos({ ...config, logger: config.logger ?? ctx.logger }));

export const payment = betterPayment({
  providers: {
    iyzico: iyzico({ apiKey: 'key', secretKey: 'secret' }),
    paytr: paytr({ merchantId: '1', merchantKey: 'key', merchantSalt: 'salt' }),
    mypos: myPos({ terminalId: 'T1' }),
    mock: new MockProvider(),
  },
  defaultProvider: 'iyzico',
  mode: 'sandbox',
  plugins: [paytrAbove(5000), auditLog],
});

export async function usage(): Promise<void> {
  // Providers are typed by their key
  const provider: Iyzico = payment.iyzico;
  const terminal: string = payment.mypos.terminal;
  const mock: MockProvider = payment.use('mock');
  mock.failNext('payment');
  void provider;
  void terminal;

  // Plugin members and error codes are typed
  const limit: number = payment.limits.paytrAbove;
  const message: string = payment.$ERROR_CODES.LIMIT_NOT_SET;
  void limit;
  void message;

  // Events are typed by name
  const off = payment.on('payment.failed', (event) => {
    const type: 'payment.failed' = event.type;
    void type;
  });
  off();

  // @ts-expect-error unknown provider id
  void payment.stripe;
  // @ts-expect-error unknown plugin member
  void payment.router;
  // @ts-expect-error unknown event
  payment.on('payment.exploded', () => undefined);

  betterPayment({
    providers: { iyzico: iyzico({ apiKey: 'key', secretKey: 'secret' }) },
    // @ts-expect-error the default provider must be one of the providers
    defaultProvider: 'paytr',
  });
}
