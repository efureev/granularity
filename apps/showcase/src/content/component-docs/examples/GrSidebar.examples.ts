import type { ShowcaseComponentExampleDoc } from '../types'

export const grSidebarExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'sidebar-basic-sections',
    title: 'Basic section rail',
    description: 'Базовый desktop-shell: `GrSidebar` с `v-model:collapsed` и `show-toggle-button`, а навигация собрана из `GrSidebarItem` (иконка, badge, active-состояние). В свёрнутом виде пункты сохраняют иконку, а «Billing» без иконки показывает первую букву.',
    status: 'ready',
    previewKey: 'gr-sidebar-basic-sections',
  },
  {
    id: 'sidebar-documentation-nav',
    title: 'Documentation anchors',
    description: 'Sidebar как rail для doc anchors: кастомные `<button>`-пункты с active-подсветкой через `--gr-sidebar-*` токены и badge-маркером якоря.',
    status: 'ready',
    previewKey: 'gr-sidebar-documentation-nav',
  },
  {
    id: 'sidebar-filter-rail',
    title: 'Filter rail composition',
    description: 'Sidebar как persistent container для фильтров и переключателей: набор `GrSwitch`, чьё состояние отражается справа через `GrBadge`.',
    status: 'ready',
    previewKey: 'gr-sidebar-filter-rail',
  },
]
