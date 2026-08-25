import type { ShowcaseComponentExampleDoc } from '../types'

export const grBadgeExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'badge-builder',
    title: 'Interactive badge constructor',
    description: 'Соберите `GrBadge` под ваш сценарий: переключайте `tone`, `size`, `radius`, filled-mode и текст лейбла, сразу видя итоговый snippet.',
    status: 'ready',
    previewKey: 'gr-badge-builder',
    hideCode: true,
  },
  {
    id: 'badge-tone-scale',
    title: 'Light and dark semantic tones',
    description: 'Сценарий работает как справочник по semantic palette: light и filled (`dark`) режимы удобно сравнить бок о бок, включая `slate` и `azure`.',
    status: 'ready',
    previewKey: 'gr-badge-variant-scale',
  },
  {
    id: 'badge-size-radius',
    title: 'Size and radius combinations',
    description: 'Отдельно выделяем `size` и `radius`, чтобы quickly show pill/semi/square badges для table cells, filters и inline labels.',
    status: 'ready',
    previewKey: 'gr-badge-size-radius',
  },
  {
    id: 'badge-status-icon',
    title: 'Status badge with a leading icon',
    description: 'Слот `#icon` ставит значок перед подписью: спиннер у идущей работы, галочку у результата, крестик у ошибки. Размер иконки идёт за `size` бейджа, поэтому ряд статусов не разъезжается.',
    status: 'ready',
    previewKey: 'gr-badge-status-icon',
    note: 'Спиннер — обычная иконка с `animate-spin`. `GrProgressCircle` в бейдж не кладут: его нижняя ступень равна 2rem и разносит плашку.',
  },
  {
    id: 'badge-toolbar-filters',
    title: 'Badges inside action toolbars',
    description: 'Компонент часто используется не сам по себе, а как secondary marker внутри toolbar/filter buttons. Этот сценарий показывает composition-паттерн.',
    status: 'ready',
    previewKey: 'gr-badge-toolbar-filters',
  },
]
