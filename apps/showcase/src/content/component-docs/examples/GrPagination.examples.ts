import type { ShowcaseComponentExampleDoc } from '../types'

export const grPaginationExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'pagination-basic-flow',
    title: 'Basic paging feedback loop',
    description: 'Минимальный сценарий для `GrPagination`: меняем страницу, а компонент сам показывает диапазон видимых элементов — проп `show-total`.',
    status: 'ready',
    previewKey: 'gr-pagination-basic-flow',
  },
  {
    id: 'pagination-page-size-guard',
    title: 'Page-size changes with page clamping',
    description: 'Отдельно показываем защиту от типичного UX-багa: когда после смены `pageSize` текущая страница выходит за пределы нового количества страниц.',
    status: 'ready',
    previewKey: 'gr-pagination-page-size-guard',
    note: 'Компонент сознательно не «чинит» внешнее состояние сам — страницу лучше нормализовать в owning-контейнере.',
  },
  {
    id: 'pagination-data-table-composition',
    title: 'Composition with GrDataTable',
    description: 'Практический сценарий: `GrPagination` остаётся контролом навигации, а slicing данных и действия по строкам живут в page-level orchestration.',
    status: 'ready',
    previewKey: 'gr-pagination-table-composition',
    note: 'Этот пример полезен как recipe: пагинация не знает о таблице, а таблица не знает о page-size логике — связка собирается наверху.',
  },
  {
    id: 'pagination-compact-jumper',
    title: 'Compact variant and page jumper',
    description: 'Для узких мест (мобайл, тулбары) `compact` заменяет ряд номеров индикатором «текущая / всего», а `show-jumper` добавляет поле быстрого перехода: ввод номера + Enter (или blur) прыгает на страницу с клампингом к диапазону.',
    status: 'ready',
    previewKey: 'gr-pagination-compact-jumper',
    note: 'Jumper клампит ввод к [1, pageCount] и очищает поле после перехода; компонент остаётся контролируемым — страницу двигает `v-model:page`.',
  },
  {
    id: 'pagination-sizes',
    title: 'Шкала размеров',
    description: 'Размер доезжает до вложенных `GrButton` и `GrSelect`: весь блок пагинации меняет масштаб целиком, а не частями.',
    status: 'ready',
    previewKey: 'gr-pagination-sizes',
  },
]
