import { BetterPayment, ProviderType } from "better-payment";

let _instance: BetterPayment | null = null;

export function getBetterPayment(): BetterPayment {
  if (!_instance) {
    _instance = new BetterPayment({
      defaultProvider: ProviderType.IYZICO,
      providers: {
        iyzico: {
          enabled: true,
          config: {
            apiKey: process.env.IYZICO_API_KEY!,
            secretKey: process.env.IYZICO_SECRET_KEY!,
            baseUrl:
              process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com",
          },
        },
      },
    });
  }
  return _instance;
}
