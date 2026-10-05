/** Ширина панели: число — пиксели, строка — CSS-длина, `auto` — по контенту. */
export type GrDropdownWidth = number | string

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
