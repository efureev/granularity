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
    id: 'statistic-dashboard',
    title: 'Counting tiles that lead somewhere',
    description: '`animate` перебирает числа при появлении плитки и при каждой смене значения — от прежнего числа, а не от нуля: перебор «с нуля» на обновлении дашборда читался бы как сброс данных. Длительность задаёт `animateDuration` в миллисекундах. Переход к деталям — тем же приёмом, что у `GrCard` и `GrListItem`: `href` даёт ссылку, `clickable` — кнопку, `as` — свой тег.',
    status: 'ready',
    previewKey: 'gr-statistic-dashboard',
    note: 'Перебор ведёт JS, поэтому глобальный кламп движения его не покрывает — компонент сам читает `prefers-reduced-motion` и под `reduce` ставит значение сразу. Пока перебор идёт, диктору отдаётся конечное значение: «1 284 500» на экране и «743 210» в ушах — не шум, а неверные данные.',
  },
  {
    id: 'statistic-trend',
    title: 'Trend and loading',
    description: '`trend` + `trend-text` добавляют строку динамики со стрелкой и цветом, `loading` подменяет значение плейсхолдером той же высоты — блок не прыгает.',
    status: 'ready',
    previewKey: 'gr-statistic-trend',    note: 'Плейсхолдер помечен `role="status"` и `aria-busy`, поэтому обновление данных не остаётся незамеченным.',
  },
  {
    id: 'statistic-polarity',
    title: 'Tone from the sign of the value',
    description: '`polarity` выводит тон из знака самой величины: `positive-good` для выручки, `negative-good` для себестоимости и оттока. Ноль нейтрален при любой полярности — «не изменилось» третье состояние, и двумя цветами оно не выражается. Явный `tone` сильнее: выведенный тон — умолчание, а не диктат.',
    status: 'ready',
    previewKey: 'gr-statistic-polarity',
    note: '`polarity` красит значение, `trend` — строку под ним. Это независимые сигналы: показатель может краснеть без подписи о динамике, а подпись — стоять под нейтральным значением.',
  },
  {
    id: 'statistic-slots',
    title: 'Slots and non-numeric values',
    description: 'Слоты `#icon`, `#trend`, `#prefix`/`#suffix` подставляют любой контент, а нечисловое значение («2 h 15 min») выводится как есть.',
    status: 'ready',
    previewKey: 'gr-statistic-slots',
  },
]
