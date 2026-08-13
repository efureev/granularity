/**
 * Брейкпоинты и вывод недостающей раскладки.
 *
 * Раскладка хранится на каждый брейкпоинт: на ноутбуке и на планшете человек
 * хочет разного, и одна раскладка с автосжатием этого не выражает. Но заводить
 * все четыре руками никто не станет — недостающая выводится из соседней.
 */
import type {
  GrDashboardBreakpoint,
  GrDashboardBreakpoints,
  GrDashboardCols,
  GrDashboardLayout,
  GrDashboardResponsiveLayout,
} from './layoutModel'
import { clampItem, sortLayout } from './layoutModel'
import { compact } from './layoutCollision'

/** Брейкпоинты от широкого к узкому. */
export function orderedBreakpoints(breakpoints: GrDashboardBreakpoints): GrDashboardBreakpoint[] {
  return Object.keys(breakpoints).sort((a, b) => (breakpoints[b] ?? 0) - (breakpoints[a] ?? 0))
}

/**
 * Брейкпоинт по ширине контейнера.
 *
 * Ширина ниже самого узкого порога отдаёт всё равно самый узкий: раскладки
 * «меньше минимума» не существует, а вернуть `undefined` значило бы обязать
 * каждого вызывающего дописывать эту же ветку.
 */
export function resolveBreakpoint(width: number, breakpoints: GrDashboardBreakpoints): GrDashboardBreakpoint {
  const ordered = orderedBreakpoints(breakpoints)
  const matched = ordered.find(key => width >= (breakpoints[key] ?? 0))

  return matched ?? ordered[ordered.length - 1] ?? 'lg'
}

export function colsFor(breakpoint: GrDashboardBreakpoint, cols: GrDashboardCols | number): number {
  if (typeof cols === 'number') return Math.max(1, Math.round(cols))

  return Math.max(1, Math.round(cols[breakpoint] ?? 12))
}

/**
 * Переносит раскладку в сетку с другим числом колонок.
 *
 * Пропорциональное сжатие, а не перекладывание с нуля: относительное
 * расположение виджетов — единственное, что о раскладке известно наверняка, и
 * его стоит сохранить. Множество идентификаторов при этом не меняется.
 */
export function deriveLayout(source: GrDashboardLayout, fromCols: number, toCols: number): GrDashboardLayout {
  if (fromCols === toCols) return sortLayout(source)

  const ratio = toCols / fromCols

  const scaled = sortLayout(source).map((item) => {
    const w = Math.max(1, Math.min(toCols, Math.round(item.w * ratio)))
    const x = Math.max(0, Math.min(toCols - w, Math.round(item.x * ratio)))

    return clampItem({ ...item, x, y: item.y, w }, toCols)
  })

  return compact(scaled, 'vertical')
}

export interface LayoutForOptions {
  breakpoints: GrDashboardBreakpoints
  cols: GrDashboardCols | number
}

/**
 * Раскладка для брейкпоинта: своя, если объявлена, иначе выведенная.
 *
 * Донор ищется **сверху**, от широких к узким: сужать раскладку осмысленно,
 * растягивать — нет, потому что при расширении появляется место, о котором
 * исходная раскладка ничего не говорит. Донора сверху нет — берётся ближайший
 * снизу, это лучше пустого экрана.
 */
export function layoutFor(
  responsive: GrDashboardResponsiveLayout,
  breakpoint: GrDashboardBreakpoint,
  options: LayoutForOptions,
): GrDashboardLayout {
  const own = responsive[breakpoint]
  if (own) return sortLayout(own)

  const ordered = orderedBreakpoints(options.breakpoints)
  const index = ordered.indexOf(breakpoint)
  if (index === -1) return []

  const wider = ordered.slice(0, index).reverse().find(key => responsive[key])
  const narrower = ordered.slice(index + 1).find(key => responsive[key])
  const donor = wider ?? narrower
  if (!donor) return []

  return deriveLayout(
    responsive[donor] ?? [],
    colsFor(donor, options.cols),
    colsFor(breakpoint, options.cols),
  )
}

/** Записывает раскладку брейкпоинта, не трогая остальные. */
export function withBreakpointLayout(
  responsive: GrDashboardResponsiveLayout,
  breakpoint: GrDashboardBreakpoint,
  layout: GrDashboardLayout,
): GrDashboardResponsiveLayout {
  return { ...responsive, [breakpoint]: layout }
}
