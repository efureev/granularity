import installationDocSource from '../../../../packages/granularity/docs/installation.md?raw'
import localizationDocSource from '../../../../packages/granularity/docs/localization.md?raw'
import stylingDocSource from '../../../../packages/granularity/docs/styling.md?raw'
import granumDocSource from '../../../../packages/granularity/docs/granum.md?raw'
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

const granumBasicSnippet = `// granum.config.ts
import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  appSources: { dirs: ['src'] },
})`

const granumComponentsSnippet = `// granum.config.ts
import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  // Сужаем набор — в CSS попадут только эти компоненты и их зависимости.
  components: [
    { provider: '@feugene/granularity', names: ['GrButton', 'GrCard'] },
  ],
  appSources: { dirs: ['src'] },
})`

const granumThemesSnippet = `// granum.config.ts
import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: [
    { provider: '@feugene/granularity', names: ['GrButton', 'GrCard'] },
  ],
  // Оставляем только перечисленные темы; своя задаётся \`themes.define\`.
  themes: { names: ['light', 'dark'] },
  appSources: { dirs: ['src'] },
})`

const granumPruneSnippet = `// granum.config.ts
import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: [
    { provider: '@feugene/granularity', names: ['GrButton', 'GrCard'] },
  ],
  themes: { names: ['light', 'dark'] },
  appSources: { dirs: ['src'] },
  // Токены, которых не берёт ни компонент селекции, ни разметка приложения,
  // из CSS вырезаются. Порядок внедрения: 'report' → план в отчёте → 'on'.
  pruneTokens: { mode: 'on' },
})`

