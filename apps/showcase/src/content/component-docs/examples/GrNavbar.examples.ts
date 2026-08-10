import type { ShowcaseComponentExampleDoc } from '../types'

export const grNavbarExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'navbar-actions-slot',
    title: 'Actions slot in page shell',
    description: 'Показываем основной layout-случай: `GrNavbar` задаёт title area, а справа размещаются глобальные quick actions и status pills.',
    status: 'ready',
    previewKey: 'gr-navbar-actions-slot',
  },
  {
    id: 'navbar-menu-toggle',
    title: 'Responsive menu trigger',
    description: 'Показываем `showMenuButton`, `menuButtonClass` и событие `menu` для responsive drawer/navigation shells.',
    status: 'ready',
    previewKey: 'gr-navbar-menu-toggle',
  },
  {
    id: 'navbar-title-slot',
    title: 'Custom title slot',
    description: 'Кастомный `title`-slot нужен для брендинга, breadcrumbs и richer header-контекста без форка базового layout-компонента.',
    status: 'ready',
    previewKey: 'gr-navbar-title-slot',
  },
]
