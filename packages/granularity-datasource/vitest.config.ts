import { defineConfig } from 'vitest/config'

/**
 * `jsdom`, хотя компонентов у пакета нет: адаптер адресной строки работает с
 * `window.location` и `history`, а композабл монтируется в тестах ради
 * жизненного цикла — без документа не проверить ни то, ни другое.
 */
export default defineConfig({
  define: {
    __GR_DEV__: 'true',
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
})