const granumGuardSnippet = `// granum.config.ts
import { defineGranumConfig } from '@feugene/granum/vite'
import { windEngine } from '@feugene/granum-engine-wind'

export default defineGranumConfig({
  engine: windEngine(),
  providers: ['@feugene/granularity'],
  components: [
    { provider: '@feugene/granularity', names: ['GrButton', 'GrCard'] },
  ],
  appSources: { dirs: ['src'] },
  // Импорт компонента вне селекции роняет сборку: его CSS в бандл не попал бы,
  // и компонент отрендерился бы голым.
  js: { guard: 'error' },
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
    id: 'quick-start-granum-basic',
    title: 'Шаг 1. Базовый `granum.config.ts`',
    description: 'Пакет подключается конвейером `@feugene/granum`: плагин `granum()` в `vite.config.ts`, конфиг рядом с ним, `import \'virtual:granum.css\'` в точке входа. Провайдер объявляется именем пакета — плагин найдёт его `granum.manifest.json` через `exports`.',
    code: granumBasicSnippet,
    language: 'ts',
    note: 'На этом уровне в сборку входят все компоненты провайдера, `tokens.css`, `base.css` и тема `light`. `engine` обязателен и принимает инстанс: своей реализации движка утилит granum не содержит. `appSources` тоже обязателен — оттуда берутся классы разметки самого приложения.',
  },
  {
    id: 'quick-start-granum-components',
    title: 'Шаг 2. Сужаем список компонентов',
    description: 'Опция `components` принимает список `{ provider, names }` и может быть собрана из нескольких провайдеров. Зависимости компонента перечислять не нужно: селекция замыкается транзитивно по графу из манифеста.',
    code: granumComponentsSnippet,
    language: 'ts',
    note: 'Сканирования `node_modules` в granum нет вовсе: классы компонентов и потребляемые ими токены посчитаны на сборке пакета и лежат в манифесте.',
  },
  {
    id: 'quick-start-granum-themes',
    title: 'Шаг 3. Ограничиваем набор тем',
    description: 'По умолчанию подключаются темы из `defaultThemes` провайдера. `themes.names` оставляет только перечисленные, `themes.define` добавляет свою тему (`extends` или `tokensRef`), `themes.tokenOverrides` переопределяет отдельные токены.',
    code: granumThemesSnippet,
    language: 'ts',
    note: 'Это рекомендуемая production-конфигурация для большинства приложений: контроль над составом компонентов и тем без ручной сборки CSS.',
  },
  {
    id: 'quick-start-granum-prune',
    title: 'Шаг 4. Обрезаем неиспользуемые токены',
    description: 'Пакет объявляет больше двух сотен токенов, а приложению с двумя компонентами нужна их малая часть. `pruneTokens` вырезает из CSS то, чего не берёт ни компонент селекции, ни разметка приложения.',
    code: granumPruneSnippet,
    language: 'ts',
    note: 'Внедряется в два шага: `mode: \'report\'` — посмотреть план в `dist/granum-report.json`, затем `\'on\'`. `appSources` при этом обязателен: токен, который приложение взяло само, иначе уедет из CSS при зелёной сборке.',
  },
  {
    id: 'quick-start-granum-guard',
    title: 'Шаг 5. Гард импорта вне селекции',
    description: 'Компонент, импортированный мимо селекции, собрался бы без своего CSS и отрендерился голым — ошибки при этом не было бы ни одной. `js.guard` превращает такой импорт в ошибку сборки.',
    code: granumGuardSnippet,
    language: 'ts',
    note: 'Альтернатива списку — `components: \'imports\'`: селекция считается по импортам и тегам в `appSources`, и вести список не нужно вовсе.',
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
    summary: 'Разделяет слои CSS — токены, базу, темы, CSS компонентов и утилиты, — чтобы приложение могло выбрать свой уровень контроля.',
    description: 'Стилизация в `granularity` строится на слоях `granum.tokens`, `granum.base`, `granum.themes`, `granum.components` и `granum.utilities`: granum собирает их в один `virtual:granum.css` по манифестам выбранных компонентов. Без granum остаётся статический `styles.css` — токены, темы, base и preflight, но без утилит и CSS компонентов. Foundations page должна объяснять этот контракт раньше, чем пользователь откроет первую компонентную страницу.',
    narrativeSource: takeLeadingBlock(stylingDocSource),
    sourcePath: 'packages/granularity/docs/styling.md',
    keyPoints: [
      '`tokens.css` хранит шкалы, формулы, типографику и базовые дизайн-токены.',
      '`base.css` добавляет foundation rules поверх токенов и тем: reset и кламп движения по `prefers-reduced-motion`.',
      'Собственный `styles.css` компонента granum берёт из манифеста в слой `granum.components`: JS-чанк компонента CSS не импортирует.',
    ],
    recommendations: [
      'Подключайте CSS одним `virtual:granum.css` через плагин `granum()`, а не ручными импортами слоёв.',
      'Минимальный CSS даёт селекция granum: `components`, `themes.names` и `pruneTokens`. Подпутей `components/<Name>/styles.css` пакет не публикует — CSS компонента granum берёт из манифеста.',
      'Для кастомной темы оставляйте foundation layers пакета и подменяйте только semantic theme layer.',
    ],
    codeSamples: [
      {
        title: 'Без granum: статический лист',
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
    id: 'granum',
    title: 'Интеграция с `granum`',
    summary: 'Пакет собирается конвейером [`@feugene/granum`](https://github.com/efureev/granum) и публикует рядом с `dist` машинно-порождённый `granum.manifest.json`. Приложение читает манифест и по своей селекции собирает CSS.',
    description: 'Плагин `granum()` из `@feugene/granum/vite` отдаёт виртуальные модули: `virtual:granum.css` (весь CSS в пяти слоях каскада), `virtual:granum/layers/<layer>.css` (один слой), `virtual:granum/components` (реэкспорт селекции) и `virtual:granum/themes` (манифест тем для рантайма). Движок утилит выбирает приложение — своей реализации granum не содержит, поэтому рядом с конвейером ставится `@feugene/granum-engine-wind`.',
    narrativeSource: takeLeadingBlock(granumDocSource, 92),
    sourcePath: 'packages/granularity/docs/granum.md',
    keyPoints: [
      '`engine` обязателен и принимает **инстанс**: строку или объект опций granum отклоняет с путём до поля.',
      'Сканирования `node_modules` нет: классы компонентов и потребляемые ими токены посчитаны на сборке пакета и лежат в манифесте.',
      'Пакет объявляет диалект словаря `unocss/preset-wind3+granum@66`; движок другого словаря доктор показывает поимённо, а не даёт тихо недорисованные компоненты.',
    ],
    recommendations: [
      'Начинайте с базового конфига и добавляйте опции по мере реальной необходимости.',
      'Используйте `components`/`themes`/`pruneTokens` для контроля над размером CSS, а `js.guard` — чтобы импорт вне селекции падал, а не рисовался голым.',
      'Иконку классом (`i-lucide-*`) генерирует не пакет: либо передавайте иконку компонентом, либо давайте правило фабрике движка — `windEngine({ rules: [...] })`.',
    ],
    codeSamples: [
      {
        title: 'Базовый `granum.config.ts`',
        code: granumBasicSnippet,
        language: 'ts',
      },
      {
        title: 'Обрезка неиспользуемых токенов',
        code: granumPruneSnippet,
        language: 'ts',
      },
      {
        title: 'Source doc excerpt',
        code: takeHeadingBlock(granumDocSource, '## Словарь утилит: диалект и отпечаток'),
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
  'Есть единая карта интеграции: быстрый старт на `granum.config.ts`, granular imports и production-селекция компонентов, тем и токенов.',
  'Narrative docs подключены прямо из `packages/granularity/docs/*`, а themes/tokens — из source layers пакета.',
  'Foundations page объясняет различие между `tokens`, `theme` и component-level styles до перехода к detail pages.',
]

export const showcaseInstallationNarrative = takeHeadingBlock(installationDocSource, '## Подключение к `Vite`')
