# Better Payment

> **Integrate once. Accept payments across all Turkish providers.**

A unified payment gateway library for Turkey that lets you integrate multiple payment providers and bank virtual POS systems through a single, consistent API.

---

## ✨ Why Better Payment?

Integrating payments in Turkey is painful:

* Every bank has a different API
* 3D Secure flows are inconsistent
* Switching providers requires rewriting code

**Better Payment solves this.**

→ One API
→ Multiple providers
→ Clean developer experience

---

## 🚀 Features

* 🔌 **Unified API** — Same interface for all providers
* 🏦 **Multi-provider support** — Iyzico, PayTR, ParamPOS
* 🔄 **Provider switching** — Change provider without rewriting logic
* 🛡️ **3D Secure & Non-3D** support
* 💸 **Refund & cancel operations**
* 🔁 **Subscription support** (Iyzico)
* ⚡ **Lightweight** — minimal dependencies
* 🧠 **TypeScript-first** — full type safety

---

## 📦 Installation

```bash
npm install better-payment
```

**Requirements:** Node.js 20+

---

## ⚡ Quick Start

```ts
import { BetterPay, ProviderType, Currency } from "better-payment";

const betterPay = new BetterPay({
  providers: {
    iyzico: {
      enabled: true,
      config: {
        apiKey: process.env.IYZICO_API_KEY!,
        secretKey: process.env.IYZICO_SECRET_KEY!,
        baseUrl: "https://sandbox-api.iyzipay.com",
      },
    },
  },
  defaultProvider: ProviderType.IYZICO,
});

const result = await betterPay.createPayment({
  price: "100.00",
  paidPrice: "100.00",
  currency: Currency.TRY,
  // ...
});

if (result.status === "success") {
  console.log(result.paymentId);
}
```

---

## 🧠 Core Concepts

### Providers

Each payment provider is abstracted behind a unified interface:

```ts
betterPay.iyzico.createPayment()
betterPay.paytr.createPayment()
betterPay.parampos.createPayment()
```

---

### Default Provider

Set once, use everywhere:

```ts
betterPay.createPayment()
```

---

### Provider Switching

```ts
betterPay.use(ProviderType.PAYTR).createPayment()
```

---

## 🏦 Supported Providers

| Provider | Status |
| -------- | ------ |
| Iyzico   | ✅ Full |
| PayTR    | ✅ Full |
| ParamPOS | ✅ Full |

---

## 🔐 3D Secure Flow

```ts
const init = await betterPay.iyzico.initThreeDSPayment({...});

// show HTML to user

const complete = await betterPay.iyzico.completeThreeDSPayment(callbackData);
```

---

## 💸 Refund & Cancel

```ts
await betterPay.refund({...});
await betterPay.cancel({...});
```

---

## 🔁 Subscription (Iyzico)

```ts
await betterPay.iyzico.initializeSubscription({...});
```

---

## 🧩 Architecture

Better Payment uses a **provider-based architecture**:

```
BetterPay
 ├── Iyzico Provider
 ├── PayTR Provider
 └── ParamPOS Provider
```

Each provider implements the same interface → making switching seamless.

---

## 📚 Documentation

Full documentation: **(add your docs URL)**

Recommended structure:

* Getting Started
* Payments
* 3D Secure
* Refunds
* Subscriptions
* Providers
* Advanced

---

## 🧪 Example Use Cases

* SaaS billing systems
* E-commerce checkout
* Marketplace payments
* Subscription platforms

---

## ⚙️ Framework Support

Works with:

* Next.js
* Express
* Node.js
* Any backend framework

---

## 🤝 Contributing

PRs are welcome!

```bash
git checkout -b feature/my-feature
git commit -m "feat: add something"
git push
```

---

## 🗺️ Roadmap

* [x] Iyzico
* [x] PayTR
* [x] ParamPOS
* [ ] Bank Virtual POS integrations
* [ ] Webhook system
* [ ] Smart provider fallback
* [ ] Dashboard (future SaaS)

---

## 📄 License

MIT

---

## ❤️ Built for Turkish developers
