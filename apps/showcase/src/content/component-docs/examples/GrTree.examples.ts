import type { ShowcaseComponentExampleDoc } from '../types'

export const grTreeExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tree-expanded-state',
    title: 'Controlled expanded state and branch lines',
    description: 'Показываем `GrTree` как иерархический explorer, где внешняя orchestration управляет раскрытием групп и визуальными branch lines.',
    status: 'ready',
    previewKey: 'gr-tree-expanded-state',    note: 'Этот сценарий подчёркивает, что `GrTree` хорошо работает как controlled navigation/data primitive, а не только как статичное дерево.',
  },
  {
    id: 'tree-filtering',
    title: 'Filtering through instance API',
    description: 'Фильтрацию важно показывать не как магический prop, а как реальную интеграцию через expose-метод `filter()` и внешний input.',
    status: 'ready',
    previewKey: 'gr-tree-filtering',    note: 'Полезный integration recipe для search/filter поверх больших справочников и nested navigation.',
  },
  {
    id: 'tree-drag-and-slot',
    title: 'Drag-and-drop with custom row slot',
    description: 'Комбинируем две важные возможности complex-дерева: rearrange drag-and-drop и кастомный рендер строки через default slot.',
    status: 'ready',
    previewKey: 'gr-tree-drag-and-slot',    note: 'Сценарий особенно важен для real-world деревьев с ownership/status метаданными и операторскими перестановками.',
  },
  {
    id: 'tree-sizes',
    title: 'Шкала размеров',
    description: 'Размер выражен CSS-переменными `--gr-tree-*`: те же точки кастомизации, что и для ручной настройки, — `size` просто задаёт им дефолты.',
    status: 'ready',
    previewKey: 'gr-tree-sizes',
  },
  {
    id: 'tree-checkboxes',
    title: 'Checkboxes and multiple selection',
    description: 'Чекбоксы включаются пропом `show-checkbox`, набор ведётся через `v-model:checked-keys`. Родитель отмечается каскадом и показывает `mixed`, когда отмечена часть детей; `check-strictly` эту связь отключает. Состояние объявляется на самом узле (`aria-checked`), а квадратик остаётся декоративным — вкладывать интерактивный чекбокс внутрь роли `treeitem` нельзя.',
    status: 'ready',
    previewKey: 'gr-tree-checkboxes',
  },
  {
    id: 'tree-lazy',
    title: 'Lazy branches',
    description: 'В режиме `lazy` дети ветки приходят по её раскрытию: `load` получает узел и `resolve`, на время запроса строка показывает спиннер и помечается `aria-busy`. Повторное раскрытие запрос не делает. Лист объявляется полем `isLeaf` в данных — иначе дерево считает ветку разворачиваемой, пока не доказано обратное.',
    status: 'ready',
    previewKey: 'gr-tree-lazy',
  },
  {
    id: 'tree-keyboard',
    title: 'Клавиатура и режимы раскрытия',
    description: 'Typeahead по первым буквам, `*` на весь уровень, плюс `accordion` и `expandOnClickNode` — то, чем дерево управляется без мыши.',
    status: 'ready',
    previewKey: 'gr-tree-keyboard',
  },
  {
    id: 'tree-virtual',
    title: 'Дерево на 10 000 узлов',
    description: 'С `virtual` и `maxHeight` дерево держит в DOM только окно вокруг вьюпорта, а скроллером становится его корень. Плоская разметка строк это и открывает.',
    status: 'ready',
    previewKey: 'gr-tree-virtual',    note: '`aria-setsize`/`aria-posinset` остаются от полного набора, а не от окна. Перетаскивание при этом работает по отрисованным строкам: уронить узел на тот, которого нет на экране, нельзя.',
  },
]
