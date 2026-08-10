import type { ShowcaseComponentExampleDoc } from '../types'

export const grSelectExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'select-addons',
    title: 'Addons in the panel trigger',
    description: 'Аддоны доступны в режиме `optionsView="panel"`: внутрь нативного `<select>` разметку положить нельзя.',
    status: 'ready',
    previewKey: 'gr-select-addons',
  },
  {
    id: 'select-remote-search',
    title: 'Удалённый поиск, теги и события',
    description: '`v-model:search` + `@search` для подгрузки с сервера, `maxTagCount` для длинного выбора и события `change`/`clear`/`visible-change`.',
    status: 'ready',
    previewKey: 'gr-select-remote-search',
  },
  {
    id: 'select-builder',
    title: 'Interactive select constructor',
    description: 'Живой playground для всех ключевых пропсов `GrSelect`: меняйте `view`, `size`, `optionsView`, `variant`, `underline` и состояния (multiple/clearable/disabled/allow-custom-value) без переключения между отдельными demo-картами.',
    status: 'ready',
    previewKey: 'gr-select-builder',
    hideCode: true,
    note: 'Лучший формат для дизайн-ревью и QA: один сценарий сразу покрывает весь контракт пропсов и помогает быстро проверить native/panel-режимы и link-стилизацию.',
  },
  {
    id: 'select-native-modes',
    title: 'Native single and clearable',
    description: 'Базовый сценарий для `GrSelect`: обычный single-select и clearable режим в native-rendering без дополнительной composition-логики.',
    status: 'ready',
    previewKey: 'gr-select-native-modes',
  },
  {
    id: 'select-panel-multiple',
    title: 'Panel mode for multiple selection',
    description: 'Отдельно показываем `optionsView="panel"` вместе с `multiple`, чтобы было видно поведение dropdown-панели как mini-picker.',
    status: 'ready',
    previewKey: 'gr-select-panel-multiple',    note: 'Этот сценарий помогает быстро проверить panel-behavior, множественный выбор и то, как компонент ведёт себя в формах фильтров.',
  },
  {
    id: 'select-groups',
    title: 'Grouped options',
    description: 'Опции можно группировать в стандартном формате `{ label, options: [{ value, label }] }`. В `optionsView="native"` группы рендерятся как нативные `<optgroup>`, а в `optionsView="panel"` — как заголовки групп внутри dropdown-панели.',
    status: 'ready',
    previewKey: 'gr-select-groups',    note: 'Группы поддерживаются в обоих режимах отображения и смешиваются с плоскими опциями; в panel-режиме фильтрация по custom-value скрывает пустые группы.',
  },
  {
    id: 'select-custom-value',
    title: 'Custom value and value slot',
    description: 'Сложный режим для cases, где пользователь может добавить свой вариант и одновременно кастомизировать отображение выбранного значения.',
    status: 'ready',
    previewKey: 'gr-select-custom-value',    note: 'Именно этот режим критичен для демо complex-компонента: здесь одновременно видны custom input, panel dropdown и slot-based composition.',
  },
  {
    id: 'select-filter-loading-tags',
    title: 'Filter, loading and tag mode',
    description: 'Три доработки panel-режима: `filterable` добавляет поле поиска над списком (независимо от `allow-custom-value`), `loading` показывает индикатор загрузки вместо опций (для удалённой подгрузки), а `tags` рендерит выбор `multiple` как удаляемые chips вместо строки «a, b, c».',
    status: 'ready',
    previewKey: 'gr-select-filter-loading-tags',    note: 'filterable/loading/tags форсят panel-режим (в нативном `<select>` они невозможны). Поиск и подгрузка комбинируются: пока `loading` — список скрыт, дальше работает клиентская фильтрация.',
  },
  {
    id: 'select-virtual',
    title: 'Сгруппированный справочник на 10 000 позиций',
    description: 'С `virtual` в DOM живёт только окно вокруг вьюпорта. Группы при этом сохраняются: если панель прокручена внутрь группы, её обёртка всё равно создаётся и берёт имя через `aria-label` — заголовка в разметке в этот момент нет.',
    status: 'ready',
    previewKey: 'gr-select-virtual',    note: '`aria-setsize`/`aria-posinset` считаются по своему набору: у опции внутри группы это размер группы, а не всего списка. Режим только для `optionsView="panel"` и не сочетается с `view="link"` — там ширина панели равна ширине отрисованной опции.',
  },
]
