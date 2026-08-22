import type { ShowcaseComponentExampleDoc } from '../types'

export const grDropdownMenuExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'dropdown-menu-quick-actions',
    title: 'Quick actions menu',
    description: 'Строим компактное action-menu поверх `GrDropdownMenu`, сохраняя привычный trigger/content contract от `GrDropdown`.',
    status: 'ready',
    previewKey: 'gr-dropdown-menu-quick-actions',
  },
  {
    id: 'dropdown-menu-grouped-actions',
    title: 'Grouped sections with danger zone',
    description: 'Для richer menus используем `GrDropdownMenuGroup` и `GrDropdownMenuDivider`, чтобы отделять publish-flow и destructive actions.',
    status: 'ready',
    previewKey: 'gr-dropdown-menu-grouped-actions',
  },
  {
    id: 'dropdown-menu-shortcut-grid',
    title: 'Shortcut cheat-sheet grid',
    description: 'Минималистичный cheat-sheet хоткеев: `GrDropdownMenuHeader` + одноколоночный `GrDropdownMenuList`, где в каждой строке действие слева и хоткей-чипы справа (`justify-between`). Клавиши рендерим компонентом `GrKbd` — без ручной вёрстки `<kbd>`.',
    status: 'ready',
    previewKey: 'gr-dropdown-menu-shortcut-grid',
  },
  {
    id: 'dropdown-menu-edge-lines',
    title: 'Lines that separate blocks',
    description: '`borderTop` / `borderBottom` отбивают список от шапки и подвала. Правило рисуется псевдоэлементом с инсетом, а не рамкой бокса: у края панели линия во всю ширину упирается в дугу скругления, и вместо двух линий глаз видит клин.',
    status: 'ready',
    previewKey: 'gr-dropdown-menu-edge-lines',
  },
  {
    id: 'dropdown-menu-declarative',
    title: 'Menu from a model',
    description: 'Пункты, группы и разделители задаются массивом `items`, а `menuitemcheckbox`/`menuitemradio` дают состояние прямо в меню — композиция подкомпонентов остаётся для нестандартных случаев.',
    status: 'ready',
    previewKey: 'gr-dropdown-menu-declarative',
  },
]
