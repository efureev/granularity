import type { GrControlShape } from '../shared/controlShape'
import { controlPillPaddingXClass, controlShapeRadiusClass } from '../shared/controlShape'

import type { GrComponentSize } from '../shared/sizes'

export type GrColorPickerSize = GrComponentSize

/**
 * Триггер повторяет геометрию поля ввода: пикер чаще всего стоит в форме рядом
 * с `GrInput`, и своя лестница высот выдала бы его из ряда.
 */
export const triggerSizeClassBySize: Record<GrColorPickerSize, string> = {
  xs: 'h-7 gap-1.5 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'h-8 gap-2 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'h-10 gap-2 text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'h-11 gap-2.5 text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

/**
 * Отступ триггера зависит и от размера, и от формы. У коробки он мельче, чем у
 * полей ввода: слева стоит образец цвета, и лишний отступ отодвигал бы его от
 * края сильнее, чем нужно.
 */
export const triggerPaddingXClass: Record<GrControlShape, Record<GrColorPickerSize, string>> = {
  box: {
    xs: 'px-2',
    sm: 'px-2.5',
    md: 'px-3',
    lg: 'px-4',
  },
  pill: controlPillPaddingXClass,
}

/** Образец в триггере: квадрат со стороной чуть меньше высоты поля. */
export const triggerSwatchSizeBySize: Record<GrColorPickerSize, string> = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export const panelSizeClassBySize: Record<GrColorPickerSize, string> = {
  xs: 'w-56 gap-2 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'w-60 gap-2.5 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'w-64 gap-3 text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'w-72 gap-3 text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

/** Скругление приходит формой, поэтому здесь его нет. */
export const triggerBaseClass = 'inline-flex w-full min-w-0 items-center border border-[var(--gr-brd)] bg-[var(--gr-bg)] text-[var(--gr-fg)] transition-colors duration-[var(--gr-duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

/** Недоступное поле гасится токенами, а не `opacity`: прозрачность роняет контраст подписи. */
export const triggerDisabledClass = 'cursor-not-allowed border-[var(--gr-brd)] bg-[var(--gr-muted)] text-[var(--gr-disabled-fg)]'
export const triggerEnabledClass = 'cursor-pointer hover:border-[var(--gr-primary)]'
export const triggerInvalidClass = 'border-[var(--gr-invalid-brd)] focus-visible:ring-[var(--gr-invalid-ring)]'

export const triggerValueClass = 'min-w-0 flex-1 truncate text-left tabular-nums'

/**
 * Шахматка под прозрачным цветом. Живёт классом-маркером, а сами клетки рисует
 * `<style>` компонента: два `conic-gradient` в утилите не выражаются.
 */
export const checkerClass = 'gr-color-picker-checker'

export const swatchBaseClass = 'relative shrink-0 overflow-hidden rounded-[var(--gr-radius-sm)] border border-[color-mix(in_srgb,var(--gr-fg)_18%,transparent)]'

/** Заливка образца лежит поверх шахматки отдельным слоем. */
export const swatchFillClass = 'absolute inset-0'

export const panelBaseClass = 'grid'

export const previewClass = 'relative h-10 w-full overflow-hidden rounded-[var(--gr-radius-md)] border border-[color-mix(in_srgb,var(--gr-fg)_18%,transparent)]'

/** Вид панели: лестница каналов или квадрат насыщенность × светлота. */
export const GR_COLOR_PICKER_VIEWS = ['sliders', 'area'] as const
export type GrColorPickerView = typeof GR_COLOR_PICKER_VIEWS[number]

/**
 * Высота области. Ширину задаёт панель, поэтому квадрат тут не буквальный:
 * на узкой ступени доля высоты крупнее, иначе область вырождается в полоску.
 */
export const areaHeightBySize: Record<GrColorPickerSize, string> = {
  xs: 'h-28',
  sm: 'h-32',
  md: 'h-36',
  lg: 'h-44',
}

/**
 * Область насыщенности и светлоты.
 *
 * Кольцо фокуса живёт на обёртке через `focus-within`: фокус получают скрытые
 * `input[type=range]` внутри, и своё кольцо у них было бы шириной в пиксель.
 */
export const areaBaseClass = 'relative w-full overflow-hidden rounded-[var(--gr-radius-md)] border border-[color-mix(in_srgb,var(--gr-fg)_18%,transparent)] [touch-action:none] focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--gr-ring)]'

export const areaEnabledClass = 'cursor-crosshair'
export const areaDisabledClass = 'cursor-not-allowed'

/**
 * Ручка области.
 *
 * Обвода два, светлый и тёмный: ручка лежит поверх произвольного цвета, и
 * одиночный пропадал бы на своём конце шкалы — белый в углу белого, тёмный в
 * углу чёрного.
 *
 * Оба независимы от темы намеренно: под ручкой не подложка компонента, а
 * выбираемый цвет, и `--gr-fg` спорил бы с ним, а не с фоном страницы.
 */
export const areaThumbClass = 'pointer-events-none absolute h-[var(--gr-color-picker-area-thumb-size,0.875rem)] w-[var(--gr-color-picker-area-thumb-size,0.875rem)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--gr-radius-full)] border-2 border-[var(--gr-color-picker-area-thumb-border,#fff)] shadow-[0_0_0_1px_var(--gr-color-picker-area-thumb-ring,rgba(0,0,0,0.45))]'

/** Оба поля осей: доступны диктору и клавиатуре, но не видны. */
export const areaInputClass = 'sr-only'

/** Пипетка стоит в одном ряду с полем hex и повторяет его высоту. */
export const eyedropperClass = 'inline-flex shrink-0 items-center justify-center rounded-[var(--gr-radius-control)] border border-[var(--gr-brd)] bg-[var(--gr-bg)] text-[var(--gr-fg)] transition-colors duration-[var(--gr-duration-fast)] hover:border-[var(--gr-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] disabled:cursor-not-allowed disabled:border-[var(--gr-brd)] disabled:bg-[var(--gr-muted)] disabled:text-[var(--gr-disabled-fg)]'

export const eyedropperSizeBySize: Record<GrColorPickerSize, string> = {
  xs: 'h-7 w-7',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-11 w-11',
}

export const eyedropperIconClass = 'h-4 w-4 shrink-0'

/** Поле hex и пипетка стоят рядом: поле тянется, кнопка держит свою ширину. */
export const hexRowClass = 'flex items-center gap-2'
export const hexFieldClass = 'min-w-0 flex-1'

export const rowClass = 'grid grid-cols-[1.25rem_minmax(0,1fr)_2.75rem] items-center gap-2'
export const rowLabelClass = 'text-[var(--gr-muted-fg)]'
export const rowValueClass = 'text-right text-[var(--gr-muted-fg)] tabular-nums'

export const presetsGridClass = 'flex flex-wrap gap-1.5'
export const presetBaseClass = 'relative h-5 w-5 shrink-0 overflow-hidden rounded-[var(--gr-radius-sm)] border border-[color-mix(in_srgb,var(--gr-fg)_18%,transparent)] transition-shadow duration-[var(--gr-duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'
export const presetSelectedClass = 'ring-2 ring-[var(--gr-primary)] ring-offset-1 ring-offset-[var(--gr-popover)]'

export function grColorPickerTriggerClass(options: {
  size: GrColorPickerSize
  disabled: boolean
  invalid: boolean
  shape: GrControlShape
}): string {
  return [
    triggerBaseClass,
    triggerSizeClassBySize[options.size],
    triggerPaddingXClass[options.shape][options.size],
    controlShapeRadiusClass[options.shape],
    options.disabled ? triggerDisabledClass : triggerEnabledClass,
    options.invalid ? triggerInvalidClass : '',
  ].filter(Boolean).join(' ')
}

export function grColorPickerPanelClass(size: GrColorPickerSize): string {
  return [panelBaseClass, panelSizeClassBySize[size]].join(' ')
}

export function grColorPickerPresetClass(selected: boolean): string {
  return [presetBaseClass, selected ? presetSelectedClass : ''].filter(Boolean).join(' ')
}

export function grColorPickerAreaClass(options: {
  size: GrColorPickerSize
  locked: boolean
}): string {
  return [
    areaBaseClass,
    areaHeightBySize[options.size],
    options.locked ? areaDisabledClass : areaEnabledClass,
  ].join(' ')
}

export function grColorPickerEyedropperClass(size: GrColorPickerSize): string {
  return [eyedropperClass, eyedropperSizeBySize[size]].join(' ')
}
