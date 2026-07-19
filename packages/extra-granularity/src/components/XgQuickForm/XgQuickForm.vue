<script setup lang="ts">
import {computed, ref, useId} from 'vue'
import {GrFormField} from '@feugene/granularity/components/GrFormField'
import {GrInput} from '@feugene/granularity/components/GrInput'
import {GrButton} from '@feugene/granularity/components/GrButton'

/**
 * `XgQuickForm` — single-line composite form built from granularity primitives:
 * `GrFormField` (label + error slot), `GrInput` (text field) and `GrButton`
 * (submit). Keeps state locally via `v-model` and emits `submit` with the
 * trimmed value.
 *
 * The component is intentionally a thin shell — it doesn't re-implement anything
 * from granularity, only orchestrates three primitives. This is exactly the
 * role of `@feugene/extra-granularity`: small, opinionated, composite pieces.
 */
const props = withDefaults(
    defineProps<{
      modelValue?: string
      label?: string
      placeholder?: string
      submitLabel?: string
      error?: string
      disabled?: boolean
      loading?: boolean
      /** Emit the raw value as-is, without trimming whitespace. */
      raw?: boolean
    }>(),
    {
      modelValue: '',
      label: undefined,
      placeholder: undefined,
      submitLabel: 'Submit',
      error: undefined,
      disabled: false,
      loading: false,
      raw: false,
    },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'submit', value: string): void
}>()

const inputId = useId()
const internal = ref(props.modelValue)

const value = computed({
  get: () => (props.modelValue !== undefined ? props.modelValue : internal.value),
  set: (next: string) => {
    internal.value = next
    emit('update:modelValue', next)
  },
})

function onSubmit() {
  if (props.disabled || props.loading) return
  const payload = props.raw ? value.value : value.value.trim()
  emit('submit', payload)
}
</script>

<template>
  <form class="xg-quick-form" @submit.prevent="onSubmit">
    <GrFormField :label="label" :for-id="inputId" :error="error">
      <GrInput
          :id="inputId"
          v-model="value"
          :placeholder="placeholder"
          :disabled="disabled || loading"
          :invalid="Boolean(error)"
      />
    </GrFormField>
    <GrButton
        type="submit"
        :disabled="disabled"
        :loading="loading"
    >
      <slot name="submit">{{ submitLabel }}</slot>
    </GrButton>
  </form>
</template>

<style>
.xg-quick-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: stretch;
}

.xg-quick-form > :last-child {
  align-self: flex-start;
}
</style>
