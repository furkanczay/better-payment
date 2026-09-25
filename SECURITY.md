# Security Policy

better-payment handles payments, so we take security reports seriously.

## Reporting a vulnerability

**Do not open a public issue, discussion or pull request for a security problem.**

Report it privately through GitHub: [open a private vulnerability report](https://github.com/furkanczay/better-payment/security/advisories/new) (Security tab → "Report a vulnerability").

Please include:

- what the problem is and what an attacker could do (for example: forge a successful 3D Secure callback, bypass the handler's `authorize` hook, leak credentials in logs)
- the affected version and provider
- steps or code to reproduce, with test credentials or placeholders only

We aim to acknowledge a report within 3 working days and to keep you updated until it is fixed. When a fix is released, we publish a GitHub security advisory and credit you, unless you prefer to stay anonymous.

## Supported versions

| Version | Supported |
| ------- | --------- |
| latest `0.x` release | Yes |
| older `0.x` releases | No, upgrade to the latest release |
| `1.x`–`3.x` (before the version reset) | No, deprecated; see the [changelog](packages/better-payment/CHANGELOG.md) |

## Scope

In scope: the `better-payment` package (including `better-payment/client`, `/testing`, `/plugins` and the framework adapters) and the documentation's security guidance.

Out of scope: vulnerabilities in the payment providers' own APIs (report them to the provider), and issues that require an already compromised server or leaked merchant credentials.
