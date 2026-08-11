import type { ShowcaseComponentExampleDoc } from '../types'

export const grRadioGroupExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'radio-group-options',
    title: 'Generated group from options list',
    description: 'Быстрый старт-сценарий для `options`: одна декларация массива сразу даёт полную radio-группу без ручного рендера каждого элемента.',
    status: 'ready',
    previewKey: 'gr-radio-group-options',
  },
  {
    id: 'radio-group-size-scale',
    title: 'Полная линейка размеров',
    description: 'Все четыре ступени рядом, в обоих вариантах. У кнопочного карта размеров общая с `GrButton` — кнопка той же ступени стоит рядом для сверки; у radiobox по ступеням масштабируются коробка, точка и подпись.',
    status: 'ready',
    previewKey: 'gr-radio-group-size-scale',
  },
  {
    id: 'radio-group-custom-slots',
    title: 'Custom slot content for per-option annotations',
    description: 'Когда у опций есть secondary badges и статусы, удобнее перейти от `options` к slot-based composition поверх `GrRadioGroup` + `GrRadio`.',
    status: 'ready',
    previewKey: 'gr-radio-group-custom-slots',
  },
]
