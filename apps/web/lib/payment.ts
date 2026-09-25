import { betterPayment, iyzico } from "better-payment";

const createPayment = () =>
  betterPayment({
    providers: {
      iyzico: iyzico({
        apiKey: process.env.IYZICO_API_KEY!,
        secretKey: process.env.IYZICO_SECRET_KEY!,
        baseUrl:
          process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com",
      }),
    },
  });

let instance: ReturnType<typeof createPayment> | undefined;

export const getBetterPayment = () => (instance ??= createPayment());
