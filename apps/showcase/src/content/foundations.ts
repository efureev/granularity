import installationDocSource from '../../../../packages/granularity/docs/installation.md?raw'
import localizationDocSource from '../../../../packages/granularity/docs/localization.md?raw'
import stylingDocSource from '../../../../packages/granularity/docs/styling.md?raw'
import unocssDocSource from '../../../../packages/granularity/docs/unocss.md?raw'
import { granularityDefaultThemes, granularityThemeNames } from '@feugene/granularity/granular-provider'
import { grDerivedTokens, grFoundationTokens, grThemeTokens, type GrTokenValues } from '@feugene/granularity/tokens'

type ShowcaseCodeSample = {
  title: string
  code: string
  language: string
}

export type ShowcaseQuickStartCard = {
  id: string
  title: string
  description: string
  code: string
  language: string
  note: string
}

export type ShowcaseFoundationGuide = {
  id: string
  title: string
  summary: string
  description: string
  narrativeSource: string
  sourcePath: string
  keyPoints: string[]
  recommendations: string[]
  codeSamples: ShowcaseCodeSample[]
}

export type ShowcaseFoundationToken = {
  name: string
  value: string
  hexValue: string | null
  description: string
  section: string
}

export type ShowcaseThemeToken = {
  name: string
  section: string
  description: string
  values: Record<ShowcaseThemeName, {
    value: string
    hexValue: string | null
  }>
}

type ShowcaseThemeName = (typeof granularityThemeNames)[number]

function takeLeadingBlock(source: string, linesCount = 48) {
  return source
    .trim()
    .split('\n')
    .slice(0, linesCount)
    .join('\n')
}

function takeHeadingBlock(source: string, heading: string) {
  const lines = source.trim().split('\n')
  const startIndex = lines.findIndex(line => line.trim() === heading)

  if (startIndex === -1)
    return takeLeadingBlock(source)

  const block: string[] = []

  for (let index = startIndex; index < lines.length; index += 1) {
    const currentLine = lines[index]

    if (index > startIndex && currentLine.startsWith('## '))
      break

    block.push(currentLine)
  }

  return block.join('\n').trim()
}

