import installationDocSource from '../../../../packages/granularity/docs/installation.md?raw'
import localizationDocSource from '../../../../packages/granularity/docs/localization.md?raw'
import stylingDocSource from '../../../../packages/granularity/docs/styling.md?raw'
import unocssDocSource from '../../../../packages/granularity/docs/unocss.md?raw'
import { granularityDefaultThemes, granularityThemeNames } from '@feugene/granularity/granular-provider'

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
    case 'Action role fallbacks':
      return 'Fallbacks / action roles'
    case 'Status role fallbacks':
      return 'Fallbacks / status roles'
    case 'Component semantic fallbacks':
      return 'Fallbacks / component semantics'
    default:
      return section
  }
}

function getFoundationTokenDescription(name: string, section: string) {
  if (name.startsWith('--gr-slate-')) {
    const shade = name.split('-').at(-1)
    return `Нейтральный оттенок slate ${shade} для базовой palette scale, поверхностей и бордеров.`
  }

  if (name === '--gr-font-ui')
    return 'Основной стек шрифта для интерфейсного текста и большинства компонентных подписей.'

  if (name === '--gr-font-mono')
    return 'Моноширинный стек для кода, числовых значений и технических подписей.'

  if (name.startsWith('--gr-text-')) {
    const size = name.replace('--gr-text-', '')
    return `Размер шрифта \`${size}\` из типографической шкалы foundation tokens.`
  }

  if (name.startsWith('--gr-leading-')) {
    const density = name.replace('--gr-leading-', '')
    return `Коэффициент межстрочного интервала \`${density}\` для текстовых блоков и подписей.`
  }

  if (name.startsWith('--gr-font-')) {
    const weight = name.replace('--gr-font-', '')
    return `Вес шрифта \`${weight}\` для типографической иерархии интерфейса.`
  }

  if (name.startsWith('--gr-space-')) {
    const step = name.replace('--gr-space-', '')
    return `Шаг spacing scale \`${step}\` для отступов, gap и внутренних paddings.`
  }

  if (name.startsWith('--gr-container-')) {
    if (name.includes('padding'))
      return 'Горизонтальный контейнерный отступ для соответствующего breakpoint-сценария.'

    return 'Максимальная ширина layout-контейнера для контентных страниц и shell-структур.'
  }

  if (name.startsWith('--gr-bp-')) {
    const breakpoint = name.replace('--gr-bp-', '')
    return `Foundation breakpoint \`${breakpoint}\` для адаптивных layout-решений.`
  }

  if (name === '--radius')
    return 'Совместимый alias базового радиуса для интеграций, ожидающих shadcn-style token contract.'

  if (name.startsWith('--gr-radius-')) {
    const radius = name.replace('--gr-radius-', '')
    return `Радиус скругления \`${radius}\` для углов компонентов и поверхностей.`
  }

  if (name.startsWith('--gr-shadow-')) {
    const level = name.replace('--gr-shadow-', '')
    return `Уровень elevation \`${level}\` для карточек, popover-слоёв и акцентных поверхностей.`
  }

  if (name.startsWith('--gr-duration-')) {
    const speed = name.replace('--gr-duration-', '')
    return `Базовая длительность анимации \`${speed}\` для transitions и state changes.`
  }

  if (name.startsWith('--gr-ease-')) {
    const easing = name.replace('--gr-ease-', '')
    return `Кривая ускорения \`${easing}\` для motion-паттернов дизайн-системы.`
  }

  if (name.startsWith('--primary-') || name.startsWith('--secondary-') || name.startsWith('--brd-') || name.startsWith('--destructive-'))
    return 'Производное interaction-состояние, вычисляемое из semantic theme roles для hover/active поведения.'

  if (name.startsWith('--gr-success-') || name.startsWith('--gr-warning-') || name.startsWith('--gr-danger-') || name.startsWith('--gr-info-'))
    return 'Производное status-состояние, вычисляемое из semantic статусных цветов для hover/active сценариев.'

  return `Токен из группы \`${section}\` в текущем foundation contract пакета.`
}

