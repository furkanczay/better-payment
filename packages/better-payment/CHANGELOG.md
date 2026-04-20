# Changelog

## 3.0.0

### Major Changes

- 8dfe354: ## Breaking Changes

  ### Class and type renames

  All exports have been renamed from `BetterPay*` to `BetterPayment*`:

  | Before                  | After                       |
  | ----------------------- | --------------------------- |
  | `BetterPay`             | `BetterPayment`             |
  | `BetterPayConfig`       | `BetterPaymentConfig`       |
  | `BetterPayHandler`      | `BetterPaymentHandler`      |
  | `BetterPayRequest`      | `BetterPaymentRequest`      |
  | `BetterPayResponse`     | `BetterPaymentResponse`     |
  | `BetterPayClient`       | `BetterPaymentClient`       |
  | `BetterPayClientConfig` | `BetterPaymentClientConfig` |
  | `createBetterPayClient` | `createBetterPaymentClient` |

  **Migration:**

  ```ts
  // Before
  import { BetterPay } from 'better-payment';
  const pay = new BetterPay({ ... });

  // After
  import { BetterPayment } from 'better-payment';
  const pay = new BetterPayment({ ... });
  ```

  ### Adapters removed

  The framework-specific adapters have been removed. Use the framework-agnostic `BetterPaymentHandler` directly.

  ```ts
  // Before (Next.js adapter)
  import { createNextHandler } from 'better-payment/adapters/next-js';

  // After (manual Next.js App Router integration)
  import { getBetterPayment } from '@/lib/payment';
  import { NextRequest, NextResponse } from 'next/server';

  async function handler(req: NextRequest) {
    const res = await getBetterPayment().handler.handle({
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      body: await req.json().catch(() => undefined),
    });
    return NextResponse.json(res.body, { status: res.status, headers: res.headers });
  }
  export const GET = handler;
  export const POST = handler;
  ```

  ### PayTR `cancel()` behavior changed

  `cancel()` no longer silently calls `refund()` with amount 0. It now returns a `FAILURE` status with an explanatory message. Use `refund()` with the original payment amount to void a PayTR payment.

  ### New iyzico handler routes

  `BetterPaymentHandler` now supports these additional iyzico-specific endpoints:

  - `POST /api/pay/iyzico/checkout/init`
  - `POST /api/pay/iyzico/checkout/retrieve`
  - `POST /api/pay/iyzico/pwi/init`
  - `POST /api/pay/iyzico/pwi/retrieve`
  - `POST /api/pay/iyzico/installment`
  - `POST /api/pay/iyzico/bin-check`
  - `POST /api/pay/iyzico/subscription/initialize`
  - `POST /api/pay/iyzico/subscription/cancel`
  - `POST /api/pay/iyzico/subscription/upgrade`
  - `POST /api/pay/iyzico/subscription/retrieve`
  - `POST /api/pay/iyzico/subscription/card-update`
  - `POST /api/pay/iyzico/subscription/product`
  - `POST /api/pay/iyzico/subscription/pricing-plan`

### Minor Changes

