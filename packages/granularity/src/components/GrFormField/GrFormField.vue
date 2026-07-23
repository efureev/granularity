<script setup lang="ts">
import { computed, provide, useId, useSlots } from 'vue'

import { GR_FORM_FIELD_KEY } from './context'

type LabelClass = string | string[] | Record<string, boolean>

const props = withDefaults(
  defineProps<{
    label?: string
    /** Явный id контрола. Если не задан — генерируется автоматически. */
    forId?: string
    error?: string
    /** Подсказка под лейблом/над контролом (можно также через слот `#hint`). */
    hint?: string
    /** Помечает поле обязательным (маркер `*` + `aria-required` у контрола). */
    required?: boolean
    labelClass?: LabelClass
  }>(),
  {
    label: undefined,
    forId: undefined,
    error: undefined,
    hint: undefined,
    required: false,
    labelClass: undefined,
  },
)

const slots = useSlots()

// Автогенерация id: контрол внутри читает его через inject и связывается с
// лейблом (`for`) без ручного дублирования `forId`.
const generatedId = useId()
const fieldId = computed(() => props.forId ?? generatedId)

const errorId = useId()
const hintId = useId()

const hasHint = computed(() => Boolean(props.hint) || Boolean(slots.hint))
const hasError = computed(() => Boolean(props.error))

// `aria-describedby` контрола: подсказка и/или ошибка.
const describedById = computed(() => {
  const ids = [hasHint.value ? hintId : null, hasError.value ? errorId : null].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
})

provide(GR_FORM_FIELD_KEY, {
  id: fieldId,
  describedById,
  invalid: hasError,
  required: computed(() => props.required),
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <label
      v-if="props.label"
      :for="fieldId"
      class="text-sm text-[var(--gr-muted-fg)]"
      :class="props.labelClass"
    >
      {{ props.label }}
      <span v-if="props.required" data-gr-form-field-required aria-hidden="true" class="text-[var(--gr-danger)]">*</span>
    </label>

    <p
      v-if="hasHint"
      :id="hintId"
      data-gr-form-field-hint
      class="text-xs text-[var(--gr-muted-fg)]"
    >
      <slot name="hint">{{ props.hint }}</slot>
    </p>

    <slot />

    <div
      v-if="hasError"
      :id="errorId"
      data-gr-form-field-error
      role="alert"
      class="text-sm text-[var(--gr-danger)]"
    >
      {{ props.error }}
    </div>
  </div>
</template>
