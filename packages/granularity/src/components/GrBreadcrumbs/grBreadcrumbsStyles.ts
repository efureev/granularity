import type { Component } from 'vue'

import type { GrComponentSize } from '../shared/sizes'

export type GrBreadcrumbsSize = GrComponentSize

/** Пункт пути. Кроме `label` всё опционально: последний пункт обычно без ссылки. */
export type GrBreadcrumbItem = {
  label: string
  href?: string
  /** Цель роутерной ссылки: уезжает в `GrLink` через `attrs` вместе с `as`. */
  to?: unknown
  /** Класс иконки перед подписью (`i-lucide-*`) — иконка декоративна. */
  icon?: string
  disabled?: boolean
  /** Доступное имя пункта, когда подписи недостаточно («Настройки» → «Настройки проекта»). */
  ariaLabel?: string
}

export const breadcrumbsRootClass = 'w-full min-w-0'
export const breadcrumbsListClass = 'flex flex-wrap items-center gap-1 m-0 p-0 [list-style:none]'

/** Кегль строки пути. Шкала общая с `GrLink`: путь — это ряд ссылок. */
export const breadcrumbsSizeClassBySize: Record<GrBreadcrumbsSize, string> = {
  xs: 'text-[length:var(--gr-text-xs)]',
  sm: 'text-[length:var(--gr-text-sm)]',
  md: 'text-[length:var(--gr-text-sm)]',
  lg: 'text-[length:var(--gr-text-base)]',
}

export const breadcrumbsSeparatorClass = 'select-none text-[var(--gr-muted-fg)]'

/** Текущая страница: не ссылка, но и не «выключенный» текст — обычный акцент подписи. */
export const breadcrumbsCurrentClass = 'inline-flex items-center gap-1 min-w-0 font-600 text-[var(--gr-fg)]'

export const breadcrumbsItemIconClass = 'inline-block h-4 w-4 shrink-0'

export const breadcrumbsLabelClass = 'truncate'

/**
 * Кнопка «…»: раскрывает схлопнутую середину пути на месте. Оформлена как
 * приглушённая ссылка, чтобы не выбиваться из ряда.
 */
export const breadcrumbsEllipsisClass = 'inline-flex items-center rounded-[var(--gr-radius-sm)] px-1 text-[var(--gr-muted-fg)] hover:text-[var(--gr-fg)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]'

export type GrBreadcrumbsLinkComponent = string | Component

/**
 * Раскладка пути: какие пункты видны и где стоит кнопка раскрытия.
 *
 * Чистая функция, потому что вся её сложность — арифметика границ, и проверять
 * её монтированием компонента дороже, чем таблицей входов.
 */
export type GrBreadcrumbsLayoutEntry =
  | { kind: 'item', item: GrBreadcrumbItem, index: number }
  | { kind: 'ellipsis', hiddenCount: number }

export function resolveBreadcrumbsLayout(options: {
  items: GrBreadcrumbItem[]
  maxItems?: number
  itemsBeforeCollapse: number
  itemsAfterCollapse: number
  expanded: boolean
}): GrBreadcrumbsLayoutEntry[] {
  const { items, maxItems, itemsBeforeCollapse, itemsAfterCollapse, expanded } = options
  const all: GrBreadcrumbsLayoutEntry[] = items.map((item, index) => ({ kind: 'item', item, index }))

  if (expanded || !maxItems || maxItems < 1 || items.length <= maxItems)
    return all

  // Хвост важнее головы: «где я сейчас» читается справа, поэтому при нехватке
  // места сначала жертвуем серединой, а не концом.
  const before = Math.max(0, Math.min(itemsBeforeCollapse, items.length))
  const after = Math.max(0, Math.min(itemsAfterCollapse, items.length - before))
  const hiddenCount = items.length - before - after

  if (hiddenCount <= 1)
    return all

  return [
    ...all.slice(0, before),
    { kind: 'ellipsis', hiddenCount },
    ...all.slice(items.length - after),
  ]
}
