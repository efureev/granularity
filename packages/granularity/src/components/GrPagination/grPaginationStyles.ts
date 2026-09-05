import type { GrComponentSize } from '../shared/sizes'

export type GrPaginationSize = GrComponentSize

/**
 * Номер страницы и многоточие: одна и та же коробка, чтобы ряд не прыгал.
 *
 * Высоты — шкала `GrButton` (`28/32/40/44`), а не своя. Номера стоят с
 * навигационными кнопками в одном ряду, и собственная шкала это ломала:
 * `sm` и `md` были одной коробкой `h-8`, а кнопке приходилось выдавать размер
 * на ступень ниже имени. Имя `pageBoxSizes`, а не `pageSizes`, потому что
 * `pageSizes` — проп со списком размеров страницы, и одно имя на два разных
 * понятия в одном компоненте читается как ошибка.
 */
export const pageBoxSizes: Record<GrPaginationSize, string> = {
  xs: 'h-7 min-w-7 px-1.5 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'h-8 min-w-8 px-2 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  md: 'h-10 min-w-10 px-2 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  lg: 'h-11 min-w-11 px-3 text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
}

/** Коробка та же, что у номера, но поле́ уже: многоточию не нужен клик-таргет. */
export const ellipsisSizes: Record<GrPaginationSize, string> = {
  xs: 'h-7 min-w-7 px-1 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'h-8 min-w-8 px-1 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  md: 'h-10 min-w-10 px-1 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  lg: 'h-11 min-w-11 px-2 text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
}

/** Вспомогательный текст: индикатор «текущая / всего» и подпись у поля перехода. */
export const labelSizes: Record<GrPaginationSize, string> = {
  xs: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  md: 'text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  lg: 'text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
}

export const jumperSizes: Record<GrPaginationSize, string> = {
  xs: 'h-7 w-12 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  sm: 'h-8 w-14 text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]',
  md: 'h-10 w-14 text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]',
  lg: 'h-11 w-16 text-[length:var(--gr-text-base)] leading-[var(--gr-leading-base)]',
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
 * Навигационные кнопки берут свой размер один в один: коробка номера теперь
 * той же высоты, что и `GrButton` того же имени, и сдвигать ступень больше не
 * нужно. Отображение оставлено явным — оно называет инвариант «кнопка и номер
 * одного роста», который иначе держался бы на совпадении двух шкал.
 */
export const navButtonSizes: Record<GrPaginationSize, GrComponentSize> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}
