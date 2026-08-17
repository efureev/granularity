import type { ShowcaseComponentExampleDoc } from '../types'

export const grTableExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'table-basic-rows',
    title: 'Basic row rendering',
    description: 'Для базовой страницы показываем canonical table markup: `#header` slot, body rows и composition с badges.',
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
    id: 'table-footer',
    title: 'Footer built by hand: totals and a note',
    description: 'Слот `#footer` рендерится в `<tfoot>`, поэтому его содержимое — строки таблицы, а не свободный блок. Итог, отбивка и `colspan` примечания пишутся руками: `GrTable` ячейки не оформляет принципиально.',
    status: 'ready',
    previewKey: 'gr-table-footer',
    note: 'Нужен итог, который сам встаёт по колоночной сетке тела и едет за `size`, шириной и закреплением, — это `summaryRow` у `GrDataTable`. Здесь же за свободу платят повтором паддингов на каждой ячейке.',
  },
  {
    id: 'table-scroll-region',
    title: 'Прокручиваемая область с клавиатуры',
    description: '`maxHeight` со `stickyHeader` превращает таблицу в прокручиваемую область, а `regionLabel` даёт ей `role="region"` и имя. Без имени такая область — безымянная ловушка для скринридера; с ним она достижима `Tab` и листается стрелками.',
    status: 'ready',
    previewKey: 'gr-table-scroll-region',
  },
  {
    id: 'table-sizes',
    title: 'Шкала размеров',
    description: '`GrTable` — тонкий контейнер, поэтому `size` задаёт базовый кегль таблицы; паддинги ячеек остаются за потребителем.',
    status: 'ready',
    previewKey: 'gr-table-sizes',
  },
]
