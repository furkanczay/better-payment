/**
 * PWI (Payment With IBAN - Korumalı Havale/EFT) Ödeme Örneği
 *
 * Bu örnek, İyzico'nun korumalı havale sistemi ile nasıl ödeme alınacağını gösterir.
 * Kullanıcılar havale/EFT ile ödeme yapar ve ödeme onaylandığında satıcıya aktarılır.
 */

import { BetterPay, ProviderType, Currency, BasketItemType, PWIPaymentStatus } from 'better-payment';

// 1. BetterPay'i yapılandır
const betterPay = new BetterPay({
  providers: {
    iyzico: {
      enabled: true,
      config: {
        apiKey: process.env.IYZICO_API_KEY!,
        secretKey: process.env.IYZICO_SECRET_KEY!,
        baseUrl: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
      },
    },
  },
  defaultProvider: ProviderType.IYZICO,
});

// 2. PWI Ödeme başlatma fonksiyonu
async function initializePWIPayment() {
  try {
    const result = await betterPay.iyzico.initPWIPayment({
      price: '100.00',
      paidPrice: '100.00',
      currency: Currency.TRY,
      basketId: 'B67832',
      callbackUrl: 'https://your-site.com/payment/callback',
      buyer: {
        id: 'BY789',
        name: 'John',
        surname: 'Doe',
        email: 'john.doe@example.com',
        identityNumber: '11111111110',
        registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah.',
        city: 'Istanbul',
        country: 'Turkey',
        ip: '85.34.78.112',
        gsmNumber: '+905350000000',
      },
      shippingAddress: {
        contactName: 'John Doe',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah.',
        zipCode: '34732',
      },
      billingAddress: {
        contactName: 'John Doe',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Nidakule Göztepe, Merdivenköy Mah.',
        zipCode: '34732',
      },
      basketItems: [
        {
          id: 'BI101',
          name: 'Premium Üyelik',
          category1: 'Membership',
          itemType: BasketItemType.VIRTUAL,
          price: '100.00',
        },
      ],
      conversationId: 'pwi-payment-001',
    });

    if (result.status === 'success') {
      console.log('PWI Ödeme başarıyla başlatıldı!');
      console.log('Token:', result.token);
      console.log('Token geçerlilik süresi:', new Date(result.tokenExpireTime!));

      // Option 1: HTML içeriğini kullanıcıya göster
      // Bu içerik IBAN numarası ve havale bilgilerini içerir
      console.log('\nHTML İçeriği (IBAN bilgileri):');
      console.log(result.htmlContent);

      // Option 2: Kullanıcıyı İyzico ödeme sayfasına yönlendir
      console.log('\nÖdeme Sayfası URL:');
      console.log(result.paymentPageUrl);

      // Token'ı veritabanına kaydet (ödeme durumu sorgulamak için)
      await saveTokenToDatabase(result.token!, result.conversationId!);

      return result.token;
    } else {
      console.error('PWI Ödeme başlatma hatası:', result.errorMessage);
      return null;
    }
  } catch (error) {
    console.error('PWI Ödeme hatası:', error);
    return null;
  }
}

// 3. PWI Ödeme durumu sorgulama fonksiyonu
async function checkPWIPaymentStatus(token: string) {
  try {
    const result = await betterPay.iyzico.retrievePWIPayment(token);

    if (result.status === 'success') {
      console.log('\nÖdeme Durumu:', result.paymentStatus);

      if (result.paymentStatus === PWIPaymentStatus.WAITING) {
        // Havale bekleniyor
        console.log('\n📋 Havale Bilgileri:');
        console.log('IBAN:', result.iban);
        console.log('Banka:', result.bankName);
        console.log('Tutar:', result.paidPrice, result.currency);
        console.log('Alıcı:', result.buyerName, result.buyerSurname);
        console.log('\n⏳ Havale yapılmasını bekliyoruz...');
      } else if (result.paymentStatus === PWIPaymentStatus.SUCCESS) {
        // Havale başarılı
        console.log('\n✅ Ödeme Başarılı!');
        console.log('Ödeme ID:', result.paymentId);
        console.log('Ödenen Tutar:', result.paidPrice, result.currency);
        console.log('Komisyon:', result.merchantCommissionRateAmount);

        // Siparişi tamamla, ürünü aktifte et vb.
        await completeOrder(result.paymentId!);
      } else if (result.paymentStatus === PWIPaymentStatus.FAILURE) {
        // Havale başarısız/iptal edildi
        console.log('\n❌ Ödeme Başarısız');
        console.log('Hata:', result.errorMessage);

        // Siparişi iptal et
        await cancelOrder(token);
      }

      return result;
    } else {
      console.error('Ödeme durumu sorgulama hatası:', result.errorMessage);
      return null;
    }
  } catch (error) {
    console.error('Ödeme sorgulama hatası:', error);
    return null;
  }
}

