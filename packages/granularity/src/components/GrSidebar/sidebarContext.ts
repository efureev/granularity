import type { ComputedRef, InjectionKey, Ref } from 'vue'

import type { GrSidebarPosition } from './grSidebarStyles'

/**
 * Контекст `GrSidebar`, который потребляют `GrSidebarItem`'ы: свёрнута ли панель.
 * В свёрнутом состоянии пункты показывают только иконку (или первую букву метки).
 */
export interface GrSidebarContext {
  collapsed: Ref<boolean>
  /**
   * Сторона панели. Пункту она нужна ради подсказки в свёрнутом режиме: та
   * обязана уходить **от** панели, иначе накроет саму себя.
   */
  position: ComputedRef<GrSidebarPosition> | Ref<GrSidebarPosition>
  /**
   * Развернуть панель. Нужна пункту с подпунктами: в свёрнутом рейле ветке
   * негде показаться, и нажатие на неё обязано сперва вернуть панели ширину —
   * иначе это кнопка, от которой ничего не происходит.
   *
   * Отдельным методом, а не записью в `collapsed`: состояние может быть
   * контролируемым, и без эмита родитель разошёлся бы с панелью.
   */
  expand: () => void
}

export const GR_SIDEBAR_KEY: InjectionKey<GrSidebarContext> = Symbol.for('@feugene/granularity/sidebar')

/**
 * Уровень вложенности пункта. Раздаётся не панелью, а самими пунктами: каждый
 * объявляет своим детям `level + 1`, поэтому глубина считается разметкой, а не
 * пропом, который потребителю пришлось бы проставлять руками и держать в
 * синхроне при перестановке ветки.
 */
export const GR_SIDEBAR_LEVEL_KEY: InjectionKey<number> = Symbol.for('@feugene/granularity/sidebar-level')
