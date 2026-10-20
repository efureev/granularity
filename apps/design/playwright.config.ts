import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT ?? 4327)

/**
 * Темы каталога в браузере: axe и визуальные эталоны компонентов под парами
 * каждой темы. Слой локальный, как визуальный гейт витрины: эталоны снимаются на
 * машине владельца (`*-chromium-darwin.png`), и `dist` пакета обязан быть свежим —
 * приложение работает с ним, а не с исходниками.
 */
export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  snapshotDir: './e2e/__screenshots__',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}/` },
  expect: {
    // Строго, как у витрины: любое изменение цвета — изменение, 300 пикселей —
    // запас на сглаживание текста.
    toHaveScreenshot: { threshold: 0, maxDiffPixels: 300, animations: 'disabled' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `yarn vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
