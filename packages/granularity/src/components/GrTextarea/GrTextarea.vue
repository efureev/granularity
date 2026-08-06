<script setup lang="ts">
/**
 * GrTextarea — многострочное поле ввода GR-примитива.
 *
 * Состояния:
 * - `state`: визуальный оттенок рамки (`default | success | warning | danger`).
 * - `invalid`: форсирует `danger`-состояние и проставляет `aria-invalid="true"`.
 */
import { computed, ref, useId } from 'vue'
import {
  countClass,
  disabledSurfaceClass,
  enabledSurfaceClass,
  grTextareaClass,
  resizeClass,
  sizes,
  type GrTextareaResize,
  type GrTextareaSize,
  type GrTextareaState,
} from './grTextareaStyles'
import { vAutosize } from '../../directives'
import { useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'

export interface GrTextareaProps {
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
  /** Ограничение длины + основа для счётчика символов. */
  maxlength?: number
  /** Показывать счётчик символов (`len` или `len/maxlength`). */
  showCount?: boolean
  /** Подгонять высоту под содержимое (директива `v-autosize`). */
  autosize?: boolean
  /** Ручное изменение размера пользователем. */
  resize?: GrTextareaResize
}

const props = withDefaults(defineProps<GrTextareaProps>(), {
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
  maxlength: undefined,
  showCount: false,
  autosize: false,
  resize: 'vertical',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// Fallback из контекста `GrFormField` (id/aria-describedby/invalid/required).
const field = useGrFormFieldContext()
const resolvedId = computed(() => props.id ?? field?.id.value)

// Счётчик обязан быть частью описания поля: иначе «12 / 60» видно глазами, но
// не слышно — при том что ограничение длины и есть его смысл.
const countId = useId()
const describedBy = computed(() =>
  [field?.describedById.value, props.showCount ? countId : undefined]
    .filter(Boolean)
    .join(' ') || undefined,
)

const countText = computed(() =>
  props.maxlength !== undefined ? `${props.modelValue.length} / ${props.maxlength}` : String(props.modelValue.length),
)
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
  resizeClass[props.resize],
  props.disabled ? disabledSurfaceClass : enabledSurfaceClass,
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
  <div v-if="showCount" data-gr-textarea-wrap class="w-full">
    <textarea
      :id="resolvedId"
      ref="textareaEl"
      v-autosize="autosize"
      data-gr-textarea
      :name="name"
      :rows="rows"
      :maxlength="maxlength"
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
      class="w-full rounded-md border text-[var(--gr-fg)] placeholder:text-[var(--gr-muted-fg)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] disabled:cursor-not-allowed"
      :class="className"
      @input="onInput"
    />

    <div :id="countId" data-gr-textarea-count :class="countClass">
      {{ countText }}
    </div>
  </div>

  <textarea
    v-else
    :id="resolvedId"
    ref="textareaEl"
    v-autosize="autosize"
    data-gr-textarea
    :name="name"
    :rows="rows"
    :maxlength="maxlength"
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
    class="w-full rounded-md border text-[var(--gr-fg)] placeholder:text-[var(--gr-muted-fg)] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] disabled:cursor-not-allowed"
    :class="className"
    @input="onInput"
  />
</template>
