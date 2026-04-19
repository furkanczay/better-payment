/**
 * Taksit Sorgulama Örneği
 *
 * Bu örnek, İyzico ile kart BIN numarasına göre taksit seçeneklerini
 * nasıl sorgulayacağınızı gösterir.
 */

import { BetterPay, ProviderType } from 'better-payment';

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

// 2. Basit taksit sorgulama
async function simpleInstallmentInquiry() {
  try {
    const result = await betterPay.iyzico.installmentInfo({
      binNumber: '552879', // Kart numarasının ilk 6 hanesi
      price: '100.00',
    });

    if (result.status === 'success' && result.installmentDetails) {
      console.log('✅ Taksit bilgileri başarıyla alındı!\n');

      // Her banka için taksit seçeneklerini göster
      result.installmentDetails.forEach((detail) => {
        console.log(`🏦 Banka: ${detail.bankName}`);
        console.log(`💳 Kart Ailesi: ${detail.cardFamilyName}`);
        console.log(`🔖 Kart Tipi: ${detail.cardType}`);
        console.log(`🏷️  Kart Kuruluşu: ${detail.cardAssociation}`);
        console.log(`🏢 Ticari Kart: ${detail.commercial === 1 ? 'Evet' : 'Hayır'}`);

        if (detail.force3ds === 1) {
          console.log('🔒 3D Secure Zorunlu');
        }

        console.log('\nTaksit Seçenekleri:');
        console.log('─'.repeat(60));

        detail.installmentPrices.forEach((installment) => {
          if (installment.installmentNumber === 1) {
            console.log(
              `✓ Tek Çekim: ${installment.totalPrice.toFixed(2)} TL`
            );
          } else {
            const totalWithInterest = installment.totalPrice;
            const monthlyPayment = installment.installmentPrice;
            const originalPrice = detail.price;
            const interest = totalWithInterest - originalPrice;
            const interestRate = ((interest / originalPrice) * 100).toFixed(2);

            console.log(
              `✓ ${installment.installmentNumber} Taksit: ${totalWithInterest.toFixed(
                2
              )} TL (Aylık: ${monthlyPayment.toFixed(2)} TL, Faiz: %${interestRate})`
            );
          }
        });

        console.log('\n' + '='.repeat(60) + '\n');
      });
    } else {
      console.error('❌ Taksit bilgileri alınamadı:', result.errorMessage);
    }
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

// 3. Birden fazla kart için taksit karşılaştırma
async function compareInstallmentOptions() {
  const cards = [
    { bin: '552879', name: 'Akbank Bonus' },
    { bin: '454360', name: 'Garanti BBVA' },
    { bin: '540668', name: 'İş Bankası Maximum' },
  ];

  const amount = '1000.00';

  console.log(`💰 ${amount} TL için taksit karşılaştırması\n`);

  for (const card of cards) {
    const result = await betterPay.iyzico.installmentInfo({
      binNumber: card.bin,
      price: amount,
    });

    if (result.status === 'success' && result.installmentDetails) {
      const detail = result.installmentDetails[0];

      console.log(`💳 ${card.name} (${card.bin})`);
      console.log(`   Banka: ${detail.bankName}`);

      // En yüksek taksit seçeneğini bul
      const maxInstallment = detail.installmentPrices.reduce((max, current) =>
        current.installmentNumber > max.installmentNumber ? current : max
      );

      console.log(
        `   Maksimum Taksit: ${maxInstallment.installmentNumber} ay`
      );

      // 6 taksit varsa göster
      const sixInstallment = detail.installmentPrices.find(
        (i) => i.installmentNumber === 6
      );
      if (sixInstallment) {
        console.log(
          `   6 Taksit: ${sixInstallment.totalPrice.toFixed(2)} TL (Aylık: ${sixInstallment.installmentPrice.toFixed(
            2
          )} TL)`
        );
      }

      console.log('');
    }
  }
}

// 4. E-Ticaret sitesi için taksit hesaplama
async function calculateInstallmentForCheckout(binNumber: string, cartTotal: string) {
  try {
    const result = await betterPay.iyzico.installmentInfo({
      binNumber,
      price: cartTotal,
      conversationId: `checkout-${Date.now()}`,
    });

    if (result.status === 'success' && result.installmentDetails) {
      // Müşteriye gösterilecek taksit seçeneklerini formatla
      const installmentOptions = result.installmentDetails.flatMap((detail) =>
        detail.installmentPrices.map((installment) => ({
          bankName: detail.bankName,
          cardFamily: detail.cardFamilyName,
          installmentNumber: installment.installmentNumber,
          monthlyPayment: installment.installmentPrice,
          totalPayment: installment.totalPrice,
          installmentText:
            installment.installmentNumber === 1
              ? 'Tek Çekim'
              : `${installment.installmentNumber} Taksit`,
          displayText:
            installment.installmentNumber === 1
              ? `Tek Çekim - ${installment.totalPrice.toFixed(2)} TL`
              : `${installment.installmentNumber} Taksit - Aylık ${installment.installmentPrice.toFixed(
                  2
                )} TL (Toplam: ${installment.totalPrice.toFixed(2)} TL)`,
        }))
      );

      console.log('🛒 Sepet Taksit Seçenekleri:');
      console.log(JSON.stringify(installmentOptions, null, 2));

      return installmentOptions;
    } else {
      console.error('Taksit bilgileri alınamadı:', result.errorMessage);
      return [];
    }
  } catch (error) {
    console.error('Hata:', error);
    return [];
  }
}

// 5. Taksit faiz oranlarını hesaplama
async function calculateInterestRates(binNumber: string, price: string) {
  try {
    const result = await betterPay.iyzico.installmentInfo({
      binNumber,
      price,
    });

    if (result.status === 'success' && result.installmentDetails) {
      console.log('📊 Taksit Faiz Oranları Analizi\n');

      result.installmentDetails.forEach((detail) => {
        console.log(`${detail.bankName} - ${detail.cardFamilyName}`);
        console.log('─'.repeat(50));

        const originalPrice = parseFloat(price);

        detail.installmentPrices.forEach((installment) => {
          if (installment.installmentNumber === 1) {
            console.log('Tek Çekim: Faizsiz');
          } else {
            const totalWithInterest = installment.totalPrice;
            const interest = totalWithInterest - originalPrice;
            const interestRate = ((interest / originalPrice) * 100).toFixed(2);
            const monthlyRate = (
              parseFloat(interestRate) / installment.installmentNumber
            ).toFixed(2);

            console.log(
              `${installment.installmentNumber} Taksit: %${interestRate} toplam faiz (%${monthlyRate} aylık)`
            );
          }
        });

        console.log('');
      });
    }
  } catch (error) {
    console.error('Hata:', error);
  }
}

// 6. Canlı kart girişi simülasyonu (örnek frontend entegrasyonu)
async function handleCardInput(cardNumber: string, amount: string) {
  // Kullanıcı kart numarasının ilk 6 hanesini girdikten sonra
  if (cardNumber.length >= 6) {
    const binNumber = cardNumber.substring(0, 6);

    console.log(`🔍 ${binNumber} BIN numarası için taksit seçenekleri sorgulanıyor...\n`);

    const result = await betterPay.iyzico.installmentInfo({
      binNumber,
      price: amount,
    });

    if (result.status === 'success' && result.installmentDetails) {
      const detail = result.installmentDetails[0];

      // Kart bilgilerini göster
      console.log('💳 Kart Bilgileri:');
      console.log(`   Banka: ${detail.bankName}`);
      console.log(`   Kart Tipi: ${detail.cardType}`);
      console.log(`   Kart Ailesi: ${detail.cardFamilyName}`);

      if (detail.commercial === 1) {
        console.log('   ⚠️  Bu bir ticari karttır');
      }

      if (detail.force3ds === 1) {
        console.log('   🔒 3D Secure zorunludur');
      }

      // Taksit seçeneklerini listele
      console.log('\n💰 Mevcut Taksit Seçenekleri:');
      detail.installmentPrices.forEach((installment) => {
        console.log(`   • ${installment.installmentNumber === 1 ? 'Tek Çekim' : installment.installmentNumber + ' Taksit'}: ${installment.totalPrice.toFixed(2)} TL`);
      });

      return detail;
    } else {
      console.log('⚠️  Bu kart için taksit bilgisi bulunamadı');
      return null;
    }
  }
}

// Kullanım örnekleri
async function main() {
  console.log('🚀 İyzico Taksit Sorgulama Örnekleri\n');
  console.log('='.repeat(60));
  console.log('');

  // Örnek 1: Basit taksit sorgulama
  console.log('📌 ÖRNEK 1: Basit Taksit Sorgulama\n');
  await simpleInstallmentInquiry();

  console.log('\n' + '='.repeat(60) + '\n');

  // Örnek 2: Farklı kartlar için karşılaştırma
  console.log('📌 ÖRNEK 2: Kart Karşılaştırma\n');
  await compareInstallmentOptions();

  console.log('\n' + '='.repeat(60) + '\n');

  // Örnek 3: E-Ticaret checkout için
  console.log('📌 ÖRNEK 3: E-Ticaret Checkout\n');
  await calculateInstallmentForCheckout('552879', '299.99');

  console.log('\n' + '='.repeat(60) + '\n');

  // Örnek 4: Faiz oranları analizi
  console.log('📌 ÖRNEK 4: Faiz Oranları Analizi\n');
  await calculateInterestRates('552879', '500.00');

  console.log('\n' + '='.repeat(60) + '\n');

  // Örnek 5: Canlı kart girişi
  console.log('📌 ÖRNEK 5: Canlı Kart Girişi Simülasyonu\n');
  await handleCardInput('5528790000000008', '150.00');
}

// Örneği çalıştır (sadece doğrudan çalıştırıldığında)
if (require.main === module) {
  main().catch(console.error);
}

export {
  simpleInstallmentInquiry,
  compareInstallmentOptions,
  calculateInstallmentForCheckout,
  calculateInterestRates,
  handleCardInput,
};
