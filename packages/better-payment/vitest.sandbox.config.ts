import { defineConfig } from 'vitest/config';

// Real provider test environments: slow, networked, run one file at a time.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/sandbox/**/*.sandbox.test.ts'],
    testTimeout: 60000,
    hookTimeout: 60000,
    fileParallelism: false,
  },
});
