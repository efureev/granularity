import type { ShowcaseComponentExampleDoc } from '../types'

export const grCheckboxGroupExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'checkbox-group-basic',
    title: 'Multi-select from an options list',
    description: 'Одна модель `string[]` на всю группу: чекбоксам не нужен собственный `v-model`, а раскладка переключается пропом `direction`.',
    status: 'ready',
    previewKey: 'gr-checkbox-group-basic',
  },
  {
    id: 'checkbox-group-form',
    title: 'Validation inside GrForm',
    description: 'Обязательность объявляется через `aria-required`, а проверяет её правило формы — нативный `required` не блокирует отправку молча.',
    status: 'ready',
    previewKey: 'gr-checkbox-group-form',
  },
]
