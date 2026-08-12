import type { ComputedRef, InjectionKey } from 'vue'

import type { GrButtonSize } from '../GrButton/grButtonStyles'

/**
 * Значение переключателя. Не только строка: перечисления в реальных формах —
 * это id числом или флаг. Объекты сюда намеренно не входят: значение уходит в
 * `data-value` и в скрытый input нативной формы, а значит должно иметь
 * однозначное строковое представление.
 */
export type GrRadioValue = string | number | boolean

export type GrRadioEntry = {
  value: () => GrRadioValue
  disabled: () => boolean
  /**
   * Корневой узел переключателя. Геттер, а не значение: регистрация идёт в
   * `setup`, когда элемента ещё нет. Благодаря ему группа переносит фокус, не
   * обходя DOM селекторами.
   */
  el: () => HTMLElement | null
}

export type GrRadioGroupContext = {
  modelValue: ComputedRef<GrRadioValue>
  name: ComputedRef<string | undefined>
  disabled: ComputedRef<boolean>
  /**
   * Только для чтения: выбор видно, но он не меняется. У роли `radio` нет
   * `aria-readonly` — состояние объявляет сама группа, переключателю остаётся
   * не прикидываться кликабельным.
   */
  readonly: ComputedRef<boolean>
  /** Ошибка группы: до вида переключателя она доходит только через контекст. */
  invalid: ComputedRef<boolean>
  size: ComputedRef<GrButtonSize>
  setValue: (value: GrRadioValue) => void
  /**
   * Регистрация переключателя в группе. Порядок регистрации совпадает с
   * порядком в документе (setup детей идёт сверху вниз), поэтому группа знает
   * состав и в slot-режиме, и на сервере — без обхода DOM.
   */
  register: (entry: GrRadioEntry) => () => void
  /**
   * Значение переключателя, который держит `tabindex="0"`. Roving tabindex
   * WAI-ARIA: группа — одна остановка Tab, внутрь попадают стрелками. Если не
   * выбрано ничего, остановкой становится первый доступный переключатель.
   */
  rovingValue: ComputedRef<GrRadioValue | undefined>
  /**
   * Стрелки, `Home`, `End`: переносят выбор и фокус на соседний доступный
   * переключатель. Вернул `true` — клавиша обработана (с `preventDefault`).
   * Кольцо ведёт группа, а не переключатель: только она знает состав.
   */
  handleNavigationKeys: (event: KeyboardEvent) => boolean
}

export const GR_RADIO_GROUP_CONTEXT: InjectionKey<GrRadioGroupContext> = Symbol('GR_RADIO_GROUP_CONTEXT')
