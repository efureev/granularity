import type { ShowcaseComponentExampleDoc } from '../types'

export const grTabsWithPanelsExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'tabs-with-panels-basic',
    title: 'Вкладки и панели одним компонентом',
    description: 'Ни `id-base`, ни второго `v-model`: активная вкладка и база id принадлежат одному компоненту, поэтому связка `tab` ↔ `tabpanel` собирается сама. У пары эти два значения писались в двух местах и расходились молча.',
    status: 'ready',
    previewKey: 'gr-tabs-with-panels-basic',
  },
  {
    id: 'tabs-with-panels-vertical',
    title: 'Вертикальный ряд сбоку',
    description: '`orientation="vertical"` ставит ряд вкладок сбоку от панелей: вертикальные вкладки над содержимым выглядели бы колонкой ссылок без связи с ним. Остальные пропы ряда — `variant`, `size`, `activation-mode` — пробрасываются как есть.',
    status: 'ready',
    previewKey: 'gr-tabs-with-panels-vertical',
  },
]
