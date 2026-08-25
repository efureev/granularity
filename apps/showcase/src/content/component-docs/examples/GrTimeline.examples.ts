import type { ShowcaseComponentExampleDoc } from '../types'

export const grTimelineExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'timeline-basic',
    title: 'История заказа',
    description: 'Событие — это `GrTimelineItem` с меткой времени, заголовком и тоном. Последний пункт `pending`: полая точка и пунктир вместо сплошной оси.',
    status: 'ready',
    previewKey: 'gr-timeline-basic',
  },
  {
    id: 'timeline-layouts',
    title: 'Четыре раскладки',
    description: 'Колонка времени слева, чередование сторон и горизонтальная ось — одним пропом. В горизонтальной ленте вертикальные раскладки не применяются.',
    status: 'ready',
    previewKey: 'gr-timeline-layouts',
  },
  {
    id: 'timeline-grouped',
    title: 'Аудит-лог по дням',
    description: 'С `items` лента знает состав набора: `groupBy` режет его на группы, каждая — секция со своим заголовком, а ось между группами не рвётся.',
    status: 'ready',
    previewKey: 'gr-timeline-grouped',
  },
  {
    id: 'timeline-narrow',
    title: 'Узкая колонка',
    description: 'Лента сжимается по доступному месту, а не выносит строку за край: гибкие треки объявлены `minmax(0, 1fr)`, поэтому `truncate` на заголовке наконец срабатывает. Ширину колонки времени задаёт хук `--gr-timeline-time-width`.',
    status: 'ready',
    previewKey: 'gr-timeline-narrow',
  },
]
