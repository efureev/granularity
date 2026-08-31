import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  define: {
    // Гард дев-предупреждений. На сборке пакета его разворачивает `vite.config.ts`,
    // а в тестах он просто `true` — иначе `__GR_DEV__` был бы неопределён и
    // первое же предупреждение уронило бы тест `ReferenceError`'ом.
    __GR_DEV__: 'true',
  },
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'json-summary', 'lcov'],
    },
    // Арифметика диффа тестируется без монтирования, но блок, редактор и дифф
    // живут в DOM.
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
