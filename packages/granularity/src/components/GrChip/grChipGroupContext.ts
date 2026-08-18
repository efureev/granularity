import type { ComputedRef, InjectionKey } from 'vue'

import type { GrChipRadius, GrChipSize, GrChipTone } from './grChipStyles'

/**
 * Значение чипа в группе.
 *
 * Не только строка: набор фильтров чаще всего адресуется id. Объекты сюда
 * намеренно не входят — значение уходит в `data-value` и в скрытое поле
 * нативной формы, а значит обязано иметь однозначное строковое представление.
 */
export type GrChipValue = string | number | boolean

/** Как группа обращается со множественностью выбора. */
export type GrChipSelection = 'single' | 'multiple'

export type GrChipEntry = {
  value: () => GrChipValue
  disabled: () => boolean
  /**
   * Корневой узел чипа. Геттер, а не значение: регистрация идёт в `setup`,
   * когда элемента ещё нет. Благодаря ему группа переносит фокус, не обходя
   * DOM селекторами.
   */
  el: () => HTMLElement | null
}

export type GrChipGroupContext = {
  selection: ComputedRef<GrChipSelection>
  isSelected: (value: GrChipValue) => boolean
  toggle: (value: GrChipValue) => void
  /** Снятие чипа группа не выполняет — состав рисует потребитель; она ретранслирует. */
  requestRemove: (value: GrChipValue) => void
  disabled: ComputedRef<boolean>
  /** Выбор видно, но он не меняется. Группа объявляет это `aria-readonly` на себе. */
  readonly: ComputedRef<boolean>
  invalid: ComputedRef<boolean>
  closable: ComputedRef<boolean>
  size: ComputedRef<GrChipSize>
  tone: ComputedRef<GrChipTone | undefined>
  radius: ComputedRef<GrChipRadius | undefined>
  dark: ComputedRef<boolean | undefined>
  /**
   * Регистрация чипа в группе. Порядок регистрации совпадает с порядком в
   * документе (setup детей идёт сверху вниз), поэтому состав известен и на
   * сервере — без обхода DOM.
   */
  register: (entry: GrChipEntry) => () => void
  /**
   * Значение чипа, который держит `tabindex="0"`. Roving tabindex: группа —
   * одна остановка Tab, внутрь попадают стрелками.
   */
  rovingValue: ComputedRef<GrChipValue | undefined>
  /** Стрелки, `Home`, `End`. Вернул `true` — клавиша обработана. */
  handleNavigationKeys: (event: KeyboardEvent) => boolean
}

export const GR_CHIP_GROUP_CONTEXT: InjectionKey<GrChipGroupContext> = Symbol('GR_CHIP_GROUP_CONTEXT')
