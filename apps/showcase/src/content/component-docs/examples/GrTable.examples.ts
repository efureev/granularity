import type { ShowcaseComponentExampleDoc } from '../types'

export const grTableExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'table-basic-rows',
    title: 'Basic row rendering',
    description: 'Для базовой страницы показываем canonical table markup: `#head` slot, body rows и composition с badges.',
    status: 'ready',
    previewKey: 'gr-table-basic-rows',
  },
  {
    id: 'table-loading-state',
    title: 'Loading rows with skeletons',
    description: 'Закрываем data-display edge case: таблица должна выглядеть предсказуемо и в loading-state, когда данные ещё не приехали.',
    status: 'ready',
    previewKey: 'gr-table-loading-state',
  },
  {
    id: 'table-empty-state',
    title: 'Empty state inside tbody',
    description: 'Показываем, как `GrTable` может содержать `GrEmptyState` внутри `tbody`, не теряя table semantics и visual shell.',
    status: 'ready',
    previewKey: 'gr-table-empty-state',
  },
  {
    id: 'table-sizes',
    title: 'Шкала размеров',
    description: '`GrTable` — тонкий контейнер, поэтому `size` задаёт базовый кегль таблицы; паддинги ячеек остаются за потребителем.',
    status: 'ready',
    previewKey: 'gr-table-sizes',
  },
]
