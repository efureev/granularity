<script setup lang="ts">
/**
 * GrCheckboxGroup — контейнер группы `GrCheckbox` с общей моделью `string[]`.
 *
 * Работает и через слот (ручной рендер `GrCheckbox` с собственными подписями),
 * и через проп `options`. Дочерние чекбоксы получают из контекста выбранные
 * значения, `name`, `size` и состояния `disabled`/`readonly`/`invalid`, поэтому
 * свой `v-model` им не нужен.
 *
 * A11y: `role="group"` — не `radiogroup`. У группы чекбоксов нет roving tabindex
 * и переезда выбора стрелками: каждый чекбокс независим и остаётся собственной
 * остановкой `Tab`, ровно как набор нативных `<input type="checkbox">`.
 * `role="group"` не поддерживает `aria-required` и `aria-readonly` (axe:
 * `aria-allowed-attr`), поэтому оба состояния объявляют чекбоксы группы.
 */
import { computed, provide, ref } from 'vue'

import { useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useFocusWithin } from '../../composables/internal/useFocusWithin'

import GrCheckbox from '../GrCheckbox/GrCheckbox.vue'
import { GR_CHECKBOX_GROUP_CONTEXT } from '../GrCheckbox/grCheckboxGroupContext'
import type { GrCheckboxSize } from '../GrCheckbox/grCheckboxStyles'

export type GrCheckboxGroupDirection = 'vertical' | 'horizontal'

export interface GrCheckboxGroupOption {
  value: string
  label: string
  disabled?: boolean
}

export interface GrCheckboxGroupProps {
  modelValue: string[]
  options?: GrCheckboxGroupOption[]
  /** Общее имя для нативной формы: значения уйдут как повторяющиеся поля. */
  name?: string
  disabled?: boolean
  /** Только для чтения: выбор видно, но он не меняется. */
  readonly?: boolean
  /** Визуальное и ARIA-состояние ошибки для всей группы. */
  invalid?: boolean
  /** Обязательная группа: `aria-required` объявляют сами чекбоксы. */
  required?: boolean
  direction?: GrCheckboxGroupDirection
  size?: GrCheckboxSize
  ariaLabel?: string
}

export interface GrCheckboxGroupEmits {
  (e: 'update:modelValue', value: string[]): void
  (e: 'change', value: string[]): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<GrCheckboxGroupProps>(), {
  options: undefined,
  name: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  direction: 'vertical',
  size: undefined,
  ariaLabel: undefined,
})

const emit = defineEmits<GrCheckboxGroupEmits>()
defineSlots<{
  /** Собственная разметка флажков вместо генерации из `options`. */
  default?: () => any
}>()


// Эффективный размер группы: локальный проп → `GrConfigProvider` → `md`.
// Дочерние чекбоксы получают уже разрешённое значение через контекст.
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrCheckboxGroup' })

// Контекст `GrFormField`. Группа — не labelable-элемент, поэтому имя приходит
// через `aria-labelledby` на подпись поля, а не через `<label for>`.
const {
  disabled: isDisabled,
  id: fieldId,
  labelId: fieldLabelId,
  describedBy,
  invalid: isInvalid,
  required: isRequired,
  readonly: isReadonly,
} = useGrFormControl(() => props)

const labelledBy = computed(() => (props.ariaLabel ? undefined : fieldLabelId.value))

const layoutClass = computed(() =>
  props.direction === 'horizontal' ? 'flex flex-wrap items-center gap-4' : 'grid gap-2',
)

function toggle(value: string, checked: boolean): void {
  if (isDisabled.value || isReadonly.value)
    return

  if (checked) {
    if (props.modelValue.includes(value))
      return
    commit([...props.modelValue, value])
    return
  }

  commit(props.modelValue.filter(item => item !== value))
}

function commit(next: string[]): void {
  emit('update:modelValue', next)
  emit('change', next)
}

const rootEl = ref<HTMLElement | null>(null)

// Фокус ходит между чекбоксами группы: без границы каждый переход давал бы
// потребителю пару `blur` + `focus`.
const { onFocusIn, onFocusOut } = useFocusWithin(rootEl, {
  enter: event => emit('focus', event),
  leave: event => emit('blur', event),
})

function firstCheckbox(): HTMLElement | null | undefined {
  return rootEl.value?.querySelector<HTMLElement>('[role="checkbox"]:not([aria-disabled="true"])')
}

function focus(): void {
  firstCheckbox()?.focus()
}

function blur(): void {
  firstCheckbox()?.blur()
}

defineExpose({ focus, blur })

provide(GR_CHECKBOX_GROUP_CONTEXT, {
  modelValue: computed(() => props.modelValue),
  name: computed(() => props.name),
  disabled: computed(() => isDisabled.value),
  readonly: isReadonly,
  invalid: isInvalid,
  size: resolvedSize,
  required: isRequired,
  toggle,
})
</script>

<template>
  <div
    :id="fieldId"
    ref="rootEl"
    data-gr-checkbox-group
    role="group"
    :class="layoutClass"
    :aria-label="ariaLabel"
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
    :aria-invalid="isInvalid ? 'true' : undefined"
    :aria-disabled="isDisabled ? 'true' : undefined"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <slot>
      <GrCheckbox
        v-for="option in options ?? []"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </GrCheckbox>
    </slot>
  </div>
</template>
