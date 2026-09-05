import { expect, test } from '@playwright/test'

import { waitForOpaque } from '@feugene/granularity-test-kit/e2e'

import { waitForSettledPreviews } from './readiness'

import { companionPath, componentPath, registryComponentNames, visualCompanionComponentNames } from './components'

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
 * Наборов два. `VISUAL_COMPONENTS` — компоненты, снимаемые страницей: их вид
 * завязан на токены и стабилен без взаимодействия. `VISUAL_OVERLAYS` — слои,
 * которые сперва раскрывают, а снимают саму панель: закрытый оверлей это
 * кнопка, и предмет гейта у него весь в раскрытом состоянии.
 *
 * Выборка при этом обязана быть полной относительно реестра: каждое имя либо
 * снимается, либо лежит в `VISUAL_EXCLUDED` с причиной. Держит это тест в конце
 * файла — без него список расходился с пакетом молча.
 */

/**
 * `animations: 'disabled'` из конфига доигрывает CSS-анимации и переходы, но
 * JS-твин ему неподвластен: перебор чисел `GrStatistic` крутится на
 * `requestAnimationFrame`, и снимок ловил бы случайный кадр. Эмуляция «уменьшить
 * движение» — тот же канал, которым пользуется сам компонент, поэтому эталон
 * снимается с уже доехавшими значениями.
 */
// Опция принадлежит контексту, а не самому тесту: в форме `test.use({ reducedMotion })`
// Playwright её не применял — гашение держалось только на `page.emulateMedia`
// ниже, а эта строка вводила в заблуждение.
test.use({ contextOptions: { reducedMotion: 'reduce' } })

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
/**
 * Градиенты витрины гасятся по той же причине, что скрывается шапка: они хром, а
 * не предмет гейта.
 *
 * Растеризация большого плавного перехода недетерминирована на ±1 из 255, и это
 * не теория: на снимке `GrButton` расходились 8225 пикселей, **все** ровно на
 * единицу — `230,232,250` против `230,231,250`. Страница у него самая длинная в
 * наборе, поэтому именно она первой перебирала абсолютный порог в 300 пикселей,
 * проходя в одиночку и падая под параллельной нагрузкой.
 *
 * Ослаблять `threshold` в ответ нельзя — он равен нулю намеренно, иначе гейт
 * слепнет к перекрашенному токену. Поэтому убирается сам источник шума: заливка
 * вместо перехода. Цвета компонентов от этого не меняются, а порог остаётся
 * строгим.
 */
async function hideChrome(page: import('@playwright/test').Page): Promise<void> {
  await page.addStyleTag({
    content: `
      .showcase-header { visibility: hidden !important; }
      .showcase-shell { background-image: none !important; }
      :root, [data-theme='dark'] { --preview-surface: var(--gr-bg) !important; }
    `,
  })
}

/**
 * Часы страницы останавливаются на константе.
 *
 * Маска, стоявшая здесь раньше, задачу не решала: прямоугольник Playwright
 * рисует по границам элемента, а они едут вслед за длиной строки («только что»
 * → «2 минуты назад»), поэтому эталон всё равно расходился — измерено на
 * `GrRelativeTime`, где маска оказалась шире эталонной на 68px. Заодно маска
 * закрывала от гейта настоящую разметку.
 *
 * `setFixedTime`, а не `install`: подменяется только `Date`, таймеры продолжают
 * идти. Общие часы `useChronoNow` тикают как обычно и каждый раз читают одно и
 * то же значение, так что текст детерминирован без остановки страницы.
 */
const FROZEN_NOW = new Date('2026-06-15T12:00:00.000Z')

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
  // Прилипшая панель — единственное место, где тень направлена вверх и собрана
  // подмесом `--gr-fg`: системного зеркала у неё нет, и `elevationPerTheme` её
  // не видит. Нижняя панель демо прилипшая с самого начала, поэтому в кадр
  // попадает и она, и панели в потоке.
  'GrAffix',
  // Активность пункта — это три признака сразу (рельс, вес, цвет текста), и
  // регрессия любого из них не видна ни axe (контраст не меняется), ни юнит-
  // тестам (они смотрят классы, а не CSS).
  'GrScrollSpy',
  // Лента детерминирована: автопрокрутка под `reduce` не стартует, а кадры
  // демо крашены плоскими токенами — градиентов, чья растеризация гуляет
  // между прогонами, тут нет (урок `GrFilePreview`).
  'GrCarousel',
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
  'GrSteps',
  'GrTimeline',
  // Приехали в 0.21–0.24 и до сих пор были вне набора.
  'GrChip',
  'GrContextMenu',
  'GrChipGroup',
  'GrDelta',
  'GrDescriptionList',
  'GrJsonViewer',
  'GrValue',
  /**
   * Статичные в покое — раскладка снимается первым кадром.
   *
   * Недетерминизм в их демо есть (`Date.now()` в шапке секции, `Math.random()`
   * у прогресса загрузки, часы в баннере ошибки), но весь он за кликом, и до
   * первого кадра не доходит. `GrLoading` крутится CSS-анимацией — её гасит
   * `animations: 'disabled'`.
   */
  'GrBadgeWrap',
  'GrCheckboxGroup',
  'GrCollapse',
  'GrFileUpload',
  'GrFormFile',
  'GrFormSection',
  'GrIcon',
  'GrLoading',
  'GrRadio',
  'GrResponseErrorBanner',
  'GrSortableList',
  'GrTabPanels',
  'GrTransfer',
  'GrTree',
  'GrTreeSections',
  'GrTreeSelect',
]

