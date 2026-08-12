import type { ShowcaseComponentExampleDoc } from '../types'

export const grSortableListExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'sortable-list-basic',
    title: 'Порядок шагов',
    description: '`v-model` — массив в текущем порядке; наружу уходит новый массив, входной не мутируется. Слот `#item` рисует строку, ключ берётся из `item-key`.',
    status: 'ready',
    previewKey: 'gr-sortable-list-basic',
    note: 'Клавиатура равноправна мыши: Space берёт строку, стрелки двигают, Space кладёт, Esc отменяет — каждый шаг объявляется скринридеру.',
  },
  {
    id: 'sortable-list-scroll',
    title: 'Длинный список и автопрокрутка',
    description: '`max-height` превращает список в скроллер: у краёв он едет сам, пока держите строку. Событие `move` отдаёт пару индексов — удобно, когда порядок хранится на сервере.',
    status: 'ready',
    previewKey: 'gr-sortable-list-scroll',
    note: 'Виртуализации здесь нет намеренно: уронить строку можно только на отрисованную цель.',
  },
  {
    id: 'sortable-list-horizontal',
    title: 'Горизонтальный ряд и запрет',
    description: '`orientation="horizontal"` переключает раскладку и ось клавиатуры разом. `disabled` оставляет список читаемым, но запрещает перенос обоими способами.',
    status: 'ready',
    previewKey: 'gr-sortable-list-horizontal',
  },
]
