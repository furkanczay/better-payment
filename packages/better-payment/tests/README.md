# Testing Guide

Bu proje için test stratejisi ve yapısı.

## Test Klasör Yapısı

```
tests/
├── unit/                      # Unit testler - mock kullanır
│   ├── core/                 # Core sınıfların unit testleri
│   ├── providers/            # Provider'ların unit testleri
│   │   ├── iyzico/
│   │   └── paytr/
│   ├── adapters/             # Adapter testleri
│   └── client/               # Client testleri
│
├── integration/              # Integration testler - gerçek request formatlarını test eder
│   ├── core/                 # Multi-provider entegrasyonu
│   └── providers/            # Provider-specific integration testler
│       ├── iyzico.test.ts   # Iyzico request format, signature, vb.
│       └── paytr.test.ts    # PayTR hash, basket encoding, vb.
│
├── e2e/                      # End-to-end testler
│   └── payment-flows.test.ts # Tam ödeme akışları
│
├── fixtures/                 # Test verileri
│   ├── payment-data.ts      # Mock ödeme verileri
│   └── provider-responses.ts # Provider response'ları (sadece unit testler için)
│
└── helpers/                  # Test yardımcıları
    ├── axios-mock.ts        # Axios mock (sadece unit testler için)
    └── request-validator.ts # Request validation helpers
```

## Test Türleri

### 1. Unit Tests (`tests/unit/`)

**Amaç**: Tek bir fonksiyon veya sınıfı izole bir şekilde test etmek.

**Özellikler**:
- HTTP istekleri mock'lanır (axios-mock kullanır)
- Provider response'ları fixture'dan gelir
- Hızlı çalışır
- Kod mantığını test eder

**Ne zaman kullanılır**:
- Utility fonksiyonlarını test ederken
- Sınıf metodlarının içsel mantığını test ederken
- Error handling mantığını test ederken

**Örnek**:
```typescript
// tests/unit/providers/iyzico/utils.test.ts
import { createIyzicoHeaders } from '../../../src/providers/iyzico/utils';

it('should create headers with correct signature', () => {
  const headers = createIyzicoHeaders('api-key', 'secret', '/endpoint', 'body');
  expect(headers.Authorization).toContain('IYZWS');
});
```

### 2. Integration Tests (`tests/integration/`)

**Amaç**: Provider'lara gönderilen request'lerin GERÇEKTEN doğru formatta olduğunu test etmek.

**Özellikler**:
- HTTP istekleri intercept edilir (mock edilmez!)
- Request formatı, header'lar, signature/hash kontrolü yapılır
- Gerçek API'ye gitmeden önce son validasyon
- Unit testlerden daha yavaş ama gerçekçi

**Ne test eder**:
- ✅ Request format (JSON vs form-urlencoded)
- ✅ Authorization header format
- ✅ Signature/hash hesaplamaları
- ✅ Request body transformasyonu
- ✅ Endpoint routing
- ✅ Provider-specific field mapping

**Örnek**:
```typescript
// tests/integration/providers/iyzico.test.ts
it('should send payment request with correct Iyzico format', async () => {
  await iyzico.createPayment(mockPaymentRequest);

  const lastRequest = requestValidator.getLastRequest();

  // Validate Iyzico-specific format
  validateIyzicoRequest(lastRequest);
  expect(lastRequest.headers['Authorization']).toMatch(/^IYZWS .+:.+$/);
  expect(lastRequest.body.locale).toBe('tr');
});
```

### 3. E2E Tests (`tests/e2e/`)

**Amaç**: Tüm sistemin birlikte çalışmasını test etmek.

**Özellikler**:
- Gerçek API'lere istek atabilir (sandbox ortamlarına)
- Veya tam mock server kullanır
- En yavaş ama en kapsamlı testler

**Ne zaman kullanılır**:
- Tam ödeme akışlarını test ederken
- Multi-step işlemleri test ederken (3DS flow, refund, vb.)
- Production-like senaryoları test ederken

## Test Çalıştırma

```bash
# Tüm testler
npm test

# Sadece unit testler
npm run test:unit

# Sadece integration testler
npm run test:integration

# Sadece e2e testler
npm run test:e2e

# Coverage ile
npm run test:coverage

# Watch mode
npm run test:watch
```

## Yeni Test Yazarken

### Unit Test Yazma

1. `tests/unit/` altında uygun klasöre git
2. `axios-mock.ts` helper'ını import et
3. Provider response'ları için `fixtures/provider-responses.ts` kullan
4. Tek bir fonksiyon/metod'u test et

```typescript
import { mockAxios, setupAxiosMock } from '../../../helpers/axios-mock';
import { mockIyzicoSuccessResponse } from '../../../fixtures/provider-responses';

it('should handle payment success', async () => {
  setupAxiosMock('post', mockIyzicoSuccessResponse);

  const result = await iyzico.createPayment(mockPaymentRequest);

  expect(result.status).toBe(PaymentStatus.SUCCESS);
});
```

### Integration Test Yazma

1. `tests/integration/` altında uygun klasöre git
2. `RequestValidator` kullan
3. Axios'u intercept et (mock etme!)
4. Request formatını detaylı kontrol et

```typescript
import { RequestValidator, validateIyzicoRequest } from '../../helpers/request-validator';

beforeEach(() => {
  requestValidator = new RequestValidator();

  // Intercept requests
  vi.spyOn(axios, 'create').mockImplementation((config) => {
    const instance = axios.create(config);
    instance.interceptors.request.use((req) => {
      requestValidator.captureRequest({ /* ... */ });
      return Promise.reject({ response: { data: {}, status: 200 } });
    });
    return instance;
  });
});

it('should send correct format', async () => {
  await iyzico.createPayment(mockPaymentRequest);

  const lastRequest = requestValidator.getLastRequest();
  validateIyzicoRequest(lastRequest);
});
```

## Yaygın Hatalar

### ❌ YANLIŞ: Integration testlerde mock response kullanmak

```typescript
// KÖTÜ - Bu unit test!
setupAxiosMock('post', mockIyzicoSuccessResponse);
await iyzico.createPayment(mockPaymentRequest);
```

### ✅ DOĞRU: Request formatını validate etmek

```typescript
// İYİ - Bu integration test!
vi.spyOn(axios, 'create').mockImplementation(/* intercept */);
await iyzico.createPayment(mockPaymentRequest);

const request = requestValidator.getLastRequest();
expect(request.headers['Authorization']).toBeDefined();
expect(request.body.locale).toBe('tr');
```

## Test Prensipleri

1. **Unit testler mock kullanır** - Hızlı ve izole
2. **Integration testler request'i validate eder** - Gerçek format kontrolü
3. **E2E testler akışı test eder** - Tam senaryo
4. **Her test bağımsız olmalı** - Birbirine bağımlı testler yazmayın
5. **Test adları açıklayıcı olmalı** - Ne test ettiği belli olmalı

## Coverage Hedefleri

- **Lines**: 80%+
- **Functions**: 80%+
- **Branches**: 80%+
- **Statements**: 80%+

## CI/CD

Testler her commit'te otomatik çalışır:
- Unit testler her zaman çalışır
- Integration testler her zaman çalışır
- E2E testler sadece PR'larda çalışır (opsiyonel)