/**
 * Почему компонент реестра **не** снимается — списком, а не прозой.
 *
 * Раньше причины жили в докблоке набора, и это ровно та форма, в которой
 * пропуск неотличим от решения: `GrTransfer` приехал в 0.43.0 и не попал ни в
 * набор, ни в объяснения — заметить это можно было только пересчитав реестр
 * руками. Ключ здесь обязателен для каждого невключённого имени, поэтому новый
 * компонент теперь роняет гейт, пока про него не сказано что-то определённое.
 *
 * Значение — причина целиком, а не отсылка: список читают, когда решают, можно
 * ли компонент внести, и «см. выше» на этот вопрос не отвечает.
 */
const VISUAL_EXCLUDED: Record<string, string> = {
  // Раскладка считается от ширины окна раннера, а не от токенов: эталон, снятый
  // на одной ширине, на другой расходится целиком.
  GrNavbar: 'раскладка зависит от ширины окна раннера',
  GrSidebar: 'раскладка зависит от ширины окна раннера',
  GrBottomNav: 'раскладка зависит от ширины окна раннера',

  // Своей разметки нет вовсе — снимок мерил бы демо, а не компонент.
  GrConfigProvider: 'своей разметки не рисует — снимок мерил бы демо',
  GrForm: 'своей разметки не рисует — снимок мерил бы демо',

  // Сервис из хоста и композабла; страницы компонента у него нет, он живёт
  // страницей `composables/use-dialog-service` (см. `SERVICE_ENTITIES`).
  GrDialogService: 'сервис без страницы компонента',

  /**
   * Эталон нестабилен by design гейта. Демо рисует полтора десятка плиток
   * картинками из `data:` с градиентами, и растеризация градиента гуляет между
   * прогонами: замер трёх прогонов подряд давал максимум **2 из 255** на 75
   * тысячах пикселей. Порог здесь абсолютный (`maxDiffPixels: 300` при
   * `threshold: 0`), поэтому такой разброс его пробивает, ничего не сообщая о
   * раскладке. Что гейт ловил бы уникально, остаётся за axe (страница из него
   * **не** исключена) и за `componentTokens`/`styleTokens` — та же развязка,
   * что у графиков.
   */
  GrFilePreview: 'растеризация градиентов в демо шумит выше абсолютного порога',
}

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
        await page.clock.setFixedTime(FROZEN_NOW)
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
        await pinAppearance(page, theme)

        await page.goto(componentPath(name))
        const examples = page.locator('#live-examples')
        await examples.waitFor()
        // Даём шрифтам/иконкам дорисоваться.
        await page.waitForLoadState('networkidle')
        await waitForSettledPreviews(page)

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
        await page.clock.setFixedTime(FROZEN_NOW)
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
        await pinAppearance(page, theme)

        await page.goto(companionPath(name))
        const examples = page.locator('#live-examples')
        await examples.waitFor()
        await page.waitForLoadState('networkidle')
        await waitForSettledPreviews(page)

        await hideChrome(page)

        await expect(examples).toHaveScreenshot(`${companionPath(name).replace('/', '-')}-${theme}.png`)
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

/**
 * Оверлеи: снимок раскрытой панели, а не страницы.
 *
 * Закрытый оверлей — это кнопка, а всё, ради чего гейт существует (поверхность
 * панели, тень, радиус, подложка), живёт в раскрытом состоянии. Приём тот же,
 * что у панели `GrColorPicker` выше: открыть и снять сам слой. Плавающее
 * позиционирование в эталон не попадает — снимается элемент, а не вьюпорт.
 *
 * **`waitForOpaque` здесь обязателен, а не желателен.** Панель появляется
 * с переходом прозрачности, и снимок посреди него ловит случайный кадр — это
 * и есть «мигающий эталон», из-за которого оверлеи держали вне набора. Ждём
 * конца перехода, а не паузой: пауза угадывает, а не измеряет.
 */
type OverlayTarget = {
  name: string
  /** Панель, которая идёт в кадр. */
  panel: string
  /** Как раскрыть. По умолчанию — клик по первой кнопке первого превью. */
  open?: (page: import('@playwright/test').Page) => Promise<void>
}

async function clickFirstPreviewButton(page: import('@playwright/test').Page): Promise<void> {
  // Триггер по позиции, а не по подписи: подпись приходит из локали витрины.
  await page.locator('[data-example-preview] button').first().click()
}

