<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, useId, useSlots } from 'vue'

import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormContext } from '../GrForm/context'
import { GR_FORM_FIELD_KEY } from './context'
import {
  controlColumnClass,
  errorBaseClass,
  errorTexts,
  fieldGaps,
  hintBaseClass,
  hintTexts,
  labelBaseClass,
  labelInlineClass,
  labelTexts,
  requiredMarkClass,
  rootColumnClass,
  rootRowClass,
  type GrFormFieldLabelPosition,
  type GrFormFieldSize,
} from './grFormFieldStyles'

import './defaults'

type LabelClass = string | string[] | Record<string, boolean>

const props = withDefaults(
  defineProps<{
    label?: string
    /**
     * Имя поля в модели `GrForm` (в т.ч. dot-path `address.city`). Когда поле внутри
     * `GrForm` и задан `name`, ошибка и признак обязательности берутся из формы по
     * этому имени, а потеря фокуса триггерит валидацию поля.
     */
    name?: string
    /** Явный id контрола. Если не задан — генерируется автоматически. */
    forId?: string
    /**
     * Явная ошибка (или несколько). Перекрывает ошибку из `GrForm` — ручной
     * режим без формы тоже здесь. Массив нужен там, где источник ошибок один,
     * а претензий несколько: ответ сервера, валидация файла.
     */
    error?: string | string[]
    /** Подсказка под лейблом/над контролом (можно также через слот `#hint`). */
    hint?: string
    /** Помечает поле обязательным (маркер `*` + `aria-required` у контрола). */
    required?: boolean
    /** Всё поле только для чтения: контролы внутри перестают редактироваться. */
    readonly?: boolean
    /**
     * Показывать текст ошибки. `false` — поле остаётся невалидным для контрола
     * и AT (`aria-invalid`), но сообщение не занимает места: так делают в
     * плотных таблицах-формах, где ошибка объясняется сводкой сверху.
     */
    showMessage?: boolean
    /** Размер подписи, подсказки и ошибки. Не задан — из `GrConfigProvider`, иначе `md`. */
    size?: GrFormFieldSize
    /** Подпись сверху (по умолчанию) или сбоку — для плотных форм. */
    labelPosition?: GrFormFieldLabelPosition
    /** Ширина колонки подписи при `labelPosition="start"`. Число — пиксели. */
    labelWidth?: string | number
    labelClass?: LabelClass
  }>(),
  {
    label: undefined,
    name: undefined,
    forId: undefined,
    error: undefined,
    hint: undefined,
    required: false,
    readonly: false,
    showMessage: true,
    size: undefined,
    labelPosition: undefined,
    labelWidth: undefined,
    labelClass: undefined,
  },
)

const slots = useSlots()

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrFormField' })
const labelPosition = useGrComponentProp('GrFormField', 'labelPosition', () => props.labelPosition, 'top')
const isInlineLabel = computed(() => labelPosition.value === 'start')

const rootClass = computed(() => [
  isInlineLabel.value ? rootRowClass : rootColumnClass,
  fieldGaps[resolvedSize.value],
])

// Подпись сбоку не сжимается и держит заданную ширину: иначе колонки контролов
// в форме разъезжаются по длине подписей.
const labelStyle = computed(() => {
  if (!isInlineLabel.value || props.labelWidth === undefined)
    return undefined

  return { width: typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : props.labelWidth }
})

const labelClassName = computed(() => [
  labelBaseClass,
  labelTexts[resolvedSize.value],
  isInlineLabel.value ? labelInlineClass : '',
])
const hintClassName = computed(() => [hintBaseClass, hintTexts[resolvedSize.value]])
const errorClassName = computed(() => [errorBaseClass, errorTexts[resolvedSize.value]])

// Контекст `GrForm` (если поле внутри формы). Контролы про форму не знают —
// оркестрация подключается здесь, на уровне поля.
const form = useGrFormContext()
const boundToForm = computed(() => Boolean(form && props.name && form.hasField(props.name)))

// Автогенерация id: контрол внутри читает его через inject и связывается с
// лейблом (`for`) без ручного дублирования `forId`.
const generatedId = useId()
const fieldId = computed(() => props.forId ?? generatedId)

const errorId = useId()
const hintId = useId()

// Ошибки: явный проп `error` имеет приоритет, иначе — из формы по `name`.
// Форма отдаёт одну строку, проп — строку или массив; внутри всегда список.
const resolvedErrors = computed<string[]>(() => {
  if (props.error)
    return (Array.isArray(props.error) ? props.error : [props.error]).filter(Boolean)

  if (boundToForm.value && props.name) {
    const fromForm = form!.errors.value[props.name]
    return fromForm ? [fromForm] : []
  }

  return []
})

// Обязательность: проп `required` ИЛИ наличие `required`-правила в форме.
const isRequired = computed(() => {
  if (props.required) return true
  if (boundToForm.value && props.name) return form!.requiredFields.value.has(props.name)
  return false
})

