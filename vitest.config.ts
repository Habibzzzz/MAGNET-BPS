import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: true,
    exclude: [
      'node_modules/**',
      'tests/**',
      'e2e/**',
      '**/*.e2e.*',
    ],
    alias: {
      '@/': path.resolve(__dirname, './') + '/',
    },
  },
});


