import type { ShowcaseComponentExampleDoc } from '../types'

export const grIconExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'icon-size-scale',
    title: 'Size scale',
    description: 'На странице важно показать, как `GrIcon` ведёт себя на разных размерах и почему он удобен как sizing-wrapper вокруг inline svg.',
    status: 'ready',
    previewKey: 'gr-icon-size-scale',
  },
  {
    id: 'icon-inline-copy',
    title: 'Inline copy and link helpers',
    description: 'Показываем, что `GrIcon` можно встраивать в copy blocks, helper rows и рядом с `GrLink`, не ломая baseline текста.',
    status: 'ready',
    previewKey: 'gr-icon-inline-copy',
  },
  {
    id: 'icon-status-card',
    title: 'Status cards and KPI tiles',
    description: 'Отдельный сценарий для dashboards: `GrIcon` помогает собирать status cards и KPI summaries с предсказуемым tone/size contract.',
    status: 'ready',
    previewKey: 'gr-icon-status-card',
  },
  {
    id: 'icon-semantics',
    title: 'Decorative vs meaningful, tone and spin',
    description: 'Иконка декоративна по умолчанию — компонент сам ставит `aria-hidden`. Значимой её делает `label`: появляются `role="img"` и имя. `tone` красит токеном текста (насыщенный тон как цвет текста в пакете запрещён — контраст падает до 2:1), `spin` крутит спиннер и сам замирает при `prefers-reduced-motion`.',
    status: 'ready',
    previewKey: 'gr-icon-semantics',
  },
]
