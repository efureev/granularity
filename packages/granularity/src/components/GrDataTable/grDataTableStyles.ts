import type { GrCheckboxSize } from '../GrCheckbox/grCheckboxStyles'
import type { GrComponentSize } from '../shared/sizes'

export type GrDataTableSize = GrComponentSize

/** Паддинг ячейки — и в шапке, и в теле: колонки обязаны совпадать по сетке. */
export const cellPaddings: Record<GrDataTableSize, string> = {
  xs: 'px-2 py-1.5',
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-5 py-4',
}

/** Заглушки loading/empty: по горизонтали как ячейка, по вертикали просторнее. */
export const placeholderPaddings: Record<GrDataTableSize, string> = {
  xs: 'px-2 py-3',
  sm: 'px-3 py-4',
  md: 'px-4 py-6',
  lg: 'px-5 py-8',
}

/** Подпись колонки набирается мельче тела таблицы — она не данные, а навигация. */
export const headerTextSizes: Record<GrDataTableSize, string> = {
  xs: 'text-[10px]',
  sm: 'text-[11px]',
  md: 'text-xs',
  lg: 'text-sm',
}

/**
 * Размер `GrCheckbox` в колонке выбора. Здесь не классы, а ступень шкалы:
 * коробку рисует сам чекбокс — он же держит `indeterminate`, disabled без
 * `opacity` и фокус-кольцо.
 */
export const selectCheckboxSizes: Record<GrDataTableSize, GrCheckboxSize> = {
  xs: 'xs',
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}

/** Ширина колонки выбора: коробка чекбокса плюс горизонтальный паддинг ячейки. */
export const selectColumnWidths: Record<GrDataTableSize, string> = {
  xs: 'w-7',
  sm: 'w-8',
  md: 'w-10',
  lg: 'w-12',
}

/** Зазор между подписью колонки и стрелкой сортировки. */
export const headerGaps: Record<GrDataTableSize, string> = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-2',
}

/** Спиннер в строке загрузки — тем же кеглем, что иконка сортировки рядом. */
export const spinnerSizes: Record<GrDataTableSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

/** Стрелка сортировки берёт размер из шкалы `GrIcon` (`xs…lg` → `14…20px`). */
export const sortIconSizes: Record<GrDataTableSize, GrComponentSize> = {
  xs: 'xs',
  sm: 'xs',
  md: 'sm',
  lg: 'md',
}
