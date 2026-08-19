import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

import type { GrDashboardTransfer } from '../../composables/useDashboardTransfer'
import type {
  GrDashboardBreakpoint,
  GrDashboardCell,
  GrDashboardItemLayout,
  GrDashboardLayout,
  GrDashboardMoveOptions,
  GrDashboardRect,
  GrDashboardSpan,
} from '../../layout'
import type { GrDashboardMode } from './grDashboardStyles'

/**
 * Границы, объявленные самим виджетом.
 *
 * Раскладка приходит из приложения и про виджет знает только координаты;
 * «этот график ниже трёх строк не читается» знает виджет. Поэтому границы
 * едут не в раскладке, а регистрацией — и применяются к записи поверх неё.
 */
export interface GrDashboardItemBounds {
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
  static?: boolean
  /**
   * Запрет переноса и растягивания для одного виджета.
   *
   * Не задан — действует правило сетки. Отличие от `static`: тот про раскладку
   * («не двигается и соседям не даёт себя двигать»), а эти два — про
   * интерфейс, и каждый снимается по отдельности.
   */
  draggable?: boolean
  resizable?: boolean
  /** Имя виджета для ручек и объявлений. */
  title?: string
}

/**
 * Всё, что нужно, чтобы положить брошенный виджет ровно туда, где стояла подложка.
 *
 * `breakpoint` и `options` — не полнота ради полноты: без первого приложение
 * пишет в `lg`, когда пользователь на `sm`, а со своими опциями считает
 * раскладку не так, как её посчитала сетка, и получает не то, что было показано.
 */
export interface GrDashboardDropEvent {
  transfer: GrDashboardTransfer
  /** Ячейка левого верхнего угла — та же, что показывала подложка. */
  cell: GrDashboardCell
  breakpoint: GrDashboardBreakpoint
  options: GrDashboardMoveOptions
}

/** Геометрия виджета, который сейчас несут: выставляется один раз на старте жеста. */
export interface GrDashboardActiveGeometry {
  id: string
  kind: 'move' | 'resize'
  rect: GrDashboardRect
}

export interface GrDashboardContext {
  mode: ComputedRef<GrDashboardMode>
  cols: ComputedRef<number>
  draggable: ComputedRef<boolean>
  resizable: ComputedRef<boolean>
  lazy: ComputedRef<boolean>
  layout: ComputedRef<GrDashboardLayout>
  order: ComputedRef<string[]>
  itemFor: (id: string) => GrDashboardItemLayout | undefined
  activeGeometry: Readonly<Ref<GrDashboardActiveGeometry | null>>
  grabbedId: Readonly<Ref<string | null>>

  registerItem: (id: string, bounds: GrDashboardItemBounds) => void
  unregisterItem: (id: string) => void
  setHandleElement: (id: string, el: HTMLElement | null) => void
  setItemElement: (id: string, el: HTMLElement | null) => void
  /**
   * Подписать тело виджета на общий наблюдатель размера.
   *
   * Наблюдатель один на всю сетку и здесь: `ResizeObserver` умеет следить за
   * многими элементами, а N инстансов на N виджетов — это N очередей коллбэков
   * там, где хватает одной.
   */
  observeBody: (el: HTMLElement, onResize: () => void) => void
  unobserveBody: (el: HTMLElement) => void

  startMove: (id: string, event: PointerEvent) => void
  startResize: (id: string, event: PointerEvent) => void
  onHandleKeydown: (id: string, event: KeyboardEvent) => void
  onResizeKeydown: (id: string, event: KeyboardEvent) => void
  onHandleFocus: (id: string) => void

  /** Виджет попросил открыть свои настройки. Сетка только пересылает это наружу. */
  requestSettings: (id: string) => void
  /** Разрешено ли растягивать этот виджет: правило сетки, сужённое виджетом, плюс `static`. */
  canResize: (id: string) => boolean
  /**
   * Программное изменение размера — единственный путь мимо жеста и клавиатуры.
   *
   * Возвращает, изменилась ли раскладка. Отказ (`static`, `preventCollision`,
   * соседняя статика) обязан быть виден вызывающему: `resizeItem` в этом случае
   * молча отдаёт исходную раскладку, и тот, кто показал форму, должен уметь
   * сказать «не поместилось» вместо того, чтобы закрыться над несделанным.
   */
  resizeItemTo: (id: string, span: GrDashboardSpan) => boolean

  tabindexFor: (id: string) => 0 | -1
  dragLabelFor: (id: string) => string
  resizeLabelFor: (id: string) => string
}

export const GR_DASHBOARD_KEY: InjectionKey<GrDashboardContext> = Symbol('gr-dashboard')

/**
 * Контекст дашборда, если виджет стоит внутри него.
 *
 * `null` — легальный ответ: `GrDashboardPalette` и `GrDashboardToolbar`
 * работают и снаружи, через собственные пропы и эмиты.
 */
export function useGrDashboardContext(): GrDashboardContext | null {
  return inject(GR_DASHBOARD_KEY, null)
}
