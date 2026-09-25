import { defineConfig, mergeConfig } from 'vitest/config';
import base from './vitest.config';

/**
 * Runs the test suite with edge-runtime globals (fetch, WebCrypto, TextEncoder)
 * instead of Node's. `pnpm test:edge`
 */
export default mergeConfig(
  base,
  defineConfig({
    test: {
      environment: 'edge-runtime',
      coverage: { enabled: false },
    },
  })
);
