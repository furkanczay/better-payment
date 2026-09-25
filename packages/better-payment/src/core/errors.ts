export class BetterPaymentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly provider?: string
  ) {
    super(message);
    this.name = 'BetterPaymentError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ProviderNotEnabledError extends BetterPaymentError {
  constructor(provider: string) {
    super(`Provider '${provider}' is not enabled or configured`, 'PROVIDER_NOT_ENABLED', provider);
    this.name = 'ProviderNotEnabledError';
  }
}

export class PaymentFailedError extends BetterPaymentError {
  constructor(
    message: string,
    public readonly errorCode?: string,
    public readonly rawResponse?: unknown,
    provider?: string
  ) {
    super(message, 'PAYMENT_FAILED', provider);
    this.name = 'PaymentFailedError';
  }
}

export interface ValidationIssue {
  /** Dotted path of the invalid field, e.g. `paymentCard.cardNumber` or `basketItems[0].price` */
  path: string;
  message: string;
}

export class ValidationError extends BetterPaymentError {
  /** Every invalid field; empty when the error was raised for a single value */
  public readonly issues: ValidationIssue[];

  constructor(message: string, provider?: string, issues: ValidationIssue[] = []) {
    super(message, 'VALIDATION_ERROR', provider);
    this.name = 'ValidationError';
    this.issues = issues;
  }

  /** Path of the first invalid field, if known */
  get field(): string | undefined {
    return this.issues[0]?.path;
  }
}

export class ConfigurationError extends BetterPaymentError {
  constructor(message: string, provider?: string) {
    super(message, 'CONFIGURATION_ERROR', provider);
    this.name = 'ConfigurationError';
  }
}
