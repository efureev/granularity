import type { ShowcaseComponentExampleDoc } from '../types'

export const grContextMenuExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'context-menu-tree',
    title: 'Меню под конкретный узел дерева',
    description: '`beforeOpen` приходит до открытия, поэтому `items` успевают собраться под цель: у папки и файла действия разные. Цель берётся из DOM, а не из события мыши, — тот же код обслуживает и `Shift+F10`.',
    status: 'ready',
    previewKey: 'gr-context-menu-tree',
  },
  {
    id: 'context-menu-area',
    title: 'Меню на области',
    description: 'Когда действия не зависят от того, по чему кликнули, хватает обёртки: она ловит и правый клик, и клавиатурный вызов. `Shift`+правый клик остаётся браузеру.',
    status: 'ready',
    previewKey: 'gr-context-menu-area',
  },
]
