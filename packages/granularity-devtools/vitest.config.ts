import { defineConfig } from 'vitest/config'

export default defineConfig({
  define: {
    __GR_DEVTOOLS_VERSION__: JSON.stringify('0.1.1'),
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
