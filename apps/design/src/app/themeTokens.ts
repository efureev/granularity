import { grDerivedTokens, grFoundationTokens, grRoleTokens, type GrThemeData } from '@feugene/granularity-tokens'

import type { TokenPreview } from './componentTokens'
import type { ThemeView } from './tokens'

/** Строка таблицы токенов: одно значение на все режимы или по значению на режим. */
export interface TokenTableRow {
  name: string
  description: string
  /** Значение, общее для режимов. */
  value?: string
  /** Значения по режимам: имя режима → значение. */
  modes?: Readonly<Record<string, string>>
  /** Пометка под значением режима — «формула пакета», если тема его не задала. */
  modeNotes?: Readonly<Record<string, string>>
  preview?: TokenPreview
}

export interface TokenTableSection {
  id: string
  title: string
  rows: TokenTableRow[]
}

export type ThemeTokenKind = 'roles' | 'foundation' | 'derived'

export const THEME_TOKEN_KINDS: { id: ThemeTokenKind, title: string, lead: string }[] = [
  { id: 'roles', title: 'Роли', lead: 'Значение задаёт каждый режим темы: компоненты берут роль, а не оттенок шкалы.' },
  { id: 'foundation', title: 'Примитивы', lead: 'Шкалы и семейства — от режима не зависят, лежат в `root` темы.' },
  { id: 'derived', title: 'Производные', lead: 'Состояния отклика: формула пакета `color-mix`, если тема не задала значение сама.' },
]

/** Разделы реестра пакета токенов по-русски; полноту держит тест. */
export const SECTION_TITLES: Readonly<Record<string, string>> = {
  'Foundations: neutral palette': 'Нейтральная палитра',
  'Typography: font families': 'Семейства шрифтов',
  'Typography: font sizes': 'Кегли контента',
  'Typography: control scale': 'Кегли контролов',
  'Typography: line heights': 'Интерлиньяж',
  'Typography: font weights': 'Начертания',
  'Layout: spacing scale': 'Отступы',
  'Layout: containers': 'Контейнеры',
  'Layout: breakpoints': 'Брейкпоинты',
  'Iconography: icon sizes': 'Размеры иконок',
  'Shapes: radii and compatibility aliases': 'Скругления',
  'Elevation': 'Тени',
  'Motion': 'Движение',
  'Layering: z-index scale': 'Слои',
  'Surface roles': 'Поверхности',
  'State roles': 'Состояния',
  'Action roles': 'Действия',
  'Status roles': 'Статусы',
  'Solid fill roles': 'Заливки',
  'Data visualization roles': 'Данные и графики',
  'Navigation roles': 'Навигация',
  'Derived interaction formulas: action roles': 'Отклик действий',
  'Derived interaction formulas: status roles': 'Отклик статусов',
}

const SECTION_PREVIEW: Readonly<Record<string, TokenPreview>> = {
  'Foundations: neutral palette': 'color',
  'Typography: font families': 'font',
  'Shapes: radii and compatibility aliases': 'radius',
  'Elevation': 'shadow',
}

function previewOf(kind: ThemeTokenKind, section: string): TokenPreview | undefined {
  if (SECTION_PREVIEW[section])
    return SECTION_PREVIEW[section]
  return kind === 'foundation' ? undefined : 'color'
}

function grouped(rows: { section: string, row: TokenTableRow }[]): TokenTableSection[] {
  const sections = new Map<string, TokenTableRow[]>()
  for (const { section, row } of rows)
    sections.set(section, [...(sections.get(section) ?? []), row])
  return [...sections].map(([section, items]) => ({ id: section, title: SECTION_TITLES[section] ?? section, rows: items }))
}

/** Токены темы по разделам реестра: значения — из данных темы с раскрытым `extends`. */
export function themeTokenSections(theme: ThemeView, kind: ThemeTokenKind): TokenTableSection[] {
  const modeNames = theme.modeList.map(mode => mode.id)
  const key = (name: string): string => name.slice(2)

  if (kind === 'foundation') {
    return grouped(grFoundationTokens.map(token => ({
      section: token.section,
      row: { name: token.name, description: token.description, value: theme.data.root[key(token.name)], preview: previewOf(kind, token.section) },
    })))
  }

  if (kind === 'roles') {
    return grouped(grRoleTokens.map(token => ({
      section: token.section,
      row: {
        name: token.name,
        description: token.description,
        modes: Object.fromEntries(modeNames.flatMap((mode) => {
          const value = theme.modes.get(mode)?.[key(token.name)]
          return value === undefined ? [] : [[mode, value]]
        })),
        preview: previewOf(kind, token.section),
      },
    })))
  }

  return grouped(grDerivedTokens.map((token) => {
    const own = (mode: string): string | undefined => theme.modes.get(mode)?.[key(token.name)]
    return {
      section: token.section,
      row: {
        name: token.name,
        description: token.description,
        modes: Object.fromEntries(modeNames.map(mode => [mode, own(mode) ?? token.formula])),
        modeNotes: Object.fromEntries(modeNames.flatMap(mode => (own(mode) === undefined ? [[mode, 'формула пакета']] : []))),
        preview: previewOf(kind, token.section),
      },
    }
  }))
}

export function themeTokenCount(kind: ThemeTokenKind): number {
  return { roles: grRoleTokens.length, foundation: grFoundationTokens.length, derived: grDerivedTokens.length }[kind]
}

/** Разделы `components` темы: какие компоненты каких пакетов получают от неё значения. */
export function themeComponentSections(data: GrThemeData): { packageId: string, component: string, values: number }[] {
  return Object.entries(data.components ?? {}).flatMap(([packageId, components]) => Object.entries(components)
    .map(([component, values]) => ({
      packageId,
      component,
      values: Object.keys(values.root ?? {}).length + Object.values(values.modes ?? {}).reduce((sum, mode) => sum + Object.keys(mode).length, 0),
    }))).sort((a, b) => a.packageId.localeCompare(b.packageId) || a.component.localeCompare(b.component))
}

/** Пропсы по умолчанию, которые тема включает компонентам (`componentDefaults`). */
export function themeComponentDefaults(data: GrThemeData): { component: string, prop: string, value: unknown }[] {
  const granularity = data.extensions?.granularity as { componentDefaults?: Record<string, Record<string, unknown>> } | undefined
  return Object.entries(granularity?.componentDefaults ?? {})
    .flatMap(([component, props]) => Object.entries(props).map(([prop, value]) => ({ component, prop, value })))
}
