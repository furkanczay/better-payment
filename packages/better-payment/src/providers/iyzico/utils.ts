import crypto from 'crypto';

/**
 * İyzico V2 authorization header oluşturur
 * Resmi iyzico-node SDK algoritmasına göre
 */
export function generateIyzicoAuthStringV2(
  apiKey: string,
  secretKey: string,
  randomString: string,
  uri: string,
  requestBody: string
): string {
  // 1. Signature oluştur: HMAC-SHA256(randomString + uri + requestBody)
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(randomString + uri + requestBody)
    .digest('hex');

  // 2. Authorization parametrelerini birleştir
  const authorizationParams = [
    `apiKey:${apiKey}`,
    `randomKey:${randomString}`,
    `signature:${signature}`,
  ];

  // 3. Base64 encode et
  const base64Auth = Buffer.from(authorizationParams.join('&')).toString('base64');

  return `IYZWSv2 ${base64Auth}`;
}

/**
 * İyzico V1 authorization header oluşturur (fallback)
 */
export function generateIyzicoAuthStringV1(
  apiKey: string,
  secretKey: string,
  randomString: string,
  pkiString: string
): string {
  const dataToEncrypt = apiKey + randomString + secretKey + pkiString;
  const hash = crypto.createHash('sha1').update(dataToEncrypt, 'utf8').digest('base64');
  return `IYZWS ${apiKey}:${hash}`;
}

/**
 * Random string oluşturur
 */
export function generateRandomString(): string {
  // İyzico SDK ile uyumlu format: timestamp + random
  return Date.now() + Math.random().toString(36).slice(2);
}

/**
 * İyzico API isteği için header oluşturur
 */
export function createIyzicoHeaders(
  apiKey: string,
  secretKey: string,
  uri: string,
  requestBody: string,
  pkiString?: string
): Record<string, string> {
  const randomString = generateRandomString();
  const authStringV2 = generateIyzicoAuthStringV2(
    apiKey,
    secretKey,
    randomString,
    uri,
    requestBody
  );

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: authStringV2,
    'x-iyzi-rnd': randomString,
    'x-iyzi-client-version': 'better-pay-1.0.0',
  };

  // V1 fallback header ekle (iyzico bazen bunu da kontrol eder)
  if (pkiString) {
    headers['Authorization_Fallback'] = generateIyzicoAuthStringV1(
      apiKey,
      secretKey,
      randomString,
      pkiString
    );
  }

  return headers;
}
