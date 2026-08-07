import type { GrComponentSize } from '../shared/sizes'

export type GrPaginationSize = GrComponentSize

/** Номер страницы и многоточие: одна и та же коробка, чтобы ряд не прыгал. */
export const pageSizes: Record<GrPaginationSize, string> = {
  xs: 'h-7 min-w-7 px-1.5 text-[length:var(--gr-text-xs)]',
  sm: 'h-8 min-w-8 px-2 text-[length:var(--gr-text-xs)]',
  md: 'h-8 min-w-8 px-2 text-[length:var(--gr-text-sm)]',
  lg: 'h-10 min-w-10 px-3 text-[length:var(--gr-text-base)]',
}

/** Коробка та же, что у номера, но поле́ уже: многоточию не нужен клик-таргет. */
export const ellipsisSizes: Record<GrPaginationSize, string> = {
  xs: 'h-7 min-w-7 px-1 text-[length:var(--gr-text-xs)]',
  sm: 'h-8 min-w-8 px-1 text-[length:var(--gr-text-xs)]',
  md: 'h-8 min-w-8 px-1 text-[length:var(--gr-text-sm)]',
  lg: 'h-10 min-w-10 px-2 text-[length:var(--gr-text-base)]',
}

/** Вспомогательный текст: индикатор «текущая / всего» и подпись у поля перехода. */
export const labelSizes: Record<GrPaginationSize, string> = {
  xs: 'text-[length:var(--gr-text-xs)]',
  sm: 'text-[length:var(--gr-text-xs)]',
  md: 'text-[length:var(--gr-text-sm)]',
  lg: 'text-[length:var(--gr-text-base)]',
}

export const jumperSizes: Record<GrPaginationSize, string> = {
  xs: 'h-7 w-12 text-[length:var(--gr-text-xs)]',
  sm: 'h-8 w-14 text-[length:var(--gr-text-xs)]',
  md: 'h-8 w-14 text-[length:var(--gr-text-sm)]',
  lg: 'h-10 w-16 text-[length:var(--gr-text-base)]',
}

export const rowGaps: Record<GrPaginationSize, string> = {
  xs: 'gap-2',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-3',
}

export const pageListGaps: Record<GrPaginationSize, string> = {
  xs: 'gap-0.5',
  sm: 'gap-1',
  md: 'gap-1',
  lg: 'gap-1',
}

export const pageSizeSelectWidths: Record<GrPaginationSize, string> = {
  xs: 'min-w-[84px]',
  sm: 'min-w-[92px]',
  md: 'min-w-[100px]',
  lg: 'min-w-[112px]',
}

/**
 * Навигационные кнопки берут размер из шкалы `GrButton`, а не из своей: они
 * обязаны стоять в один ряд с номерами страниц, а высоты у `GrButton`
 * `xs…lg` — `28/32/40/44px`. На `md` номера страниц ростом `h-8`, поэтому
 * кнопке достаётся `sm`, а не одноимённый `md`.
 */
export const navButtonSizes: Record<GrPaginationSize, GrComponentSize> = {
  xs: 'xs',
  sm: 'sm',
  md: 'sm',
  lg: 'md',
}
