import type { Placement } from '@floating-ui/dom'
import { overlayOriginClass } from '../shared/overlayOrigin'

/** Ширина панели: число — пиксели, строка — CSS-длина, `auto` — по контенту. */
export type GrDropdownWidth = number | string

export function grDropdownOriginClass(placement: Placement): string {
  return overlayOriginClass(placement)
}

/**
 * Поле вокруг пунктов меню.
 *
 * Поверхности здесь больше нет: панель рисует `GrPopover`, на котором меню и
 * стоит. Осталось только поле — пункты не должны прилегать к рамке вплотную, —
 * и классы потребителя.
 */
export const dropdownContentBaseClass = 'p-1'

export function grDropdownContentClass(contentClass?: string): string {
  return [
    dropdownContentBaseClass,
    contentClass,
  ].filter(Boolean).join(' ')
}
