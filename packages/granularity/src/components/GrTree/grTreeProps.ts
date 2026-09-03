import type { Component, HTMLAttributes } from 'vue'

import type { GrTreeSize } from './grTreeStyles'
import type {
  GrTreeAllowDropType,
  GrTreeKey,
  GrTreeNode,
} from './grTreeTypes'

export type NodeKeyProp<T extends object> = Extract<keyof T, string>

export type GrTreePropsMap = {
  children?: string
  label?: string
  /** Поле данных «узел — лист». Нужно ленивому режиму: детей ещё нет, а раскрывать нечего. */
  isLeaf?: string
}

export type GrTreeFilterNodeMethod<T extends object = any> = (value: string, data: T, node?: GrTreeNode<T>) => boolean

export type GrTreeBranchLine = 'line' | 'elbow'

export type GrTreeBranchLineColor<T extends object = any> = string | ((node: GrTreeNode<T>) => string | undefined | null)

export type GrTreeVisibleRow<T extends object> = {
  node: GrTreeNode<T>
  isExpanded: boolean
  isLeaf: boolean
  isMatched: boolean
  /**
   * Место узла среди соседей. В плоском DOM группы нет, поэтому структуру
   * дерева диктору сообщают `aria-level` + `aria-posinset` + `aria-setsize`.
   */
  posInSet: number
  setSize: number
  /** Идёт ли сейчас ленивая загрузка детей этого узла. */
  isLoading: boolean
  /** Цвета направляющих для уровней предков (пусто, если `branchLine` выключен). */
  branchColors: string[]
}

export type GrTreeClassValue = HTMLAttributes['class']
export type GrTreeNodeClass<T extends object> = GrTreeClassValue | ((row: GrTreeVisibleRow<T>) => GrTreeClassValue)

export type GrTreeDataProps<T extends object> = {
  data: T[]
  props?: GrTreePropsMap
  nodeKey?: NodeKeyProp<T> | 'id'
  defaultExpandedKeys?: GrTreeKey[]
  /**
   * Раскрывать узлы, как только они появились в данных. Уже свёрнутое руками
   * не раскрывается обратно на каждом обновлении `data`.
   */
  defaultExpandAll?: boolean
  filterNodeMethod?: GrTreeFilterNodeMethod<T>
  /**
   * Значение фильтра. Проп, а не только метод `filter()`: обёртке иначе
   * приходится держать `ref` на дерево и гонять значение в обход собственного
   * реактивного контура.
   *
   * Результат фильтрации дерево сообщает событием `filter` — без него нельзя
   * отличить «данных нет» от «поиск ничего не нашёл», а это разные экраны.
   */
  filterValue?: string
  /**
   * Ленивый режим: дети ветки приходят по её раскрытию через `load`.
   * Узел считается разворачиваемым, пока не доказано обратное — полем `isLeaf`
   * из карты `props`.
   */
  lazy?: boolean
  /** Загрузчик ветки. `resolve` дописывает детей в данные узла. */
  load?: GrTreeLoad<T>
}

export type GrTreeLoad<T extends object = any> = (
  node: GrTreeNode<T>,
  resolve: (children: T[]) => void,
) => void