const VISUAL_OVERLAYS: OverlayTarget[] = [
  // Семейство модальных: `GrDialog` и оба его пресета рисуются через `GrModal`,
  // поэтому панель у всех четырёх одна и та же.
  { name: 'GrModal', panel: '[data-gr-modal-panel]' },
  { name: 'GrDialog', panel: '[data-gr-modal-panel]' },
  { name: 'GrConfirmDialog', panel: '[data-gr-modal-panel]' },
  { name: 'GrPromptDialog', panel: '[data-gr-modal-panel]' },
  { name: 'GrDrawer', panel: '[data-gr-drawer-panel]' },
  { name: 'GrCommandPalette', panel: '[data-gr-command-palette]' },
  { name: 'GrImageViewer', panel: '[data-gr-image-viewer-panel]' },
  { name: 'GrDropdown', panel: '[data-gr-dropdown-panel]' },
  { name: 'GrDropdownMenu', panel: '[data-gr-dropdown-panel]' },
  {
    name: 'GrPopover',
    panel: '[data-gr-popover-panel]',
    open: page => page.locator('[data-gr-popover-trigger]').first().click(),
  },
  {
    // Тултип раскрывается наведением, а не кликом.
    name: 'GrTooltip',
    panel: '[data-gr-tooltip-panel]',
    open: page => page.locator('[data-gr-tooltip-trigger]').first().hover(),
  },
  { name: 'GrToaster', panel: '[data-gr-toaster]' },
]

for (const theme of ['light', 'dark'] as const) {
  test.describe(`visual overlay (${theme})`, () => {
    for (const target of VISUAL_OVERLAYS) {
      test(`${target.name} panel`, async ({ page }) => {
        /*
         * Часы здесь НЕ замораживаются, в отличие от снимков страниц.
         * `page.clock.setFixedTime` не даёт оверлею раскрыться вовсе: панель не
         * появляется в DOM, и тест падает на ожидании, а не на диффе. Проверено
         * прямым замером — с этой строкой не открывался ни один из двенадцати,
         * без неё открылись все. Времязависимого текста в панелях нет, так что
         * замораживать нечего.
         */
        await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
        await pinAppearance(page, theme)

        await page.goto(componentPath(target.name))
        await page.locator('#live-examples').waitFor()
        await page.waitForLoadState('networkidle')

        await (target.open ?? clickFirstPreviewButton)(page)

        const panel = page.locator(`${target.panel}:visible`).first()
        await expect(panel).toBeVisible()
        await waitForOpaque(page, target.panel)

        const slug = componentPath(target.name).split('/')[1]
        await expect(panel).toHaveScreenshot(`${slug}-panel-${theme}.png`)
      })
    }
  })
}

/**
 * Сторож источника набора — зеркало теста полноты в `a11y.spec.ts`.
 *
 * Набор ядра здесь набирается руками (в отличие от компаньонов, которые
 * выводятся из реестров пакетов), а рукописный список расходится с пакетом
 * молча: `GrTransfer` пролежал вне гейта с 0.43.0, не упомянутый ни в наборе,
 * ни в причинах. Такой пропуск не виден ни на одном прогоне — гейт зелен,
 * потому что теста просто нет.
 *
 * Поэтому решение обязано быть явным для **каждого** имени реестра: снимаем
 * или не снимаем, и во втором случае — почему. Молчание больше не проходит.
 *
 * Проверяются обе стороны. Забытое имя — дыра в покрытии; лишнее в причинах —
 * протухшая запись, которая после переименования компонента снова открывает ту
 * же дыру, прикидываясь осознанным решением.
 */
test('каждый компонент реестра либо снимается, либо исключён с причиной', () => {
  const excluded = Object.keys(VISUAL_EXCLUDED)
  const overlayNames = VISUAL_OVERLAYS.map(target => target.name)
  const accounted = new Set([...VISUAL_COMPONENTS, ...overlayNames, ...excluded])

  const unaccounted = registryComponentNames.filter(name => !accounted.has(name))
  expect(
    unaccounted,
    `Ни в наборе, ни в VISUAL_EXCLUDED: ${unaccounted.join(', ')}. `
    + 'Внесите в набор и снимите эталоны либо объявите причину в VISUAL_EXCLUDED.',
  ).toEqual([])

  const registry = new Set(registryComponentNames)
  const stale = excluded.filter(name => !registry.has(name))
  expect(
    stale,
    `В VISUAL_EXCLUDED имена, которых нет в реестре: ${stale.join(', ')}. `
    + 'Переименован или удалён — запись обязана уехать следом.',
  ).toEqual([])

  const contradictory = [...VISUAL_COMPONENTS, ...overlayNames].filter(name => name in VISUAL_EXCLUDED)
  expect(
    contradictory,
    `Одновременно в наборе и в исключениях: ${contradictory.join(', ')}.`,
  ).toEqual([])
})
