import type { ShowcaseComponentExampleDoc } from '../types'

export const grChipGroupExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'chip-group-filters',
    title: 'Фильтры списка',
    description: 'Множественный выбор: видно все варианты сразу, выбранных может быть несколько.',
    status: 'ready',
    previewKey: 'gr-chip-group-filters',
  },
  {
    id: 'chip-group-single',
    title: 'Один выбор с отменой',
    description: 'Период отчёта. Повторное нажатие на выбранный чип возвращает «весь».',
    status: 'ready',
    previewKey: 'gr-chip-group-single',
    note: 'Набор фильтров без выбранного значения осмыслен, поэтому одиночный выбор снимается.',
  },
  {
    id: 'chip-group-removable',
    title: 'Выбор и снятие вместе',
    description: 'Метки записи, которые можно и отметить, и убрать.',
    status: 'ready',
    previewKey: 'gr-chip-group-removable',
    note: 'Набор — одна остановка Tab: внутрь ведут стрелки, Delete снимает чип под фокусом.',
  },
]