export type GrTreeViewProps<T extends object> = {
  /** Размер строки: высота, отступы, иконки и кегль подписи. */
  size?: GrTreeSize
  /** Шаг отступа уровня в пикселях. `0` — значение из темы (`--gr-tree-indent-step`). */
  indent?: number
  /**
   * Виртуализация: в DOM живёт только окно вокруг вьюпорта.
   *
   * Требует `maxHeight` — без ограниченной высоты окна прокрутки не существует;
   * скроллером в этом режиме становится сам корень дерева.
   *
   * Включается осознанно: на списке в сотню узлов выигрыша нет, а в DOM остаётся
   * только окно — вместе с ним меняется и то, что находит `querySelector`
   * потребителя.
   *
   * Ограничение: перетаскивание работает по отрисованным строкам — уронить узел
   * на тот, которого нет на экране, нельзя.
   */
  virtual?: boolean
  /** Максимальная высота дерева со своим скроллером. Число — пиксели. */
  maxHeight?: number | string
  highlightCurrent?: boolean
  /**
   * Иконка свёрнутого узла: Vue-компонент либо класс иконки вашей UnoCSS-сборки
   * (`'i-lucide-plus'` — тогда нужен ваш `presetIcons`, см. `docs/installation.md`).
   * Не задана — встроенная стрелка.
   */
  expandIcon?: string | Component
  /** Иконка раскрытого узла. Не задана — та же встроенная стрелка, повёрнутая. */
  collapseIcon?: string | Component
  toggleIconRotate?: boolean
  /**
   * Направляющие уровней. `true` — то же, что `'line'`: одна вертикаль на
   * уровень. `'elbow'` добавляет горизонтальное колено к строке и обрывает
   * линию на середине последнего ребёнка — так видно не только уровень, но и
   * то, какие ветки ещё продолжаются.
   */
  branchLine?: boolean | GrTreeBranchLine
  branchLineColor?: GrTreeBranchLineColor<T>
  branchLineActiveColor?: GrTreeBranchLineColor<T>
  rowClass?: GrTreeNodeClass<T>
  dragHandleClass?: GrTreeNodeClass<T>
  toggleClass?: GrTreeNodeClass<T>
  toggleIconClass?: GrTreeNodeClass<T>
  toggleSpacerClass?: GrTreeNodeClass<T>
  contentClass?: GrTreeNodeClass<T>
  /** i18n-метка кнопки "Перетащить" (default: 'Drag'). */
  dragLabel?: string
  /** i18n-метка кнопки "Развернуть" (default: 'Expand'). */
  expandLabel?: string
  /** i18n-метка кнопки "Свернуть" (default: 'Collapse'). */
  collapseLabel?: string
}

export type GrTreeInteractionProps<T extends object> = {
  /** Клик по строке раскрывает/сворачивает узел, а не только выбирает его. */
  expandOnClickNode?: boolean
  /** На каждом уровне раскрыт максимум один узел. */
  accordion?: boolean
  draggable?: boolean
  /** Иконка ручки переноса: компонент, класс иконки или ничего — тогда встроенная. */
  dragHandleIcon?: string | Component
  allowDrop?: (draggingNode: GrTreeNode<T>, dropNode: GrTreeNode<T>, type: GrTreeAllowDropType) => boolean
  allowDrag?: (draggingNode: GrTreeNode<T>) => boolean
  /**
   * Когда показывать ручку переноса.
   *
   * `hover` — только под курсором; `always` — всегда; `auto` (по умолчанию) —
   * `always` там, где наведения не бывает (`@media (hover: none)`), иначе
   * `hover`. На тач-устройстве ручка «по наведению» недостижима вовсе, то есть
   * перетаскивания там нет — а это не решение дизайна, а отсутствие функции.
   */
  dragHandleVisibility?: 'hover' | 'always' | 'auto'
}

export type GrTreeSelectionProps = {
  /** Чекбоксы у узлов: множественный выбор поверх дерева. */
  showCheckbox?: boolean
  /**
   * Текущий узел — `v-model:current-key`.
   *
   * Не задан — дерево ведёт текущий узел само, как и раньше. Задан — источник
   * правды снаружи: подсветка строки и признак, по которому обёртка рисует
   * собственные детали, перестают быть двумя разными состояниями, способными
   * разойтись на такт.
   */
  currentKey?: GrTreeKey | null
  /** Отмеченные ключи (`v-model:checked-keys`). */
  checkedKeys?: GrTreeKey[]
  defaultCheckedKeys?: GrTreeKey[]
  /** Не связывать родителей и детей: каждый узел отмечается сам по себе. */
  checkStrictly?: boolean
}

export type GrTreeProps<T extends object> = GrTreeDataProps<T>
  & GrTreeViewProps<T>
  & GrTreeSelectionProps
  & GrTreeInteractionProps<T>
