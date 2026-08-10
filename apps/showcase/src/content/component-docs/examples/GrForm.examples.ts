import type { ShowcaseComponentExampleDoc } from '../types'

export const grFormExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'form-validation',
    title: 'Declarative validation & submit',
    description: 'Модель формы (`:model`) + декларативные `rules` по имени поля. `GrFormField` с `name` сам подтягивает ошибку и маркер обязательности из формы, а `submit` эмитится только если форма валидна. Контролы (`GrInput`) не меняются — они уже читают `invalid`/`id`/`aria-describedby` из контекста поля.',
    status: 'ready',
    previewKey: 'gr-form-validation',    note: 'Ошибка снимается по мере исправления поля; `resetFields()` возвращает начальные значения. Императивный API — через template ref: `validate()` / `validateField()` / `clearValidate()` / `scrollToField()`.',
  },
  {
    id: 'form-mixed-controls',
    title: 'Any control + custom / async rules',
    description: 'Ключевой архитектурный смысл: `GrSelect`, `GrAutocomplete`, `GrInput` валидируются одинаково — через `GrFormField name`, без правок самих контролов. Кастомный (в т.ч. async) `validator` получает значение и весь `model` (проверка совпадения паролей). `validate()` скроллит к первому невалидному полю.',
    status: 'ready',
    previewKey: 'gr-form-mixed-controls',    note: 'Правило может иметь `trigger: "blur" | "change" | "submit"`; правило без триггера срабатывает на любом. Дефолтные сообщения (`gr.form.*`) локализованы (en/ru/es) и перекрываются `rule.message`.',
  },
  {
    id: 'form-custom-control',
    title: 'Custom control + custom validator',
    description: 'Свой контрол интегрируется в форму так же, как встроенные: он читает контекст `GrFormField` через `useGrFormFieldContext()` (id / aria-describedby / aria-invalid / required) и работает с `v-model`. Правило `brandColor` использует кастомный `validator`, возвращающий строку-ошибку для невалидного hex-цвета.',
    status: 'ready',
    previewKey: 'gr-form-custom-control',    note: 'Тот же приём работает и для async-валидатора (например, проверка на сервере): `validator` может вернуть `Promise`. Любой контрол, который читает `useGrFormFieldContext()`, автоматически получает id/aria и попадает в валидацию.',
  },
  {
    id: 'form-editing',
    title: 'Editing form: snapshot, dirty state and async rule',
    description: 'Данные приходят после монтирования, поэтому форма пересниает снимок через `setSnapshot()` — иначе «Сбросить» вернул бы пустоту, какой модель была до ответа сервера. `isDirty` блокирует кнопки, `disabled` выключает всю форму на время отправки, а асинхронное правило показывает состояние проверки вместо молчания. Поле «Имя» обязательно пропом `required`, без записи в `rules`, — и submit это проверяет.',
    status: 'ready',
    previewKey: 'gr-form-editing',
  },
]
