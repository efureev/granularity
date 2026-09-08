import type { GrControlState } from '../shared/sizes'

import type { GrInputSize } from '../GrInput/GrInput.vue'

export type GrInputTagSize = GrInputSize
export type GrInputTagState = GrControlState

export const wrapperSizeClassBySize: Record<GrInputTagSize, string> = {
  xs: 'min-h-7 px-2.5 py-1 gap-1.5',
  sm: 'min-h-8 px-3 py-1 gap-1.5',
  md: 'min-h-10 px-3 py-1.5 gap-2',
  lg: 'min-h-11 px-4 py-2 gap-2',
}

export const inputSizeClassBySize: Record<GrInputTagSize, string> = {
  xs: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

export const wrapperBorderClassByState: Record<GrInputTagState, string> = {
  default: 'border-[var(--gr-brd)]',
  success: 'border-[var(--gr-success)] focus-within:ring-[var(--gr-success)]',
  warning: 'border-[var(--gr-warning)] focus-within:ring-[var(--gr-warning)]',
  danger: 'border-[var(--gr-danger)] focus-within:ring-[var(--gr-danger)]',
}

/**
 * Ошибка валидации красится своей ролью, а не декоративным тоном `danger`:
 * `state="danger"` — это подсветка по решению разработчика, `invalid` — вердикт
 * валидации, и тема вправе развести их по цвету.
 */
export const invalidWrapperBorderClass = 'border-[var(--gr-invalid-brd)] focus-within:ring-[var(--gr-invalid-ring)]'

export const wrapperBaseClass = 'w-full flex flex-wrap items-center rounded-[var(--gr-radius-control)] border text-[var(--gr-fg)] transition-colors duration-[var(--gr-duration-fast)] focus-within:ring-2 focus-within:ring-[var(--gr-ring)]'

export const wrapperEnabledClass = 'bg-[var(--gr-bg)] cursor-text'

/**
 * Заблокированное поле гасится фоном, а не `opacity`: прозрачность разбавляет
 * выверенные на AA токены текста. Фон взаимоисключающий с `wrapperEnabledClass` —
 * два `bg-*` одной специфичности разрулил бы порядок в сгенерированном CSS.
 */
export const wrapperDisabledClass = 'bg-[var(--gr-muted)] text-[var(--gr-muted-fg)] cursor-not-allowed'

export const clearButtonClass = 'ml-auto shrink-0 inline-flex items-center justify-center rounded-[var(--gr-radius-control)] p-0.5 text-[var(--gr-muted-fg)] transition-colors hover:text-[var(--gr-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const spinnerClass = 'shrink-0 inline-flex items-center justify-center text-[var(--gr-muted-fg)]'

export function grInputTagWrapperClass(options: {
  size: GrInputTagSize
  state: GrInputTagState
  invalid: boolean
  disabled: boolean
}): string {
  return [
    wrapperBaseClass,
    wrapperSizeClassBySize[options.size],
    options.invalid ? invalidWrapperBorderClass : wrapperBorderClassByState[options.state],
    options.disabled ? wrapperDisabledClass : wrapperEnabledClass,
  ].join(' ')
}

export function grInputTagInputClass(size: GrInputTagSize): string {
  return inputSizeClassBySize[size]
}

/**
 * Поле правки тега — внутри чипа, вместо его содержимого.
 *
 * Ни фона, ни рамки: их рисует сам чип, и второй набор внутри выглядел бы
 * полем в поле. А вот кольцо фокуса нужно: без него чип в правке неотличим от
 * обычного — единственным признаком остаётся каретка, и режим не виден.
 *
 * Ширину задаёт нативный `size` по длине черновика: в режиме правки у чипа нет
 * содержимого, от которого он взял бы ширину.
 */
export const tagEditInputClass = 'min-w-[2ch] bg-transparent border-none p-0 text-inherit [font:inherit] rounded-[var(--gr-radius-sm)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'
