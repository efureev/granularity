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
  /** Выбранный ключ или `null`; при `multiple` — массив ключей (`v-model`). */
  modelValue: GrTreeSelectModelValue
  /** Узлы дерева верхнего уровня; дети лежат в поле из `props.children`. */
  data: T[]
  /** Имена полей узла: детей и подписи. По умолчанию `children` и `label`. */
  props?: GrTreePropsMap
  /**
   * Поле-ключ узла — его значения уходят в модель. По умолчанию `id`; без значения ключом
   * становится позиция узла в дереве.
   */
  nodeKey?: NodeKeyProp<T> | 'id'
  /** Ключи узлов, раскрытых в дереве панели с самого начала. */
  defaultExpandedKeys?: GrTreeKey[]
  /**
   * Недоступен: панель не открывается, значение не меняется. Складывается по «или» с полем
   * и формой.
   */
  disabled?: boolean

  /** Текст триггера, пока ничего не выбрано. */
  placeholder?: string
  /**
   * Высота триггера и кегль по шкале контролов; дерево в панели берёт ту же ступень.
   * По умолчанию `md`.
   */
  size?: GrInputSize
  /** Форма рамки. `box` — скругление шкалы контролов; `pill` — пилюля. */
  shape?: GrControlShape
  /**
   * Данные ещё едут. Панель показывает индикатор вместо «Нет данных» — иначе
   * пустой ответ и незагруженный выглядят одинаково.
   */
  loading?: boolean
  /** Визуальное и ARIA-состояние ошибки; сильнее `state`. Складывается по «или» с `GrFormField`. */
  invalid?: boolean
  /** Только для чтения: значение видно, но не меняется. */
  readonly?: boolean
  /** Обязательное поле (`aria-required`). */
  required?: boolean
  /** Доступное имя вне `GrFormField`. */
  ariaLabel?: string
  /**
   * Подсветка рамки по решению разработчика. `success` и `warning` добавляют иконку и скрытую
   * подпись; `invalid` сильнее. По умолчанию `default`.
   */
  state?: GrTreeSelectState

  /** Множественный выбор: модель — массив ключей, клик по узлу переключает его. */
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
  /** Плотная заливка чипов в режиме `tags`. */
  tagDark?: boolean
  /** Размер чипов по шкале `GrBadge`. По умолчанию `sm`. */
  tagSize?: GrBadgeSize
  /** Скругление чипов: `square`, `semi` или `round`. По умолчанию `round`. */
  tagRadius?: GrBadgeRadius
  /** Крестик очистки на месте шеврона, когда что-то выбрано. По умолчанию `false`. */
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

  /** Поле поиска над деревом; без `filterNodeMethod` узлы ищутся подстрокой в подписи. */
  filterable?: boolean
  /** Подсказка в поле поиска. По умолчанию — переведённое «Search…». */
  filterPlaceholder?: string
  /** `inputmode` поля поиска — какую экранную клавиатуру показать на мобильных. */
  filterInputmode?: InputHTMLAttributes['inputmode']
  /** Своё правило совпадения узла с запросом вместо подстрочного поиска по подписи. */
  filterNodeMethod?: GrTreeFilterNodeMethod<T>

  /** Закрывать панель после выбора узла. По умолчанию — только при одиночном выборе. */
  closeOnSelect?: boolean
  /** Максимальная высота панели с деревом, px. По умолчанию `320`. */
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
  /** Максимальная ширина префикса: содержимое шире обрезается. */
  prefixMaxWidth?: string
  /** Минимальная ширина суффикса. По умолчанию — по ступени размера. */
  suffixMinWidth?: string
  /** Максимальная ширина суффикса: содержимое шире обрезается. */
  suffixMaxWidth?: string
  /** Жёсткая ширина префикса: `prefixMaxWidth`, иначе `prefixMinWidth`, иначе по ступени размера. */
  prefixFixed?: boolean
  /** Жёсткая ширина суффикса: `suffixMaxWidth`, иначе `suffixMinWidth`, иначе по ступени размера. */
  suffixFixed?: boolean
}
