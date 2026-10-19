import { defineConfig } from 'vitest/config'

/** Гейты читают файлы пакета от cwd; `document` нужен только `theme/apply`. */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
