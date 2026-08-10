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
import IconX from '~icons/lucide/x'
import { vAutosize } from '../../directives'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useGranularityTranslations } from '../../internal/granularityI18n'

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
  /** Кнопка очистки значения. Настраивается через `GrConfigProvider`. */
  clearable?: boolean
  /** A11y-подпись кнопки очистки. */
  clearLabel?: string
  /** Ручное изменение размера пользователем. */
  resize?: GrTextareaResize
}

export interface GrTextareaEmits {
  (e: 'update:modelValue', value: string): void
  /** Значение зафиксировано нативным `change` — по `blur`. */
  (e: 'change', value: string): void
  /** Значение стёрто кнопкой очистки. */
  (e: 'clear'): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
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
  clearable: undefined,
  clearLabel: undefined,
  resize: 'vertical',
})

defineOptions({
  // Иначе атрибуты потребителя (`data-*`, `aria-*`, `name`) садятся на корень,
  // а корень со `showCount` — обёртка счётчика, а не само поле.
  inheritAttrs: false,
})

const emit = defineEmits<GrTextareaEmits>()

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
  disabled: isDisabled,
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
const resolvedClearable = useGrComponentProp('GrTextarea', 'clearable', () => props.clearable, false)

const { t } = useGranularityTranslations()
const resolvedClearLabel = computed(() => props.clearLabel ?? t('gr.input.clear', 'Clear'))

const showClear = computed(() =>
  resolvedClearable.value && !isDisabled.value && !isReadonly.value && props.modelValue !== '',
)

function clear(): void {
  emit('update:modelValue', '')
  emit('change', '')
  emit('clear')
  focus()
}

const baseClass = 'w-full rounded-[var(--gr-radius-control)] border text-[var(--gr-fg)] placeholder:text-[var(--gr-muted-fg)] transition-colors duration-[var(--gr-duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] disabled:cursor-not-allowed'

const className = computed(() => [
  sizes[resolvedSize.value],
  resizeClass[props.resize],
  isDisabled.value ? disabledSurfaceClass : enabledSurfaceClass,
  grTextareaClass({
    state: props.state,
    invalid: isInvalid.value,
  }),
].join(' '))

// Обе ветки шаблона (со счётчиком и без) рендерят одно и то же поле, поэтому
// атрибуты живут одним объектом: двадцать строк копипасты расходятся молча.
const textareaAttrs = computed(() => ({
  id: resolvedId.value,
  'data-gr-textarea': '',
  name: props.name,
  rows: props.rows,
  maxlength: props.maxlength,
  autocomplete: props.autocomplete,
  placeholder: props.placeholder,
  disabled: isDisabled.value,
  value: props.modelValue,
  'aria-invalid': isInvalid.value ? ('true' as const) : undefined,
  'aria-describedby': describedBy.value,
  'aria-required': isRequired.value ? ('true' as const) : undefined,
  'aria-readonly': isReadonly.value ? ('true' as const) : undefined,
  'aria-label': props.ariaLabel,
  readonly: isReadonly.value,
  class: [baseClass, className.value],
}))

function onInput(e: Event): void {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}

// Объявленный emit уходит из `$attrs`, поэтому нативные события переизлучаем
// руками — иначе `@change`/`@focus`/`@blur` у потребителя перестали бы работать.
function onChange(e: Event): void {
  emit('change', (e.target as HTMLTextAreaElement).value)
}

function onFocus(e: FocusEvent): void {
  emit('focus', e)
}

function onBlur(e: FocusEvent): void {
  emit('blur', e)
}
</script>

<template>
  <div v-if="showCount" data-gr-textarea-wrap class="relative w-full">
    <textarea
      ref="textareaEl"
      v-autosize="autosize"
      v-bind="{ ...textareaAttrs, ...$attrs }"
      @input="onInput"
      @change="onChange"
      @focus="onFocus"
      @blur="onBlur"
    />

    <button
      v-if="showClear"
      type="button"
      data-gr-textarea-clear
      :aria-label="resolvedClearLabel"
      class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-[var(--gr-radius-sm)] text-[var(--gr-muted-fg)] transition-colors hover:bg-[var(--gr-muted)] hover:text-[var(--gr-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
      @click="clear"
    >
      <IconX class="h-4 w-4" aria-hidden="true" />
    </button>

    <div :id="countId" data-gr-textarea-count :class="countClass">
      {{ countText }}
    </div>
  </div>

  <!-- Обёртка появляется только под кнопку очистки: без неё поле остаётся
       корневым элементом — на этом стоит контракт fallthrough-атрибутов. -->
  <div v-else-if="resolvedClearable" class="relative w-full">
    <textarea
      ref="textareaEl"
      v-autosize="autosize"
      v-bind="{ ...textareaAttrs, ...$attrs }"
      @input="onInput"
      @change="onChange"
      @focus="onFocus"
      @blur="onBlur"
    />

    <button
      v-if="showClear"
      type="button"
      data-gr-textarea-clear
      :aria-label="resolvedClearLabel"
      class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-[var(--gr-radius-sm)] text-[var(--gr-muted-fg)] transition-colors hover:bg-[var(--gr-muted)] hover:text-[var(--gr-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
      @click="clear"
    >
      <IconX class="h-4 w-4" aria-hidden="true" />
    </button>
  </div>

  <textarea
    v-else
    ref="textareaEl"
    v-autosize="autosize"
    v-bind="{ ...textareaAttrs, ...$attrs }"
    @input="onInput"
    @change="onChange"
    @focus="onFocus"
    @blur="onBlur"
  />
</template>
