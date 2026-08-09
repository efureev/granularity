import type { ShowcaseComponentExampleDoc } from '../types'

export const grFormFieldExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'form-field-context',
    title: 'Auto id, hint, required and error linking',
    description: 'Поле само генерирует `id` (связка с `label for`) и через provide/inject отдаёт контролу `aria-describedby` (hint + error), `aria-invalid` и `aria-required` — без ручного `forId`. Ошибка анонсируется через `role="alert"`.',
    status: 'ready',
    previewKey: 'gr-form-field-context',    note: 'GrInput / GrSelect / GrTextarea внутри `GrFormField` подхватывают контекст автоматически — id/aria прокидывать не нужно.',
  },
  {
    id: 'form-field-basic-label',
    title: 'Basic label and `forId` wiring',
    description: 'Минимальный сценарий показывает, как `GrFormField` связывает label и control, не навязывая конкретный input-тип.',
    status: 'ready',
    previewKey: 'gr-form-field-basic-label',  },
  {
    id: 'form-field-error-state',
    title: 'Inline validation message',
    description: 'Отдельно документируем ответственность `GrFormField` за error copy, когда сам control лишь сигнализирует invalid-state.',
    status: 'ready',
    previewKey: 'gr-form-field-error-state',  },
  {
    id: 'form-field-custom-label',
    title: 'Section-style labels via `labelClass`',
    description: 'Компонент можно использовать и как мини-секцию формы: label становится heading-строкой, а внутри slot живёт уже более сложная композиция.',
    status: 'ready',
    previewKey: 'gr-form-field-custom-label',  },
  {
    id: 'form-field-custom-control',
    title: 'Custom control + custom rule (no GrForm)',
    description: 'Даже без `GrForm` поле связывает свой контрол и ошибку: кастомный контрол (звёздный рейтинг) читает контекст через `useGrFormFieldContext()`, а валидация делается вручную — своя функция-правило вычисляет `:error`, который `GrFormField` показывает через `role="alert"`.',
    status: 'ready',
    previewKey: 'gr-form-field-custom-control',    note: 'Тот же приём (чтение `useGrFormFieldContext()`) делает любой контрол совместимым и с `GrForm` — тогда правило описывается декларативно в `rules`, а не вручную.',
  },
  {
    id: 'form-field-inline-label',
    title: 'Dense form: inline label, several errors, size',
    description: '`labelPosition="start"` с `labelWidth` собирает плотную форму, `error` принимает массив претензий, а `showMessage: false` помечает поле невалидным без текста.',
    status: 'ready',
    previewKey: 'gr-form-field-inline-label',  },
]
