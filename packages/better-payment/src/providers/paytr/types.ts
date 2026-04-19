/**
 * PayTR API yanıt tipleri
 */

export interface PayTRResponse {
  status: string;
  reason?: string;
  token?: string;
}

export interface PayTRPaymentResponse extends PayTRResponse {
  merchant_oid?: string;
  payment_amount?: string;
  payment_type?: string;
  installment_count?: string;
  hash?: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  test_mode?: string;
  payment_status?: string;
}

export interface PayTRIframeResponse {
  status: string;
  reason?: string;
  token?: string;
  iframe_url?: string;
}

export interface PayTRRefundResponse {
  status: string;
  error_no?: string;
  error_message?: string;
  merchant_oid?: string;
  return_amount?: string;
}

/**
 * PayTR API istek tipleri
 */

export interface PayTRPaymentRequest {
  merchant_id: string;
  merchant_key: string;
  merchant_salt: string;
  email: string;
  payment_amount: string; // Kuruş cinsinden (örn: 10000 = 100 TL)
  merchant_oid: string; // Sipariş numarası
  user_name: string;
  user_address: string;
  user_phone: string;
  merchant_ok_url: string;
  merchant_fail_url: string;
  user_basket: string; // JSON string
  user_ip: string;
  timeout_limit?: string; // Dakika cinsinden, default 30
  debug_on?: string; // "1" veya "0"
  test_mode?: string; // "1" veya "0"
  no_installment?: string; // "1" = taksit kapalı
  max_installment?: string; // Maksimum taksit sayısı
  currency?: string; // TL, USD, EUR
  lang?: string; // tr, en
  payment_type?: string; // card, eft
  client_lang?: string; // tr, en
}

export interface PayTRBasketItem {
  name: string;
  price: string; // Kuruş cinsinden
  quantity: number;
}

export interface PayTRCallbackData {
  merchant_oid: string;
  status: string;
  total_amount: string;
  hash: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
  test_mode?: string;
  payment_type?: string;
  currency?: string;
  payment_amount?: string;
  merchant_id?: string;
}

export interface PayTRRefundRequest {
  merchant_id: string;
  merchant_key: string;
  merchant_salt: string;
  merchant_oid: string;
  return_amount: string; // Kuruş cinsinden
  reference_no?: string;
}
