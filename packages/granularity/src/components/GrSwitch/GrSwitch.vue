<script setup lang="ts">
import {computed} from 'vue'

import {
  grSwitchLabelClass,
  grSwitchThumbClass,
  grSwitchTrackClass,
  type GrSwitchSize,
} from './grSwitchStyles'

export type {GrSwitchSize} from './grSwitchStyles'

/**
 * Пропсы публичного DS-примитива «Switch».
 */
export interface GrSwitchProps {
  modelValue: boolean
  disabled?: boolean
  ariaLabel?: string
  size?: GrSwitchSize
  /** Кастомный цвет фона в активном состоянии. Если не задан — `var(--primary)`. */
  activeBackgroundColor?: string
  /** Кастомный цвет фона в неактивном состоянии. Если не задан — `var(--muted)`. */
  inactiveBackgroundColor?: string
}

const getCustomColor = (value?: string) => value?.trim() || undefined

const props = withDefaults(
    defineProps<GrSwitchProps>(),
    {
      disabled: false,
      ariaLabel: undefined,
      size: 'md',
      activeBackgroundColor: undefined,
      inactiveBackgroundColor: undefined,
    },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const trackClass = computed(() => grSwitchTrackClass(props.size))

const trackStyle = computed(() => {
  const isChecked = props.modelValue
  const defaultBackgroundColor = isChecked ? 'var(--primary)' : 'var(--muted)'
  const customBackgroundColor = getCustomColor(
      isChecked ? props.activeBackgroundColor : props.inactiveBackgroundColor,
  )
  const backgroundColor = customBackgroundColor ?? defaultBackgroundColor

  return {
    '--ds-switch-track-bg': backgroundColor,
    '--ds-switch-track-brd': customBackgroundColor
        ? backgroundColor
        : isChecked
            ? 'var(--primary)'
            : 'var(--brd)',
    backgroundColor: 'var(--ds-switch-track-bg)',
  }
})

const thumbClass = computed(() => grSwitchThumbClass({size: props.size, checked: props.modelValue}))

const labelClass = computed(() => grSwitchLabelClass(props.size))

function toggle(): void {
  if (props.disabled) {
    return
  }

  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
      type="button"
      role="switch"
      data-ds-switch
      :aria-checked="modelValue ? 'true' : 'false'"
      :aria-label="ariaLabel"
      :disabled="disabled"
      class="inline-flex items-center gap-2 select-none disabled:opacity-50 disabled:cursor-not-allowed"
      @click="toggle"
  >
    <span
        data-testid="ds-switch-track"
        data-ds-switch-track
        :class="trackClass"
        :style="trackStyle"
    >
      <span
          data-testid="ds-switch-thumb"
          data-ds-switch-thumb
          :class="thumbClass"
          aria-hidden="true"
      />
    </span>
    <span
        v-if="$slots.default"
        data-ds-switch-label
        :class="labelClass"
    >
      <slot />
    </span>
  </button>
</template>
