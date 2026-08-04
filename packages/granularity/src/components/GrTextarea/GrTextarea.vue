<script setup lang="ts">
/**
 * GrTextarea — многострочное поле ввода GR-примитива.
 *
 * Состояния:
 * - `state`: визуальный оттенок рамки (`default | success | warning | danger`).
 * - `invalid`: форсирует `danger`-состояние и проставляет `aria-invalid="true"`.
 */
import { computed, ref } from 'vue'
import { type GrTextareaSize, type GrTextareaState, grTextareaClass, sizes } from './grTextareaStyles'
import { useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  autocomplete?: string
  disabled?: boolean
  /** Только для чтения: значение видно и уходит в форму, но не редактируется. */
  readonly?: boolean
  invalid?: boolean
  /** Обязательное поле (`aria-required`). Складывается с `required` у `GrFormField`. */
  required?: boolean
  /** Доступное имя вне `GrFormField`. */
  ariaLabel?: string
  state?: GrTextareaState
  name?: string
  id?: string
  rows?: number
  size?: GrTextareaSize
}>(), {
  placeholder: undefined,
  autocomplete: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  ariaLabel: undefined,
  state: 'default',
  name: undefined,
  id: undefined,
  rows: 4,
  size: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

export type GrTextareaProps = typeof props

// Fallback из контекста `GrFormField` (id/aria-describedby/invalid/required).
const field = useGrFormFieldContext()
const resolvedId = computed(() => props.id ?? field?.id.value)
const describedBy = computed(() => field?.describedById.value)
const {
  invalid: isInvalid,
  required: isRequired,
  readonly: isReadonly,
} = useGrFormControl(() => props)

const textareaEl = ref<HTMLTextAreaElement | null>(null)

function focus(): void {
  textareaEl.value?.focus()
}

function blur(): void {
  textareaEl.value?.blur()
}

defineExpose({ focus, blur })

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrTextarea' })

const className = computed(() => [
  sizes[resolvedSize.value],
  grTextareaClass({
    state: props.state,
    invalid: isInvalid.value,
  }),
].join(' '))

function onInput(e: Event): void {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <textarea
    :id="resolvedId"
    ref="textareaEl"
    data-gr-textarea
    :name="name"
    :rows="rows"
    :autocomplete="autocomplete"
    :placeholder="placeholder"
    :disabled="disabled"
    :value="modelValue"
    :aria-invalid="isInvalid ? 'true' : undefined"
    :aria-describedby="describedBy"
    :aria-required="isRequired ? 'true' : undefined"
    :aria-readonly="isReadonly ? 'true' : undefined"
    :aria-label="ariaLabel"
    :readonly="isReadonly"
    class="w-full rounded-md border bg-[var(--gr-bg)] text-[var(--gr-fg)] placeholder:text-[var(--gr-muted-fg)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] disabled:opacity-50 disabled:cursor-not-allowed"
    :class="className"
    @input="onInput"
  />
</template>
