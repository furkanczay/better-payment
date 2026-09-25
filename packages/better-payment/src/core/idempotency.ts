import { digest, toHex } from './crypto';

/**
 * Key-value store used by the HTTP handler to process each callback once and to
 * honor `Idempotency-Key` headers. Values are JSON strings.
 *
 * Implementations must make `setIfAbsent` atomic (Redis `SET key value NX EX ttl`,
 * a unique-key insert in SQL). With several app instances, use a shared store:
 * the in-memory default only deduplicates within one process.
 */
export interface IdempotencyStore {
  get(key: string): Promise<string | undefined> | string | undefined;
  set(key: string, value: string, ttlSeconds: number): Promise<void> | void;
  /** Stores the value only if the key does not exist; returns whether it was stored */
  setIfAbsent(key: string, value: string, ttlSeconds: number): Promise<boolean> | boolean;
  delete(key: string): Promise<void> | void;
}

/**
 * In-process store with expiry. Holds at most `maxEntries` keys and evicts the
 * oldest first. Suitable for a single instance and for tests.
 */
export class MemoryIdempotencyStore implements IdempotencyStore {
  private readonly entries = new Map<string, { value: string; expiresAt: number }>();

  constructor(private readonly maxEntries = 10_000) {}

  get(key: string): string | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: string, ttlSeconds: number): void {
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    while (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest === undefined) break;
      this.entries.delete(oldest);
    }
  }

  setIfAbsent(key: string, value: string, ttlSeconds: number): boolean {
    if (this.get(key) !== undefined) return false;
    this.set(key, value, ttlSeconds);
    return true;
  }

  delete(key: string): void {
    this.entries.delete(key);
  }
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((k) => [k, canonical((value as Record<string, unknown>)[k])])
    );
  }
  return value;
}

/** SHA-256 of a value's canonical JSON (object keys sorted), hex encoded */
export async function fingerprint(value: unknown): Promise<string> {
  return toHex(await digest('SHA-256', JSON.stringify(canonical(value ?? null))));
}
