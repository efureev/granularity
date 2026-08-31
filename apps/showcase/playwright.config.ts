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
  // Прогрев dev-сервера: пребандл зависимостей vite шлёт полную перезагрузку
  // страницы, и до этого шага она попадала на первые тесты — см. `global-setup.ts`.
  globalSetup: './e2e/global-setup.ts',
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

  expect: {
    toHaveScreenshot: {
      // `threshold` — допустимая разница ЦВЕТА на пиксель (YIQ). Дефолт 0.2
      // делает гейт слепым к цветовым регрессиям в принципе: приглушённый сдвиг
      // оттенка токена не дотягивает до порога, пиксель не считается
      // отличающимся, и эталон молча протухает — при этом тест «проходит», а
      // значит `--update-snapshots=changed` его не перезапишет. Ноль означает:
      // любое изменение цвета — это изменение.
      threshold: 0,
      // Бюджет — абсолютный, а не доля площади. `maxDiffPixelRatio: 0.02` на
      // странице ~902×2745 разрешал ~49 500 различающихся пикселей, то есть
      // перекрашенный бейдж или кнопка проходили незамеченными. Сотни пикселей
      // покрывают антиалиасинг и субпиксельный рендер шрифтов, но не перекраску.
      maxDiffPixels: 300,
      animations: 'disabled',
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: `yarn vite --port ${PORT} --strictPort`,
    // Панель Vue DevTools в кадре не нужна — см. `vite.config.ts`.
    env: { SHOWCASE_E2E: '1' },
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
