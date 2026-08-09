import type { ShowcaseComponentExampleDoc } from '../types'

export const grTabPanelsExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tab-panels-keep-alive',
    title: 'keepAlive и ленивое монтирование',
    description: 'Панель монтируется при первом показе (`lazy`) и дальше не разрушается (`keepAlive`) — состояние формы переживает переключение.',
    status: 'ready',
    previewKey: 'gr-tab-panels-keep-alive',  },
  {
    id: 'tab-panels-basic',
    title: 'Accessible tabs with linked panels',
    description: 'Companion к `GrTabs`: одинаковый `id-base` связывает вкладки и панели по ARIA (`aria-controls` ↔ `aria-labelledby`). Показывается панель активной вкладки; `keep-alive` оставляет неактивные в DOM.',
    status: 'ready',
    previewKey: 'gr-tab-panels-basic',  },
]
