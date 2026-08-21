import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  define: {
    __GR_DEV__: 'true',
  },
  test: {
    // ProseMirror живёт в DOM: проверено пробным монтажом — редактор
    // поднимается в jsdom, команды идут, разбор по схеме работает.
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
