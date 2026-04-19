# Better Pay Projesine Katkı Rehberi

Better Pay projesine katkıda bulunmayı düşündüğünüz için teşekkür ederiz! Bu doküman, projeye nasıl katkıda bulunabileceğinizi açıklar.

## İçindekiler

- [Davranış Kuralları](#davranış-kuralları)
- [Nasıl Katkıda Bulunabilirim?](#nasıl-katkıda-bulunabilirim)
- [Geliştirme Ortamı Kurulumu](#geliştirme-ortamı-kurulumu)
- [Pull Request Süreci](#pull-request-süreci)
- [Kodlama Standartları](#kodlama-standartları)
- [Commit Mesajları](#commit-mesajları)
- [Yeni Provider Ekleme](#yeni-provider-ekleme)
- [Test Yazma](#test-yazma)

## Davranış Kuralları

Bu proje ve topluluğu herkes için açık ve misafirperver bir deneyim sağlamayı taahhüt eder. Lütfen saygılı ve yapıcı olun.

## Nasıl Katkıda Bulunabilirim?

### Bug Raporlama

Bug bulduğunuzda lütfen bir issue açın ve aşağıdaki bilgileri ekleyin:

- Bug'ın detaylı açıklaması
- Hatayı yeniden oluşturma adımları
- Beklenen davranış
- Gerçek davranış
- Ortam bilgileri (Node.js versiyonu, işletim sistemi, vb.)
- Varsa hata mesajları ve stack trace

### Özellik Önerisi

Yeni özellik önerileri için:

1. Önce [Discussions](https://github.com/furkanczay/better-payment/discussions) bölümünde önerinizi paylaşın
2. Topluluktan geri bildirim alın
3. Onaylandıktan sonra bir issue açın

### Dokümantasyon

Dokümantasyon iyileştirmeleri her zaman değerlidir:

- README.md güncellemeleri
- Kod yorumları
- Örnek kodlar
- Kullanım kılavuzları

## Geliştirme Ortamı Kurulumu

### Gereksinimler

- Node.js 18.x veya üzeri
- pnpm 8.x veya üzeri

### Kurulum Adımları

1. Repository'yi fork edin

2. Fork'unuzu klonlayın:
```bash
git clone https://github.com/KULLANICI_ADINIZ/better-payment.git
cd better-payment
```

3. Upstream remote'u ekleyin:
```bash
git remote add upstream https://github.com/furkanczay/better-payment.git
```

4. Bağımlılıkları yükleyin:
```bash
pnpm install
```

5. Environment değişkenlerini ayarlayın:
```bash
# .env.local dosyası oluşturun
cp .env.example .env.local
# Gerekli API key'leri ekleyin
```

6. Geliştirme modunda çalıştırın:
```bash
pnpm dev
```

7. Testleri çalıştırın:
```bash
pnpm test
```

## Pull Request Süreci

1. **Branch Oluşturun**
```bash
git checkout -b feature/amazing-feature
# veya
git checkout -b fix/bug-description
```

Branch isimlendirme kuralları:
- `feature/` - Yeni özellikler için
- `fix/` - Bug düzeltmeleri için
- `docs/` - Dokümantasyon güncellemeleri için
- `refactor/` - Kod yeniden yapılandırma için
- `test/` - Test güncellemeleri için
- `chore/` - Diğer değişiklikler için

2. **Değişikliklerinizi Yapın**
- Kodlama standartlarına uyun
- Test yazın
- Dokümantasyon güncelleyin

3. **Commit Edin**
```bash
git add .
git commit -m "feat: Add amazing feature"
```

4. **Pull Request Açın**
- Branch'inizi fork'unuza push edin
- GitHub'da Pull Request açın
- PR şablonunu doldurun
- Test sonuçlarını ve değişiklikleri açıklayın

5. **Code Review**
- Geri bildirimlere yanıt verin
- Gerekli değişiklikleri yapın
- CI/CD pipeline'ının geçmesini sağlayın

## Kodlama Standartları

### TypeScript

- Strict mode kullanın
- Her zaman tip tanımlamaları yapın
- `any` kullanmaktan kaçının
- Interface'leri tercih edin

```typescript
// İyi ✅
interface PaymentConfig {
  apiKey: string;
  secretKey: string;
}

function createPayment(config: PaymentConfig): Promise<PaymentResponse> {
  // ...
}

// Kötü ❌
function createPayment(config: any) {
  // ...
}
```

### Kod Formatı

Prettier ve ESLint otomatik olarak çalışır:

```bash
# Format kontrolü
pnpm format:check

# Format uygula
pnpm format

# Lint kontrolü
pnpm lint
```

### İsimlendirme Kuralları

- **Dosyalar**: kebab-case (`payment-provider.ts`)
- **Sınıflar**: PascalCase (`PaymentProvider`)
- **Fonksiyonlar**: camelCase (`createPayment`)
- **Sabitler**: UPPER_SNAKE_CASE (`API_VERSION`)
- **Interface'ler**: PascalCase, "I" prefix kullanmayın (`PaymentRequest`)

### Error Handling

```typescript
// İyi ✅
try {
  const result = await provider.createPayment(request);
  return result;
} catch (error) {
  if (error instanceof PaymentError) {
    // Spesifik hata işleme
  }
  throw new PaymentError('Payment failed', error);
}

// Kötü ❌
try {
  const result = await provider.createPayment(request);
  return result;
} catch (e) {
  console.log(e);
}
```

## Commit Mesajları

[Conventional Commits](https://www.conventionalcommits.org/) standardını kullanıyoruz.

### Format

```
<tip>(<kapsam>): <kısa açıklama>

<detaylı açıklama (opsiyonel)>

<footer (opsiyonel)>
```

### Tipler

- `feat`: Yeni özellik
- `fix`: Bug düzeltme
- `docs`: Dokümantasyon değişiklikleri
- `style`: Kod formatı değişiklikleri
- `refactor`: Kod yeniden yapılandırma
- `test`: Test ekleme veya düzeltme
- `chore`: Build, CI/CD vb. değişiklikler
- `perf`: Performans iyileştirmeleri

### Örnekler

```bash
# Yeni özellik
git commit -m "feat(iyzico): Add installment support"

# Bug düzeltme
git commit -m "fix(paytr): Fix token generation issue"

# Dokümantasyon
git commit -m "docs: Update installation instructions"

# Breaking change
git commit -m "feat(core)!: Change API response structure

BREAKING CHANGE: Response structure changed from {data} to {result}"
```

### Husky ve Commitlint

Commit mesajları otomatik olarak doğrulanır. Hatalı commit mesajları reddedilir.

## Yeni Provider Ekleme

### 1. Klasör Yapısı Oluşturun

```
src/providers/
└── your-provider/
    ├── index.ts
    ├── types.ts
    ├── mappers.ts
    └── __tests__/
        └── your-provider.test.ts
```

### 2. PaymentProvider Abstract Sınıfını Extend Edin

```typescript
// src/providers/your-provider/index.ts
import { PaymentProvider } from '../base/payment-provider';
import type { PaymentRequest, PaymentResponse } from '../../types';

export class YourProvider extends PaymentProvider {
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Implementasyon
  }

  async initThreeDSPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Implementasyon
  }

  async completeThreeDSPayment(callbackData: unknown): Promise<PaymentResponse> {
    // Implementasyon
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    // Implementasyon
  }

  async cancel(request: CancelRequest): Promise<CancelResponse> {
    // Implementasyon
  }

  async getPayment(paymentId: string): Promise<PaymentResponse> {
    // Implementasyon
  }
}
```

### 3. Tipler Tanımlayın

```typescript
// src/providers/your-provider/types.ts
export interface YourProviderConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

export interface YourProviderRequest {
  // Provider-specific fields
}

export interface YourProviderResponse {
  // Provider-specific fields
}
```

### 4. Mapper Fonksiyonları Yazın

```typescript
// src/providers/your-provider/mappers.ts
import type { PaymentRequest } from '../../types';
import type { YourProviderRequest } from './types';

export function mapToProviderRequest(
  request: PaymentRequest
): YourProviderRequest {
  return {
    // Map unified request to provider-specific request
  };
}

export function mapFromProviderResponse(
  response: YourProviderResponse
): PaymentResponse {
  return {
    // Map provider-specific response to unified response
  };
}
```

### 5. Testler Yazın

```typescript
// src/providers/your-provider/__tests__/your-provider.test.ts
import { describe, it, expect } from 'vitest';
import { YourProvider } from '../index';

describe('YourProvider', () => {
  it('should create payment successfully', async () => {
    const provider = new YourProvider({
      apiKey: 'test',
      secretKey: 'test',
      baseUrl: 'https://test.com',
    });

    const result = await provider.createPayment({
      // Test data
    });

    expect(result.status).toBe('success');
  });
});
```

### 6. BetterPay Ana Sınıfına Ekleyin

```typescript
// src/index.ts
export { YourProvider } from './providers/your-provider';
```

### 7. Dokümantasyon Ekleyin

README.md dosyasını güncelleyin:
- Desteklenen provider listesine ekleyin
- Kullanım örneği ekleyin
- Konfigürasyon detaylarını ekleyin

## Test Yazma

### Test Yapısı

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should handle success case', async () => {
    // Arrange
    const provider = new Provider(config);
    const request = createTestRequest();

    // Act
    const result = await provider.method(request);

    // Assert
    expect(result.status).toBe('success');
    expect(result).toHaveProperty('paymentId');
  });

  it('should handle error case', async () => {
    // Test error scenarios
  });
});
```

### Test Çalıştırma

```bash
# Tüm testler
pnpm test

# Watch mode
pnpm test --watch

# UI ile
pnpm test:ui

# Coverage
pnpm test --coverage
```

### Test Coverage

Minimum %80 test coverage hedefleyin:
- Tüm public metodlar test edilmeli
- Error case'ler test edilmeli
- Edge case'ler test edilmeli

## Sorular ve Destek

- 📖 [Dokümantasyon](README.md)
- 🐛 [Issues](https://github.com/furkanczay/better-payment/issues)
- 💬 [Discussions](https://github.com/furkanczay/better-payment/discussions)

## Lisans

Katkıda bulunarak, değişikliklerinizin MIT Lisansı altında lisanslanmasını kabul etmiş olursunuz.

---

Tekrar teşekkürler! Katkılarınız Better Pay'i daha iyi hale getiriyor. ❤️