function getThemeTokenDescription(name: string, section: string) {
  const descriptions: Record<string, string> = {
    '--bg': 'Базовый фон приложения и крупных layout-поверхностей текущей темы.',
    '--fg': 'Основной цвет текста и иконок поверх базового фона текущей темы.',
    '--card': 'Фон карточек, панелей и других поднятых поверхностей.',
    '--card-fg': 'Цвет контента внутри карточек и raised surface-блоков.',
    '--popover': 'Фон popover-, dropdown- и overlay-поверхностей.',
    '--popover-fg': 'Цвет текста и иконок внутри popover-слоёв.',
    '--muted': 'Приглушённая поверхность для вторичных блоков, плашек и заполнений.',
    '--muted-fg': 'Вторичный текстовый цвет для helper-копии и менее важных подписей.',
    '--secondary': 'Нейтральная secondary action/surface-подложка без сильного бренд-акцента.',
    '--secondary-fg': 'Контрастный текст для secondary-кнопок и поверхностей.',
    '--brd': 'Базовый цвет бордеров и разделителей текущей темы.',
    '--input': 'Цвет рамки и фона input-like контролов в состоянии покоя.',
    '--ring': 'Цвет focus-ring и акцентного outline для интерактивных компонентов.',
    '--primary': 'Главный brand/action цвет темы для primary CTA и ключевых акцентов.',
    '--primary-fg': 'Контрастный текст и иконки поверх primary-заливки.',
    '--accent': 'Мягкая акцентная поверхность для selected/hovered областей и подсветок.',
    '--accent-fg': 'Цвет текста поверх accent-подложек.',
    '--destructive': 'Цвет destructive action-сценариев и критических состояний.',
    '--destructive-fg': 'Контрастный текст и иконки поверх destructive-заливки.',
    '--gr-success': 'Основной semantic success-цвет для статусов, бейджей и уведомлений.',
    '--gr-success-light': 'Облегчённая success-подложка для мягких статусов и подсветок.',
    '--gr-success-fg': 'Контрастный текст и иконки поверх success-заливки.',
    '--gr-success-text': 'Текстовый оттенок для success-сообщений на светлой подложке.',
    '--gr-warning': 'Основной semantic warning-цвет для предупреждений и промежуточных статусов.',
    '--gr-warning-light': 'Облегчённая warning-подложка для мягких warning-состояний.',
    '--gr-warning-fg': 'Контрастный текст и иконки поверх warning-заливки.',
    '--gr-warning-text': 'Текстовый оттенок для warning-сообщений на мягкой warning-подложке.',
    '--gr-danger': 'Semantic danger-цвет для ошибок, рисков и критических сообщений.',
    '--gr-danger-light': 'Облегчённая danger-подложка для мягких error-состояний.',
    '--gr-danger-fg': 'Контрастный текст и иконки поверх danger-заливки.',
    '--gr-danger-text': 'Текстовый оттенок для error-сообщений на мягкой danger-подложке.',
    '--gr-info': 'Semantic info-цвет для нейтральных уведомлений и информационных акцентов.',
    '--gr-info-light': 'Облегчённая info-подложка для спокойных информационных блоков.',
    '--gr-info-fg': 'Контрастный текст и иконки поверх info-заливки.',
    '--gr-info-text': 'Текстовый оттенок для спокойных info-сообщений и подсказок.',
    '--gr-slate': 'Нейтральный semantic slate-цвет для subdued индикаторов и secondary статусов.',
    '--gr-slate-light': 'Облегчённая slate-подложка для мягких нейтральных состояний.',
    '--gr-slate-fg': 'Контрастный текст и иконки поверх slate-заливки.',
    '--gr-slate-text': 'Текстовый оттенок для нейтральных slate-сообщений и плашек.',
    '--gr-azure': 'Semantic azure-цвет для информационных акцентов и вспомогательных статусов.',
    '--gr-azure-light': 'Облегчённая azure-подложка для мягких informational поверхностей.',
    '--gr-azure-fg': 'Контрастный текст и иконки поверх azure-заливки.',
    '--gr-azure-text': 'Текстовый оттенок для azure-плашек и спокойных informational блоков.',
    '--chart-1': 'Первый цвет серии для графиков и data-visualization элементов.',
    '--chart-2': 'Второй цвет серии для графиков и data-visualization элементов.',
    '--chart-3': 'Третий цвет серии для графиков и data-visualization элементов.',
    '--chart-4': 'Четвёртый цвет серии для графиков и data-visualization элементов.',
    '--chart-5': 'Пятый цвет серии для графиков и data-visualization элементов.',
    '--sidebar': 'Фон sidebar/navigation rail области текущей темы.',
    '--sidebar-fg': 'Основной текст и иконки внутри sidebar.',
    '--sidebar-primary': 'Акцентный цвет активных/ключевых элементов внутри sidebar.',
    '--sidebar-primary-fg': 'Контрастный текст поверх sidebar primary-акцентов.',
    '--sidebar-accent': 'Мягкий accent-фон для hover/selected состояний в sidebar.',
    '--sidebar-accent-fg': 'Цвет текста поверх sidebar accent-подложек.',
    '--sidebar-brd': 'Бордеры и разделители sidebar-области.',
    '--sidebar-ring': 'Focus-ring для интерактивных элементов внутри sidebar.',
    '--gr-category-tree-branch-line-active-color': 'Semantic цвет активной ветки category tree и подобных композитных компонентов.',
    '--primary-hover': 'Fallback-цвет hover-состояния для primary action без поддержки `color-mix`.',
    '--primary-active': 'Fallback-цвет active-состояния для primary action без поддержки `color-mix`.',
    '--secondary-hover': 'Fallback-цвет hover-состояния для secondary action без поддержки `color-mix`.',
    '--secondary-active': 'Fallback-цвет active-состояния для secondary action без поддержки `color-mix`.',
    '--brd-hover': 'Fallback-цвет hover-состояния для border/outline-элементов без поддержки `color-mix`.',
    '--brd-active': 'Fallback-цвет active-состояния для border/outline-элементов без поддержки `color-mix`.',
    '--destructive-hover': 'Fallback-цвет hover-состояния для destructive action без поддержки `color-mix`.',
    '--destructive-active': 'Fallback-цвет active-состояния для destructive action без поддержки `color-mix`.',
    '--gr-success-hover': 'Fallback-цвет hover-состояния для success-ролей без поддержки `color-mix`.',
    '--gr-success-active': 'Fallback-цвет active-состояния для success-ролей без поддержки `color-mix`.',
    '--gr-warning-hover': 'Fallback-цвет hover-состояния для warning-ролей без поддержки `color-mix`.',
    '--gr-warning-active': 'Fallback-цвет active-состояния для warning-ролей без поддержки `color-mix`.',
    '--gr-danger-hover': 'Fallback-цвет hover-состояния для danger-ролей без поддержки `color-mix`.',
    '--gr-danger-active': 'Fallback-цвет active-состояния для danger-ролей без поддержки `color-mix`.',
    '--gr-info-hover': 'Fallback-цвет hover-состояния для info-ролей без поддержки `color-mix`.',
    '--gr-info-active': 'Fallback-цвет active-состояния для info-ролей без поддержки `color-mix`.',
    '--gr-slate-hover': 'Fallback-цвет hover-состояния для slate-ролей без поддержки `color-mix`.',
    '--gr-slate-active': 'Fallback-цвет active-состояния для slate-ролей без поддержки `color-mix`.',
    '--gr-azure-hover': 'Fallback-цвет hover-состояния для azure-ролей без поддержки `color-mix`.',
    '--gr-azure-active': 'Fallback-цвет active-состояния для azure-ролей без поддержки `color-mix`.',
  }

  return descriptions[name] ?? `Theme token из группы \`${section}\`, задающий semantic цветовой контракт текущего режима.`
}

