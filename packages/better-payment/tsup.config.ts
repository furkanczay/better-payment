import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
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
  // Smaller published bundles; sourcemaps keep stack traces readable.
  minify: true,
  // Keep class and function names: error names, instanceof checks in user code
  // and provider names derived from constructor.name must survive minification.
  keepNames: true,
});
