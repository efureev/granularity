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
  if (name.startsWith('--ds-slate-')) {
    const shade = name.split('-').at(-1)
    return `Нейтральный оттенок slate ${shade} для базовой palette scale, поверхностей и бордеров.`
  }

  if (name === '--ds-font-ui')
    return 'Основной стек шрифта для интерфейсного текста и большинства компонентных подписей.'

  if (name === '--ds-font-mono')
    return 'Моноширинный стек для кода, числовых значений и технических подписей.'

  if (name.startsWith('--ds-text-')) {
    const size = name.replace('--ds-text-', '')
    return `Размер шрифта \`${size}\` из типографической шкалы foundation tokens.`
  }

  if (name.startsWith('--ds-leading-')) {
    const density = name.replace('--ds-leading-', '')
    return `Коэффициент межстрочного интервала \`${density}\` для текстовых блоков и подписей.`
  }

  if (name.startsWith('--ds-font-')) {
    const weight = name.replace('--ds-font-', '')
    return `Вес шрифта \`${weight}\` для типографической иерархии интерфейса.`
  }

  if (name.startsWith('--ds-space-')) {
    const step = name.replace('--ds-space-', '')
    return `Шаг spacing scale \`${step}\` для отступов, gap и внутренних paddings.`
  }

  if (name.startsWith('--ds-container-')) {
    if (name.includes('padding'))
      return 'Горизонтальный контейнерный отступ для соответствующего breakpoint-сценария.'

    return 'Максимальная ширина layout-контейнера для контентных страниц и shell-структур.'
  }

  if (name.startsWith('--ds-bp-')) {
    const breakpoint = name.replace('--ds-bp-', '')
    return `Foundation breakpoint \`${breakpoint}\` для адаптивных layout-решений.`
  }

  if (name === '--radius')
    return 'Совместимый alias базового радиуса для интеграций, ожидающих shadcn-style token contract.'

  if (name.startsWith('--ds-radius-')) {
    const radius = name.replace('--ds-radius-', '')
    return `Радиус скругления \`${radius}\` для углов компонентов и поверхностей.`
  }

  if (name.startsWith('--ds-shadow-')) {
    const level = name.replace('--ds-shadow-', '')
    return `Уровень elevation \`${level}\` для карточек, popover-слоёв и акцентных поверхностей.`
  }

  if (name.startsWith('--ds-duration-')) {
    const speed = name.replace('--ds-duration-', '')
    return `Базовая длительность анимации \`${speed}\` для transitions и state changes.`
  }

  if (name.startsWith('--ds-ease-')) {
    const easing = name.replace('--ds-ease-', '')
    return `Кривая ускорения \`${easing}\` для motion-паттернов дизайн-системы.`
  }

  if (name.startsWith('--primary-') || name.startsWith('--secondary-') || name.startsWith('--brd-') || name.startsWith('--destructive-'))
    return 'Производное interaction-состояние, вычисляемое из semantic theme roles для hover/active поведения.'

  if (name.startsWith('--ds-success-') || name.startsWith('--ds-warning-') || name.startsWith('--ds-danger-') || name.startsWith('--ds-info-'))
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
    '--ds-success': 'Основной semantic success-цвет для статусов, бейджей и уведомлений.',
    '--ds-success-light': 'Облегчённая success-подложка для мягких статусов и подсветок.',
    '--ds-success-fg': 'Контрастный текст и иконки поверх success-заливки.',
    '--ds-success-text': 'Текстовый оттенок для success-сообщений на светлой подложке.',
    '--ds-warning': 'Основной semantic warning-цвет для предупреждений и промежуточных статусов.',
    '--ds-warning-light': 'Облегчённая warning-подложка для мягких warning-состояний.',
    '--ds-warning-fg': 'Контрастный текст и иконки поверх warning-заливки.',
    '--ds-warning-text': 'Текстовый оттенок для warning-сообщений на мягкой warning-подложке.',
    '--ds-danger': 'Semantic danger-цвет для ошибок, рисков и критических сообщений.',
    '--ds-danger-light': 'Облегчённая danger-подложка для мягких error-состояний.',
    '--ds-danger-fg': 'Контрастный текст и иконки поверх danger-заливки.',
    '--ds-danger-text': 'Текстовый оттенок для error-сообщений на мягкой danger-подложке.',
    '--ds-info': 'Semantic info-цвет для нейтральных уведомлений и информационных акцентов.',
    '--ds-info-light': 'Облегчённая info-подложка для спокойных информационных блоков.',
    '--ds-info-fg': 'Контрастный текст и иконки поверх info-заливки.',
    '--ds-info-text': 'Текстовый оттенок для спокойных info-сообщений и подсказок.',
    '--ds-slate': 'Нейтральный semantic slate-цвет для subdued индикаторов и secondary статусов.',
    '--ds-slate-light': 'Облегчённая slate-подложка для мягких нейтральных состояний.',
    '--ds-slate-fg': 'Контрастный текст и иконки поверх slate-заливки.',
    '--ds-slate-text': 'Текстовый оттенок для нейтральных slate-сообщений и плашек.',
    '--ds-azure': 'Semantic azure-цвет для информационных акцентов и вспомогательных статусов.',
    '--ds-azure-light': 'Облегчённая azure-подложка для мягких informational поверхностей.',
    '--ds-azure-fg': 'Контрастный текст и иконки поверх azure-заливки.',
    '--ds-azure-text': 'Текстовый оттенок для azure-плашек и спокойных informational блоков.',
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
    '--ds-category-tree-branch-line-active-color': 'Semantic цвет активной ветки category tree и подобных композитных компонентов.',
    '--primary-hover': 'Fallback-цвет hover-состояния для primary action без поддержки `color-mix`.',
    '--primary-active': 'Fallback-цвет active-состояния для primary action без поддержки `color-mix`.',
    '--secondary-hover': 'Fallback-цвет hover-состояния для secondary action без поддержки `color-mix`.',
    '--secondary-active': 'Fallback-цвет active-состояния для secondary action без поддержки `color-mix`.',
    '--brd-hover': 'Fallback-цвет hover-состояния для border/outline-элементов без поддержки `color-mix`.',
    '--brd-active': 'Fallback-цвет active-состояния для border/outline-элементов без поддержки `color-mix`.',
    '--destructive-hover': 'Fallback-цвет hover-состояния для destructive action без поддержки `color-mix`.',
    '--destructive-active': 'Fallback-цвет active-состояния для destructive action без поддержки `color-mix`.',
    '--ds-success-hover': 'Fallback-цвет hover-состояния для success-ролей без поддержки `color-mix`.',
    '--ds-success-active': 'Fallback-цвет active-состояния для success-ролей без поддержки `color-mix`.',
    '--ds-warning-hover': 'Fallback-цвет hover-состояния для warning-ролей без поддержки `color-mix`.',
    '--ds-warning-active': 'Fallback-цвет active-состояния для warning-ролей без поддержки `color-mix`.',
    '--ds-danger-hover': 'Fallback-цвет hover-состояния для danger-ролей без поддержки `color-mix`.',
    '--ds-danger-active': 'Fallback-цвет active-состояния для danger-ролей без поддержки `color-mix`.',
    '--ds-info-hover': 'Fallback-цвет hover-состояния для info-ролей без поддержки `color-mix`.',
    '--ds-info-active': 'Fallback-цвет active-состояния для info-ролей без поддержки `color-mix`.',
    '--ds-slate-hover': 'Fallback-цвет hover-состояния для slate-ролей без поддержки `color-mix`.',
    '--ds-slate-active': 'Fallback-цвет active-состояния для slate-ролей без поддержки `color-mix`.',
    '--ds-azure-hover': 'Fallback-цвет hover-состояния для azure-ролей без поддержки `color-mix`.',
    '--ds-azure-active': 'Fallback-цвет active-состояния для azure-ролей без поддержки `color-mix`.',
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
  DsButton,
  DsCard,
} from '@feugene/granularity'

