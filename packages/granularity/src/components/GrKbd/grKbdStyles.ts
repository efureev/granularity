import type { GrComponentSize } from '../shared/sizes'

/**
 * Классы `GrKbd`.
 *
 * Шкала полная (`xs…lg`), а не «sm и всё остальное»: тип пропа обещает четыре
 * ступени, и `xs`/`lg` не должны молча рендериться как `md`.
 */

export const keyBaseClass = 'inline-flex items-center justify-center rounded-md border border-[var(--gr-brd)] bg-[var(--gr-muted)] font-medium leading-none text-[var(--gr-muted-fg)] shadow-[var(--gr-shadow-1)] [font-variant-numeric:tabular-nums]'

export const keySizes: Record<GrComponentSize, string> = {
  xs: 'min-w-[1.25rem] h-5 px-1 text-[10px]',
  sm: 'min-w-[1.5rem] h-6 px-1.5 text-xs',
  md: 'min-w-[1.75rem] h-7 px-2 text-sm',
  lg: 'min-w-[2rem] h-8 px-2.5 text-base',
}

/** Обёртка комбинации: сама рамки не имеет — её рисуют вложенные клавиши. */
export const comboBaseClass = 'inline-flex items-center align-middle'

export const comboGaps: Record<GrComponentSize, string> = {
  xs: 'gap-0.5',
  sm: 'gap-1',
  md: 'gap-1',
  lg: 'gap-1.5',
}

export const separatorClass = 'select-none text-[var(--gr-muted-fg)]'

export function grKbdKeyClass(size: GrComponentSize): string {
  return `${keyBaseClass} ${keySizes[size]}`
}

export function grKbdComboClass(size: GrComponentSize): string {
  return `${comboBaseClass} ${comboGaps[size]}`
}
