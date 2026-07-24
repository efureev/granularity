<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, provide, ref, useId, useSlots } from 'vue'

import { useGrFormContext } from '../GrForm/context'
import { GR_FORM_FIELD_KEY } from './context'

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
    /** Явная ошибка. Перекрывает ошибку из `GrForm` (ручной режим без формы — тоже здесь). */
    error?: string
    /** Подсказка под лейблом/над контролом (можно также через слот `#hint`). */
    hint?: string
    /** Помечает поле обязательным (маркер `*` + `aria-required` у контрола). */
    required?: boolean
    labelClass?: LabelClass
  }>(),
  {
    label: undefined,
    name: undefined,
    forId: undefined,
    error: undefined,
    hint: undefined,
    required: false,
    labelClass: undefined,
  },
)

const slots = useSlots()

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

// Ошибка: явный проп `error` имеет приоритет, иначе — из формы по `name`.
const resolvedError = computed(() => {
  if (props.error) return props.error
  if (boundToForm.value && props.name) return form!.errors.value[props.name]
  return undefined
})

// Обязательность: проп `required` ИЛИ наличие `required`-правила в форме.
const isRequired = computed(() => {
  if (props.required) return true
  if (boundToForm.value && props.name) return form!.requiredFields.value.has(props.name)
  return false
})

const hasHint = computed(() => Boolean(props.hint) || Boolean(slots.hint))
const hasError = computed(() => Boolean(resolvedError.value))

// `aria-describedby` контрола: подсказка и/или ошибка.
const describedById = computed(() => {
  const ids = [hasHint.value ? hintId : null, hasError.value ? errorId : null].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
})

provide(GR_FORM_FIELD_KEY, {
  id: fieldId,
  describedById,
  invalid: hasError,
  required: isRequired,
})

// ————— Интеграция с формой: регистрация (scroll-to-error) + валидация по blur.
const fieldRootEl = ref<HTMLElement | null>(null)
let unregister: (() => void) | undefined

onMounted(() => {
  if (form && props.name) unregister = form.registerField(props.name, () => fieldRootEl.value)
})
onBeforeUnmount(() => unregister?.())

// `focusout` всплывает от любого фокусируемого контрола внутри поля (native и
// кастомного) — единый способ поймать blur без правок самих контролов.
function onFocusOut(): void {
  if (form && props.name) void form.validateField(props.name, 'blur')
}
</script>

<template>
  <div
    ref="fieldRootEl"
    data-gr-form-field
    class="flex flex-col gap-2"
    @focusout="onFocusOut"
  >
    <label
      v-if="props.label"
      :for="fieldId"
      class="text-sm text-[var(--gr-muted-fg)]"
      :class="props.labelClass"
    >
      {{ props.label }}
      <span v-if="isRequired" data-gr-form-field-required aria-hidden="true" class="text-[var(--gr-danger)]">*</span>
    </label>

    <p
      v-if="hasHint"
      :id="hintId"
      data-gr-form-field-hint
      class="text-xs text-[var(--gr-muted-fg)]"
    >
      <slot name="hint">
        {{ props.hint }}
      </slot>
    </p>

    <slot />

    <div
      v-if="hasError"
      :id="errorId"
      data-gr-form-field-error
      role="alert"
      class="text-sm text-[var(--gr-danger)]"
    >
      {{ resolvedError }}
    </div>
  </div>
</template>
