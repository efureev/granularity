import type { ShowcaseComponentExampleDoc } from '../types'

export const grCardExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'card-variants',
    title: 'Варианты поверхности и карточка-кнопка',
    description: '`elevated` / `outlined` / `ghost` и полиморфный корень: `clickable` делает интерактивной всю поверхность.',
    status: 'ready',
    previewKey: 'gr-card-variants',
  },
  {
    id: 'card-basic-surface',
    title: 'Basic surface with host-controlled spacing',
    description: 'Показываем главный contract `GrCard`: компонент отвечает за surface/border, а внутренние spacing/layout decisions остаются у страницы через `class`.',
    status: 'ready',
    previewKey: 'gr-card-basic-surface',
  },
  {
    id: 'card-kpi-grid',
    title: 'Cards as metric tiles',
    description: 'Один из самых частых use-case — KPI/stat tiles, где `GrCard` даёт единый surface для компактных dashboard-блоков.',
    status: 'ready',
    previewKey: 'gr-card-kpi-grid',
  },
  {
    id: 'card-section-heading',
    title: 'Section heading and description',
    description: '`title` печатается настоящим `h2`…`h6` (`headingLevel`), а не жирной строкой: отчёт из нескольких карточек иначе нечем обойти по структуре. Слот `#header` остаётся сильнее пропов.',
    status: 'ready',
    previewKey: 'gr-card-section-heading',
    note: 'У кликабельной карточки заголовка не будет: корень там `<button>`, а его контент-модель это phrasing content. Нужен и заголовок, и переход — `hoverable` плюс ссылка в самом заголовке.',
  },
  {
    id: 'card-action-panel',
    title: 'Action panel with badges and CTA group',
    description: 'Документируем composed pattern, где карточка работает контейнером для actions, helper badges и explanatory copy.',
    status: 'ready',
    previewKey: 'gr-card-action-panel',
  },
]
