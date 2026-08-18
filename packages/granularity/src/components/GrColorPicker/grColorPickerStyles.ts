import type { GrComponentSize } from '../shared/sizes'

export type GrColorPickerSize = GrComponentSize

/**
 * Триггер повторяет геометрию поля ввода: пикер чаще всего стоит в форме рядом
 * с `GrInput`, и своя лестница высот выдала бы его из ряда.
 */
export const triggerSizeClassBySize: Record<GrColorPickerSize, string> = {
  xs: 'h-7 px-2 gap-1.5 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'h-8 px-2.5 gap-2 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'h-10 px-3 gap-2 text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'h-11 px-4 gap-2.5 text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
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

export const triggerBaseClass = 'inline-flex w-full min-w-0 items-center rounded-[var(--gr-radius-control)] border border-[var(--gr-brd)] bg-[var(--gr-bg)] text-[var(--gr-fg)] transition-colors duration-[var(--gr-duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

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
}): string {
  return [
    triggerBaseClass,
    triggerSizeClassBySize[options.size],
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
