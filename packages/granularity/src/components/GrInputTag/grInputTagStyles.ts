import type { GrControlState } from '../shared/sizes'

import type { GrInputSize } from '../GrInput/GrInput.vue'

export type GrInputTagSize = GrInputSize
export type GrInputTagState = GrControlState

export const wrapperSizeClassBySize: Record<GrInputTagSize, string> = {
  xs: 'px-2.5 py-1 gap-1.5',
  sm: 'px-3 py-1 gap-1.5',
  md: 'px-3 py-1.5 gap-2',
  lg: 'px-4 py-2 gap-2',
}

export const inputSizeClassBySize: Record<GrInputTagSize, string> = {
  xs: 'text-[length:var(--gr-control-text-xs)] leading-[var(--gr-control-leading-xs)]',
  sm: 'text-[length:var(--gr-control-text-sm)] leading-[var(--gr-control-leading-sm)]',
  md: 'text-[length:var(--gr-control-text-md)] leading-[var(--gr-control-leading-md)]',
  lg: 'text-[length:var(--gr-control-text-lg)] leading-[var(--gr-control-leading-lg)]',
}

/** Рамку рисует лист поля (`GrInput`); цвет текста — утилитой: `docs/field.md`. */
export const wrapperBaseClass = 'flex flex-wrap items-center'

export const clearButtonClass = 'ml-auto shrink-0 inline-flex items-center justify-center rounded-[var(--gr-radius-control)] p-0.5 text-[var(--gr-muted-fg)] transition-colors hover:text-[var(--gr-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export const spinnerClass = 'shrink-0 inline-flex items-center justify-center text-[var(--gr-muted-fg)]'

export function grInputTagWrapperClass(options: { size: GrInputTagSize, disabled: boolean }): string {
  return [
    wrapperBaseClass,
    wrapperSizeClassBySize[options.size],
    options.disabled ? 'text-[var(--gr-disabled-fg)]' : 'text-[var(--gr-fg)] cursor-text',
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
