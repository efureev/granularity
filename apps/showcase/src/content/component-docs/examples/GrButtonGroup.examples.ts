import type { ShowcaseComponentExampleDoc } from '../types'

export const grButtonGroupExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'button-group-segmented',
    title: 'Segmented view switcher',
    description: 'Базовый composition-сценарий: `GrButtonGroup` собирает несколько adjacent actions в единый segmented control для view-mode и similar state switches.',
    status: 'ready',
    previewKey: 'gr-button-group-segmented',  },
  {
    id: 'button-group-toolbar',
    title: 'Compact toolbar cluster',
    description: 'Показываем `GrButtonGroup` как контейнер для плотной action-toolbar, где важна визуальная связность соседних кнопок.',
    status: 'ready',
    previewKey: 'gr-button-group-toolbar',  },
  {
    id: 'button-group-shared-style',
    title: 'Shared styling and wrapped buttons',
    description: 'Размер, вариант и тон задаются один раз на группе и доходят до кнопок; проп самой кнопки сильнее группы, а группа сильнее `GrConfigProvider` — она ближе. Обёртка вокруг кнопки (тултип, `v-if`-спан, роутерная ссылка) ряд не разрывает: склейка считает звенья группы, а не прямых потомков.',
    status: 'ready',
    previewKey: 'gr-button-group-shared-style',  },
  {
    id: 'button-group-orientation',
    title: 'Vertical group and spaced mode',
    description: '`orientation="vertical"` собирает кнопки в столбец — скругления переезжают на верхний и нижний края. `:attached="false"` даёт обычный ряд с зазором: каждая кнопка сохраняет свои радиусы и границы.',
    status: 'ready',
    previewKey: 'gr-button-group-orientation',  },
  {
    id: 'button-group-filter-rail',
    title: 'Filter rail composition',
    description: 'Группа подходит и для shallow filters: рядом с cards/list states можно быстро переключать сегменты без отдельного tabs-компонента.',
    status: 'ready',
    previewKey: 'gr-button-group-filter-rail',  },
]
