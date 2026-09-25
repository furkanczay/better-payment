// SOAP responses in the format documented by Param (TURKPOS API):
// TP_Ozel_Oran_SK_Liste returns DT_Ozel_Oranlar_SK rows with MO_01..MO_12 rates,
// where a negative rate means the installment is not available.

const envelope = (body: string) =>
  `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>${body}</soap:Body></soap:Envelope>`;

const rateRow = (id: string, posId: string, bank: string, rates: string[]) =>
  `<DT_Ozel_Oranlar_SK diffgr:id="DT_Ozel_Oranlar_SK${id}" msdata:rowOrder="${Number(id) - 1}">` +
  `<Ozel_Oran_SK_ID>${id}</Ozel_Oran_SK_ID><GUID>0c13d406-873b-403b-9c09-a5766840d98c</GUID>` +
  `<SanalPOS_ID>${posId}</SanalPOS_ID><Kredi_Karti_Banka>${bank}</Kredi_Karti_Banka>` +
  rates
    .map(
      (r, i) => `<MO_${String(i + 1).padStart(2, '0')}>${r}</MO_${String(i + 1).padStart(2, '0')}>`
    )
    .join('') +
  `</DT_Ozel_Oranlar_SK>`;

export const PARAMPOS_RATES_RESPONSE = envelope(
  `<TP_Ozel_Oran_SK_ListeResponse xmlns="https://turkpos.com.tr/"><TP_Ozel_Oran_SK_ListeResult>` +
    `<Sonuc>1</Sonuc><Sonuc_Str>Başarılı</Sonuc_Str>` +
    `<DT_Bilgi><xs:schema id="NewDataSet"></xs:schema><diffgr:diffgram><NewDataSet>` +
    rateRow('1', '1029', 'Axess', [
      '1.7500',
      '3.2000',
      '4.1000',
      '-2.0000',
      '-2.0000',
      '7.9000',
      '-1.0000',
      '-2.0000',
      '-2.0000',
      '-2.0000',
      '-2.0000',
      '-2.0000',
    ]) +
    rateRow('2', '1009', 'Diğer Banka Kartları', [
      '1.9900',
      '-2.0000',
      '-2.0000',
      '-2.0000',
      '-2.0000',
      '-2.0000',
      '-2.0000',
      '-2.0000',
      '-2.0000',
      '-2.0000',
      '-2.0000',
      '-2.0000',
    ]) +
    `</NewDataSet></diffgr:diffgram></DT_Bilgi>` +
    `</TP_Ozel_Oran_SK_ListeResult></TP_Ozel_Oran_SK_ListeResponse>`
);

export const paramposBinResponse = (posId: string, dkk: '0' | '1') =>
  envelope(
    `<BIN_SanalPosResponse xmlns="https://turkpos.com.tr/"><BIN_SanalPosResult>` +
      `<Sonuc>1</Sonuc><Sonuc_Str>Başarılı</Sonuc_Str><DT_Bilgi><diffgr:diffgram><NewDataSet><Temp>` +
      `<BIN>435508</BIN><SanalPOS_ID>${posId}</SanalPOS_ID><Kart_Banka>AKBANK T.A.Ş.</Kart_Banka>` +
      `<DKK>${dkk}</DKK><Kart_Tip>Credit Kart</Kart_Tip><Kart_Org>VISA</Kart_Org>` +
      `</Temp></NewDataSet></diffgr:diffgram></DT_Bilgi></BIN_SanalPosResult></BIN_SanalPosResponse>`
  );
