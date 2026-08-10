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
    id: 'radio-group-button-tone',
    title: 'Button tone with runtime size control',
    description: 'Группа переключается в button-mode и масштабируется через `size`, что особенно полезно для toolbar и page-view toggles.',
    status: 'ready',
    previewKey: 'gr-radio-group-button-variant',
  },
  {
    id: 'radio-group-custom-slots',
    title: 'Custom slot content for per-option annotations',
    description: 'Когда у опций есть secondary badges и статусы, удобнее перейти от `options` к slot-based composition поверх `GrRadioGroup` + `GrRadio`.',
    status: 'ready',
    previewKey: 'gr-radio-group-custom-slots',
  },
]