import '@feugene/granularity/styles.css'`

const granularImportSnippet = `import { DsButton } from '@feugene/granularity/components/DsButton'

import '@feugene/granularity/styles.css'`

const granularComponentCssSnippet = `import { DsButton } from '@feugene/granularity/components/DsButton'

import '@feugene/granularity/components/DsButton/styles.css'`

const useThemeSnippet = `import { initThemeEarly, useTheme } from '@feugene/granularity'

initThemeEarly()

const {
  isDark,
  toggleTheme,
} = useTheme()`

const unoNodeSnippet = `import { fileURLToPath, URL } from 'node:url'
import { defineConfig, presetMini } from 'unocss'

import { presetGranularityNode } from '@feugene/granularity/uno-node'

export default defineConfig({
  presets: [
    presetMini(),
    presetGranularityNode({
      components: ['DsButton', 'DsCard'],
      tokens: fileURLToPath(new URL('./src/styles/tokens.css', import.meta.url)),
      baseFile: fileURLToPath(new URL('./src/styles/base.css', import.meta.url)),
      themes: ['light', 'dark'],
      themeFiles: [fileURLToPath(new URL('./src/styles/light-app.css', import.meta.url))],
    }),
  ],
})`

const localizationSnippet = `import { createFintI18n } from '@feugene/fint-i18n'
import { DS_I18N_BLOCK, dsLocaleLoaders } from '@feugene/granularity/i18n'

