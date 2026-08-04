import type { GrComponentSize } from '../shared/sizes'

export type GrTableSize = GrComponentSize

/**
 * `GrTable` — «тонкий» контейнер: он задаёт только кегль таблицы, паддинги
 * ячеек остаются за потребителем (см. `GrTableProps`). Поэтому карта здесь
 * одна, а метрики ячеек живут в `GrDataTable`, который рисует их сам.
 */
export const tableSizes: Record<GrTableSize, string> = {
  xs: 'text-[12px]',
  sm: 'text-[13px]',
  md: 'text-sm',
  lg: 'text-base',
}
