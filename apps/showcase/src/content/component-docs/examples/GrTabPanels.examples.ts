import type { ShowcaseComponentExampleDoc } from '../types'

export const grTabPanelsExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tab-panels-keep-alive',
    title: 'keepAlive и ленивое монтирование',
    description: 'Панель монтируется при первом показе (`lazy`) и дальше не разрушается (`keepAlive`) — состояние формы переживает переключение. Из DOM панель не уходит, поэтому и перехода здесь нет — смена мгновенная.',
    status: 'ready',
    previewKey: 'gr-tab-panels-keep-alive',
  },
  {
    id: 'tab-panels-basic',
    title: 'Accessible tabs with linked panels',
    description: 'Companion к `GrTabs`: одинаковый `id-base` связывает вкладки и панели по ARIA (`aria-controls` ↔ `aria-labelledby`). Показывается панель активной вкладки: входящая проявляется, уходящая исчезает сразу — контейнер не дёргается по высоте.',
    status: 'ready',
    previewKey: 'gr-tab-panels-basic',
  },
]
