export interface RetryConfig {
  /** Total attempts including the initial one. Default: 1 (no retry). */
  attempts: number;
  /** Delay in ms between attempts. Default: 1000. */
  delay?: number;
  /** HTTP status codes that trigger a retry. When omitted, only network errors (no response) are retried. */
  statusCodes?: number[];
}
