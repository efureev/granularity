export type GrListItemDensity = 'compact' | 'regular'

/**
 * Классы `GrList`/`GrListItem`.
 *
 * Единственный источник правды для шаблонов и safelist: до этого карта
 * плотности жила в SFC, а её копия — строковыми литералами прямо в `config.ts`,
 * и разойтись они могли молча.
 */

export const densityPadding: Record<GrListItemDensity, string> = {
  compact: 'px-4 py-2',
  regular: 'px-4 py-3',
}

export const itemLayoutClass = 'flex items-start justify-between gap-4'

/** Интерактивная строка занимает всю ширину пункта — кликабельна вся, а не текст. */
export const itemInteractiveClass = 'w-full text-left transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] focus-visible:ring-inset'

export const itemHoverClass = 'cursor-pointer hover:bg-[var(--gr-muted)]'

/**
 * Заблокированная строка гасится фоном и цветом, а не `opacity`: прозрачность
 * разбавляет выверенные на AA токены текста.
 */
export const itemDisabledClass = 'cursor-not-allowed bg-[var(--gr-muted)] text-[var(--gr-muted-fg)]'

export const dividedClass = 'divide-y divide-[var(--gr-brd)]'

export const emptyClass = 'px-4 py-6 text-center text-[length:var(--gr-text-sm)] text-[var(--gr-muted-fg)]'

/** Заголовок и описание строки. Оба нужны обеим веткам пункта — интерактивной и обычной. */
export const itemTitleClass = 'text-[length:var(--gr-text-sm)] font-700'
export const itemDescriptionClass = 'mt-0.5 text-[length:var(--gr-text-sm)] text-[var(--gr-muted-fg)]'

export const loadingRowClass = 'px-4 py-3'

export function grListItemPaddingClass(density: GrListItemDensity): string {
  return densityPadding[density]
}