function extractHexValue(value: string) {
  return value.match(/#(?:[\da-f]{3}|[\da-f]{6})\b/i)?.[0] ?? null
}

function toThemeValues(values: GrTokenValues): ShowcaseThemeToken['values'] {
  return Object.fromEntries(
    granularityThemeNames.map(theme => [
      theme,
      {
        value: values[theme],
        hexValue: extractHexValue(values[theme]),
      },
    ]),
  ) as ShowcaseThemeToken['values']
}

function normalizeFoundationTokenSection(section: string) {
  switch (section) {
    case 'Foundations: neutral palette':
      return 'Palette scale'
    case 'Typography: font families':
      return 'Typography / font families'
    case 'Typography: font sizes':
      return 'Typography / font sizes'
    case 'Typography: line heights':
      return 'Typography / line heights'
    case 'Typography: font weights':
      return 'Typography / font weights'
    case 'Layout: spacing scale':
      return 'Layout / spacing scale'
    case 'Layout: containers':
      return 'Layout / containers'
    case 'Layout: breakpoints':
      return 'Layout / breakpoints'
    case 'Shapes: radii and compatibility aliases':
      return 'Shapes / radii'
    case 'Derived interaction formulas: action roles':
      return 'Derived interaction / action roles'
    case 'Derived interaction formulas: status roles':
      return 'Derived interaction / status roles'
    default:
      return section
  }
}

function normalizeThemeTokenSection(section: string) {
  switch (section) {
    case 'Derived interaction formulas: action roles':
      return 'Fallbacks / action roles'
    case 'Derived interaction formulas: status roles':
      return 'Fallbacks / status roles'
    default:
      return section
  }
}

const rootImportSnippet = `import {
  GrButton,
  GrCard,
} from '@feugene/granularity'

import '@feugene/granularity/styles.css'`

const useThemeSnippet = `import { initThemeEarly, useTheme } from '@feugene/granularity'

initThemeEarly()

const {
  isDark,
  toggleTheme,
} = useTheme()`

const presetBasicSnippet = `import { defineConfig, presetMini } from 'unocss'
import { presetGranularNode } from '@feugene/unocss-preset-granular/node'

import granularityProvider from '@feugene/granularity/granular-provider/node'

export default defineConfig({
  presets: [
    presetMini(),
    presetGranularNode({
      providers: [granularityProvider],
    }),
  ],
})`

const presetComponentsSnippet = `import { defineConfig, presetMini } from 'unocss'
import { presetGranularNode } from '@feugene/unocss-preset-granular/node'

import granularityProvider from '@feugene/granularity/granular-provider/node'

export default defineConfig({
  presets: [
    presetMini(),
    presetGranularNode({
      providers: [granularityProvider],
      // Сужаем набор компонентов — в бандл попадёт только их CSS и preflight-ы.
      components: [
        { provider: '@feugene/granularity', names: ['GrButton', 'GrCard'] },
      ],
    }),
  ],
})`

const presetThemesSnippet = `import { defineConfig, presetMini } from 'unocss'
import { presetGranularNode } from '@feugene/unocss-preset-granular/node'

import granularityProvider from '@feugene/granularity/granular-provider/node'

export default defineConfig({
  presets: [
    presetMini(),
    presetGranularNode({
      providers: [granularityProvider],
      components: [
        { provider: '@feugene/granularity', names: ['GrButton', 'GrCard'] },
      ],
      // Ограничиваем набор встроенных тем и/или подмешиваем свои theme files.
      themes: { names: ['light', 'dark'] },
    }),
  ],
})`

const presetLayerSnippet = `import { defineConfig, presetMini } from 'unocss'
import { presetGranularNode } from '@feugene/unocss-preset-granular/node'

import granularityProvider from '@feugene/granularity/granular-provider/node'

export default defineConfig({
  presets: [
    presetMini(),
    presetGranularNode({
      providers: [granularityProvider],
      components: [
        { provider: '@feugene/granularity', names: ['GrButton', 'GrCard'] },
      ],
      themes: { names: ['light', 'dark'] },
      // Кладём preflight-ы пакета в отдельный CSS layer — так проще
      // управлять порядком относительно \`preflights\`/\`default\`.
      layer: 'granular',
    }),
  ],
})`

const presetGranularContentSnippet = `import { defineConfig, presetMini } from 'unocss'
import { granularContent, presetGranularNode } from '@feugene/unocss-preset-granular/node'

import granularityProvider from '@feugene/granularity/granular-provider/node'

const granularOptions = {
  providers: [granularityProvider],
  components: [
    { provider: '@feugene/granularity', names: ['GrButton', 'GrCard'] },
  ],
  themes: { names: ['light', 'dark'] },
  layer: 'granular' as const,
}

export default defineConfig({
  presets: [
    presetMini(),
    presetGranularNode(granularOptions),
  ],
  // Обязательно для авто-сканирования, когда компоненты импортируются из
  // собранного \`dist/\` через subpath exports: \`@unocss/vite\` читает
  // \`content\` только из top-level user-config, не из \`preset.content\`.
  content: granularContent(granularOptions),
})`

const localizationSnippet = `import { createFintI18n } from '@feugene/fint-i18n/core'
import { installI18n } from '@feugene/fint-i18n/vue'
import { GRANULARITY_I18N_BLOCK, en, ru } from '@feugene/granularity/i18n'

const i18n = createFintI18n({
  locale: 'ru',
  fallbackLocale: 'en',
  loaders: [en, ru],
})

i18n.registerBlocks([GRANULARITY_I18N_BLOCK])
await i18n.loadUsedBlocks('ru')

// В точке входа приложения — иначе granularity не найдёт инстанс через provide/inject
installI18n(app, i18n)`

// Токены приезжают ДАННЫМИ из пакета (`tokens/*.json` → `@feugene/granularity/tokens`).
// Раньше здесь лежали копии `tokens.css`/`themes/*.css` литералами и словарь описаний:
// копии протухали молча (страница показывала `--gr-primary: #6366f1` спустя две
// починки контраста), а описания дублировали то, что и так есть в данных.
const foundationTokensFromData: ShowcaseFoundationToken[] = [
  ...grFoundationTokens.map(token => ({
    name: token.name,
    value: token.value,
    hexValue: extractHexValue(token.value),
    description: token.description,
    section: normalizeFoundationTokenSection(token.section),
  })),
  // Производные состояния живут в `tokens.css` формулой — показываем формулу,
  // а не посчитанный фолбэк: именно она попадает в браузер.
  ...grDerivedTokens.map(token => ({
    name: token.name,
    value: token.formula,
    hexValue: null,
    description: token.description,
    section: normalizeFoundationTokenSection(token.section),
  })),
]

const themeTokensFromData: ShowcaseThemeToken[] = [
  ...grThemeTokens.map(token => ({
    name: token.name,
    section: token.section,
    description: token.description ?? `Theme token из группы \`${token.section}\`, задающий semantic цветовой контракт текущего режима.`,
    values: toThemeValues(token.values),
  })),
  // Фолбэки `@supports not (color-mix)` — тот же токен, но уже вычисленным hex.
  ...grDerivedTokens.map(token => ({
    name: token.name,
    section: normalizeThemeTokenSection(token.section),
    description: token.description,
    values: toThemeValues(token.values),
  })),
]

export const showcaseFoundationTokens = foundationTokensFromData

export const showcaseThemeTokens = themeTokensFromData

const foundationTokenCount = showcaseFoundationTokens.length

const foundationBaseCssExcerpt = `html,
body {
  height: 100%;
}

body {
  margin: 0;
  font-family: var(--gr-font-ui);
  background: var(--gr-bg);
  color: var(--gr-fg);
}

:where(a, button) {
  background-color: transparent;
}`

// Выдержки строятся из тех же данных, что и сам CSS: захардкоженные копии
// разъезжались с пакетом при каждой правке токенов.
function renderThemeExcerpt(theme: ShowcaseThemeName, selector: string, names: readonly string[]) {
  const declarations = names
    .map((name) => {
      const token = showcaseThemeTokens.find(item => item.name === name)
      return token ? `  ${name}: ${token.values[theme].value};` : null
    })
    .filter((line): line is string => line !== null)

  return [`${selector} {`, ...declarations, '}'].join('\n')
}

const themeExcerptTokenNames = [
  '--gr-bg',
  '--gr-fg',
  '--gr-card',
  '--gr-muted',
  '--gr-brd',
  '--gr-ring',
  '--gr-primary',
  '--gr-primary-fg',
  '--gr-success',
  '--gr-warning',
  '--gr-danger',
  '--gr-info',
] as const

const lightThemeCssExcerpt = renderThemeExcerpt('light', ':root', themeExcerptTokenNames)

const darkThemeCssExcerpt = renderThemeExcerpt('dark', '[data-theme=\'dark\']', themeExcerptTokenNames)

// Срез обязан дотягиваться дальше палитры — до типографики, интервалов и
// радиусов: иначе страница Foundations показывает один список цветов. Граница
// подвижная: каждая новая ступень шкалы сдвигает интервалы вправо, и её надо
// двигать следом — гейт `foundationsContent` требует, чтобы `--gr-space-4`
// оставался в срезе.
const tokensCssExcerpt = [
  ':root {',
  ...showcaseFoundationTokens
    .slice(0, 60)
    .map(token => `  ${token.name}: ${token.value};`),
  '}',
].join('\n')

export const showcaseQuickStartCards: ShowcaseQuickStartCard[] = [
  {
    id: 'quick-start-preset-basic',
    title: 'Шаг 1. Базовый `uno.config.ts` с `presetGranularNode`',
    description: '`presetGranular` (node-вариант — `presetGranularNode`) — единственный поддерживаемый способ подключения пакета. На этом шаге в `presets` добавляется только сам preset и granular-провайдер пакета: никаких `components`, `themes` или `layer` пока нет.',
    code: presetBasicSnippet,
    language: 'ts',
    note: 'Уже на этом уровне в сборку подмешиваются `tokens.css` и `base.css`, включены все компоненты провайдера и их preflight-ы — эквивалент `components: "all"` по умолчанию.',
  },
  {
    id: 'quick-start-preset-components',
    title: 'Шаг 2. Сужаем список компонентов',
    description: 'Чтобы не тянуть в бандл CSS всех компонентов провайдера, явно перечисляем только нужные. Опция `components` принимает список `{ provider, names }` и может быть собрана из нескольких провайдеров.',
    code: presetComponentsSnippet,
    language: 'ts',
    note: 'Preset сам подмешивает foundation layers, preflight-ы и safelist только для выбранных компонентов, остальные в бандл не попадают.',
  },
  {
    id: 'quick-start-preset-themes',
    title: 'Шаг 3. Ограничиваем набор тем',
    description: 'По умолчанию подключаются все темы провайдера. Опция `themes.names` оставляет только перечисленные темы; `themeFiles` позволяет добавить или полностью переопределить CSS темы файлами приложения, а `tokensFile`/`baseFile` — подменить foundation-слои.',
    code: presetThemesSnippet,
    language: 'ts',
    note: 'Это рекомендуемая production-конфигурация для большинства приложений: чёткий контроль над компонентами и набором тем без ручной сборки CSS.',
  },
  {
    id: 'quick-start-preset-layer',
    title: 'Шаг 4. Отдельный CSS layer для preflight-ов',
    description: 'По умолчанию preflight-ы пакета идут без явного `layer`. Опция `layer` кладёт их в собственный CSS-слой, что даёт предсказуемый порядок относительно `preflights`/`default` и упрощает переопределение стилей приложением.',
    code: presetLayerSnippet,
    language: 'ts',
    note: 'Используйте именованный layer, если у вас уже есть своя система CSS layers или нужно, чтобы утилиты Uno гарантированно перебивали базовые стили компонентов.',
  },
  {
    id: 'quick-start-preset-granular-content',
    title: 'Шаг 5. Продвинутый сценарий: `granularContent` для subpath imports',
    description: 'Когда приложение импортирует компоненты из собранного `dist/` через subpath exports, extractor UnoCSS должен заглянуть в директории этих компонентов и их `.js`/`.ts` чанки. Хелпер `granularContent` формирует нужный `content`, который передаётся в top-level user-config UnoCSS.',
    code: presetGranularContentSnippet,
    language: 'ts',
    note: '`@unocss/vite` читает `content` только из top-level user-config, не из `preset.content`, поэтому `granularContent(...)` передаётся именно в `defineConfig`. Если у приложения уже есть свой `content.pipeline.include`, объедините его с `granularContent(...).pipeline.include`.',
  },
]

export const showcaseFoundationStats = [
  {
    id: 'public-components',
    label: 'Компоненты в реестре',
    value: '25+',
    description: 'Showcase уже знает о публичных компонентах через generated registry и build-time API metadata.',
  },
  {
    id: 'theme-modes',
    label: 'Встроенные темы',
    value: `${granularityThemeNames.length}`,
    description: `Дефолтно пакет публикует ${granularityThemeNames.join(' и ')}, при этом по умолчанию активна ${granularityDefaultThemes.join(', ')} theme.`,
  },
  {
    id: 'token-count',
    label: 'Foundation tokens',
    value: `${foundationTokenCount}`,
    description: 'Токены уже вынесены в отдельный слой и доступны для собственного theme layer приложения.',
  },
]

export const showcaseFoundationGuides: ShowcaseFoundationGuide[] = [
  {
    id: 'styling',
    title: 'Styling layers',
    summary: 'Разделяет foundation-слои, theme CSS и component-level styles, чтобы приложение могло выбрать свой уровень контроля.',
    description: 'Стилизация в `granularity` строится вокруг нескольких слоёв: `tokens.css`, `base.css`, theme files и component-level `styles.css`. Foundations page должна объяснять этот контракт раньше, чем пользователь откроет первую компонентную страницу.',
    narrativeSource: takeLeadingBlock(stylingDocSource),
    sourcePath: 'packages/granularity/docs/styling.md',
    keyPoints: [
      '`tokens.css` хранит шкалы, формулы, типографику и базовые дизайн-токены.',
      '`base.css` добавляет foundation rules поверх токенов и не зависит от внешних Uno shortcuts.',
      '`styles.css` не заменяет foundation layers, а только добавляет component-level utility CSS.',
    ],
    recommendations: [
      'Начинайте интеграцию со стандартного порядка импортов: `tokens` → `base` → `theme` → component styles.',
      'Если хотите минимальный CSS без `UnoCSS`, подключайте `components/<Name>/styles.css` точечно.',
      'Для кастомной темы оставляйте foundation layers пакета и подменяйте только semantic theme layer.',
    ],
    codeSamples: [
      {
        title: 'Рекомендуемый порядок импортов',
        code: rootImportSnippet,
        language: 'ts',
      },
      {
        title: 'Foundation base.css excerpt',
        code: foundationBaseCssExcerpt,
        language: 'css',
      },
    ],
  },
  {
    id: 'themes',
    title: 'Themes',
    summary: 'Встроенные `light` и `dark` темы отделены от foundation-токенов и могут жить рядом с кастомными theme layers приложения.',
    description: 'Theme layer определяет semantic значения вроде `--gr-bg`, `--gr-primary`, `--gr-brd` и статусные роли. Это позволяет использовать один набор foundations и переключать только визуальный режим.',
    narrativeSource: takeHeadingBlock(stylingDocSource, '## Встроенные темы'),
    sourcePath: 'packages/granularity/docs/styling.md',
    keyPoints: [
      `Пакет публикует встроенные темы: ${granularityThemeNames.join(', ')}.`,
      '`light.css` использует `:root`, а `dark.css` — `[data-theme=\'dark\']` и `.dark` (интероп с class-стратегией Tailwind/UnoCSS).',
      '`useTheme()` и `initThemeEarly()` уже дают базовый runtime-контракт для переключения темы.',
    ],
    recommendations: [
      'Инициализируйте тему максимально рано, чтобы избежать визуального flash на старте.',
      'Если приложение хранит тему само, оставляйте тот же semantic contract по CSS variables.',
      'Используйте showcase как dogfooding-площадку: shell уже живёт на тех же `light`/`dark` слоях.',
    ],
    codeSamples: [
      {
        title: 'Theme runtime API',
        code: useThemeSnippet,
        language: 'ts',
      },
      {
        title: 'Light theme excerpt',
        code: lightThemeCssExcerpt,
        language: 'css',
      },
      {
        title: 'Dark theme excerpt',
        code: darkThemeCssExcerpt,
        language: 'css',
      },
    ],
  },
  {
    id: 'tokens',
    title: 'Tokens',
    summary: 'Токены фиксируют стабильные дизайн-значения, которые не должны дублироваться по темам и компонентам.',
    description: 'Foundation tokens описывают palette scale, typography, spacing, radii, elevation и motion. Они лежат отдельно от theme layer, чтобы продукт мог переиспользовать базовый контракт и менять только semantic цвета.',
    narrativeSource: tokensCssExcerpt,
    sourcePath: 'packages/granularity/src/styles/tokens.css',
    keyPoints: [
      `В \`tokens.css\` уже вынесено ${foundationTokenCount} токенов и производных формул.`,
      'Практическое правило из docs: всё, что одинаково для тем, живёт в `tokens`, а не в theme files.',
      'Производные interaction values вроде `--gr-primary-hover` считаются от semantic-переменных и не требуют копирования по темам.',
    ],
    recommendations: [
      'Не переносите theme-specific цвета в foundation tokens — это усложнит поддержку `light`/`dark`.',
      'Переопределяйте token layer только когда хотите менять именно базовую шкалу, а не semantic тему.',
      'Показывайте токены рядом с примерами компонентов, чтобы было видно связь между design contract и UI.',
    ],
    codeSamples: [
      {
        title: 'Foundation tokens excerpt',
        code: tokensCssExcerpt,
        language: 'css',
      },
    ],
  },
  {
    id: 'unocss',
    title: 'UnoCSS integration',
    summary: '`presetGranularNode` из `@feugene/unocss-preset-granular/node` — единственный поддерживаемый способ интеграции пакета. Foundations показывает его прогрессию от базового конфига к продвинутому `granularContent`.',
    description: 'Интеграция с UnoCSS строится вокруг одного preset-а. `presetGranularNode` подмешивает foundation layers, темы и component CSS выбранных провайдеров; `granularContent` дополнительно настраивает авто-сканирование для subpath imports из собранного `dist/`.',
    narrativeSource: takeLeadingBlock(unocssDocSource, 92),
    sourcePath: 'packages/granularity/docs/unocss.md',
    keyPoints: [
      '`presetGranularNode({ providers: [granularityProvider] })` — минимальный рабочий конфиг, остальные опции опциональны.',
      '`components`, `themes`, `themeFiles`, `tokensFile`/`baseFile`, `layer` позволяют сузить бандл и управлять порядком CSS layers.',
      '`granularContent(options)` передаётся в top-level `content` user-config: `@unocss/vite` не читает `preset.content`.',
    ],
    recommendations: [
      'Начинайте с базового конфига и добавляйте опции пресета по мере реальной необходимости.',
      'Используйте `components`/`themes` для performance-полировки и контроля над размером CSS бандла.',
      'Подключайте `granularContent` сразу, как только компоненты импортируются через subpath из `dist/`.',
    ],
    codeSamples: [
      {
        title: 'Базовый `presetGranularNode`',
        code: presetBasicSnippet,
        language: 'ts',
      },
      {
        title: 'Продвинутый сценарий: `granularContent` + авто-сканирование',
        code: presetGranularContentSnippet,
        language: 'ts',
      },
      {
        title: 'Source doc excerpt',
        code: takeHeadingBlock(unocssDocSource, '## `@feugene/granularity/uno`'),
        language: 'md',
      },
    ],
  },
  {
    id: 'localization',
    title: 'Localization',
    summary: '`granularity` не навязывает свой i18n-движок и ожидает, что источником правды для переводов остаётся приложение.',
    description: 'Локализация в пакете устроена как integration contract: компоненты читают переводы из хост-приложения, а при их отсутствии используют встроенный fallback. Foundations page должна сделать это поведение прозрачным ещё до интеграции компонентных страниц.',
    narrativeSource: takeLeadingBlock(localizationDocSource, 86),
    sourcePath: 'packages/granularity/docs/localization.md',
    keyPoints: [
      'Пакет ожидает внешний i18n-слой и не создаёт собственный изолированный i18n runtime.',
      'При отсутствии перевода компонент использует fallback-текст и не ломает UI.',
      'Публичный entrypoint `@feugene/granularity/i18n` публикует `GRANULARITY_I18N_BLOCK`, per-locale `en`/`ru`/`es` и adapter types.',
    ],
    recommendations: [
      'Держите словари приложения и словари дизайн-системы в одном общем i18n-слое.',
      'Переопределяйте package-level тексты на стороне приложения, а не через форк пакета.',
      'Документируйте fallback-поведение рядом с компонентами, у которых есть встроенные интерфейсные строки.',
    ],
    codeSamples: [
      {
        title: 'Минимальная интеграция i18n слоя',
        code: localizationSnippet,
        language: 'ts',
      },
      {
        title: 'Source doc excerpt',
        code: takeHeadingBlock(localizationDocSource, '## Публичный API пакета'),
        language: 'md',
      },
    ],
  },
]

export const showcaseFoundationGuideRecord = Object.fromEntries(
  showcaseFoundationGuides.map(guide => [guide.id, guide]),
) as Record<ShowcaseFoundationGuide['id'], ShowcaseFoundationGuide>

export const showcaseOverviewChecklist = [
  'Showcase уже поднят как отдельное приложение без зависимости от legacy playground shell.',
  'Data layer собирает public registry, package-level exports и generated API metadata на build-time.',
  'Следующий этап после foundations — detail pages компонентов, директив, composables и utilities.',
]

export const showcaseFoundationsChecklist = [
  'Есть единая карта интеграции: быстрый старт, granular imports и UnoCSS preset path.',
  'Narrative docs подключены прямо из `packages/granularity/docs/*`, а themes/tokens — из source layers пакета.',
  'Foundations page объясняет различие между `tokens`, `theme` и component-level styles до перехода к detail pages.',
]

export const showcaseInstallationNarrative = takeHeadingBlock(installationDocSource, '## Какой способ подключения выбирать')
