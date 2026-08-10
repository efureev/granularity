<script setup lang="ts">
import { computed, provide, ref } from 'vue'

import { useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useFocusWithin } from '../../composables/internal/useFocusWithin'

import type { GrButtonSize } from '../GrButton'
import GrButtonGroup from '../GrButtonGroup/GrButtonGroup.vue'
import GrRadio from '../GrRadio/GrRadio.vue'
import { GR_RADIO_GROUP_CONTEXT } from '../GrRadio'
import type { GrRadioEntry, GrRadioValue } from '../GrRadio/grRadioGroupContext'

export type GrRadioGroupVariant = 'radiobox' | 'button'
export type GrRadioGroupOrientation = 'vertical' | 'horizontal'
export interface GrRadioGroupOption {
  value: GrRadioValue
  label: string
  /** Отключить одну опцию, не переходя на слот. */
  disabled?: boolean
  /** Пояснение под подписью. Рисуется только в варианте `radiobox`. */
  description?: string
}

/**
 * GrRadioGroup — контейнер группы `GrRadio`.
 *
 * Может работать как через слот (ручной рендер `GrRadio`), так и через проп `options`.
 * Предоставляет дочерним `GrRadio` общий `modelValue`/`disabled`/`size`/`name` через `inject`.
 */
export interface GrRadioGroupProps {
  modelValue: GrRadioValue
  options?: GrRadioGroupOption[]
  name?: string
  disabled?: boolean
  /** Только для чтения: выбор видно, но он не меняется. */
  readonly?: boolean
  /** Визуальное и ARIA-состояние ошибки. */
  invalid?: boolean
  /** Обязательное поле (`aria-required`). */
  required?: boolean
  variant?: GrRadioGroupVariant
  /**
   * Раскладка варианта `radiobox`. Кнопочный вариант всегда горизонтальный —
   * его собирает `GrButtonGroup`.
   */
  orientation?: GrRadioGroupOrientation
  size?: GrButtonSize
  ariaLabel?: string
}

export interface GrRadioGroupEmits {
  (e: 'update:modelValue', value: GrRadioValue): void
  (e: 'change', value: GrRadioValue): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<GrRadioGroupProps>(), {
  options: undefined,
  name: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  variant: 'radiobox',
  orientation: 'vertical',
  size: undefined,
  ariaLabel: undefined,
})

// Эффективный размер группы: локальный проп → `GrConfigProvider` → `md`.
// Дочерние `GrRadio` получают уже разрешённое значение через контекст, поэтому
// провайдер работает и для них — без второго чтения конфига.
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrRadioGroup' })

// Контекст `GrFormField`. Группа — не labelable-элемент, поэтому имя приходит
// через `aria-labelledby` на подпись поля, а не через `<label for>`.
const field = useGrFormFieldContext()
const fieldId = computed(() => field?.id.value)
const describedBy = computed(() => field?.describedById.value)
const {
  disabled: isDisabled,
  invalid: isInvalid, required: isRequired, readonly: isReadonly } = useGrFormControl(() => props)
const labelledBy = computed(() => (props.ariaLabel ? undefined : field?.labelId.value))

const emit = defineEmits<GrRadioGroupEmits>()
defineSlots<{
  /** Собственная разметка переключателей вместо генерации из `options`. */
  default?: () => any
}>()


function setValue(next: GrRadioValue): void {
  if (isDisabled.value || isReadonly.value)
    return
  emit('update:modelValue', next)
  emit('change', next)
}

const listClass = computed(() => (props.orientation === 'horizontal'
  ? 'flex flex-wrap items-start gap-x-6 gap-y-2'
  : 'grid gap-2'))

const rootEl = ref<HTMLElement | null>(null)

// Фокус ходит между радиокнопками: без границы каждая стрелка давала бы
// потребителю пару `blur` + `focus`.
const { onFocusIn, onFocusOut } = useFocusWithin(rootEl, {
  enter: event => emit('focus', event),
  leave: event => emit('blur', event),
})

function focus(): void {
  rootEl.value?.querySelector<HTMLElement>('[role="radio"][tabindex="0"]')?.focus()
}

function blur(): void {
  rootEl.value?.querySelector<HTMLElement>('[role="radio"][tabindex="0"]')?.blur()
}

defineExpose({ focus, blur })

const entries = ref<GrRadioEntry[]>([])

function register(entry: GrRadioEntry): () => void {
  entries.value.push(entry)
  return () => {
    const index = entries.value.indexOf(entry)
    if (index >= 0) entries.value.splice(index, 1)
  }
}

const enabledValues = computed(() =>
  entries.value.filter(entry => !entry.disabled()).map(entry => entry.value()),
)

const rovingValue = computed(() => {
  if (enabledValues.value.includes(props.modelValue)) return props.modelValue
  return enabledValues.value[0]
})

function moveSelection(from: GrRadioValue, direction: 1 | -1): GrRadioValue | undefined {
  const values = enabledValues.value
  if (values.length === 0) return undefined

  const current = values.indexOf(from)
  // Стрелки зациклены — это требование паттерна radiogroup.
  const next = values[(current + direction + values.length) % values.length]

  if (next !== undefined) setValue(next)
  return next
}

/** `Home`/`End` — на края набора; как в `GrSegmented`, где паттерн реализован целиком. */
function selectEdge(edge: 'first' | 'last'): GrRadioValue | undefined {
  const values = enabledValues.value
  const next = edge === 'first' ? values[0] : values.at(-1)

  if (next !== undefined) setValue(next)
  return next
}

provide(GR_RADIO_GROUP_CONTEXT, {
  modelValue: computed(() => props.modelValue),
  name: computed(() => props.name),
  disabled: computed(() => isDisabled.value),
  readonly: isReadonly,
  invalid: isInvalid,
  size: resolvedSize,
  setValue,
  register,
  rovingValue,
  moveSelection,
  selectEdge,
})
</script>

<template>
  <div
    :id="fieldId"
    ref="rootEl"
    data-gr-radio-group
    role="radiogroup"
    :aria-label="ariaLabel"
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
    :aria-invalid="isInvalid ? 'true' : undefined"
    :aria-required="isRequired ? 'true' : undefined"
    :aria-readonly="isReadonly ? 'true' : undefined"
    :aria-disabled="isDisabled ? 'true' : undefined"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <template v-if="$slots.default">
      <GrButtonGroup v-if="variant === 'button'">
        <slot />
      </GrButtonGroup>
      <div v-else :class="listClass">
        <slot />
      </div>
    </template>
    <template v-else>
      <GrButtonGroup v-if="variant === 'button'">
        <GrRadio
          v-for="opt in options ?? []"
          :key="String(opt.value)"
          :value="opt.value"
          :disabled="opt.disabled"
          variant="button"
          :size="resolvedSize"
        >
          {{ opt.label }}
        </GrRadio>
      </GrButtonGroup>
      <div v-else :class="listClass">
        <GrRadio
          v-for="opt in options ?? []"
          :key="String(opt.value)"
          :value="opt.value"
          :disabled="opt.disabled"
        >
          {{ opt.label }}

          <template v-if="opt.description" #description>
            {{ opt.description }}
          </template>
        </GrRadio>
      </div>
    </template>
  </div>
</template>
