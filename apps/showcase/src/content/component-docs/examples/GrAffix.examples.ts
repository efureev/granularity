import type { ShowcaseComponentExampleDoc } from '../types'

export const grAffixExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'affix-sections',
    title: 'Заголовок раздела в длинном списке',
    description: 'Заголовок месяца остаётся на виду, пока идут его строки, и уступает место следующему. Каждая панель прилипает внутри своего раздела: край берётся у ближайшего прокручиваемого блока, а не у окна.',
    status: 'ready',
    previewKey: 'gr-affix-sections',
  },
  {
    id: 'affix-form-actions',
    title: 'Кнопки под длинной формой',
    description: 'Панель действий прижата к нижнему краю, пока форма не кончилась, и там отпускается. Фон и тень появляются только в прилипшем виде: отлипшая панель — часть формы, а не карточка поверх неё.',
    status: 'ready',
    previewKey: 'gr-affix-form-actions',
  },
  {
    id: 'affix-offset',
    title: 'Две панели одна под другой',
    description: 'Шапка списка и строка колонок стоят стопкой. Общий отступ задан переменной `--gr-affix-offset` на контейнере — наблюдатель читает вычисленный стиль, поэтому каскад работает наравне с пропом, а исключение переопределяется на месте.',
    status: 'ready',
    previewKey: 'gr-affix-offset',
  },
  {
    id: 'affix-state',
    title: 'Содержимое меняется, когда прилипло',
    description: 'Подзаголовок уходит, кнопка ужимается: состояние приезжает в слот параметром `stuck` и наружу событием `stickyChange`. Тем же состоянием можно управлять из CSS — на прилипшей панели стоит `data-stuck`.',
    status: 'ready',
    previewKey: 'gr-affix-state',
  },
  {
    id: 'affix-disabled',
    title: 'Прилипание можно выключить',
    description: 'Проп `disabled` гасит прилипание, не размонтируя содержимое: фокус в поле и набранный текст остаются на месте. Так удобно отключать липкость на узком экране.',
    status: 'ready',
    previewKey: 'gr-affix-disabled',
  },
]
