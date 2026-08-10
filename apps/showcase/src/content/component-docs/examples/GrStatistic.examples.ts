import type { ShowcaseComponentExampleDoc } from '../types'

export const grStatisticExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'statistic-basic',
    title: 'KPI row',
    description: 'Показатель с подписью, иконкой, приписками и форматированием: `precision` фиксирует знаки, разряды разделяются автоматически.',
    status: 'ready',
    previewKey: 'gr-statistic-basic',
  },
  {
    id: 'statistic-trend',
    title: 'Trend and loading',
    description: '`trend` + `trend-text` добавляют строку динамики со стрелкой и цветом, `loading` подменяет значение плейсхолдером той же высоты — блок не прыгает.',
    status: 'ready',
    previewKey: 'gr-statistic-trend',    note: 'Плейсхолдер помечен `role="status"` и `aria-busy`, поэтому обновление данных не остаётся незамеченным.',
  },
  {
    id: 'statistic-slots',
    title: 'Slots and non-numeric values',
    description: 'Слоты `#icon`, `#trend`, `#prefix`/`#suffix` подставляют любой контент, а нечисловое значение («2 h 15 min») выводится как есть.',
    status: 'ready',
    previewKey: 'gr-statistic-slots',
  },
]
