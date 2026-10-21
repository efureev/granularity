import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT ?? 4327)
const PREVIEW_PORT = Number(process.env.E2E_PREVIEW_PORT ?? 4329)

/**
 * Темы каталога в браузере: axe и визуальные эталоны компонентов под парами
 * каждой темы. Слой локальный, как визуальный гейт витрины: эталоны снимаются на
 * машине владельца (`*-chromium-darwin.png`), и `dist` пакета обязан быть свежим —
 * приложение работает с ним, а не с исходниками.
 *
 * Смена темы (`switch.spec.ts`) идёт и на сборке (`build`): скрипт темы там стоит
 * после стилей, а в dev стили приходят из JS уже после него — порядок слоёв
 * держится по-разному, и проверять надо оба пути.
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  snapshotDir: './e2e/__screenshots__',
  fullyParallel: true,
  reporter: [['list']],
  expect: {
    // Строго, как у витрины: любое изменение цвета — изменение, 300 пикселей —
    // запас на сглаживание текста.
    toHaveScreenshot: { threshold: 0, maxDiffPixels: 300, animations: 'disabled' },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${PORT}/` } },
    { name: 'build', testMatch: 'switch.spec.ts', use: { ...devices['Desktop Chrome'], baseURL: `http://localhost:${PREVIEW_PORT}/` } },
  ],
  webServer: [
    {
      command: `yarn vite --port ${PORT} --strictPort`,
      url: `http://localhost:${PORT}/`,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `yarn vite build --logLevel warn && yarn vite preview --port ${PREVIEW_PORT} --strictPort`,
      url: `http://localhost:${PREVIEW_PORT}/`,
      reuseExistingServer: false,
      timeout: 240_000,
    },
  ],
})
