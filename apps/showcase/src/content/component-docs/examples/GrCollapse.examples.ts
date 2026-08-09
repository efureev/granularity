import type { ShowcaseComponentExampleDoc } from '../types'

export const grCollapseExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'collapse-accordion-flow',
    title: 'Accordion with controlled active item',
    description: 'Базовый controlled-сценарий: в `accordion` режиме одновременно открыт только один раздел, а текущий state можно вывести рядом.',
    status: 'ready',
    previewKey: 'gr-collapse-accordion-flow',  },
  {
    id: 'collapse-multi-section',
    title: 'Multi-expand sections with custom title slot',
    description: 'Показываем `accordion = false`, массив в `v-model` и richer `title` slot для badge/counter сценариев.',
    status: 'ready',
    previewKey: 'gr-collapse-multi-section',  },
  {
    id: 'collapse-disabled-state',
    title: 'Parent disabled mode and item-level guard',
    description: 'Отдельно проверяем whole-group `disabled` и `disabled` на уровне конкретного `GrCollapseItem`.',
    status: 'ready',
    previewKey: 'gr-collapse-disabled-state',  },
  {
    id: 'collapse-borderless',
    title: 'Borderless accordion inside a card',
    description: 'Аккордеон внутри чужой поверхности не должен рисовать вторую рамку: `borderless` снимает обёртку в `GrCard`, `expandIconPosition` и слот `#extra` доводят заголовок до вида настроек.',
    status: 'ready',
    previewKey: 'gr-collapse-borderless',  },
  {
    id: 'collapse-guard',
    title: 'Async guard before collapsing',
    description: '`beforeChange` успевает спросить «сохранить изменения?» и отменить переключение: пока guard думает, повторный клик по заголовку игнорируется.',
    status: 'ready',
    previewKey: 'gr-collapse-guard',  },
]
