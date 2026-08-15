import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Гейты пакета читают файловую систему, а не монтируют компоненты: DOM тут
    // не нужен, и jsdom стоил бы секунды на ровном месте.
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