- ## New Features

  ### Logging Interface

  Add optional `BetterPaymentLogger` to `BetterPaymentConfig`. When configured, all HTTP requests, responses, and errors are logged via axios interceptors across all four providers.

  ```typescript
  const payment = new BetterPayment({
    mode: 'sandbox',
    logger: {
      debug: (msg, meta) => console.debug(msg, meta),
      info: (msg, meta) => console.info(msg, meta),
      error: (msg, err, meta) => console.error(msg, err, meta),
    },
    providers: { ... },
  });
  ```

  ### Retry Logic

  Add optional `RetryConfig` to `BetterPaymentConfig`. Automatically retries failed requests on network errors or specified HTTP status codes.

  ```typescript
  const payment = new BetterPayment({
    retry: {
      attempts: 3,      // 1 initial + 2 retries
      delay: 1000,      // 1s between attempts
      statusCodes: [429, 503],
    },
    providers: { ... },
  });
  ```

  ### Typed Error Classes

  New error classes in `better-payment/errors`:

  - `BetterPaymentError` — base class with `code` and `provider` fields
  - `ProviderNotEnabledError` — thrown when accessing a disabled provider
  - `PaymentFailedError` — includes `errorCode` and `rawResponse`
  - `ValidationError`
  - `ConfigurationError`

  ### Config Defaults (mode-based URLs)

  `baseUrl` is no longer required. Set `mode: 'sandbox' | 'production'` and the correct URL is applied automatically for all providers.

  ```typescript
  const payment = new BetterPayment({
    mode: 'sandbox', // uses sandbox URLs for all providers
    providers: {
      iyzico: { enabled: true, config: { apiKey: '...', secretKey: '...' } },
    },
  });
  ```

  ### Akbank BIN Check & Installment Info

  `Akbank.binCheck()` and `Akbank.installmentInfo()` are now implemented via `TXNTYPE=BINQuery` and `TXNTYPE=InstallmentEnquiry`.

  ### PayTR Card Tokenization

  New `PayTR.createPaymentWithToken(request)` method and handler route `POST /api/pay/paytr/payment/token` for saved-card (utoken) payments.

  ### BetterPaymentClient — All Providers

  `BetterPaymentClient` now exposes `akbank` and `parampos` clients in addition to `iyzico` and `paytr`. All provider clients include `binCheck` and `installmentInfo` methods.

  ## Bug Fixes

  ### type: use() overloads restore provider-specific types

  `payment.use('iyzico')` now correctly returns `Iyzico` (not the base `PaymentProvider`), enabling TypeScript to see provider-specific methods like `initCheckoutForm`.

  ### fix: handler parses form-encoded PayTR callbacks

  `POST /api/pay/paytr/callback` with `Content-Type: application/x-www-form-urlencoded` is now correctly parsed using `URLSearchParams`. Previously the callback body was silently dropped.

  ### fix: CancelResponse.rawResponse optional

  `rawResponse` changed from required to optional on `CancelResponse` to match all other response types.

  ### fix: subscription types use PaymentStatus enum

  All subscription response `status` fields now use `PaymentStatus` enum instead of string literals.

  ## New Exports

  The following types are now exported from `better-payment`:

  - `BetterPaymentError`, `ProviderNotEnabledError`, `PaymentFailedError`, `ValidationError`, `ConfigurationError`
  - `BetterPaymentLogger`, `RetryConfig`
  - `PROVIDER_DEFAULT_URLS`
  - `IyzicoProviderConfig`, `PayTRProviderConfig`, `AkbankProviderConfig`, `ParamposProviderConfig`
  - `BetterPaymentClient`, `createBetterPaymentClient`
  - `PayTRTokenPaymentRequest`
  - `BinCheckResponse`, `SubscriptionStatus`, `PaymentInterval`

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.3.0](https://github.com/furkanczay/better-payment/compare/v2.2.0...v2.3.0) (2026-01-20)

### ✨ Features

- **parampos:** add ParamPOS payment provider integration ([5ed11b9](https://github.com/furkanczay/better-payment/commit/5ed11b92b783ade3a39c02f9b4402969c2076ee9))

## [2.2.0](https://github.com/furkanczay/better-payment/compare/v2.1.0...v2.2.0) (2025-12-07)

### 🐛 Bug Fixes

- Build error ([30f6408](https://github.com/furkanczay/better-payment/commit/30f6408c277bb7b517f1fc180580c186031c7d18))
- **tsconfig:** exclude examples directory from TypeScript compilation ([83b0d1c](https://github.com/furkanczay/better-payment/commit/83b0d1cd85a172f11e3e0de06850f363dba4d2ef))

### ✨ Features

- **iyzico:** add installment inquiry support ([ef6cb00](https://github.com/furkanczay/better-payment/commit/ef6cb00abbe3d5b0b60eaafc22e1235c56ded433))
- **iyzico:** implement PWI (Payment With IBAN) functionality with comprehensive examples and tests ([8d7e82d](https://github.com/furkanczay/better-payment/commit/8d7e82d841cc1ec2b867f6617dd88b8c407e0098))

## [2.1.0](https://github.com/furkanczay/better-payment/compare/v2.0.0...v2.1.0) (2025-11-22)

### ✨ Features

- **iyzico:** add BIN check support and comprehensive tests ([c5373af](https://github.com/furkanczay/better-payment/commit/c5373af9e34e6d2c2d793c5e2e1e5064ba5e0f83))

## [2.0.0](https://github.com/furkanczay/better-payment/compare/v1.4.0-beta.0...v2.0.0) (2025-11-22)

### ⚠ BREAKING CHANGES

- Release workflow changed from release-please to standard-version

### 🐛 Bug Fixes

- Format ([ec63ade](https://github.com/furkanczay/better-payment/commit/ec63ade8024fbddbcbd6c063467b74f953e241bb))

### ✨ Features

- add roadmap for Turkish bank virtual POS integrations ([8ac088c](https://github.com/furkanczay/better-payment/commit/8ac088c5d5142c52c27fac2ede6273caec7aa0b7))
- Akbank Provider ([54e27c4](https://github.com/furkanczay/better-payment/commit/54e27c4600f0299da4cd6ea5c4ccf578dec335b1))
- replace release-please with standard-version for better release control ([4ac4df7](https://github.com/furkanczay/better-payment/commit/4ac4df7cfe296586fd1fd9a60633646a7149aebe))

## [1.5.0](https://github.com/furkanczay/better-payment/compare/better-payment-v1.4.0...better-payment-v1.5.0) (2025-10-28)

### Features

- Akbank Provider ([54e27c4](https://github.com/furkanczay/better-payment/commit/54e27c4600f0299da4cd6ea5c4ccf578dec335b1))

## [1.4.0](https://github.com/furkanczay/better-payment/compare/better-payment-v1.3.0...better-payment-v1.4.0) (2025-10-25)

### Features

- add PaymentStatus enum and PaymentMetadata interface for better transaction tracking ([26f172e](https://github.com/furkanczay/better-payment/commit/26f172e3d8fa75750757e3e29d4ecb6eb91f677e))
- Beta branch ([a9c3eac](https://github.com/furkanczay/better-payment/commit/a9c3eac6544b22cfee63689674303a8186b88365))

### Bug Fixes

- set target-branch to beta in release-please workflow ([1aa6668](https://github.com/furkanczay/better-payment/commit/1aa6668516e60874dd742d6ca2ccac336557b67d))

## [1.3.0](https://github.com/furkanczay/better-payment/compare/better-payment-v1.2.4...better-payment-v1.3.0) (2025-10-25)

### Features

- **iyzico:** Subscription ([9d1641d](https://github.com/furkanczay/better-payment/commit/9d1641dc90f91f10616e87ff226cffd11f4a42eb))

## [1.2.4](https://github.com/furkanczay/better-payment/compare/better-payment-v1.2.3...better-payment-v1.2.4) (2025-10-25)

### Bug Fixes

- Integration and unit tests ([a34f3bb](https://github.com/furkanczay/better-payment/commit/a34f3bbb1655e7f790e4991e7fbb164fabc704e2))

## [1.2.3](https://github.com/furkanczay/better-payment/compare/better-payment-v1.2.2...better-payment-v1.2.3) (2025-10-23)

### Bug Fixes

- Format ([3550fbe](https://github.com/furkanczay/better-payment/commit/3550fbe615376e1bc5f466feaed081496e03f466))
- **iyzico:** Checkout Form Endpoints ([08b044e](https://github.com/furkanczay/better-payment/commit/08b044e0cd47be3e67e456b0af55bef926b6fff7))

## [1.2.2](https://github.com/furkanczay/better-payment/compare/better-payment-v1.2.1...better-payment-v1.2.2) (2025-10-23)

### Bug Fixes

- types ([cd099f4](https://github.com/furkanczay/better-payment/commit/cd099f4ad4af4dd0116ff05397295423eff8dae3))

## [1.2.1](https://github.com/furkanczay/better-payment/compare/better-payment-v1.2.0...better-payment-v1.2.1) (2025-10-23)

### Bug Fixes

- **iyzico:** Checkout form test functions ([8392fa6](https://github.com/furkanczay/better-payment/commit/8392fa68ee280126557513650e8b7ee2bfa8bb8d))

## [1.2.0](https://github.com/furkanczay/better-payment/compare/better-payment-v1.1.1...better-payment-v1.2.0) (2025-10-23)

### Features

- **iyzico:** Checkout form implementation ([83c7eac](https://github.com/furkanczay/better-payment/commit/83c7eac28bf9e2e90577484244165b41c934dc09))

### Bug Fixes

- Format check ([32c3d5d](https://github.com/furkanczay/better-payment/commit/32c3d5d4d6db07b07093835ba7e07624feea9308))

## [1.1.1](https://github.com/furkanczay/better-payment/compare/better-payment-v1.1.0...better-payment-v1.1.1) (2025-10-23)

### Bug Fixes

- add contents write permission for npm badge update ([df202cb](https://github.com/furkanczay/better-payment/commit/df202cb69b21e8382c33d9d61971d44a6dd9b145))

## [1.1.0](https://github.com/furkanczay/better-payment/compare/better-payment-v1.0.2...better-payment-v1.1.0) (2025-10-23)

### Features

- add automatic changelog generation ([dfe1ae8](https://github.com/furkanczay/better-payment/commit/dfe1ae8b154f00bc727fc57a2dfbea144b939859))
- add automatic changelog generation ([50d094f](https://github.com/furkanczay/better-payment/commit/50d094f4369e4debeffcbe480875971574531804))

### Bug Fixes

- CI automation ([076e56b](https://github.com/furkanczay/better-payment/commit/076e56b2ae001dd3ee1df78ad36302a4e71dfe92))
- Min Node version 18 to 20 ([9f118d8](https://github.com/furkanczay/better-payment/commit/9f118d8ba425a9a6658b0330c08ef33a460e57f1))
- publish.yml ([856b9ed](https://github.com/furkanczay/better-payment/commit/856b9edcc1bdae3567a8d2d1cb1a95d8e20919cb))
- Readme ([40fa223](https://github.com/furkanczay/better-payment/commit/40fa2233cf579e6fde870fc8f85cbe03f425a485))
- REPO NAME ([adbdd3b](https://github.com/furkanczay/better-payment/commit/adbdd3b1501abe50cc253b10f8cfcf1cdf6358af))
