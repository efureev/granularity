import type { GrThemeData } from '@feugene/granularity-tokens'
import type { GrComponentToken } from '@feugene/granularity/tokens'

type ComponentValues = NonNullable<GrThemeData['components']>[string][string]

/** Как показать значение рядом с текстом: образец цвета, тени, угла или шрифта. */
export type TokenPreview = 'color' | 'shadow' | 'radius' | 'font'

export interface ThemeTokenRow {
  token: GrComponentToken
  /** Значение во всех режимах — раздел `root` компонента в теме. */
  root?: string
  /** Значения по режимам — раздел `modes`; у токена, общего для режимов, пусто. */
  modes: Readonly<Record<string, string>>
  preview?: TokenPreview
}

export interface TokenGroup {
  id: string
  title: string
  match: RegExp
}

const COLOR = /-(?:bg(?:-hover|-active)?|fg|border(?:-soft)?|brd|divider|(?:soft-|solid-)?color)$/
/** Тень тона — цвет; `--gr-button-glow` без тона — её геометрия. */
const TONED_GLOW = /-(?:primary|success|warning|danger|info|slate|azure|neutral)-glow$/
const SHADOW = /-(?:shadow|shadow-active|surface-shadow)$/
const RADIUS = /-radius-(?:xs|sm|md|lg)$/

export function tokenPreview(name: string): TokenPreview | undefined {
  if (COLOR.test(name) || TONED_GLOW.test(name))
    return 'color'
  if (SHADOW.test(name))
    return 'shadow'
  if (RADIUS.test(name))
    return 'radius'
  return undefined
}

/**
 * Значения компонента в теме: тема кладёт их разделом своего пакета
 * (`components/<пакет>/<GrX>/`), а имена компонентов уникальны во всей экосистеме —
 * владелец находит свой раздел сам, будь он ядра или спутника.
 */
export function componentThemeValues(data: GrThemeData, owner: string): ComponentValues | undefined {
  return Object.values(data.components ?? {}).find(values => values[owner] !== undefined)?.[owner]
}

/** Пропы, которые тема включает компоненту (`componentDefaults` в `theme.json`). */
export function componentDefaultsOf(data: GrThemeData, owner: string): Readonly<Record<string, unknown>> {
  const granularity = data.extensions?.granularity as { componentDefaults?: Record<string, Record<string, unknown>> } | undefined
  return granularity?.componentDefaults?.[owner] ?? {}
}

/** Токены вида `theme` со значениями этой темы: из `root` или по режимам. */
export function themeTokenRows(tokens: readonly GrComponentToken[], data: GrThemeData): ThemeTokenRow[] {
  return tokens
    .filter(token => token.kind === 'theme')
    .map((token) => {
      const values = componentThemeValues(data, token.owner)
      const key = token.name.slice(2)
      const modes = Object.fromEntries(Object.entries(values?.modes ?? {})
        .flatMap(([mode, entries]) => (entries[key] === undefined ? [] : [[mode, entries[key]]])))
      return { token, root: values?.root?.[key], modes, preview: tokenPreview(token.name) }
    })
}

/** Раскладка по группам: первое совпадение; что не легло ни в одну — отдельно, его держит тест. */
export function groupTokenRows<T extends { token: GrComponentToken }>(rows: readonly T[], groups: readonly TokenGroup[]): { groups: Map<string, T[]>, unmatched: T[] } {
  const result = new Map(groups.map(group => [group.id, [] as T[]]))
  const unmatched: T[] = []
  for (const row of rows) {
    const group = groups.find(item => item.match.test(row.token.name))
    if (group)
      result.get(group.id)!.push(row)
    else
      unmatched.push(row)
  }
  return { groups: result, unmatched }
}
