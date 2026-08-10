import type { ShowcaseComponentExampleDoc } from '../types'

export const grRadioExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'radio-descriptions-and-validation',
    title: 'Описания, ошибка и числовые значения',
    description: 'Слот `#description` связан с переключателем через `aria-describedby`, `invalid` приходит от группы, а `value` — число.',
    status: 'ready',
    previewKey: 'gr-radio-descriptions',
  },
  {
    id: 'radio-standalone-controlled',
    title: 'Standalone radios with shared model',
    description: 'Минимальный контролируемый сценарий без group-wrapper, полезный там, где нужно вручную разложить отдельные radio по кастомному layout.',
    status: 'ready',
    previewKey: 'gr-radio-standalone-controlled',
  },
  {
    id: 'radio-button-tone',
    title: 'Button tone for segmented controls',
    description: 'Отдельный пример для `tone="button"`: по API это всё тот же radio, но визуально он работает как сегментированный toolbar-control.',
    status: 'ready',
    previewKey: 'gr-radio-button-variant',
  },
  {
    id: 'radio-group-inheritance',
    title: 'Inherited name, size and disabled state from `GrRadioGroup`',
    description: 'Этот сценарий важен именно для `GrRadio`: компонент должен корректно читать group-context и не дублировать базовые props на каждом элементе.',
    status: 'ready',
    previewKey: 'gr-radio-group-inheritance',
  },
]
