import { defineConfig, devices } from '@playwright/test'

/**
 * E2E-конфиг для доступностного (axe) и визуально-регрессионного слоя витрины.
 *
 * Витрина рендерит живые демо всех компонентов дизайн-системы (в т.ч. ручных
 * ARIA-паттернов: GrSelect, GrAutocomplete, GrSlider, GrTree, GrTabs, GrDropdown),
 * поэтому именно она — естественная площадка для сквозных a11y/visual проверок.
 *
 * Тесты гоняются против dev-сервера vite (base `/`), который надёжно отдаёт SPA
 * на глубоких маршрутах. Он использует собранный `dist` библиотеки через alias,
 * поэтому перед запуском её нужно собрать (см. скрипт `test:e2e` → `yarn build`,
 * который также обновляет сгенерированные `componentApi`/`searchIndex`).
 */
const PORT = Number(process.env.E2E_PORT ?? 4319)

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  // Визуальные снапшоты храним рядом с тестами (детеминированно, попадают в git).
  snapshotDir: './e2e/__screenshots__',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: `http://localhost:${PORT}/`,
    trace: 'on-first-retry',
  },

  // Небольшой допуск, чтобы визуальные тесты не падали от антиалиасинга/субпикселей.
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled' },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: `yarn vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
