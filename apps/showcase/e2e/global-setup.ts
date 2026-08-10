import type { FullConfig } from '@playwright/test'
import { chromium } from '@playwright/test'

/**
 * Прогрев dev-сервера до первого теста.
 *
 * Vite пребандлит зависимости при первом обращении, а когда пребандл готов —
 * шлёт подключённым клиентам полную перезагрузку страницы. Прогон витрины
 * начинается сразу после `yarn build` (а локально — ещё и после пересборки
 * библиотеки, которую витрина тянет алиасом), поэтому оптимизация всегда
 * попадала на первые тесты: страница перезагружалась под уже открытым
 * модальным окном, панель исчезала, и ожидание конца анимации уходило в
 * тридцатисекундный таймаут. Симптом выглядел как флак «модального окна»:
 * падали 2–4 сценария из шестнадцати, всегда самые долгие, а повторный прогон
 * по прогретому кэшу был зелёным.
 *
 * Здесь мы один раз открываем самую тяжёлую страницу и дожидаемся тишины в
 * сети: к моменту старта тестов пребандл закончен и перезагружать нечего.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL
  if (!baseURL) return

  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    await page.goto(new URL('components/gr-modal', baseURL).toString(), { waitUntil: 'networkidle' })
    await page.locator('#live-examples').waitFor()
    // Демо грузятся лениво: даём догрузиться их чанкам, иначе оптимизация
    // догонит тесты на первом же открытии окна.
    await page.locator('[data-example-preview] button').first().waitFor()
    await page.waitForLoadState('networkidle')
  }
  finally {
    await browser.close()
  }
}
