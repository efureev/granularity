import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  plugins: [vue()],
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Снимок серверного HTML делается в настоящем Node (без jsdom) — иначе
    // гарды `typeof window === 'undefined'` считают себя клиентом.
    globalSetup: ['./test/ssr-snapshot.ts'],
    server: {
      deps: {
        // Пакет собран с `libInjectCss`: его чанки импортируют `.css`, чего
        // Node сам не умеет. Инлайним, чтобы CSS обработал vite.
        inline: [/@feugene\/granularity/],
      },
    },
  },
})
