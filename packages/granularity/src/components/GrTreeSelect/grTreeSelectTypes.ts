import type { GrControlShape } from '../shared/controlShape'
import type { InputHTMLAttributes } from 'vue'
import type { GrInputSize } from '../GrInput/GrInput.vue'
import type { GrTreeFilterNodeMethod, GrTreeKey, GrTreePropsMap } from '../GrTree'
import type { GrBadgeRadius, GrBadgeSize, GrBadgeTone } from '../GrBadge/grBadgeStyles'
import type { GrTreeSelectState } from './grTreeSelectStyles'

export type GrTreeSelectModelValue = GrTreeKey | GrTreeKey[] | null

export type GrTreeSelectValueDisplay = 'label' | 'path'

type NodeKeyProp<T> = keyof T & string

/**
 * Пропсы публичного GR-примитива «TreeSelect».
 */
export interface GrTreeSelectProps<T extends object = any> {
  modelValue: GrTreeSelectModelValue
  data: T[]
  props?: GrTreePropsMap
  nodeKey?: NodeKeyProp<T> | 'id'
  defaultExpandedKeys?: GrTreeKey[]
  disabled?: boolean

  placeholder?: string
  size?: GrInputSize
  /** Форма рамки. `box` — скругление шкалы контролов; `pill` — пилюля. */
  shape?: GrControlShape
  /**
   * Данные ещё едут. Панель показывает индикатор вместо «Нет данных» — иначе
   * пустой ответ и незагруженный выглядят одинаково.
   */
  loading?: boolean
  invalid?: boolean
  /** Только для чтения: значение видно, но не меняется. */
  readonly?: boolean
  /** Обязательное поле (`aria-required`). */
  required?: boolean
  /** Доступное имя вне `GrFormField`. */
  ariaLabel?: string
  state?: GrTreeSelectState

  multiple?: boolean
  /**
   * Чекбоксы в дереве вместо собственной галочки: отметка родителя каскадом
   * закрывает поддерево, полувыбранный родитель показывается `mixed`. Работает
   * только вместе с `multiple`.
   */
  showCheckbox?: boolean
  /** Отвязать родителей от детей: отметка перестаёт распространяться каскадом. */
  checkStrictly?: boolean

  /**
   * Чипы выбранных узлов в триггере вместо строки «a, b, c». Работает только
   * вместе с `multiple`: у одиночного выбора чип был бы плашкой на одно значение.
   */
  tags?: boolean
  /**
   * Сколько чипов показать до сворачивания остатка в «+N». Без него растёт весь
   * набор, а высота триггера за ним не идёт — лишние чипы уходят за край.
   */
  maxTagCount?: number
  /**
   * Вид чипов. Чип — это `GrBadge`: своя плашка на светлой теме почти не
   * отличалась бы от фона поля. Имена и шкалы те же, что у `GrSelect`, — переходя
   * с одного компонента на другой, потребитель не переучивается.
   */
  tagTone?: GrBadgeTone
  tagDark?: boolean
  tagSize?: GrBadgeSize
  tagRadius?: GrBadgeRadius
  clearable?: boolean

  /**
   * Контролируемое состояние панели (`v-model:open`). Без пропа панель ведёт
   * себя сама (uncontrolled), с ним — слушайте `update:open` и меняйте проп.
   */
  open?: boolean

  /** Имя для нативной формы: hidden input на каждый выбранный ключ. */
  name?: string

  /** Как отображать выбранное значение в single-режиме. */
  valueDisplay?: GrTreeSelectValueDisplay

  filterable?: boolean
  filterPlaceholder?: string
  filterInputmode?: InputHTMLAttributes['inputmode']
  filterNodeMethod?: GrTreeFilterNodeMethod<T>

  closeOnSelect?: boolean
  dropdownMaxHeight?: number
  /**
   * Виртуализация дерева в панели: в DOM живёт только окно вокруг вьюпорта.
   *
   * Скроллером в этом режиме становится само дерево, а не контейнер панели —
   * два вложенных скроллера дали бы две полосы прокрутки на одном списке.
   */
  virtual?: boolean

  /**
   * Ширины аддонов `prefix`/`suffix` — общий контракт контролов пакета
   * (`docs/form-controls.md`).
   */
  prefixMinWidth?: string
  prefixMaxWidth?: string
  suffixMinWidth?: string
  suffixMaxWidth?: string
  prefixFixed?: boolean
  suffixFixed?: boolean
}
