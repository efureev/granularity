import { expect, test } from '@playwright/test'

import { componentPath } from './components'

/**
 * Консольный мост панели (`@feugene/granularity-devtools`).
 *
 * Смысл раздела — не проверить панель, а показать, что тестам больше не нужно
 * ждать по времени. Состояние стека слоёв живёт в приватном синглтоне ядра, из
 * DOM его не видно, и до моста «дождаться, что слой зарегистрирован» писалось
 * как «подождать 300 мс».
 *
 * Мост существует только в dev-сборке, а e2e и так гоняются против dev-сервера
 * (см. докблок `playwright.config.ts`), поэтому отдельного стенда не нужно.
 *
 * Появляется он не на `load`, а после монтирования приложения: витрина стартует
 * асинхронно (ждёт словари локали), и `app.use(installGranularityDevtools())`
 * выполняется уже после. Отсюда `waitForFunction` в хелпере — единственное
 * ожидание в этом файле, и оно по факту, а не по времени.
 */

async function waitForBridge(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForFunction(() => Boolean(window.__GR_DEVTOOLS__))
}

interface BridgeSnapshot {
  version: string
  layers: { id: number, modal: boolean, topmostForEscape: boolean, closesOnEscape: boolean }[]
  issues: { component: string | null, message: string, count: number }[]
}

declare global {
  interface Window {
    __GR_DEVTOOLS__?: {
      version: string
      snapshot: () => BridgeSnapshot
      waitFor: (predicate: (snapshot: BridgeSnapshot) => boolean, options?: { timeout?: number }) => Promise<BridgeSnapshot>
    }
  }
}

test.describe('консольный мост devtools', () => {
  test('стек слоёв виден тесту без единого ожидания по времени', async ({ page }) => {
    await page.goto(componentPath('GrModal'))
    await page.locator('#live-examples').waitFor()
    await waitForBridge(page)

    const before = await page.evaluate(() => window.__GR_DEVTOOLS__?.snapshot().layers.length)
    expect(before).toBe(0)

    await page.locator('[data-example-preview] button').first().click()

    // Ждём событие стека, а не анимацию: слой регистрируется до того, как
    // панель окна станет непрозрачной.
    const opened = await page.evaluate(async () => {
      const snapshot = await window.__GR_DEVTOOLS__!.waitFor(state => state.layers.length === 1, { timeout: 3000 })
      return snapshot.layers[0]
    })

    expect(opened).toMatchObject({ modal: true, topmostForEscape: true, closesOnEscape: true })

    await page.keyboard.press('Escape')

    const closed = await page.evaluate(async () => {
      const snapshot = await window.__GR_DEVTOOLS__!.waitFor(state => state.layers.length === 0, { timeout: 3000 })
      return snapshot.layers
    })

    expect(closed).toEqual([])
  })

  test('мост знает свою версию и виден странице сразу', async ({ page }) => {
    await page.goto(componentPath('GrButton'))
    await waitForBridge(page)

    const version = await page.evaluate(() => window.__GR_DEVTOOLS__?.version)

    expect(version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  test('предупреждения пакета собираются и без открытой панели', async ({ page }) => {
    await page.goto(componentPath('GrButton'))
    await waitForBridge(page)

    // Панель никто не открывал: журнал наполняет перехват консоли из `install`.
    const issues = await page.evaluate(async () => {
      console.warn('[GrButton] проверка моста')
      const snapshot = await window.__GR_DEVTOOLS__!.waitFor(state => state.issues.length > 0, { timeout: 1000 })
      return snapshot.issues
    })

    expect(issues[0]).toMatchObject({ component: 'GrButton', message: 'проверка моста', count: 1 })
  })
})
