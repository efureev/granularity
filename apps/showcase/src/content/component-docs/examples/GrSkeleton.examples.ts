import type { ShowcaseComponentExampleDoc } from '../types'

export const grSkeletonExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'skeleton-text-card',
    title: 'Text card placeholder',
    description: 'Базовый loading-surface для статей, карточек и описательных блоков: title + несколько строк контента.',
    status: 'ready',
    previewKey: 'gr-skeleton-text-card',
  },
  {
    id: 'skeleton-list-placeholder',
    title: 'Avatar/list row placeholders',
    description: 'Data-display сценарий для таблиц и списков: avatar, две текстовые строки и trailing action area.',
    status: 'ready',
    previewKey: 'gr-skeleton-list-placeholder',
  },
  {
    id: 'skeleton-dashboard-layout',
    title: 'Dashboard and chart layout',
    description: 'Комбинируем разные размеры `GrSkeleton`, чтобы быстро собрать loading-layout для dashboard, chart и KPI blocks.',
    status: 'ready',
    previewKey: 'gr-skeleton-dashboard-layout',
  },
]