// 4. Callback endpoint handler (Express örneği)
async function handlePWICallback(req: any, res: any) {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token gerekli' });
  }

  // Ödeme durumunu sorgula
  const paymentStatus = await checkPWIPaymentStatus(token);

  if (!paymentStatus) {
    return res.status(500).json({ error: 'Ödeme durumu sorgulanamadı' });
  }

  // Ödeme başarılıysa kullanıcıyı başarı sayfasına yönlendir
  if (paymentStatus.paymentStatus === PWIPaymentStatus.SUCCESS) {
    return res.redirect('/payment/success?paymentId=' + paymentStatus.paymentId);
  } else if (paymentStatus.paymentStatus === PWIPaymentStatus.WAITING) {
    return res.redirect('/payment/waiting?token=' + token);
  } else {
    return res.redirect('/payment/failed?error=' + paymentStatus.errorMessage);
  }
}

// 5. Periyodik ödeme durumu kontrolü (örnek: her 5 dakikada bir)
async function periodicPaymentCheck() {
  // Veritabanından bekleyen ödemeleri getir
  const pendingPayments = await getPendingPaymentsFromDatabase();

  for (const payment of pendingPayments) {
    const result = await checkPWIPaymentStatus(payment.token);

    if (result?.paymentStatus === PWIPaymentStatus.SUCCESS) {
      // Ödeme tamamlandı
      await completeOrder(result.paymentId!);
      await updatePaymentStatus(payment.token, 'completed');
    } else if (result?.paymentStatus === PWIPaymentStatus.FAILURE) {
      // Ödeme başarısız
      await cancelOrder(payment.token);
      await updatePaymentStatus(payment.token, 'failed');
    }
  }
}

// Yardımcı fonksiyonlar (örnek implementasyonlar)
async function saveTokenToDatabase(token: string, conversationId: string) {
  // Veritabanına kaydet
  console.log('Token veritabanına kaydedildi:', token);
}

async function getPendingPaymentsFromDatabase() {
  // Veritabanından bekleyen ödemeleri getir
  return [];
}

async function completeOrder(paymentId: string) {
  console.log('Sipariş tamamlandı:', paymentId);
}

async function cancelOrder(token: string) {
  console.log('Sipariş iptal edildi:', token);
}

async function updatePaymentStatus(token: string, status: string) {
  console.log('Ödeme durumu güncellendi:', token, status);
}

// Kullanım örneği
async function main() {
  console.log('🚀 PWI Ödeme Örneği\n');

  // PWI ödeme başlat
  const token = await initializePWIPayment();

  if (token) {
    console.log('\n---\n');

    // Ödeme durumunu hemen sorgula
    await checkPWIPaymentStatus(token);

    console.log('\n---\n');
    console.log('💡 İpucu: Kullanıcı havale yaptıktan sonra callback endpoint\'inize bildirim gelir.');
    console.log('💡 Ayrıca periyodik olarak ödeme durumunu sorgulayabilirsiniz.');
  }
}

// Örneği çalıştır (sadece doğrudan çalıştırıldığında)
if (require.main === module) {
  main().catch(console.error);
}

export {
  initializePWIPayment,
  checkPWIPaymentStatus,
  handlePWICallback,
  periodicPaymentCheck,
};
