import type { ShowcaseComponentExampleDoc } from '../types'

export const grCheckboxExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'checkbox-sizes',
    title: 'Sizes aligned with the rest of the form row',
    description: 'Чекбокс живёт на той же размерной шкале, что `GrInput`, `GrRadio` и `GrButton` (`xs`–`lg`), поэтому смешанная форма выравнивается сама — и глобально, через `GrConfigProvider`.',
    status: 'ready',
    previewKey: 'gr-checkbox-sizes',  },
  {
    id: 'checkbox-state-matrix',
    title: 'Checked, unchecked and locked states',
    description: 'Показываем базовую матрицу состояний: управляемые чекбоксы, отдельный disabled-case и компактную сводку по текущему выбору.',
    status: 'ready',
    previewKey: 'gr-checkbox-state-matrix',  },
  {
    id: 'checkbox-interactive-label',
    title: 'Interactive content inside the label slot',
    description: 'Отдельный сценарий фиксирует важную интеграционную деталь: ссылки и кнопки внутри slot-контента не должны случайно переключать чекбокс.',
    status: 'ready',
    previewKey: 'gr-checkbox-interactive-label',  },
  {
    id: 'checkbox-native-form',
    title: 'Native form submission semantics',
    description: 'Показываем, какие `name`/`value` пары реально уходят в `FormData`, чтобы поведение чекбокса было предсказуемо в обычных формах и без обвязки form-library.',
    status: 'ready',
    previewKey: 'gr-checkbox-native-form',  },
]
