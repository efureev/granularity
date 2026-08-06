<script setup lang="ts">
import {computed, ref} from 'vue'

import { useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'

import {
  grSwitchLabelClass,
  grSwitchThumbClass,
  grSwitchTrackClass,
  type GrSwitchSize,
} from './grSwitchStyles'

export type {GrSwitchSize} from './grSwitchStyles'

/**
 * Пропсы публичного GR-примитива «Switch».
 */
export interface GrSwitchProps {
  modelValue: boolean
  disabled?: boolean
  /** Только для чтения: состояние видно, но не переключается. */
  readonly?: boolean
  /** Визуальное и ARIA-состояние ошибки. */
  invalid?: boolean
  /** Обязательное поле (`aria-required`). */
  required?: boolean
  ariaLabel?: string
  size?: GrSwitchSize
  /** Кастомный цвет фона в активном состоянии. Если не задан — `var(--gr-primary)`. */
  activeBackgroundColor?: string
  /** Кастомный цвет фона в неактивном состоянии. Если не задан — `var(--gr-muted)`. */
  inactiveBackgroundColor?: string
}

const getCustomColor = (value?: string) => value?.trim() || undefined

const props = withDefaults(
    defineProps<GrSwitchProps>(),
    {
      disabled: false,
      readonly: false,
      invalid: false,
      required: false,
      ariaLabel: undefined,
      size: undefined,
      activeBackgroundColor: undefined,
      inactiveBackgroundColor: undefined,
    },
)

// Контекст `GrFormField`: id для `<label for>`, описание ошибкой, невалидность.
// `<button>` — labelable-элемент, поэтому клик по подписи фокусирует переключатель.
const field = useGrFormFieldContext()
const fieldId = computed(() => field?.id.value)
const describedBy = computed(() => field?.describedById.value)
const {
  disabled: isDisabled,
  invalid: isInvalid,
  required: isRequired,
  readonly: isReadonly,
} = useGrFormControl(() => props)

const rootEl = ref<HTMLButtonElement | null>(null)

function focus(): void {
  rootEl.value?.focus()
}

function blur(): void {
  rootEl.value?.blur()
}

defineExpose({ focus, blur })

// Эффективный размер: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentSize(() => props.size, {
  component: 'GrSwitch',
  supported: ['sm', 'md', 'lg'],
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const trackClass = computed(() => grSwitchTrackClass(resolvedSize.value))

const trackStyle = computed(() => {
  const isChecked = props.modelValue
  const defaultBackgroundColor = isChecked ? 'var(--gr-primary)' : 'var(--gr-muted)'
  const customBackgroundColor = getCustomColor(
      isChecked ? props.activeBackgroundColor : props.inactiveBackgroundColor,
  )
  const backgroundColor = customBackgroundColor ?? defaultBackgroundColor

  return {
    '--gr-switch-track-bg': backgroundColor,
    '--gr-switch-track-brd': customBackgroundColor
        ? backgroundColor
        : isChecked
            ? 'var(--gr-primary)'
            : 'var(--gr-brd)',
    backgroundColor: 'var(--gr-switch-track-bg)',
  }
})

const thumbClass = computed(() => grSwitchThumbClass({size: resolvedSize.value, checked: props.modelValue}))

const labelClass = computed(() => grSwitchLabelClass(resolvedSize.value))

function toggle(): void {
  if (isDisabled.value || isReadonly.value) {
    return
  }

  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
      :id="fieldId"
      ref="rootEl"
      type="button"
      role="switch"
      data-gr-switch
      :aria-checked="modelValue ? 'true' : 'false'"
      :aria-label="ariaLabel"
      :aria-describedby="describedBy"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :aria-required="isRequired ? 'true' : undefined"
      :aria-readonly="isReadonly ? 'true' : undefined"
      :disabled="isDisabled"
      class="inline-flex items-center gap-2 select-none disabled:opacity-50 disabled:cursor-not-allowed"
      @click="toggle"
  >
    <span
        data-testid="gr-switch-track"
        data-gr-switch-track
        :class="trackClass"
        :style="trackStyle"
    >
      <span
          data-testid="gr-switch-thumb"
          data-gr-switch-thumb
          :class="thumbClass"
          aria-hidden="true"
      />
    </span>
    <span
        v-if="$slots.default"
        data-gr-switch-label
        :class="labelClass"
    >
      <slot />
    </span>
  </button>
</template>
