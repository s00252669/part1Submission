import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    restoreMocks: true,
    include: ['tests/**/*.test.ts'],
    setupFiles: './tests/setup.ts',
    testTimeout: 20000,
    fileParallelism: false,
  },
});