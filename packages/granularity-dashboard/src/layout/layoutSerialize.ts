/**
 * Сериализация раскладки для хранилища.
 *
 * Разбор намеренно **терпимый**: JSON приходит из `localStorage`, куда его мог
 * записать предыдущий мажор приложения. Исключение на старте страницы — цена,
 * которую платить не за что; неразобранное просто означает «взять `initial`».
 */
import type {
  GrDashboardItemLayout,
  GrDashboardLayout,
  GrDashboardResponsiveLayout,
} from './layoutModel'

export const GR_DASHBOARD_LAYOUT_VERSION = 1

export interface GrDashboardLayoutSnapshot {
  version: number
  layout: GrDashboardResponsiveLayout
}

export interface ParseLayoutOptions {
  /** Версия схемы, которую понимает приложение. */
  version?: number
  /**
   * Приведение чужой версии к текущей. Не задано — раскладка другой версии
   * отбрасывается.
   */
  migrate?: (raw: unknown, from: number | null) => GrDashboardResponsiveLayout | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseItem(value: unknown): GrDashboardItemLayout | null {
  if (!isRecord(value)) return null

  const { id, x, y, w, h } = value
  if (typeof id !== 'string' || id === '') return null
  if (![x, y, w, h].every(n => typeof n === 'number' && Number.isFinite(n))) return null

  const item: GrDashboardItemLayout = {
    id,
    x: Math.max(0, Math.round(x as number)),
    y: Math.max(0, Math.round(y as number)),
    w: Math.max(1, Math.round(w as number)),
    h: Math.max(1, Math.round(h as number)),
  }

  for (const key of ['minW', 'minH', 'maxW', 'maxH'] as const) {
    const bound = value[key]
    if (typeof bound === 'number' && Number.isFinite(bound)) item[key] = Math.round(bound)
  }

  if (value.static === true) item.static = true

  return item
}

function parseResponsive(value: unknown): GrDashboardResponsiveLayout | null {
  if (!isRecord(value)) return null

  const result: GrDashboardResponsiveLayout = {}

  for (const [breakpoint, layout] of Object.entries(value)) {
    if (!Array.isArray(layout)) return null

    const items = layout.map(parseItem).filter((item): item is GrDashboardItemLayout => item !== null)
    // Виджет с испорченной записью пропускается, но раскладка, в которой
    // испорчено всё, — это не «пустой дашборд», а нечитаемые данные.
    if (items.length !== layout.length && items.length === 0) return null

    result[breakpoint] = items
  }

  return result
}

export function serializeLayout(
  layout: GrDashboardResponsiveLayout,
  version: number = GR_DASHBOARD_LAYOUT_VERSION,
): string {
  return JSON.stringify({ version, layout } satisfies GrDashboardLayoutSnapshot)
}

export function parseLayout(
  raw: string | null | undefined,
  options: ParseLayoutOptions = {},
): GrDashboardResponsiveLayout | null {
  if (!raw) return null

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  }
  catch {
    return null
  }

  const expected = options.version ?? GR_DASHBOARD_LAYOUT_VERSION
  const version = isRecord(parsed) && typeof parsed.version === 'number' ? parsed.version : null

  if (version !== expected) {
    return options.migrate ? options.migrate(parsed, version) : null
  }

  return parseResponsive(isRecord(parsed) ? parsed.layout : null)
}

/** Раскладки равны, если равны по составу и координатам. */
export function layoutsEqual(a: GrDashboardLayout, b: GrDashboardLayout): boolean {
  if (a.length !== b.length) return false

  return a.every((item, index) => {
    const other = b[index]

    return other !== undefined
      && item.id === other.id
      && item.x === other.x
      && item.y === other.y
      && item.w === other.w
      && item.h === other.h
  })
}