const i18n = createFintI18n({
  locale: 'ru',
  fallbackLocale: 'en',
  loaders: [dsLocaleLoaders],
})

i18n.registerBlocks([DS_I18N_BLOCK])
await i18n.loadUsedBlocks('ru')`

const tokensCssSource = `:root {
  /* Foundations: neutral palette */
  --ds-slate-0: #ffffff;
  --ds-slate-50: #f8fafc;
  --ds-slate-100: #f1f5f9;
  --ds-slate-200: #e2e8f0;
  --ds-slate-300: #cbd5e1;
  --ds-slate-400: #94a3b8;
  --ds-slate-500: #64748b;
  --ds-slate-600: #475569;
  --ds-slate-700: #334155;
  --ds-slate-800: #1e293b;
  --ds-slate-900: #0f172a;

  /* Typography: font families */
  --ds-font-ui: Inter, Roboto, system-ui, -apple-system, Segoe UI, Arial, sans-serif;
  --ds-font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;

  /* Typography: font sizes */
  --ds-text-xs: 12px;
  --ds-text-sm: 14px;
  --ds-text-base: 16px;
  --ds-text-lg: 18px;
  --ds-text-xl: 20px;
  --ds-text-2xl: 24px;
  --ds-text-3xl: 30px;
  --ds-text-4xl: 36px;

  /* Typography: line heights */
  --ds-leading-tight: 1.25;
  --ds-leading-normal: 1.5;
  --ds-leading-relaxed: 1.625;

  /* Typography: font weights */
  --ds-font-regular: 400;
  --ds-font-medium: 500;
  --ds-font-semibold: 600;
  --ds-font-bold: 700;

  /* Layout: spacing scale */
  --ds-space-0: 0px;
  --ds-space-1: 4px;
  --ds-space-2: 8px;
  --ds-space-3: 12px;
  --ds-space-4: 16px;
  --ds-space-5: 20px;
  --ds-space-6: 24px;
  --ds-space-8: 32px;
  --ds-space-10: 40px;
  --ds-space-12: 48px;
  --ds-space-16: 64px;
  --ds-space-20: 80px;
  --ds-space-24: 96px;
  --ds-space-32: 128px;
  --ds-space-40: 160px;
  --ds-space-48: 192px;
  --ds-space-64: 256px;

  /* Layout: containers */
  --ds-container-max: 1280px;
  --ds-container-max-2xl: 1440px;
  --ds-container-padding-mobile: 16px;
  --ds-container-padding-tablet: 24px;
  --ds-container-padding-desktop: 32px;

  /* Layout: breakpoints */
  --ds-bp-sm: 640px;
  --ds-bp-md: 768px;
  --ds-bp-lg: 1024px;
  --ds-bp-xl: 1280px;
  --ds-bp-2xl: 1536px;

  /* Shapes: radii and compatibility aliases */
  --radius: 0.5rem;
  --ds-radius-none: 0px;
  --ds-radius-sm: 4px;
  --ds-radius-md: 8px;
  --ds-radius-lg: 12px;
  --ds-radius-xl: 16px;
  --ds-radius-full: 9999px;

  /* Elevation */
  --ds-shadow-0: none;
  --ds-shadow-1: 0 1px 2px rgba(15, 23, 42, 0.08);
  --ds-shadow-2: 0 8px 24px rgba(15, 23, 42, 0.14);
  --ds-shadow-3: 0 16px 48px rgba(15, 23, 42, 0.20);

  /* Motion */
  --ds-duration-fast: 150ms;
  --ds-duration-base: 200ms;
  --ds-duration-slow: 300ms;
  --ds-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ds-ease-in: cubic-bezier(0.7, 0, 0.84, 0);

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
  --ds-success-hover: color-mix(in srgb, var(--ds-success) 92%, var(--fg));
  --ds-success-active: color-mix(in srgb, var(--ds-success) 84%, var(--fg));
  --ds-warning-hover: color-mix(in srgb, var(--ds-warning) 92%, var(--fg));
  --ds-warning-active: color-mix(in srgb, var(--ds-warning) 84%, var(--fg));
  --ds-danger-hover: color-mix(in srgb, var(--ds-danger) 92%, var(--fg));
  --ds-danger-active: color-mix(in srgb, var(--ds-danger) 84%, var(--fg));
  --ds-info-hover: color-mix(in srgb, var(--ds-info) 92%, var(--fg));
  --ds-info-active: color-mix(in srgb, var(--ds-info) 84%, var(--fg));
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
  --ds-success: #10b981;
  --ds-success-light: #d1fae5;
  --ds-success-fg: #ffffff;
  --ds-success-text: #065f46;
  --ds-warning: #f97316;
  --ds-warning-light: #ffedd5;
  --ds-warning-fg: #ffffff;
  --ds-warning-text: #7c2d12;
  --ds-danger: #dc2626;
  --ds-danger-light: #fee2e2;
  --ds-danger-fg: #ffffff;
  --ds-danger-text: #991b1b;
  --ds-info: #5850ec;
  --ds-info-light: #e0e7ff;
  --ds-info-fg: #ffffff;
  --ds-info-text: #3730a3;
  --ds-slate: #475569;
  --ds-slate-light: #e2e8f0;
  --ds-slate-fg: #ffffff;
  --ds-slate-text: #334155;
  --ds-azure: #0ea5e9;
  --ds-azure-light: #e0f2fe;
  --ds-azure-fg: #ffffff;
  --ds-azure-text: #075985;

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
  --ds-category-tree-branch-line-active-color: color-mix(in srgb, var(--primary) 20%, var(--brd));
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
    --ds-success-hover: #10ac7a;
    --ds-success-active: #109f73;
    --ds-warning-hover: #e66c18;
    --ds-warning-active: #d46419;
    --ds-danger-hover: #cc2526;
    --ds-danger-active: #bb2427;
    --ds-info-hover: #5c60e1;
    --ds-info-active: #5659d1;
    --ds-slate-hover: #435062;
    --ds-slate-active: #3d4a5b;
    --ds-azure-hover: #0284c7;
    --ds-azure-active: #0369a1;

    /* Component semantic fallbacks */
    --ds-category-tree-branch-line-active-color: #c4cdf7;
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
  --ds-success: #34d399;
  --ds-success-light: #064e3b;
  --ds-success-fg: #0f172a;
  --ds-success-text: #6ee7b7;
  --ds-warning: #fb923c;
  --ds-warning-light: #7c2d12;
  --ds-warning-fg: #0f172a;
  --ds-warning-text: #fdba74;
  --ds-danger: #f87171;
  --ds-danger-light: #7f1d1d;
  --ds-danger-fg: #0f172a;
  --ds-danger-text: #fca5a5;
  --ds-info: #818cf8;
  --ds-info-light: #312e81;
  --ds-info-fg: #0f172a;
  --ds-info-text: #c7d2fe;
  --ds-slate: #94a3b8;
  --ds-slate-light: #334155;
  --ds-slate-fg: #0f172a;
  --ds-slate-text: #cbd5e1;
  --ds-azure: #38bdf8;
  --ds-azure-light: #0c4a6e;
  --ds-azure-fg: #0f172a;
  --ds-azure-text: #bae6fd;

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
  --ds-category-tree-branch-line-active-color: color-mix(in srgb, var(--primary) 38%, var(--brd));
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
    --ds-success-hover: #44d6a1;
    --ds-success-active: #53d9a9;
    --ds-warning-hover: #fb9a4b;
    --ds-warning-active: #fba35b;
    --ds-danger-hover: #f87c7c;
    --ds-danger-active: #f88787;
    --ds-info-hover: #8b95f8;
    --ds-info-active: #949ef9;
    --ds-slate-hover: #9faec0;
    --ds-slate-active: #aab7c8;
    --ds-azure-hover: #4bc3f9;
    --ds-azure-active: #5dcbf9;

    /* Component semantic fallbacks */
    --ds-category-tree-branch-line-active-color: #505b8c;
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
  font-family: var(--ds-font-ui);
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
  --ds-success: #10b981;
  --ds-warning: #f97316;
  --ds-danger: #dc2626;
  --ds-info: #6366f1;
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
  --ds-success: #34d399;
  --ds-warning: #fb923c;
  --ds-danger: #f87171;
  --ds-info: #818cf8;
}`

const tokensCssExcerpt = takeLeadingBlock(tokensCssSource, 46)

export const showcaseQuickStartCards: ShowcaseQuickStartCard[] = [
  {
    id: 'quick-start-root',
    title: 'Быстрый старт: root import + `styles.css`',
    description: 'Самый прямой сценарий из документации: root API даёт простой вход, а `styles.css` сразу подключает foundation и стили всех компонентов.',
    code: rootImportSnippet,
    language: 'ts',
    note: 'Подходит для первого подключения, прототипов и экранов, где важнее быстрый старт, чем точная настройка bundle.',
  },
  {
    id: 'quick-start-subpath-js',
    title: 'Granular JS: subpath import + `styles.css`',
    code: granularImportSnippet,
    language: 'ts',
    description: 'Сценарий для более точного `JS` bundle: компоненты импортируются через subpath exports, а CSS остаётся в общем пакетном entrypoint-е.',
    note: 'Удобный переходный вариант, если хочется уменьшить `JS`-граф без ручной сборки component-level CSS.',
  },
  {
    id: 'quick-start-component-css',
    title: 'Минимальный CSS для 1–2 компонентов',
    description: 'Если нужен точечный CSS без UnoCSS, используйте component-level bundle: он уже включает foundation и зависимости выбранного компонента.',
    code: granularComponentCssSnippet,
    language: 'ts',
    note: 'Лучше всего работает для 1–2 компонентов; при большем масштабе удобнее общий `styles.css` или preset-подход.',
  },
  {
    id: 'quick-start-uno-node',
    title: 'Предпочтительный путь: `UnoCSS` + `uno-node`',
    description: 'Рекомендуемый production-сценарий для `UnoCSS`: кроме выбора компонентов здесь можно переопределять `tokens`, `base`, набор встроенных тем и подключать собственные `themeFiles`.',
    code: unoNodeSnippet,
    language: 'ts',
    note: '`@feugene/granularity/uno-node` автоматически подтягивает foundation layers, темы и component CSS, а preset остаётся гибким для кастомных токенов, base-слоя и theme files приложения.',
  },
  {
    id: 'quick-start-uno-pure',
    title: 'Pure/browser-safe preset: UnoCSS + `uno`',
    description: 'Специальный вариант для интеграций без node-only API и без чтения файлов с диска.',
    code: `import {
  createGranularityCssPreflights,
  presetGranularity,
} from '@feugene/granularity/uno'

