<script setup lang="ts">
import { computed } from 'vue'

export type { DsTextareaState } from './dsTextareaStyles'

import { dsTextareaClass, type DsTextareaState } from './dsTextareaStyles'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  autocomplete?: string
  disabled?: boolean
  invalid?: boolean
  state?: DsTextareaState
  name?: string
  id?: string
  rows?: number
}>(), {
  placeholder: undefined,
  autocomplete: undefined,
  disabled: false,
  invalid: false,
  state: 'default',
  name: undefined,
  id: undefined,
  rows: 4,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const className = computed(() => {
  return dsTextareaClass({
    state: props.state,
    invalid: props.invalid,
  })
})

function onInput(e: Event): void {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <textarea
    :id="props.id"
    :name="props.name"
    :rows="props.rows"
    :autocomplete="props.autocomplete"
    :placeholder="props.placeholder"
    :disabled="props.disabled"
    :value="props.modelValue"
    :aria-invalid="props.invalid ? 'true' : undefined"
    class="w-full rounded-md border bg-[var(--bg)] px-3 py-2 text-[14px] text-[var(--fg)] placeholder:text-[var(--muted-fg)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed"
    :class="className"
    @input="onInput"
  />
</template>