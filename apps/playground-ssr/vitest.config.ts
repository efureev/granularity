import { fileURLToPath, URL } from 'node:url'
import { granum } from '@feugene/granum/vite'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

import granumConfig from './granum.config'

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  // granum — ради `virtual:granum/themes`: манифест режимов приложение берёт
  // у сборки, и сервер стенда отдаёт пары из него же.
  plugins: [vue(), granum(granumConfig)],
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Снимок серверного HTML делается в настоящем Node (без jsdom) — иначе
    // гарды `typeof window === 'undefined'` считают себя клиентом.
    globalSetup: ['./test/ssr-snapshot.ts'],
    // Добирает то, чего нет в jsdom. Сам файл ничего не делает в
    // `environment: 'node'` — см. комментарий внутри.
    setupFiles: ['./test/setup-dom.ts'],
  },
})
