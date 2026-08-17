import { expect, test } from '@playwright/test'

import { companionPath, componentPath, visualCompanionComponentNames } from './components'

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
 * Тема и язык фиксируются до загрузки приложения.
 *
 * Язык — не формальность: демо `chrono` следуют языку витрины, а он переживает
 * перезагрузку в `localStorage`. Без явной отметки эталон зависел бы от того,
 * что осталось в профиле браузера от прошлого прогона.
 */
async function pinAppearance(page: import('@playwright/test').Page, theme: 'light' | 'dark'): Promise<void> {
  await page.addInitScript((value) => {
    try {
      localStorage.setItem('gr-theme', value)
      localStorage.setItem('showcase-locale', 'en')
    }
    catch {
      // ignore storage errors
    }
  }, theme)
}

/**
 * Липкая шапка витрины перекрывает верх `#live-examples`, поэтому попадает в
 * снимок элемента — вместе с номером версии пакета. Любой бамп версии иначе
 * расходится с эталонами на всех страницах сразу, хотя ни один компонент не
 * менялся: предмет гейта — компоненты, а не хром витрины.
 *
 * Шапка **скрывается**, а не маскируется. Маска закрашивает box элемента, но
 * не то, что он рисует за его пределами: у активной вкладки навигации есть
 * свечение, и оно спускается ниже шапки на полтора десятка пикселей. Строка
 * версии меняет ширину плашки, плашка сдвигает навигацию, навигация уводит
 * свечение — и эталон расходился под маской, а не под ней. `visibility` снимает
 * всю отрисовку разом и не трогает раскладку: шапка липкая и места в потоке
 * `#live-examples` не занимает.
 */
async function hideChrome(page: import('@playwright/test').Page): Promise<void> {
  await page.addStyleTag({ content: '.showcase-header { visibility: hidden !important; }' })
}

/**
 * Всё, что выведено из часов, из кадра исключается: «5 секунд назад» меняется
 * между съёмкой и прогоном, и эталон протухал бы через минуту после создания.
 *
 * Селектор не перечисляет демо, а спрашивает у разметки: `data-allow-mismatch`
 * компонент ставит ровно там, где читает часы. Новое живое демо попадёт под
 * маску само.
 */
function clockDriven(page: import('@playwright/test').Page) {
  return page.locator('[data-gr-relative-time][data-allow-mismatch]')
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
 * Страницы компаньонов снимаются целиком, а не выборкой: их вид завязан на те
 * же токены. Панели пикеров в кадр попадают через демо с `inline` —
 * открывающиеся по клику в снимок не идут по общему правилу.
 *
 * Исключение — `granularity-charts`: он рисует геометрию, а не вёрстку, и
 * пиксельный дифф по кривой меряет антиалиасинг. Обоснование и список —
 * `components.ts`, `VISUAL_EXCLUDED_PACKAGES`. Из axe-гейта эти страницы **не**
 * исключены.
 */
const VISUAL_COMPANIONS = visualCompanionComponentNames

for (const theme of ['light', 'dark'] as const) {
  test.describe(`visual (${theme})`, () => {
    for (const name of VISUAL_COMPONENTS) {
      test(`${name} live examples`, async ({ page }) => {
        /*
         * Тема форсится до загрузки приложения, чтобы снапшот был стабильным.
         *
         * `reducedMotion` — по той же причине, а не ради доступности: снимок
         * анимации ловит случайный кадр и протухает сразу после съёмки. Демо
         * пакета под этим режимом останавливаются сами (таймеры «живого
         * значения» у `GrProgressCircle` не запускаются вовсе, пульс
         * `GrSkeleton` гасится медиазапросом), поэтому маска не нужна —
         * достаточно попросить страницу не двигаться.
         */
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
        await pinAppearance(page, theme)

        await page.goto(componentPath(name))
        const examples = page.locator('#live-examples')
        await examples.waitFor()
        // Даём шрифтам/иконкам дорисоваться.
        await page.waitForLoadState('networkidle')

        await hideChrome(page)

        await expect(examples).toHaveScreenshot(`${componentPath(name).replace('/', '-')}-${theme}.png`)
      })
    }
  })
}

for (const theme of ['light', 'dark'] as const) {
  test.describe(`visual companion (${theme})`, () => {
    for (const name of VISUAL_COMPANIONS) {
      test(`${name} live examples`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
        await pinAppearance(page, theme)

        await page.goto(companionPath(name))
        const examples = page.locator('#live-examples')
        await examples.waitFor()
        await page.waitForLoadState('networkidle')

        await hideChrome(page)

        await expect(examples).toHaveScreenshot(`${companionPath(name).replace('/', '-')}-${theme}.png`, {
          mask: [clockDriven(page)],
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
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
    await pinAppearance(page, theme)

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
