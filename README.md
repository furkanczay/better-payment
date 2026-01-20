# Better Payment

[![npm version](https://badge.fury.io/js/better-payment.svg)](https://badge.fury.io/js/better-payment)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Türkiye'deki tüm ödeme altyapılarını entegre edebilen unified payment gateway kütüphanesi.

## Özellikler

- 🚀 **TypeScript ile Yazılmış** - Tam tip güvenliği ve IntelliSense desteği
- 🔌 **Framework Agnostic** - Node.js, Next.js, Express ve diğer tüm JavaScript framework'leri ile uyumlu
- 🏦 **Çoklu Provider Desteği** - Birden fazla ödeme sağlayıcısını aynı API ile yönetin
- 🎯 **Tutarlı API** - Tüm provider'lar için aynı interface
- 🔄 **Abonelik Desteği** - İyzico ile tekrarlayan ödemeler (subscription)
- 📦 **Hafif** - Minimal bağımlılık (sadece axios)
- 🛡️ **Güvenli** - API key ve secret key şifreleme

## Desteklenen Ödeme Sağlayıcıları

- ✅ **İyzico** - Tam destek (V2 Authorization, Checkout Form, Subscription, Installment Inquiry)
- ✅ **PayTR** - Tam destek
- ✅ **Parampos** - Tam destek (SOAP API, 3D Secure, Taksit, İade/İptal)

## Kurulum

**Gereksinimler:** Node.js 20 veya üzeri

```bash
npm install better-payment
# veya
yarn add better-payment
# veya
pnpm add better-payment
```

## Hızlı Başlangıç

### 🎯 Önerilen Yöntem: Config-Based

```typescript
import { BetterPay, ProviderType, Currency, BasketItemType } from 'better-payment';

// 1. Config dosyası oluşturun
const paymentConfig = {
  providers: {
    iyzico: {
      enabled: true,
      config: {
        apiKey: process.env.IYZICO_API_KEY!,
        secretKey: process.env.IYZICO_SECRET_KEY!,
        baseUrl: 'https://sandbox-api.iyzipay.com',
      },
    },
    paytr: {
      enabled: false, // İsteğe bağlı - Kullanmak için true yapın
      config: {
        apiKey: process.env.PAYTR_MERCHANT_KEY!,
        secretKey: process.env.PAYTR_SECRET_KEY!,
        merchantId: process.env.PAYTR_MERCHANT_ID!,
        merchantSalt: process.env.PAYTR_MERCHANT_SALT!,
        baseUrl: 'https://www.paytr.com',
      },
    },
    parampos: {
      enabled: false, // İsteğe bağlı - Kullanmak için true yapın
      config: {
        clientCode: process.env.PARAMPOS_CLIENT_CODE!,
        clientUsername: process.env.PARAMPOS_CLIENT_USERNAME!,
        clientPassword: process.env.PARAMPOS_CLIENT_PASSWORD!,
        guid: process.env.PARAMPOS_GUID!,
        apiKey: process.env.PARAMPOS_GUID!,
        secretKey: process.env.PARAMPOS_CLIENT_PASSWORD!,
        baseUrl: 'https://testposws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx',
        testMode: true,
      },
    },
  },
  defaultProvider: ProviderType.IYZICO,
};

// 2. BetterPay'i başlatın
const betterPay = new BetterPay(paymentConfig);

// 3. Ödeme yapın - Farklı Kullanım Şekilleri:

// Yöntem 1: Provider'a doğrudan erişim (Önerilen)
const result = await betterPay.iyzico.createPayment({
  price: '100.00',
  paidPrice: '100.00',
  currency: Currency.TRY,
  basketId: 'B67832',
  paymentCard: {
    cardHolderName: 'John Doe',
    cardNumber: '5528790000000008',
    expireMonth: '12',
    expireYear: '2030',
    cvc: '123',
  },
  buyer: {
    id: 'BY789',
    name: 'John',
    surname: 'Doe',
    email: 'email@email.com',
    identityNumber: '11111111110',
    registrationAddress: 'Address',
    city: 'Istanbul',
    country: 'Turkey',
    ip: '85.34.78.112',
  },
  shippingAddress: {
    contactName: 'John Doe',
    city: 'Istanbul',
    country: 'Turkey',
    address: 'Address',
  },
  billingAddress: {
    contactName: 'John Doe',
    city: 'Istanbul',
    country: 'Turkey',
    address: 'Address',
  },
  basketItems: [
    {
      id: 'BI101',
      name: 'Product 1',
      category1: 'Category',
      itemType: BasketItemType.PHYSICAL,
      price: '100.00',
    },
  ],
});

if (result.status === 'success') {
  console.log('Ödeme başarılı:', result.paymentId);
} else {
  console.error('Ödeme hatası:', result.errorMessage);
}

// Yöntem 2: Default provider kullanarak (defaultProvider ayarlanmışsa)
const result2 = await betterPay.createPayment({ ... });

// Yöntem 3: use() metodu ile provider seçerek
const result3 = await betterPay.use(ProviderType.PAYTR).createPayment({ ... });

// Yöntem 4: PayTR'a doğrudan erişim
const result4 = await betterPay.paytr.createPayment({ ... });
```

### 📦 Alternatif: Direct Provider Kullanımı

```typescript
import { Iyzico } from 'better-payment';

const iyzico = new Iyzico({
  apiKey: process.env.IYZICO_API_KEY!,
  secretKey: process.env.IYZICO_SECRET_KEY!,
  baseUrl: 'https://sandbox-api.iyzipay.com',
});

const result = await iyzico.createPayment({ ... });
```

**Not:** Config-based (BetterPay) yaklaşımın avantajları:

- ✅ Birden fazla provider'ı tek yerden yönetebilirsiniz
- ✅ Provider'lar arası kolayca geçiş yapabilirsiniz (`betterPay.iyzico` / `betterPay.paytr`)
- ✅ Ortam değişkenlerine göre provider değiştirebilirsiniz
- ✅ Default provider ile basit kullanım: `betterPay.createPayment()`
- ✅ Daha temiz ve maintainable kod

### 3D Secure Ödeme

```typescript
// 3D Secure işlemini başlat
const threeDSResult = await betterPay.iyzico.initThreeDSPayment({
  // Aynı parametreler + callbackUrl
  callbackUrl: 'https://your-site.com/payment/callback',
  price: '100.00',
  paidPrice: '100.00',
  currency: Currency.TRY,
  // ... diğer parametreler
});

if (threeDSResult.status === 'success' && threeDSResult.threeDSHtmlContent) {
  // HTML içeriğini kullanıcıya göster
  // Bu, banka 3D Secure sayfasına yönlendirir
  return threeDSResult.threeDSHtmlContent;
}

// Callback'ten sonra ödemeyi tamamla
const finalResult = await betterPay.iyzico.completeThreeDSPayment(callbackData);
```

### Korumalı Havale/EFT (PWI - Payment With IBAN)

İyzico'nun korumalı havale sistemi ile kullanıcılarınız havale/EFT ile ödeme yapabilir. Havale yapıldığında ödeme onaylanır ve satıcıya aktarılır:

```typescript
import { BetterPay, Currency, BasketItemType } from 'better-payment';

// PWI Ödeme başlat
const pwiResult = await betterPay.iyzico.initPWIPayment({
  price: '100.00',
  paidPrice: '100.00',
  currency: Currency.TRY,
  basketId: 'B67832',
  callbackUrl: 'https://your-site.com/payment/callback',
  buyer: {
    id: 'BY789',
    name: 'John',
    surname: 'Doe',
    email: 'email@email.com',
    identityNumber: '11111111110',
    registrationAddress: 'Address',
    city: 'Istanbul',
    country: 'Turkey',
    ip: '85.34.78.112',
    gsmNumber: '+905350000000',
  },
  shippingAddress: {
    contactName: 'John Doe',
    city: 'Istanbul',
    country: 'Turkey',
    address: 'Address',
  },
  billingAddress: {
    contactName: 'John Doe',
    city: 'Istanbul',
    country: 'Turkey',
    address: 'Address',
  },
  basketItems: [
    {
      id: 'BI101',
      name: 'Product 1',
      category1: 'Category',
      itemType: BasketItemType.PHYSICAL,
      price: '100.00',
    },
  ],
});

if (pwiResult.status === 'success') {
  // Option 1: HTML içeriğini göster (IBAN ve havale bilgileri)
  document.getElementById('payment-info').innerHTML = pwiResult.htmlContent;

  // Option 2: İyzico ödeme sayfasına yönlendir
  window.location.href = pwiResult.paymentPageUrl;

  // Token'ı sakla (ödeme durumu sorgulamak için)
  const token = pwiResult.token;
}

// PWI Ödeme durumunu sorgula
const paymentStatus = await betterPay.iyzico.retrievePWIPayment(token);

if (paymentStatus.status === 'success') {
  if (paymentStatus.paymentStatus === 'SUCCESS') {
    console.log('Havale başarıyla alındı:', paymentStatus.paymentId);
    console.log('Ödenen tutar:', paymentStatus.paidPrice);
  } else if (paymentStatus.paymentStatus === 'WAITING') {
    console.log('Havale bekleniyor');
    console.log('IBAN:', paymentStatus.iban);
    console.log('Banka:', paymentStatus.bankName);
  }
}
```

### Checkout Form (Ödeme Formu)

İyzico'nun hazır ödeme formunu kullanarak, kart bilgilerini kendi sunucunuzda tutmadan ödeme alabilirsiniz:

```typescript
import { BetterPay, Currency, BasketItemType } from 'better-payment';

// Checkout Form başlat
const checkoutResult = await betterPay.iyzico.initCheckoutForm({
  price: '100.00',
  paidPrice: '100.00',
  currency: Currency.TRY,
  basketId: 'B67832',
  callbackUrl: 'https://your-site.com/payment/callback',
  enabledInstallments: [1, 2, 3, 6, 9], // İsteğe bağlı - İzin verilen taksit sayıları
  buyer: {
    id: 'BY789',
    name: 'John',
    surname: 'Doe',
    email: 'email@email.com',
    identityNumber: '11111111110',
    registrationAddress: 'Address',
    city: 'Istanbul',
    country: 'Turkey',
    ip: '85.34.78.112',
  },
  shippingAddress: {
    contactName: 'John Doe',
    city: 'Istanbul',
    country: 'Turkey',
    address: 'Address',
  },
  billingAddress: {
    contactName: 'John Doe',
    city: 'Istanbul',
    country: 'Turkey',
    address: 'Address',
  },
  basketItems: [
    {
      id: 'BI101',
      name: 'Product 1',
      category1: 'Category',
      itemType: BasketItemType.PHYSICAL,
      price: '100.00',
    },
  ],
});

if (checkoutResult.status === 'success') {
  // Kullanıcıyı İyzico ödeme sayfasına yönlendir
  // Option 1: paymentPageUrl ile redirect
  window.location.href = checkoutResult.paymentPageUrl;

  // Option 2: checkoutFormContent (iframe HTML) göster
  // document.getElementById('payment-form').innerHTML = checkoutResult.checkoutFormContent;
}

// Callback'te token ile ödeme sonucunu sorgula
const paymentResult = await betterPay.iyzico.retrieveCheckoutForm(token);

if (paymentResult.status === 'success') {
  console.log('Ödeme başarılı:', paymentResult.paymentId);
  console.log('Ödenen tutar:', paymentResult.paidPrice);
  console.log('Taksit sayısı:', paymentResult.installment);
}
```

### Abonelik Yönetimi (İyzico Subscription)

İyzico'nun abonelik sistemi ile tekrarlayan ödemeler alabilirsiniz:

```typescript
import { BetterPay, PaymentInterval, SubscriptionStatus } from 'better-payment';

// 1. Abonelik ürünü oluştur
const product = await betterPay.iyzico.createSubscriptionProduct({
  name: 'Premium Üyelik',
  description: 'Aylık premium üyelik paketi',
  conversationId: 'product-001',
});

// 2. Fiyatlandırma planı oluştur
const plan = await betterPay.iyzico.createPricingPlan({
  productReferenceCode: product.data.referenceCode,
  name: 'Aylık Plan',
  price: 99.9,
  currency: 'TRY',
  paymentInterval: PaymentInterval.MONTHLY,
  paymentIntervalCount: 1,
  trialPeriodDays: 7, // 7 günlük deneme süresi (opsiyonel)
  recurrenceCount: 12, // 12 ay sonra otomatik iptal (opsiyonel)
  conversationId: 'plan-001',
});

// 3. Aboneliği başlat
const subscription = await betterPay.iyzico.initializeSubscription({
  pricingPlanReferenceCode: plan.data.referenceCode,
  subscriptionInitialStatus: SubscriptionStatus.ACTIVE,
  customer: {
    name: 'John',
    surname: 'Doe',
    email: 'john.doe@example.com',
    gsmNumber: '+905350000000',
    identityNumber: '11111111111',
    billingAddress: {
      contactName: 'John Doe',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Nidakule Göztepe, Merdivenköy Mah.',
      zipCode: '34732',
    },
  },
  paymentCard: {
    cardHolderName: 'John Doe',
    cardNumber: '5528790000000008',
    expireMonth: '12',
    expireYear: '2030',
    cvc: '123',
  },
  conversationId: 'subscription-001',
});

if (subscription.status === 'success') {
  console.log('Abonelik başlatıldı:', subscription.data.referenceCode);
  console.log('Durum:', subscription.data.subscriptionStatus);
}

// 4. Abonelik detaylarını sorgula
const details = await betterPay.iyzico.retrieveSubscription({
  subscriptionReferenceCode: subscription.data.referenceCode,
});

// 5. Aboneliği yükselt (farklı plana geç)
const upgrade = await betterPay.iyzico.upgradeSubscription({
  subscriptionReferenceCode: subscription.data.referenceCode,
  newPricingPlanReferenceCode: 'yeni-plan-ref-code',
  useTrial: false,
  resetRecurrenceCount: false,
});

// 6. Kart güncelleme formu oluştur
const cardUpdate = await betterPay.iyzico.updateSubscriptionCard({
  subscriptionReferenceCode: subscription.data.referenceCode,
  callbackUrl: 'https://your-site.com/subscription/card-update/callback',
  conversationId: 'card-update-001',
});

if (cardUpdate.status === 'success') {
  // Kullanıcıyı kart güncelleme sayfasına yönlendir
  window.location.href = cardUpdate.paymentPageUrl;
}

// 7. Aboneliği iptal et
const cancel = await betterPay.iyzico.cancelSubscription({
  subscriptionReferenceCode: subscription.data.referenceCode,
});
```

**Ödeme Aralıkları (PaymentInterval):**

- `PaymentInterval.DAILY` - Günlük
- `PaymentInterval.WEEKLY` - Haftalık
- `PaymentInterval.MONTHLY` - Aylık
- `PaymentInterval.YEARLY` - Yıllık

**Abonelik Durumları (SubscriptionStatus):**

- `SubscriptionStatus.ACTIVE` - Aktif
- `SubscriptionStatus.PENDING` - Beklemede
- `SubscriptionStatus.CANCELED` - İptal Edildi
- `SubscriptionStatus.EXPIRED` - Süresi Doldu
- `SubscriptionStatus.UNPAID` - Ödenmedi

### Taksit Sorgulama

Kullanıcının kartına ait BIN numarasına göre kullanılabilir taksit seçeneklerini sorgulayabilirsiniz:

```typescript
import { BetterPay } from 'better-payment';

// Kart BIN numarası ile taksit seçeneklerini sorgula
const installmentResult = await betterPay.iyzico.installmentInfo({
  binNumber: '552879', // Kart numarasının ilk 6-8 hanesi
  price: '100.00',
  conversationId: 'optional-conversation-id',
});

if (installmentResult.status === 'success' && installmentResult.installmentDetails) {
  installmentResult.installmentDetails.forEach((detail) => {
    console.log(`Banka: ${detail.bankName}`);
    console.log(`Kart Ailesi: ${detail.cardFamilyName}`);
    console.log(`Kart Tipi: ${detail.cardType}`);
    console.log(`Kart Kuruluşu: ${detail.cardAssociation}`);

    // Taksit seçenekleri
    detail.installmentPrices.forEach((installment) => {
      if (installment.installmentNumber === 1) {
        console.log(`Tek Çekim: ${installment.totalPrice} TL`);
      } else {
        console.log(
          `${installment.installmentNumber} Taksit: ${installment.totalPrice} TL ` +
          `(Aylık: ${installment.installmentPrice} TL)`
        );
      }
    });
  });
}
```

**Taksit Bilgileri:**
- `binNumber` - Kart BIN numarası
- `bankName` - Banka adı
- `cardFamilyName` - Kart ailesi (Bonus, Maximum, Axess, World, vb.)
- `cardType` - Kart tipi (CREDIT_CARD, DEBIT_CARD)
- `cardAssociation` - Kart kuruluşu (VISA, MASTER_CARD, TROY, AMEX)
- `commercial` - Ticari kart mı (0: hayır, 1: evet)
- `force3ds` - 3DS zorunlu mu (0: hayır, 1: evet)
- `installmentPrices` - Taksit seçenekleri listesi

**Kullanım Senaryoları:**
- E-Ticaret checkout sayfasında kullanıcıya taksit seçeneklerini gösterme
- Farklı kartlar için taksit oranlarını karşılaştırma
- Kart girişi sırasında gerçek zamanlı taksit bilgisi gösterme

### Diğer İşlemler

```typescript
// Ödeme sorgulama
const payment = await betterPay.iyzico.getPayment('payment-id');

// İade
const refund = await betterPay.iyzico.refund({
  paymentId: 'payment-id',
  price: '50.00',
  currency: Currency.TRY,
  ip: '85.34.78.112',
});

// İptal
const cancel = await betterPay.iyzico.cancel({
  paymentId: 'payment-id',
  ip: '85.34.78.112',
});

// Default provider kullanarak (defaultProvider ayarlanmışsa)
const payment2 = await betterPay.getPayment('payment-id');
const refund2 = await betterPay.refund({ ... });
const cancel2 = await betterPay.cancel({ ... });
```

## Parampos Kullanımı

Parampos, Türkiye'de 22 banka ve 9 kart markası ile çalışan SOAP tabanlı bir ödeme altyapısıdır.

### Parampos Konfigürasyonu

```typescript
import { BetterPay, ProviderType } from 'better-payment';

const betterPay = new BetterPay({
  providers: {
    parampos: {
      enabled: true,
      config: {
        clientCode: process.env.PARAMPOS_CLIENT_CODE!,
        clientUsername: process.env.PARAMPOS_CLIENT_USERNAME!,
        clientPassword: process.env.PARAMPOS_CLIENT_PASSWORD!,
        guid: process.env.PARAMPOS_GUID!,
        apiKey: process.env.PARAMPOS_GUID!,
        secretKey: process.env.PARAMPOS_CLIENT_PASSWORD!,
        baseUrl: 'https://testposws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx',
        testMode: true,
      },
    },
  },
  defaultProvider: ProviderType.PARAMPOS,
});
```

**Önemli Not:** Parampos kullanmadan önce sunucunuzun statik IP adresini integration@param.com.tr adresine göndererek beyaz listeye eklettirmeniz gerekmektedir.

### Parampos ile Direkt Ödeme

```typescript
const result = await betterPay.parampos.createPayment({
  price: '100.00',
  paidPrice: '100.00',
  currency: Currency.TRY,
  basketId: 'BASKET123',
  paymentCard: {
    cardHolderName: 'John Doe',
    cardNumber: '5528790000000008',
    expireMonth: '12',
    expireYear: '2030',
    cvc: '123',
  },
  buyer: {
    id: 'BUYER123',
    name: 'John',
    surname: 'Doe',
    email: 'email@email.com',
    identityNumber: '12345678901',
    registrationAddress: 'Address',
    city: 'Istanbul',
    country: 'Turkey',
    ip: '85.34.78.112',
    gsmNumber: '+905301234567',
  },
  shippingAddress: {
    contactName: 'John Doe',
    city: 'Istanbul',
    country: 'Turkey',
    address: 'Address',
  },
  billingAddress: {
    contactName: 'John Doe',
    city: 'Istanbul',
    country: 'Turkey',
    address: 'Address',
  },
  basketItems: [
    {
      id: 'ITEM1',
      name: 'Product',
      category1: 'Electronics',
      itemType: BasketItemType.PHYSICAL,
      price: '100.00',
    },
  ],
});

if (result.status === 'success') {
  console.log('Ödeme başarılı:', result.paymentId);
}
```

### Parampos ile 3D Secure Ödeme

```typescript
// 1. 3D Secure işlemini başlat
const threeDSResult = await betterPay.parampos.initThreeDSPayment({
  // Yukarıdaki parametreler + aşağıdakiler
  callbackUrl: 'https://your-domain.com/payment/callback',
  installment: 1, // Taksit sayısı (1 = tek çekim)
  price: '100.00',
  paidPrice: '100.00',
  currency: Currency.TRY,
  // ... diğer parametreler
});

if (threeDSResult.status === 'pending' && threeDSResult.threeDSHtmlContent) {
  // Base64 HTML içeriğini decode et ve kullanıcıya göster
  const htmlContent = Buffer.from(
    threeDSResult.threeDSHtmlContent,
    'base64'
  ).toString('utf-8');

  // HTML içeriğini sayfada göster (banka 3DS sayfasına yönlendirir)
  document.getElementById('payment-form').innerHTML = htmlContent;
}

// 2. Banka callback'inden sonra ödemeyi tamamla
// Callback handler'ınızda:
const completeResult = await betterPay.parampos.completeThreeDSPayment({
  islemGUID: callbackData.islemGUID,
  md: callbackData.md,
  mdStatus: callbackData.mdStatus,
  orderId: callbackData.orderId,
  GUID: callbackData.GUID,
  hash: callbackData.hash,
});

if (completeResult.status === 'success') {
  console.log('3D Secure ödeme başarılı:', completeResult.paymentId);
}
```

### Parampos ile Taksitli Ödeme

```typescript
const installmentResult = await betterPay.parampos.initThreeDSPayment({
  price: '1000.00',
  paidPrice: '1060.00', // Taksit komisyonu dahil toplam tutar
  currency: Currency.TRY,
  basketId: 'BASKET123',
  callbackUrl: 'https://your-domain.com/callback',
  installment: 6, // 6 taksit
  // ... diğer parametreler
});

// Taksit komisyon hesaplama (otomatik)
// 2 taksit: %2, 3 taksit: %3, ... 12 taksit: %12
```

### Parampos İşlemleri

```typescript
// İade
const refund = await betterPay.parampos.refund({
  paymentId: 'payment-guid',
  price: '50.00', // Kısmi iade
  currency: Currency.TRY,
  ip: '85.34.78.112',
});

// İptal (Void)
const cancel = await betterPay.parampos.cancel({
  paymentId: 'payment-guid',
  ip: '85.34.78.112',
});

// Ödeme Sorgulama
const payment = await betterPay.parampos.getPayment('payment-guid');

// BIN Sorgulama (Kart Bilgisi)
const binInfo = await betterPay.parampos.binCheck('552879');
if (binInfo.cardType) {
  console.log('Kart Tipi:', binInfo.cardType); // CREDIT, DEBIT
  console.log('Banka:', binInfo.bankName);
  console.log('Kart Ailesi:', binInfo.cardFamily); // VISA, MASTERCARD
  console.log('Ticari Kart:', binInfo.commercial);
}
```

### Parampos API Özellikleri

**Hash Algoritmaları:**
- Ödeme İstekleri: SHA256 → Base64
- 3DS Callback Doğrulama: SHA1 → Base64

**Desteklenen İşlemler:**
- ✅ Direkt ödeme (3D Secure olmadan)
- ✅ 3D Secure ödeme (başlatma ve tamamlama)
- ✅ Taksitli ödemeler (otomatik komisyon hesaplama)
- ✅ İade işlemi (tam/kısmi)
- ✅ İptal işlemi (void)
- ✅ Ödeme sorgulama
- ✅ BIN sorgulama (kart bilgisi)

**Para Birimleri:**
- TRY (Türk Lirası)
- USD (Amerikan Doları)
- EUR (Euro)
- GBP (İngiliz Sterlini)

**Test Ortamı:**
- Test URL: `https://testposws.param.com.tr/turkpos.ws/service_turkpos_prod.asmx`
- IP Kaydı: integration@param.com.tr

**Production Ortamı:**
- Production URL: ParamPOS panelinden alınır
- IP Kaydı: ParamPOS > Entegrasyon Bilgilerim panelinden yapılır

## TypeScript Desteği

Better Pay, tam TypeScript desteği sunar:

```typescript
import type { PaymentRequest, PaymentResponse } from 'better-payment';

const request: PaymentRequest = {
  // TypeScript otomatik olarak tüm gerekli alanları gösterir
  price: '100.00',
  // ...
};

const result: PaymentResponse = await provider.createPayment(request);

if (result.status === 'success') {
  // TypeScript bilir ki result.paymentId var
  console.log(result.paymentId);
}
```

## Framework Örnekleri

### Next.js (App Router)

```typescript
// app/api/payment/route.ts
import { BetterPay, ProviderType } from 'better-payment';
import { NextRequest, NextResponse } from 'next/server';

const betterPay = new BetterPay({
  providers: {
    iyzico: {
      enabled: true,
      config: {
        apiKey: process.env.IYZICO_API_KEY!,
        secretKey: process.env.IYZICO_SECRET_KEY!,
        baseUrl: process.env.IYZICO_BASE_URL!,
      },
    },
  },
  defaultProvider: ProviderType.IYZICO,
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Yöntem 1: Provider'a doğrudan erişim
  const result = await betterPay.iyzico.createPayment(body);

  // Yöntem 2: Default provider kullanarak
  // const result = await betterPay.createPayment(body);

  return NextResponse.json(result);
}
```

### Express.js

```typescript
import express from 'express';
import { BetterPay, ProviderType } from 'better-payment';

const app = express();

const betterPay = new BetterPay({
  providers: {
    iyzico: {
      enabled: true,
      config: {
        apiKey: process.env.IYZICO_API_KEY!,
        secretKey: process.env.IYZICO_SECRET_KEY!,
        baseUrl: process.env.IYZICO_BASE_URL!,
      },
    },
  },
  defaultProvider: ProviderType.IYZICO,
});

app.post('/payment', async (req, res) => {
  // Provider'a doğrudan erişim
  const result = await betterPay.iyzico.createPayment(req.body);
  res.json(result);
});
```

## API Dokümantasyonu

Detaylı API dokümantasyonu için: [Dokümantasyon Sitesi]

### Temel Metodlar

Tüm provider'lar aşağıdaki metodları uygular:

- `createPayment(request)` - Direkt ödeme oluştur
- `initThreeDSPayment(request)` - 3D Secure ödeme başlat
- `completeThreeDSPayment(callbackData)` - 3D Secure ödeme tamamla
- `refund(request)` - İade işlemi
- `cancel(request)` - İptal işlemi
- `getPayment(paymentId)` - Ödeme sorgulama
- `binCheck(binNumber)` - BIN sorgulama (provider desteğine bağlı)

### İyzico Özel Metodlar

İyzico provider'ı aşağıdaki ek metodları sunar:

**PWI (Payment With IBAN - Korumalı Havale/EFT):**

- `initPWIPayment(request)` - Korumalı havale/EFT ödeme başlat
- `retrievePWIPayment(token, conversationId?)` - PWI ödeme durumunu sorgula

**Checkout Form:**

- `initCheckoutForm(request)` - Checkout form başlat (kart bilgileri toplamadan ödeme)
- `retrieveCheckoutForm(token)` - Checkout form sonucunu sorgula

**Abonelik (Subscription):**

- `createSubscriptionProduct(request)` - Abonelik ürünü oluştur
- `createPricingPlan(request)` - Fiyatlandırma planı oluştur
- `initializeSubscription(request)` - Abonelik başlat
- `retrieveSubscription(request)` - Abonelik detaylarını sorgula
- `upgradeSubscription(request)` - Aboneliği farklı plana yükselt
- `updateSubscriptionCard(request)` - Abonelik kartını güncelle
- `cancelSubscription(request)` - Aboneliği iptal et

**BIN Sorgulama:**

- `binCheck(binNumber)` - Kart BIN numarası sorgulama

**Taksit Sorgulama:**

- `installmentInfo(request)` - Kart BIN numarası ve tutara göre taksit seçeneklerini sorgula

### Tipler ve Enum'lar

```typescript
enum PaymentStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

enum Currency {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
}

enum BasketItemType {
  PHYSICAL = 'PHYSICAL',
  VIRTUAL = 'VIRTUAL',
}

enum PaymentInterval {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
  UNPAID = 'UNPAID',
}
```

## Test

```bash
# Testleri çalıştır
pnpm test

# Test UI ile çalıştır
pnpm test:ui

# Build
pnpm build
```

## Katkıda Bulunma

Better Pay açık kaynak bir projedir. Katkılarınızı bekliyoruz!

1. Repository'yi fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'i push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

### Sürüm Yönetimi ve Release Süreci

Bu proje [Release Please](https://github.com/googleapis/release-please) kullanarak otomatik sürüm yönetimi yapar. Her commit [Conventional Commits](https://www.conventionalcommits.org/) standardına uygun olmalıdır.

#### Commit Mesajı Formatı

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Commit Tipleri:**

- `feat:` - Yeni özellik (minor sürüm artışı: 1.1.0 → 1.2.0)
- `fix:` - Bug düzeltmesi (patch sürüm artışı: 1.1.0 → 1.1.1)
- `docs:` - Dokümantasyon değişikliği
- `style:` - Kod formatı değişikliği
- `refactor:` - Kod iyileştirmesi
- `test:` - Test ekleme/güncelleme
- `chore:` - Genel bakım işlemleri
- `BREAKING CHANGE:` - Geriye dönük uyumsuz değişiklik (major sürüm artışı: 1.1.0 → 2.0.0)

**Örnekler:**

```bash
git commit -m "feat: Add webhook support for payment notifications"
git commit -m "fix: Resolve 3DS callback parsing issue"
git commit -m "feat(iyzico): Add installment calculation method"
git commit -m "feat!: Change payment API interface" # Breaking change
```

#### Prerelease (Beta/Alpha) Sürüm Yayınlama

Beta veya alpha gibi prerelease sürümleri yayınlamak için:

**1. Prerelease Branch Oluşturun**

```bash
# Beta sürüm için
git checkout -b release-please--branches--main--prerelease-type--beta

# Alpha sürüm için
git checkout -b release-please--branches--main--prerelease-type--alpha

# RC (Release Candidate) için
git checkout -b release-please--branches--main--prerelease-type--rc
```

**2. Değişikliklerinizi Yapın ve Commit Edin**

```bash
git commit -m "feat: Add new experimental payment method"
git push origin release-please--branches--main--prerelease-type--beta
```

**3. Release Please Otomatik PR Oluşturur**

Release Please, branch'i algılayıp otomatik olarak bir prerelease PR oluşturur:

- Beta branch için: `1.2.0` → `1.2.0-beta.1`
- Her yeni commit: `1.2.0-beta.1` → `1.2.0-beta.2`

**4. PR'ı Merge Ederek Prerelease Yayınlayın**

PR'ı merge ettiğinizde:

- Git tag oluşturulur (örn: `v1.2.0-beta.1`)
- NPM'e beta tag ile yayınlanır
- Kullanıcılar şu şekilde kurabilir:

```bash
npm install better-payment@beta
# veya spesifik versiyon
npm install better-payment@1.2.0-beta.1
```

**5. Stable Sürüme Geçiş**

Beta testleri tamamlandıktan sonra:

```bash
# Beta branch'i main'e merge edin
git checkout main
git merge release-please--branches--main--prerelease-type--beta
git push origin main

# Beta branch'i silin
git push origin --delete release-please--branches--main--prerelease-type--beta
```

Release Please bir sonraki main PR'ında beta label'ını kaldırıp stable sürüm (örn: `1.2.0`) oluşturur.

#### NPM Tag'leri

- `latest` - Stable sürümler (varsayılan: `npm install better-payment`)
- `beta` - Beta sürümler (`npm install better-payment@beta`)
- `alpha` - Alpha sürümler (`npm install better-payment@alpha`)
- `rc` - Release candidate sürümler (`npm install better-payment@rc`)

#### Release Workflow

Normal geliştirme akışı:

```
main branch → feat/fix commits → Release Please PR → merge → stable release (1.2.0)
```

Prerelease akışı:

```
beta branch → feat commits → Release Please PR → merge → beta release (1.2.0-beta.1)
              → more commits → auto update PR → merge → beta release (1.2.0-beta.2)
              → merge to main → Release Please PR → merge → stable release (1.2.0)
```

### Yeni Provider Ekleme

Yeni bir provider eklemek için:

1. `src/providers/[provider-name]/` klasörü oluşturun
2. `PaymentProvider` abstract sınıfını extend edin
3. Tüm metodları implement edin
4. Testler yazın
5. Dokümantasyon ekleyin

## Lisans

MIT

## Destek

- 📖 [Dokümantasyon]
- 🐛 [Issues](https://github.com/furkanczay/better-payment/issues)
- 💬 [Discussions](https://github.com/furkanczay/better-payment/discussions)
- [Discord](https://discord.gg/SkundF4FFU)

## Roadmap

### Ödeme Altyapıları

- [x] İyzico
  - [x] Non3D Ödeme
  - [x] 3D Secure Ödeme
  - [x] Checkout Form
  - [x] PWI (Korumalı Havale/EFT)
  - [x] Abonelik (Subscription) Desteği
  - [x] İade ve İptal
  - [x] Ödeme Sorgulama
  - [x] TypeScript Desteği
  - [x] BIN Check
  - [x] Taksit Sorgulama
- [x] PayTR entegrasyonu
  - [x] Non3D Ödeme
  - [x] 3D Secure Ödeme
  - [x] TypeScript Desteği
  - [ ] BIN Check
- [x] Parampos
  - [x] Non3D Ödeme
  - [x] 3D Secure Ödeme
  - [x] Taksitli Ödemeler
  - [x] İade ve İptal
  - [x] Ödeme Sorgulama
  - [x] BIN Check
  - [x] TypeScript Desteği
  - [x] SOAP API Entegrasyonu

### Banka Sanal POS'ları

- [ ] Akbank Sanal POS
  - [ ] Non3D Ödeme
  - [ ] 3D Secure Ödeme
  - [ ] İade ve İptal
  - [ ] TypeScript Desteği
- [ ] Garanti BBVA Sanal POS
  - [ ] Non3D Ödeme
  - [ ] 3D Secure Ödeme
  - [ ] İade ve İptal
  - [ ] TypeScript Desteği
- [ ] İş Bankası Sanal POS
  - [ ] Non3D Ödeme
  - [ ] 3D Secure Ödeme
  - [ ] İade ve İptal
  - [ ] TypeScript Desteği
- [ ] Yapı Kredi Sanal POS (POSNET)
  - [ ] Non3D Ödeme
  - [ ] 3D Secure Ödeme
  - [ ] İade ve İptal
  - [ ] TypeScript Desteği
- [ ] Ziraat Bankası Sanal POS
  - [ ] Non3D Ödeme
  - [ ] 3D Secure Ödeme
  - [ ] İade ve İptal
  - [ ] TypeScript Desteği
- [ ] Vakıfbank Sanal POS
  - [ ] Non3D Ödeme
  - [ ] 3D Secure Ödeme
  - [ ] İade ve İptal
  - [ ] TypeScript Desteği
- [ ] Halkbank Sanal POS
  - [ ] Non3D Ödeme
  - [ ] 3D Secure Ödeme
  - [ ] İade ve İptal
  - [ ] TypeScript Desteği
- [ ] QNB Finansbank Sanal POS
  - [ ] Non3D Ödeme
  - [ ] 3D Secure Ödeme
  - [ ] İade ve İptal
  - [ ] TypeScript Desteği
- [ ] Denizbank Sanal POS
  - [ ] Non3D Ödeme
  - [ ] 3D Secure Ödeme
  - [ ] İade ve İptal
  - [ ] TypeScript Desteği
- [ ] TEB Sanal POS
  - [ ] Non3D Ödeme
  - [ ] 3D Secure Ödeme
  - [ ] İade ve İptal
  - [ ] TypeScript Desteği

---

Made with ❤️ for Turkish developers
