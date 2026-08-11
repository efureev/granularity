import type { ShowcaseComponentExampleDoc } from '../types'

export const grSkeletonExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'skeleton-variants',
    title: 'Shape and repetition',
    description: '`variant` задаёт **форму**, а не размеры: `text` — пилюля, `rect` — скруглённый блок, `circle` — круг (высота повторяет ширину). Размеры остаются на потребителе, потому что высоту заглушки диктует соседний контент. `count` рисует блок из N заглушек одним пропом; у `text` последняя строка короче, поэтому блок читается абзацем, а не списком одинаковых полос.',
    status: 'ready',
    previewKey: 'gr-skeleton-variants',
    note: 'Одна заглушка рендерится без обёртки — DOM тех, кто уже использует `GrSkeleton`, от появления `count` не меняется. Заглушка целиком `aria-hidden`: загрузку объявляет контейнер (`aria-busy` + живой регион), а не полоса.',
  },
  {
    id: 'skeleton-text-card',
    title: 'Text card placeholder',
    description: 'Базовый loading-surface для статей, карточек и описательных блоков: заголовок `variant="rect"` и абзац одним `:count="3"` вместо трёх строк вручную.',
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
