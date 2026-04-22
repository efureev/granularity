<script setup lang="ts">
import {computed, ref, useId} from 'vue'
import {DsFormField} from '@feugene/granularity/components/DsFormField'
import {DsInput} from '@feugene/granularity/components/DsInput'
import {DsButton} from '@feugene/granularity/components/DsButton'

/**
 * `XgQuickForm` — single-line composite form built from granularity primitives:
 * `DsFormField` (label + error slot), `DsInput` (text field) and `DsButton`
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
    <DsFormField :label="label" :for-id="inputId" :error="error">
      <DsInput
          :id="inputId"
          v-model="value"
          :placeholder="placeholder"
          :disabled="disabled || loading"
          :invalid="Boolean(error)"
      />
    </DsFormField>
    <DsButton
        type="submit"
        :disabled="disabled"
        :loading="loading"
    >
      <slot name="submit">{{ submitLabel }}</slot>
    </DsButton>
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
