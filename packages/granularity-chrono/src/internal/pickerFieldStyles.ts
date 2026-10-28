import type { GrComponentSize } from '@feugene/granularity/components/GrConfigProvider'
import { grFieldLookAttrs } from '@feugene/granularity/components/GrInput'

/** Шкала размеров одна на всю систему — своего кортежа пакет не заводит. */
export type GrPickerSize = GrComponentSize

/**
 * Поле пикера — поле ядра: рамку, высоту ступени, скругление, подложку, отклик и
 * кольцо фокуса рисует лист `GrInput` по атрибутам `grFieldLookAttrs`
 * (`docs/field.md` ядра). Поэтому каждый пикер объявляет `GrInput` в
 * `dependencies`: без ребра лист поля не попадёт в приложение.
 *
 * Здесь — только то, что у пикера своё: отступы под кнопки справа, кегль
 * ступени и курсор. Модуль общий и уезжает в `dist/chunks/`; granum доходит до
 * него по графу бандла каждого пикера и извлекает классы сам.
 */

export const fieldSizes: Record<GrPickerSize, string> = {
  xs: 'pl-2.5 text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'pl-3 text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'pl-3 text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'pl-4 text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

export const fieldBaseClass = 'w-full truncate pr-9 placeholder:text-[var(--gr-muted-fg)] focus:outline-none'

/** Цвет текста — утилитой и у недоступного: `packages/granularity/docs/field.md`. */
export const fieldEnabledClass = 'cursor-pointer text-[var(--gr-fg)]'
export const fieldDisabledClass = 'text-[var(--gr-disabled-fg)]'

export interface PickerFieldOptions {
  size: GrPickerSize
  disabled: boolean
  invalid: boolean
  readonly?: boolean
}

export function pickerFieldClass(options: PickerFieldOptions): string {
  return [
    fieldBaseClass,
    fieldSizes[options.size],
    options.disabled ? fieldDisabledClass : fieldEnabledClass,
  ].join(' ')
}

export function pickerFieldAttrs(options: PickerFieldOptions): Record<string, string | undefined> {
  return grFieldLookAttrs(options)
}

/** Зона справа: индикатор, спиннер и кнопка очистки лежат друг на друге. */
export const trailingZoneClass = 'absolute inset-y-0 right-2 flex items-center'

export const indicatorClass = 'pointer-events-none text-[var(--gr-muted-fg)]'

export const clearButtonClass
  = 'inline-flex h-6 w-6 items-center justify-center rounded-[var(--gr-radius-sm)] '
    + 'text-[var(--gr-muted-fg)] transition-colors duration-[var(--gr-duration-fast)] ease-[var(--gr-ease-out)] '
    + 'hover:bg-[var(--gr-muted)] hover:text-[var(--gr-fg)] '
    + 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const iconClass = 'h-4 w-4'

export const spinnerClass = 'h-4 w-4 animate-spin text-[var(--gr-muted-fg)]'
