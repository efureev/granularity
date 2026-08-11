import type { ShowcaseComponentExampleDoc } from '../types'

export const grSegmentedExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'segmented-basic-pills',
    title: 'Pills variant for compact view switching',
    description: 'Базовый happy-path для `GrSegmented`: лёгкий pills-control с moving indicator и выбором одного значения.',
    status: 'ready',
    previewKey: 'gr-segmented-basic-pills',
  },
  {
    id: 'segmented-button-variant',
    title: 'Button variant with runtime size control',
    description: 'Button-like режим подходит для toolbar и view-switcher сценариев, но сохраняет общий segmented UX и анимацию индикатора.',
    status: 'ready',
    previewKey: 'gr-segmented-button-variant',
  },
  {
    id: 'segmented-custom-content',
    title: 'Icon + label and icon-only content',
    description: 'Компонент умеет работать и с `icon + label`, и с компактным icon-only рендерингом через scoped slot без раздувания API.',
    status: 'ready',
    previewKey: 'gr-segmented-content',
  },
  {
    id: 'segmented-vertical',
    title: 'Vertical orientation for sidebar filters',
    description: '`orientation="vertical"` разворачивает ряд в колонку и объявляет `aria-orientation`. Индикатор к этому готов по построению: он измеряется в двух измерениях и едет вниз ровно так же, как вдоль ряда. Переключатель сверху меняет ориентацию на лету — видно, что индикатор пересчитывается, а не остаётся в координатах прежней раскладки.',
    status: 'ready',
    previewKey: 'gr-segmented-vertical',
    note: 'Клавиатура не меняется: у `radiogroup` обе оси стрелок работают в любой ориентации, как требует APG. В вертикали колонка одна, поэтому сегменты одинаковой ширины по построению, а `block` решает лишь, занимать ли ширину контейнера.',
  },
  {
    id: 'segmented-states',
    title: 'Disabled items, block layout and language switcher',
    description: 'Собираем реальные product-like сценарии: language pills, full-width layout и disabled item внутри группы без потери читаемости.',
    status: 'ready',
    previewKey: 'gr-segmented-states',
  },
]