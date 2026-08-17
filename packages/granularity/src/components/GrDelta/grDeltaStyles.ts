import type { GrComponentSize } from '../shared/sizes'

import type { GrDeltaTone } from './deltaTone'

/**
 * Классы `GrDelta`.
 *
 * Тон перечислен целиком по одному литералу на ветку: UnoCSS сканирует исходный
 * текст файла, и собранное шаблонной строкой имя (`text-[var(--gr-${tone}-text)]`)
 * уехало бы в CSS литералом.
 */

/**
 * Величина стоит в строке текста, поэтому наследует её кегль и выравнивание.
 *
 * Общего `gap` нет намеренно: префикс — это валюта, и «$ 12,50» с зазором
 * читается как опечатка. Отбивку получают только стрелка и суффикс.
 */
export const deltaRootClass = 'inline-flex items-baseline tabular-nums'

/** Суффикс — единица измерения, и от числа он отбивается: «−15 %», «120 мс». */
export const deltaSuffixClass = 'ml-1'

export const deltaToneClass: Record<GrDeltaTone, string> = {
  success: 'text-[var(--gr-success-text)]',
  danger: 'text-[var(--gr-danger-text)]',
  neutral: 'text-[var(--gr-muted-fg)]',
}

/** Прочерк вместо величины: тона у него нет, но и цвет основного текста ему не нужен. */
export const deltaEmptyClass = 'text-[var(--gr-muted-fg)]'

export const deltaSizeClass: Record<GrComponentSize, string> = {
  xs: 'text-[length:var(--gr-control-text-2xs)]',
  sm: 'text-[length:var(--gr-control-text-xs)]',
  md: 'text-[length:var(--gr-control-text-sm)]',
  lg: 'text-[length:var(--gr-control-text-md)]',
}

/**
 * Стрелка меньше кегля величины: она декоративна, и равный вес спорил бы с
 * самим числом.
 */
export const deltaArrowSizeClass: Record<GrComponentSize, string> = {
  xs: 'h-2.5 w-2.5',
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
}

/** Стрелка выравнивается по строке, а не по базовой линии: у svg её нет. */
export const deltaArrowClass = 'mr-0.5 self-center shrink-0'
