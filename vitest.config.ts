import * as tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths.default()],
  base: process.env.VITEST ? undefined : './src',
  test: {
    browser: {
      // enabled: true,
      name: 'chrome',
      provider: 'webdriverio',
      headless: true
    },
    include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    globals: true,
    environmentMatchGlobs: [
      ['src/**/', 'jsdom'] // all tests in tests/dom will run in jsdom
    ]
  }
});
