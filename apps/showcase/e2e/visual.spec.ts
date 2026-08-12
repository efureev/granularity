import { expect, test } from '@playwright/test'

import { companionComponentNames, companionPath, componentPath } from './components'

/**
 * Визуальная регрессия: снимок области «Live examples» для набора компонентов.
 *
 * Снапшоты детерминированы (анимации отключены в конфиге, тема форсится) и
 * хранятся в `e2e/__screenshots__`. Первый прогон создаёт эталоны
 * (`--update-snapshots`), последующие — сравнивают.
 *
 * Допуски заданы в `playwright.config.ts` и намеренно строгие (`threshold: 0` +
 * абсолютный `maxDiffPixels`): цель слоя — ловить именно цветовые регрессии
 * токенов, а они при дефолтных допусках не видны в принципе.
 *
 * Список — не все 64 компонента, а выборка по визуальному «языку»: форм-контролы,
 * поверхности, данные, состояния. Компонент попадает сюда, если его вид завязан на
 * токены и стабилен без взаимодействия; оверлеи, открывающиеся по клику, и всё с
 * асинхронным содержимым — нет, они дают мигающие эталоны.
 */

/**
 * `animations: 'disabled'` из конфига доигрывает CSS-анимации и переходы, но
 * JS-твин ему неподвластен: перебор чисел `GrStatistic` крутится на
 * `requestAnimationFrame`, и снимок ловил бы случайный кадр. Эмуляция «уменьшить
 * движение» — тот же канал, которым пользуется сам компонент, поэтому эталон
 * снимается с уже доехавшими значениями.
 */
test.use({ reducedMotion: 'reduce' })

/**
 * Липкая шапка витрины перекрывает верх `#live-examples`, поэтому попадает в
 * снимок элемента — вместе с номером версии пакета. Без маски любой бамп
 * версии расходится с эталонами на всех страницах сразу (144 файла), хотя ни
 * один компонент не менялся. Маскируем: предмет гейта — компоненты, а не хром
 * витрины.
 */
async function chrome(page: import('@playwright/test').Page) {
  return [page.locator('.showcase-header')]
}

const VISUAL_COMPONENTS = [
  // Форм-контролы: на них завязана бо́льшая часть цветовых токенов.
  'GrButton',
  'GrButtonGroup',
  'GrInput',
  'GrTextarea',
  'GrNumberInput',
  'GrSelect',
  'GrAutocomplete',
  'GrCheckbox',
  'GrRadioGroup',
  'GrSwitch',
  'GrSlider',
  'GrSplitter',
  'GrRating',
  'GrSegmented',
  'GrInputTag',
  'GrFormField',
  'GrColorPicker',
  // Поверхности и типографика.
  'GrCard',
  'GrAlert',
  'GrBadge',
  'GrDivider',
  'GrKbd',
  'GrLink',
  'GrAvatar',
  'GrEmptyState',
  // Данные и навигация.
  'GrTable',
  'GrDataTable',
  'GrTabs',
  'GrBreadcrumbs',
  'GrPagination',
  'GrList',
  'GrProgressBar',
  'GrProgressCircle',
  'GrSkeleton',
  'GrStatistic',
  'GrTimeline',
]

/**
 * Страницы компаньонов снимаются целиком, а не выборкой: пакет там один, и его
 * вид завязан на те же токены. Панели пикеров в кадр попадают через демо с
 * `inline` — открывающиеся по клику в снимок не идут по общему правилу.
 */
const VISUAL_COMPANIONS = companionComponentNames

for (const theme of ['light', 'dark'] as const) {
  test.describe(`visual (${theme})`, () => {
    for (const name of VISUAL_COMPONENTS) {
      test(`${name} live examples`, async ({ page }) => {
        // Форсим тему до загрузки приложения, чтобы снапшот был стабильным.
        await page.emulateMedia({ colorScheme: theme })
        await page.addInitScript((t) => {
          try {
            localStorage.setItem('gr-theme', t)
          }
          catch {
            // ignore storage errors
          }
        }, theme)

        await page.goto(componentPath(name))
        const examples = page.locator('#live-examples')
        await examples.waitFor()
        // Даём шрифтам/иконкам дорисоваться.
        await page.waitForLoadState('networkidle')

        await expect(examples).toHaveScreenshot(`${componentPath(name).replace('/', '-')}-${theme}.png`, {
          mask: await chrome(page),
        })
      })
    }
  })
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`visual companion (${theme})`, () => {
    for (const name of VISUAL_COMPANIONS) {
      test(`${name} live examples`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme })
        await page.addInitScript((t) => {
          try {
            localStorage.setItem('gr-theme', t)
          }
          catch {
            // ignore storage errors
          }
        }, theme)

        await page.goto(companionPath(name))
        const examples = page.locator('#live-examples')
        await examples.waitFor()
        await page.waitForLoadState('networkidle')

        await expect(examples).toHaveScreenshot(`${companionPath(name).replace('/', '-')}-${theme}.png`, {
          mask: await chrome(page),
        })
      })
    }
  })
}

/**
 * Единственное исключение из правила «без взаимодействия»: закрытый
 * `GrColorPicker` — это кнопка с образцом, и всё, ради чего гейт существует
 * (радуга оттенка, переходы насыщенности и светлоты, шахматка под альфой),
 * живёт в панели. Снимок берётся с самой панели, а не со страницы, поэтому
 * плавающее позиционирование в эталон не попадает.
 */
for (const theme of ['light', 'dark'] as const) {
  test(`visual (${theme}) GrColorPicker panel`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme })
    await page.addInitScript((t) => {
      try {
        localStorage.setItem('gr-theme', t)
      }
      catch {
        // ignore storage errors
      }
    }, theme)

    await page.goto(componentPath('GrColorPicker'))
    await page.locator('#live-examples').waitFor()
    await page.waitForLoadState('networkidle')

    // Второй триггер — демо формы: у него включена альфа, то есть все четыре канала.
    await page.locator('[data-gr-color-picker-trigger]').nth(1).click()
    const panel = page.locator('[data-gr-color-picker-panel]:visible')
    await expect(panel).toBeVisible()

    await expect(panel).toHaveScreenshot(`gr-color-picker-panel-${theme}.png`)
  })
}
