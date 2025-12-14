import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['**/test/**/*.test.ts'],
    clearMocks: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: './test-output',
      reporter: ['text', 'lcov'],
      include: ['src/**'],
      exclude: [...configDefaults.exclude, 'test-output', '**/test/**'],
      clean: false
    }
  }
})
