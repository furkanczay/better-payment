/**
 * Runtime-independent crypto helpers on WebCrypto (`globalThis.crypto`), available
 * in Node.js 20+, Deno, Bun, Cloudflare Workers and Vercel Edge. No `node:crypto`
 * or `Buffer`, so the library runs on edge runtimes.
 */

export type DigestAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512';

const encoder = new TextEncoder();

function webCrypto(): Crypto {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (!c?.subtle) {
    throw new Error('WebCrypto (globalThis.crypto.subtle) is not available in this runtime');
  }
  return c;
}

function bytesOf(data: string | Uint8Array): Uint8Array<ArrayBuffer> {
  return typeof data === 'string'
    ? encoder.encode(data)
    : (new Uint8Array(data) as Uint8Array<ArrayBuffer>);
}

/** UTF-8 bytes of a string */
export function utf8(value: string): Uint8Array {
  return encoder.encode(value);
}

export function toBase64(data: string | Uint8Array): string {
  const bytes = typeof data === 'string' ? encoder.encode(data) : data;
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/** Decodes base64 to a UTF-8 string */
export function fromBase64(value: string): string {
  const binary = atob(value.replace(/\s/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function toHex(bytes: Uint8Array): string {
  let hex = '';
  for (const byte of bytes) hex += byte.toString(16).padStart(2, '0');
  return hex;
}

export async function digest(
  algorithm: DigestAlgorithm,
  data: string | Uint8Array
): Promise<Uint8Array> {
  return new Uint8Array(await webCrypto().subtle.digest(algorithm, bytesOf(data)));
}

export async function hmac(
  algorithm: DigestAlgorithm,
  key: string,
  data: string | Uint8Array
): Promise<Uint8Array> {
  const subtle = webCrypto().subtle;
  const cryptoKey = await subtle.importKey(
    'raw',
    bytesOf(key),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  );
  return new Uint8Array(await subtle.sign('HMAC', cryptoKey, bytesOf(data)));
}

/** Cryptographically random bytes as lowercase hex */
export function randomHex(byteLength: number): string {
  return toHex(webCrypto().getRandomValues(new Uint8Array(byteLength)));
}

/**
 * Constant-time string comparison for signatures/hashes.
 * Returns false for missing values or different lengths.
 */
export function safeEqual(a: string | undefined | null, b: string | undefined | null): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bytesA = encoder.encode(a);
  const bytesB = encoder.encode(b);
  if (bytesA.length !== bytesB.length) return false;
  let diff = 0;
  for (let i = 0; i < bytesA.length; i++) diff |= bytesA[i] ^ bytesB[i];
  return diff === 0;
}