function parseFoundationTokens(source: string): ShowcaseFoundationToken[] {
  const lines = source.trim().split('\n')
  const tokens: ShowcaseFoundationToken[] = []
  let currentSection = 'Foundation tokens'

  for (const line of lines) {
    const commentMatch = line.match(/\/\*\s*(.*?)\s*\*\//)

    if (commentMatch) {
      currentSection = normalizeFoundationTokenSection(commentMatch[1])
      continue
    }

    const tokenMatch = line.match(/^\s*(--[\w-]+):\s*(.+);$/)

    if (!tokenMatch)
      continue

    const [, name, rawValue] = tokenMatch
    const value = rawValue.trim()

    tokens.push({
      name,
      value,
      hexValue: extractHexValue(value),
      description: getFoundationTokenDescription(name, currentSection),
      section: currentSection,
    })
  }

  return tokens
}

function parseThemeTokens(sourceByTheme: Record<ShowcaseThemeName, string>): ShowcaseThemeToken[] {
  const themeTokens = new Map<string, ShowcaseThemeToken>()

  for (const themeName of granularityThemeNames) {
    const lines = sourceByTheme[themeName].trim().split('\n')
    let currentSection = 'Theme tokens'

    for (const line of lines) {
      const commentMatch = line.match(/\/\*\s*(.*?)\s*\*\//)

      if (commentMatch) {
        currentSection = normalizeThemeTokenSection(commentMatch[1])
        continue
      }

      const tokenMatch = line.match(/^\s*(--[\w-]+):\s*(.+);$/)

      if (!tokenMatch)
        continue

      const [, name, rawValue] = tokenMatch
      const value = rawValue.trim()
      const existingToken = themeTokens.get(name)

      if (existingToken) {
        existingToken.values[themeName] = {
          value,
          hexValue: extractHexValue(value),
        }
        continue
      }

      const tokenValues = Object.fromEntries(
        granularityThemeNames.map(theme => [
          theme,
          {
            value: '',
            hexValue: null,
          },
        ]),
      ) as ShowcaseThemeToken['values']

      tokenValues[themeName] = {
        value,
        hexValue: extractHexValue(value),
      }

      themeTokens.set(name, {
        name,
        section: currentSection,
        description: getThemeTokenDescription(name, currentSection),
        values: tokenValues,
      })
    }
  }

  return [...themeTokens.values()]
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

const tokensCssSource = `:root {
  /* Foundations: neutral palette */
  --gr-slate-0: #ffffff;
  --gr-slate-50: #f8fafc;
  --gr-slate-100: #f1f5f9;
  --gr-slate-200: #e2e8f0;
  --gr-slate-300: #cbd5e1;
  --gr-slate-400: #94a3b8;
  --gr-slate-500: #64748b;
  --gr-slate-600: #475569;
  --gr-slate-700: #334155;
  --gr-slate-800: #1e293b;
  --gr-slate-900: #0f172a;

  /* Typography: font families */
  --gr-font-ui: Inter, Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif;
  --gr-font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;

  /* Typography: font sizes */
  --gr-text-xs: 12px;
  --gr-text-sm: 14px;
  --gr-text-base: 16px;
  --gr-text-lg: 18px;
  --gr-text-xl: 20px;
  --gr-text-2xl: 24px;
  --gr-text-3xl: 30px;
  --gr-text-4xl: 36px;

  /* Typography: line heights */
  --gr-leading-tight: 1.25;
  --gr-leading-normal: 1.5;
  --gr-leading-relaxed: 1.625;

  /* Typography: font weights */
  --gr-font-regular: 400;
  --gr-font-medium: 500;
  --gr-font-semibold: 600;
  --gr-font-bold: 700;

  /* Layout: spacing scale */
  --gr-space-0: 0px;
  --gr-space-1: 4px;
  --gr-space-2: 8px;
  --gr-space-3: 12px;
  --gr-space-4: 16px;
  --gr-space-5: 20px;
  --gr-space-6: 24px;
  --gr-space-8: 32px;
  --gr-space-10: 40px;
  --gr-space-12: 48px;
  --gr-space-16: 64px;
  --gr-space-20: 80px;
  --gr-space-24: 96px;
  --gr-space-32: 128px;
  --gr-space-40: 160px;
  --gr-space-48: 192px;
  --gr-space-64: 256px;

  /* Layout: containers */
  --gr-container-max: 1280px;
  --gr-container-max-2xl: 1440px;
  --gr-container-padding-mobile: 16px;
  --gr-container-padding-tablet: 24px;
  --gr-container-padding-desktop: 32px;

  /* Layout: breakpoints */
  --gr-bp-sm: 640px;
  --gr-bp-md: 768px;
  --gr-bp-lg: 1024px;
  --gr-bp-xl: 1280px;
  --gr-bp-2xl: 1536px;

  /* Shapes: radii and compatibility aliases */
  --radius: 0.5rem;
  --gr-radius-none: 0px;
  --gr-radius-sm: 4px;
  --gr-radius-md: 8px;
  --gr-radius-lg: 12px;
  --gr-radius-xl: 16px;
  --gr-radius-full: 9999px;

  /* Elevation */
  --gr-shadow-0: none;
  --gr-shadow-1: 0 1px 2px rgba(15, 23, 42, 0.08);
  --gr-shadow-2: 0 8px 24px rgba(15, 23, 42, 0.14);
  --gr-shadow-3: 0 16px 48px rgba(15, 23, 42, 0.20);

  /* Motion */
  --gr-duration-fast: 150ms;
  --gr-duration-base: 200ms;
  --gr-duration-slow: 300ms;
  --gr-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --gr-ease-in: cubic-bezier(0.7, 0, 0.84, 0);

  /* Derived interaction formulas: action roles */
  --primary-hover: color-mix(in srgb, var(--primary) 92%, var(--fg));
  --primary-active: color-mix(in srgb, var(--primary) 84%, var(--fg));
  --secondary-hover: color-mix(in srgb, var(--secondary) 92%, var(--fg));
  --secondary-active: color-mix(in srgb, var(--secondary) 84%, var(--fg));
  --brd-hover: color-mix(in srgb, var(--brd) 70%, var(--fg));
  --brd-active: color-mix(in srgb, var(--brd) 55%, var(--fg));
  --destructive-hover: color-mix(in srgb, var(--destructive) 92%, var(--fg));
  --destructive-active: color-mix(in srgb, var(--destructive) 84%, var(--fg));

  /* Derived interaction formulas: status roles */
  --gr-success-hover: color-mix(in srgb, var(--gr-success) 92%, var(--fg));
  --gr-success-active: color-mix(in srgb, var(--gr-success) 84%, var(--fg));
  --gr-warning-hover: color-mix(in srgb, var(--gr-warning) 92%, var(--fg));
  --gr-warning-active: color-mix(in srgb, var(--gr-warning) 84%, var(--fg));
  --gr-danger-hover: color-mix(in srgb, var(--gr-danger) 92%, var(--fg));
  --gr-danger-active: color-mix(in srgb, var(--gr-danger) 84%, var(--fg));
  --gr-info-hover: color-mix(in srgb, var(--gr-info) 92%, var(--fg));
  --gr-info-active: color-mix(in srgb, var(--gr-info) 84%, var(--fg));
}`

const lightThemeCssSource = `:root {
  /* Surface roles */
  --bg: #f8fafc;
  --fg: #0f172a;
  --card: #ffffff;
  --card-fg: #0f172a;
  --popover: #ffffff;
  --popover-fg: #0f172a;
  --muted: #f1f5f9;
  --muted-fg: #64748b;
  --secondary: #e2e8f0;
  --secondary-fg: #1e293b;
  --brd: #e2e8f0;
  --input: #e2e8f0;
  --ring: #6366f1;

  /* Action roles */
  --primary: #4f46e5;
  --primary-fg: #ffffff;
  --accent: #eef2ff;
  --accent-fg: #3730a3;
  --destructive: #dc2626;
  --destructive-fg: #ffffff;

  /* Status roles */
  --gr-success: #10b981;
  --gr-success-light: #d1fae5;
  --gr-success-fg: #ffffff;
  --gr-success-text: #065f46;
  --gr-warning: #f97316;
  --gr-warning-light: #ffedd5;
  --gr-warning-fg: #ffffff;
  --gr-warning-text: #7c2d12;
  --gr-danger: #dc2626;
  --gr-danger-light: #fee2e2;
  --gr-danger-fg: #ffffff;
  --gr-danger-text: #991b1b;
  --gr-info: #5850ec;
  --gr-info-light: #e0e7ff;
  --gr-info-fg: #ffffff;
  --gr-info-text: #3730a3;
  --gr-slate: #475569;
  --gr-slate-light: #e2e8f0;
  --gr-slate-fg: #ffffff;
  --gr-slate-text: #334155;
  --gr-azure: #0ea5e9;
  --gr-azure-light: #e0f2fe;
  --gr-azure-fg: #ffffff;
  --gr-azure-text: #075985;

  /* Data visualization roles */
  --chart-1: #4f46e5;
  --chart-2: #10b981;
  --chart-3: #f97316;
  --chart-4: #6366f1;
  --chart-5: #8b5cf6;

  /* Navigation roles */
  --sidebar: #ffffff;
  --sidebar-fg: #0f172a;
  --sidebar-primary: #4f46e5;
  --sidebar-primary-fg: #ffffff;
  --sidebar-accent: #f1f5f9;
  --sidebar-accent-fg: #1e293b;
  --sidebar-brd: #e2e8f0;
  --sidebar-ring: #6366f1;

  /* Component semantic roles */
  --gr-category-tree-branch-line-active-color: color-mix(in srgb, var(--primary) 20%, var(--brd));
}

@supports not (color: color-mix(in srgb, #000 50%, #fff)) {
  :root {
    /* Action role fallbacks */
    --primary-hover: #4a42d6;
    --primary-active: #453ec7;
    --secondary-hover: #d1d7e0;
    --secondary-active: #c0c7d0;
    --brd-hover: #a3a9b5;
    --brd-active: #838a97;
    --destructive-hover: #cc2526;
    --destructive-active: #bb2427;

    /* Status role fallbacks */
    --gr-success-hover: #10ac7a;
    --gr-success-active: #109f73;
    --gr-warning-hover: #e66c18;
    --gr-warning-active: #d46419;
    --gr-danger-hover: #cc2526;
    --gr-danger-active: #bb2427;
    --gr-info-hover: #5c60e1;
    --gr-info-active: #5659d1;
    --gr-slate-hover: #435062;
    --gr-slate-active: #3d4a5b;
    --gr-azure-hover: #0284c7;
    --gr-azure-active: #0369a1;

    /* Component semantic fallbacks */
    --gr-category-tree-branch-line-active-color: #c4cdf7;
  }
}`

const darkThemeCssSource = `.theme-dark,
.dark,
[data-theme='dark'] {
  /* Surface roles */
  --bg: #0f172a;
  --fg: #f8fafc;
  --card: #1e293b;
  --card-fg: #f8fafc;
  --popover: #1e293b;
  --popover-fg: #f8fafc;
  --muted: #334155;
  --muted-fg: #94a3b8;
  --secondary: #334155;
  --secondary-fg: #f1f5f9;
  --brd: #334155;
  --input: #334155;
  --ring: #818cf8;

  /* Action roles */
  --primary: #6366f1;
  --primary-fg: #ffffff;
  --accent: #1e1b4b;
  --accent-fg: #c7d2fe;
  --destructive: #ef4444;
  --destructive-fg: #ffffff;

  /* Status roles */
  --gr-success: #34d399;
  --gr-success-light: #064e3b;
  --gr-success-fg: #0f172a;
  --gr-success-text: #6ee7b7;
  --gr-warning: #fb923c;
  --gr-warning-light: #7c2d12;
  --gr-warning-fg: #0f172a;
  --gr-warning-text: #fdba74;
  --gr-danger: #f87171;
  --gr-danger-light: #7f1d1d;
  --gr-danger-fg: #0f172a;
  --gr-danger-text: #fca5a5;
  --gr-info: #818cf8;
  --gr-info-light: #312e81;
  --gr-info-fg: #0f172a;
  --gr-info-text: #c7d2fe;
  --gr-slate: #94a3b8;
  --gr-slate-light: #334155;
  --gr-slate-fg: #0f172a;
  --gr-slate-text: #cbd5e1;
  --gr-azure: #38bdf8;
  --gr-azure-light: #0c4a6e;
  --gr-azure-fg: #0f172a;
  --gr-azure-text: #bae6fd;

  /* Data visualization roles */
  --chart-1: #6366f1;
  --chart-2: #34d399;
  --chart-3: #fb923c;
  --chart-4: #818cf8;
  --chart-5: #a78bfa;

  /* Navigation roles */
  --sidebar: #1e293b;
  --sidebar-fg: #f8fafc;
  --sidebar-primary: #6366f1;
  --sidebar-primary-fg: #ffffff;
  --sidebar-accent: #334155;
  --sidebar-accent-fg: #f1f5f9;
  --sidebar-brd: #334155;
  --sidebar-ring: #818cf8;

  /* Component semantic roles */
  --gr-category-tree-branch-line-active-color: color-mix(in srgb, var(--primary) 38%, var(--brd));
}

@supports not (color: color-mix(in srgb, #000 50%, #fff)) {
  .theme-dark,
  .dark,
  [data-theme='dark'] {
    /* Action role fallbacks */
    --primary-hover: #6f72f2;
    --primary-active: #7b7ef3;
    --secondary-hover: #435062;
    --secondary-active: #535f70;
    --brd-hover: #6e7987;
    --brd-active: #8c94a0;
    --destructive-hover: #f05353;
    --destructive-active: #f06161;

    /* Status role fallbacks */
    --gr-success-hover: #44d6a1;
    --gr-success-active: #53d9a9;
    --gr-warning-hover: #fb9a4b;
    --gr-warning-active: #fba35b;
    --gr-danger-hover: #f87c7c;
    --gr-danger-active: #f88787;
    --gr-info-hover: #8b95f8;
    --gr-info-active: #949ef9;
    --gr-slate-hover: #9faec0;
    --gr-slate-active: #aab7c8;
    --gr-azure-hover: #4bc3f9;
    --gr-azure-active: #5dcbf9;

    /* Component semantic fallbacks */
    --gr-category-tree-branch-line-active-color: #505b8c;
  }
}`

export const showcaseFoundationTokens = parseFoundationTokens(tokensCssSource)

export const showcaseThemeTokens = parseThemeTokens({
  light: lightThemeCssSource,
  dark: darkThemeCssSource,
})

const foundationTokenCount = showcaseFoundationTokens.length

const foundationBaseCssExcerpt = `html,
body {
  height: 100%;
}

body {
  margin: 0;
  font-family: var(--gr-font-ui);
  background: var(--bg);
  color: var(--fg);
}

:where(a, button) {
  background-color: transparent;
}`

const lightThemeCssExcerpt = `:root {
  --bg: #f8fafc;
  --fg: #0f172a;
  --card: #ffffff;
  --muted: #f1f5f9;
  --brd: #e2e8f0;
  --ring: #6366f1;
  --primary: #4f46e5;
  --primary-fg: #ffffff;
  --gr-success: #10b981;
  --gr-warning: #f97316;
  --gr-danger: #dc2626;
  --gr-info: #6366f1;
}`

const darkThemeCssExcerpt = `.theme-dark,
.dark,
[data-theme='dark'] {
  --bg: #0f172a;
  --fg: #f8fafc;
  --card: #1e293b;
  --muted: #334155;
  --brd: #334155;
  --ring: #818cf8;
  --primary: #6366f1;
  --primary-fg: #ffffff;
  --gr-success: #34d399;
  --gr-warning: #fb923c;
  --gr-danger: #f87171;
  --gr-info: #818cf8;
}`

const tokensCssExcerpt = takeLeadingBlock(tokensCssSource, 46)

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
    description: 'Theme layer определяет semantic значения вроде `--bg`, `--primary`, `--brd` и статусные роли. Это позволяет использовать один набор foundations и переключать только визуальный режим.',
    narrativeSource: takeHeadingBlock(stylingDocSource, '## Встроенные темы'),
    sourcePath: 'packages/granularity/docs/styling.md',
    keyPoints: [
      `Пакет публикует встроенные темы: ${granularityThemeNames.join(', ')}.`,
      '`light.css` использует `:root`, а `dark.css` поддерживает `.theme-dark`, `.dark` и `[data-theme=\'dark\']`.',
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
      'Производные interaction values вроде `--primary-hover` считаются от semantic-переменных и не требуют копирования по темам.',
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