presetGranularity({
  components: ['DsButton'],
  preflights: createGranularityCssPreflights([
    ':root { --primary: hotpink; --primary-fg: white; }',
  ]),
})`,
    language: 'ts',
    note: '`@feugene/granularity/uno` используйте только когда нужен именно pure/browser-safe preset и CSS preflight-ы надо передавать явно.',
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
    summary: '`uno-node` остаётся предпочтительным preset-путём, а pure/browser-safe `uno` нужен для специальных интеграционных сценариев.',
    description: 'Если приложение уже использует UnoCSS, пакет даёт два preset-а. Foundations должен чётко объяснять, когда нужен node-aware preset с автоподмешиванием CSS preflight-ов, а когда — pure preset без чтения файлов с диска.',
    narrativeSource: takeLeadingBlock(unocssDocSource, 92),
    sourcePath: 'packages/granularity/docs/unocss.md',
    keyPoints: [
      '`@feugene/granularity/uno-node` автоматически подтягивает foundation layers, темы и component CSS.',
      '`@feugene/granularity/uno` не читает файлы с диска и требует явной передачи CSS preflight-ов.',
      'Preset-подход помогает собирать только реально используемые компоненты и темы.',
    ],
    recommendations: [
      'Сначала рассматривайте `uno-node`, а к pure preset переходите только при реальной архитектурной необходимости.',
      'Используйте `components`/`themes` настройки preset-а как основу для performance-полировки showcase.',
      'Связывайте narrative docs по UnoCSS с реальными demo-сценариями компонентов, а не только с конфигами.',
    ],
    codeSamples: [
      {
        title: 'Рекомендуемый `uno-node` preset',
        code: unoNodeSnippet,
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
      'Публичный entrypoint `@feugene/granularity/i18n` публикует `DS_I18N_BLOCK`, `dsLocaleLoaders` и adapter types.',
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