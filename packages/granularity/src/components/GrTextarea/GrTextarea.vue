<script setup lang="ts">
/**
 * GrTextarea — многострочное поле ввода DS-примитива.
 *
 * Состояния:
 * - `state`: визуальный оттенок рамки (`default | success | warning | danger`).
 * - `invalid`: форсирует `danger`-состояние и проставляет `aria-invalid="true"`.
 */
import { computed } from 'vue'
import { type GrTextareaState, grTextareaClass } from './grTextareaStyles'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  autocomplete?: string
  disabled?: boolean
  invalid?: boolean
  state?: GrTextareaState
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

export type GrTextareaProps = typeof props

const className = computed(() => grTextareaClass({
  state: props.state,
  invalid: props.invalid,
}))

function onInput(e: Event): void {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <textarea
    :id="id"
    data-ds-textarea
    :name="name"
    :rows="rows"
    :autocomplete="autocomplete"
    :placeholder="placeholder"
    :disabled="disabled"
    :value="modelValue"
    :aria-invalid="invalid ? 'true' : undefined"
    class="w-full rounded-md border bg-[var(--bg)] px-3 py-2 text-[14px] text-[var(--fg)] placeholder:text-[var(--muted-fg)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed"
    :class="className"
    @input="onInput"
  />
</template>