const hasLabel = computed(() => Boolean(props.label) || Boolean(slots.label))
const hasHint = computed(() => Boolean(props.hint) || Boolean(slots.hint))
const hasError = computed(() => resolvedErrors.value.length > 0)
// Текст можно скрыть, но невалидность поля от этого не исчезает.
const showsMessage = computed(() => hasError.value && props.showMessage)

/**
 * `aria-describedby` контрола: подсказка и ошибка.
 *
 * Id ошибки стоит здесь всегда, а не только когда ошибка есть: часть AT не
 * перечитывает описание после смены самого атрибута. Контейнер ошибки при этом
 * тоже живёт в DOM постоянно и меняет только текст — пустой он ничего не
 * добавляет к описанию.
 */
const describedById = computed(() => {
  const ids = [hasHint.value ? hintId : null, errorId].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
})

const labelElementId = useId()
const labelId = computed(() => (hasLabel.value ? labelElementId : undefined))

provide(GR_FORM_FIELD_KEY, {
  id: fieldId,
  labelId,
  readonly: computed(() => props.readonly),
  describedById,
  invalid: hasError,
  required: isRequired,
})

// ————— Интеграция с формой: регистрация (scroll-to-error) + валидация по blur.
const fieldRootEl = ref<HTMLElement | null>(null)
let unregister: (() => void) | undefined

onMounted(async () => {
  if (form && props.name) unregister = form.registerField(props.name, () => fieldRootEl.value)

  await nextTick()
  warnIfControlMissed()
})

/**
 * Контракт поля держится на том, что контрол прочитал `useGrFormFieldContext()`
 * и повесил `id` на себя. Не прочитал — `<label for>` указывает в пустоту:
 * клик по подписи ничего не фокусирует, а связи для скринридера нет, и узнать
 * об этом можно только вручную. Дешёвая страховка — предупреждение в dev.
 */
function warnIfControlMissed(): void {
  if (process.env.NODE_ENV === 'production') return
  if (!hasLabel.value) return

  const root = fieldRootEl.value
  if (!root) return

  const target = Array.from(root.querySelectorAll<HTMLElement>('[id]'))
    .some(element => element.id === fieldId.value)

  if (target) return

  console.warn(
    `[GrFormField] Подпись «${props.label ?? ''}» ссылается на id "${fieldId.value}", `
    + 'которого нет внутри поля. Контрол должен прочитать `useGrFormFieldContext()` '
    + 'и повесить `field.id` на себя — либо задайте `forId` и тот же `id` на контроле.',
  )
}
onBeforeUnmount(() => unregister?.())

// `focusout` всплывает от любого фокусируемого контрола внутри поля (native и
// кастомного) — единый способ поймать blur без правок самих контролов.
//
// Но всплывает он и когда фокус переезжает ВНУТРИ поля: с input на его же
// кнопку очистки, между чекбоксами группы. Такое поле валидировалось раньше,
// чем пользователь его дозаполнил, поэтому blur считается состоявшимся только
// если фокус ушёл за пределы корня. `relatedTarget: null` (фокус в никуда:
// клик по body, уход из окна) — тоже уход.
function onFocusOut(event: FocusEvent): void {
  if (!form || !props.name) return

  const next = event.relatedTarget as Node | null
  if (next && fieldRootEl.value?.contains(next)) return

  void form.validateField(props.name, 'blur')
}
</script>

<template>
  <div
    ref="fieldRootEl"
    data-gr-form-field
    :class="rootClass"
    @focusout="onFocusOut"
  >
    <label
      v-if="hasLabel"
      :id="labelId"
      :for="fieldId"
      :class="[labelClassName, props.labelClass]"
      :style="labelStyle"
    >
      <slot name="label">{{ props.label }}</slot>
      <span v-if="isRequired" data-gr-form-field-required aria-hidden="true" :class="requiredMarkClass">*</span>
    </label>

    <!-- Подсказка, контрол и ошибка живут одной колонкой: при подписи сбоку
         они остаются рядом с контролом, а не разъезжаются по строке. -->
    <div data-gr-form-field-control :class="[controlColumnClass, fieldGaps[resolvedSize]]">
      <p
        v-if="hasHint"
        :id="hintId"
        data-gr-form-field-hint
        :class="hintClassName"
      >
        <slot name="hint">
          {{ props.hint }}
        </slot>
      </p>

      <slot />

      <!-- Пустой контейнер уводится в `sr-only`, чтобы не добавлять пустую
           строку в колонку поля: gap дал бы видимый отступ. -->
      <div
        :id="errorId"
        data-gr-form-field-error
        role="alert"
        :class="showsMessage ? errorClassName : 'sr-only'"
      >
        <slot v-if="showsMessage" name="error" :errors="resolvedErrors">
          <div
            v-for="(message, index) in resolvedErrors"
            :key="index"
            data-gr-form-field-error-item
          >
            {{ message }}
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>
