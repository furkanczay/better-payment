/**
 * Akbank Sanal POS API yanıt tipleri
 */

export interface AkbankResponse {
  /** İşlem sonucu (Success, Declined, Error) */
  ProcReturnCode: string;
  /** İşlem mesajı */
  Response: string;
  /** İşlem kodu */
  ErrMsg?: string;
  /** Ödeme ID */
  OrderId?: string;
  /** Referans numarası */
  TransId?: string;
  /** Auth kod */
  AuthCode?: string;
  /** Host referans numarası */
  HostRefNum?: string;
  /** Kampanya tutarı */
  Extra?: {
    /** Taksit sayısı */
    NUMCODE?: string;
    [key: string]: unknown;
  };
}

export interface AkbankPaymentRequest {
  /** Mağaza numarası */
  MERCHANTID: string;
  /** Terminal ID */
  TERMINALID: string;
  /** İşlem tutarı (kuruş cinsinden) */
  AMOUNT: string;
  /** Para birimi kodu (949 = TRY) */
  CURRENCY: string;
  /** Sipariş numarası */
  ORDERID: string;
  /** İşlem tipi (Auth, PreAuth, PostAuth, etc.) */
  TXNTYPE: string;
  /** Taksit sayısı */
  INSTALLMENT_COUNT?: string;
  /** Kart numarası */
  PAN: string;
  /** Son kullanma tarihi (YYMM) */
  EXPIRY: string;
  /** CVV */
  CVV: string;
  /** Kart sahibi adı */
  CARDOWNER?: string;
  /** İşlem tipi (Auth, PreAuth, PostAuth, Sale) */
  TXNSUBTYPE?: string;
  /** 3D güvenlik seviyesi */
  SECURE3DSECURITYLEVEL?: string;
}

export interface Akbank3DSInitRequest {
  /** Mağaza numarası */
  MERCHANTID: string;
  /** Terminal ID */
  TERMINALID: string;
  /** İşlem tutarı (kuruş cinsinden) */
  AMOUNT: string;
  /** Para birimi kodu (949 = TRY) */
  CURRENCY: string;
  /** Sipariş numarası */
  ORDERID: string;
  /** İşlem tipi (Auth) */
  TXNTYPE: string;
  /** Taksit sayısı */
  INSTALLMENT_COUNT?: string;
  /** Başarı URL */
  SUCCESSURL: string;
  /** Hata URL */
  ERRORURL: string;
  /** Kart numarası */
  PAN: string;
  /** Son kullanma tarihi (YYMM) */
  EXPIRY: string;
  /** CVV */
  CVV: string;
  /** Kart sahibi adı */
  CARDOWNER?: string;
  /** Müşteri email */
  EMAIL?: string;
}

export interface Akbank3DSInitResponse extends AkbankResponse {
  /** 3D HTML formu */
  Message?: string;
}

export interface Akbank3DSCallbackRequest {
  /** Mağaza numarası */
  MERCHANTID: string;
  /** Terminal ID */
  TERMINALID: string;
  /** Sipariş numarası */
  ORDERID: string;
  /** 3D güvenlik seviyesi */
  SECURE3DSECURITYLEVEL: string;
  /** 3D Hash */
  SECURE3DHASH: string;
  /** İşlem tutarı */
  AMOUNT: string;
  /** Para birimi */
  CURRENCY: string;
  /** İşlem sonucu */
  ProcReturnCode?: string;
  /** Yanıt mesajı */
  Response?: string;
  /** MD status */
  mdStatus?: string;
  /** Cavv */
  cavv?: string;
  /** Eci */
  eci?: string;
  /** MD */
  md?: string;
  /** XID */
  xid?: string;
}

export interface AkbankRefundRequest {
  /** Mağaza numarası */
  MERCHANTID: string;
  /** Terminal ID */
  TERMINALID: string;
  /** Sipariş numarası */
  ORDERID: string;
  /** İade tutarı (kuruş cinsinden) */
  AMOUNT: string;
  /** Para birimi */
  CURRENCY: string;
  /** İşlem tipi (Refund) */
  TXNTYPE: string;
  /** Host referans numarası */
  HOSTREFNUM?: string;
}

export interface AkbankRefundResponse extends AkbankResponse {
  /** İade ID */
  RefundId?: string;
}

export interface AkbankCancelRequest {
  /** Mağaza numarası */
  MERCHANTID: string;
  /** Terminal ID */
  TERMINALID: string;
  /** Sipariş numarası */
  ORDERID: string;
  /** İşlem tipi (Void) */
  TXNTYPE: string;
  /** Host referans numarası */
  HOSTREFNUM?: string;
}

export interface AkbankCancelResponse extends AkbankResponse {
  /** İptal ID */
  VoidId?: string;
}

export interface AkbankConfig {
  /** Mağaza numarası */
  merchantId: string;
  /** Terminal ID */
  terminalId: string;
  /** Store key (güvenlik anahtarı) */
  storeKey: string;
  /** 3D Store key */
  secure3DStoreKey?: string;
  /** Test modu */
  testMode?: boolean;
}
