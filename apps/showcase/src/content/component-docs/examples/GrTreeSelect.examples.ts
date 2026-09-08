import type { ShowcaseComponentExampleDoc } from '../types'

export const grTreeSelectExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tree-select-addons',
    title: 'Addons in the trigger',
    description: 'Иконка и валюта в триггере: `prefixFixed` держит ширину аддона, поэтому колонка полей не плывёт.',
    status: 'ready',
    previewKey: 'gr-tree-select-addons',
  },
  {
    id: 'tree-select-path-display',
    title: 'Single select with path display',
    description: 'Базовый сценарий для `GrTreeSelect`: single-value режим с `valueDisplay="path"`, когда пользователю нужен контекст полной ветки.',
    status: 'ready',
    previewKey: 'gr-tree-select-path-display',
  },
  {
    id: 'tree-select-tags',
    title: 'Чипы выбранных узлов',
    description: '`tags` показывает выбранное чипами вместо строки «a, b, c»: крестик снимает свой узел, не открывая панель. `max-tag-count` держит ряд в одну строку — остаток сворачивается в «+N». Чипы лежат рядом с триггером, а не внутри: `role="combobox"` делает потомков презентационными, и крестик внутри был бы недостижим с клавиатуры.',
    status: 'ready',
    previewKey: 'gr-tree-select-tags',
  },
  {
    id: 'tree-select-multiple-filter',
    title: 'Multiple selection with filtering',
    description: 'Показываем наиболее ценный complex-flow: multi-select режим, встроенный filter и `closeOnSelect=false` для пакетного выбора узлов.',
    status: 'ready',
    previewKey: 'gr-tree-select-multiple-filter',
    note: 'Это хороший reference для permission matrices, taxonomy pickers и bulk-assignment flows.',
  },
  {
    id: 'tree-select-custom-slots',
    title: 'Custom trigger value and node slots',
    description: 'Документируем slot API компонента: кастомный value-preview в trigger и enriched node rendering внутри dropdown-tree.',
    status: 'ready',
    previewKey: 'gr-tree-select-custom-slots',
    note: 'Этот пример помогает увидеть, как `GrTreeSelect` превращается из generic picker в domain-specific selector без форка компонента.',
  },
  {
    id: 'tree-select-keyboard',
    title: 'Клавиатура и загрузка справочника',
    description: 'Стрелка с поля открывает панель и уводит в дерево, `Esc` возвращает фокус обратно, а `loading` не даёт спутать «ещё едет» с «ничего нет».',
    status: 'ready',
    previewKey: 'gr-tree-select-keyboard',
  },
]
