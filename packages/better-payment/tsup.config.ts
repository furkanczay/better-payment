import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'adapters/next-js': 'src/adapters/next-js.ts',
    'adapters/node': 'src/adapters/node.ts',
    'client/index': 'src/client/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [
    'next/server',
    'next',
    'express',
  ],
  noExternal: [],
});
