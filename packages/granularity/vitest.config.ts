import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    vue(),
    Icons({
      compiler: 'vue3',
      autoInstall: false,
    }),
  ],
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'json-summary', 'lcov'],
      include: ['src/**/*.{ts,vue}'],
      // Данные, а не логика: покрывать реестры и таблицы дефолтов нечем, а в
      // знаменателе они занижают цифру и делают порог бессмысленным.
      exclude: [
        'src/**/__tests__/**',
        'src/**/*.{test,spec}.ts',
        'src/testing/**',
        'src/index.ts',
        'src/componentNames.ts',
        'src/granular-provider/shared.ts',
        'src/tokens/generated.ts',
        'src/components/*/safelist.ts',
        'src/components/*/defaults.ts',
        'src/i18n/locales/**',
      ],
      // Порог — от измеренного минус ~3 п.п. по каждой метрике отдельно.
      // Зазор не косметический: v8 считает покрытие SFC чуть по-разному между
      // патчами vitest, и нулевой запас превратил бы гейт в генератор флака.
      // Ветки идут отдельной ступенью — они всегда ниже остальных.
      // Замер 2026-08-13: lines 92.36, statements 90.62, functions 92.51,
      // branches 84.15.
      thresholds: {
        lines: 89,
        statements: 87,
        functions: 89,
        branches: 81,
      },
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./src/__tests__/setup.ts'],
  },
})