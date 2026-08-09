import type { ShowcaseComponentExampleDoc } from '../types'

export const grTextareaExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'textarea-autosize',
    title: 'Автовысота и счётчик символов',
    description: '`autosize` поверх директивы `v-autosize`, `maxlength` + `showCount` со связкой через `aria-describedby`.',
    status: 'ready',
    previewKey: 'gr-textarea-autosize',  },
  {
    id: 'textarea-rows-layout',
    title: 'Default and expanded rows',
    description: 'Базовый сценарий для short-form и long-form контента: одна и та же textarea может быть компактной или сразу подготовленной под большой объём текста.',
    status: 'ready',
    previewKey: 'gr-textarea-rows-layout',  },
  {
    id: 'textarea-validation-states',
    title: 'Success and validation states',
    description: 'Показываем state-driven оформление и связку с form-errors без искусственной ручной таблицы API.',
    status: 'ready',
    previewKey: 'gr-textarea-validation-states',  },
  {
    id: 'textarea-disabled-state',
    title: 'Disabled review and audit mode',
    description: 'Отдельно фиксируем, как `GrTextarea` выглядит в readonly-like review flow, когда поле временно недоступно для редактирования.',
    status: 'ready',
    previewKey: 'gr-textarea-disabled-state',  },
  {
    id: 'textarea-sizes',
    title: 'Шкала размеров и почему она общая',
    description: 'Поле и textarea рядом обязаны читаться одинаково: `size` у обоих берётся из одной шкалы `xs…lg`, поэтому форма не рассыпается при смене масштаба.',
    status: 'ready',
    previewKey: 'gr-textarea-sizes',  },
]
