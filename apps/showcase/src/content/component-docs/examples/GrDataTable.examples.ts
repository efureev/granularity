import type { ShowcaseComponentExampleDoc } from '../types'

export const grDataTableExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'data-table-controlled-sort',
    title: 'Controlled / external sort',
    description: 'Управляемая сортировка через `v-model:sortKey` / `v-model:sortDir` + событие `@sortChange`. С `external-sort` таблица не сортирует `rows` сама — данные приходят уже отсортированными (серверная сортировка, синхронизация с URL).',
    status: 'ready',
    previewKey: 'gr-data-table-controlled-sort',    note: 'Контролируемый режим нужен для серверной сортировки и синхронизации состояния с URL; без пропов `sortKey`/`sortDir` таблица работает в uncontrolled-режиме как прежде.',
  },
  {
    id: 'data-table-sortable-columns',
    title: 'Sortable rows with initial state',
    description: 'Базовый сценарий для `GrDataTable`: передаём `rows`, `columns`, стартовую сортировку и сразу проверяем built-in sorting.',
    status: 'ready',
    previewKey: 'gr-data-table-sortable-columns',  },
  {
    id: 'data-table-custom-cells',
    title: 'Custom status and actions cells',
    description: 'Ключевой composition-scenario: стандартный data pipeline остаётся у `GrDataTable`, а конкретные ячейки переопределяются слотами.',
    status: 'ready',
    previewKey: 'gr-data-table-custom-cells',    note: 'Именно slots превращают компонент из «таблицы по данным» в реальный admin/reporting building block.',
  },
  {
    id: 'data-table-filtered-view',
    title: 'Filtered datasets outside the component',
    description: 'Показываем границу ответственности: фильтрация остаётся снаружи, а `GrDataTable` честно рендерит уже подготовленный набор строк.',
    status: 'ready',
    previewKey: 'gr-data-table-filtered-view',  },
  {
    id: 'data-table-selection-sticky',
    title: 'Row selection, sticky header and loading',
    description: '`selectable` добавляет ведущую колонку с чекбоксами и «выбрать все» в шапке (модель — `v-model:selected` по ключам строк). `sticky-header` + `max-height` держат заголовок видимым при вертикальном скролле. `loading` заменяет тело строкой-индикатором.',
    status: 'ready',
    previewKey: 'gr-data-table-selection-sticky',    note: '«Выбрать все» оперирует только видимыми строками и сохраняет внешние ключи; при клиентской сортировке выбор остаётся по ключам, а не по позициям.',
  },
  {
    id: 'data-table-sizes',
    title: 'Шкала размеров',
    description: 'В отличие от `GrTable`, здесь размер ведёт ещё и паддинги ячеек, стрелки сортировки и чекбоксы — таблицу видно плотнее целиком.',
    status: 'ready',
    previewKey: 'gr-data-table-sizes',  },
  {
    id: 'data-table-row-guards',
    title: 'Row guards, tri-state sorting and row click',
    description: 'Строка может быть невыбираемой (`selectableRow`), подсвеченной (`rowClass`) и кликабельной (`@row-click`), а третий клик по заголовку снимает сортировку — `sortCycle="asc-desc-none"`.',
    status: 'ready',
    previewKey: 'gr-data-table-row-guards',  },
  {
    id: 'data-table-virtual',
    title: 'Справочник на 10 000 строк',
    description: 'С `virtual` в DOM живёт только окно вокруг вьюпорта. Распорки здесь — служебные строки, а не псевдоэлементы: `<tbody>` игнорирует отступы, и произвольную коробку в него не положить.',
    status: 'ready',
    previewKey: 'gr-data-table-virtual',    note: 'Виртуализация включает фиксированную раскладку: ширина колонки считается по содержимому всех строк, а в DOM их только окно — без фиксации колонки прыгали бы на каждой прокрутке. Полное число строк уходит в `aria-rowcount`, номер строки — в `aria-rowindex`.',
  },
]
