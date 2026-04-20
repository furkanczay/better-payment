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
    super(
      `Provider '${provider}' is not enabled or configured`,
      'PROVIDER_NOT_ENABLED',
      provider
    );
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

export class ValidationError extends BetterPaymentError {
  constructor(message: string, provider?: string) {
    super(message, 'VALIDATION_ERROR', provider);
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends BetterPaymentError {
  constructor(message: string, provider?: string) {
    super(message, 'CONFIGURATION_ERROR', provider);
    this.name = 'ConfigurationError';
  }
}
