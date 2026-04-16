<script setup lang="ts">
import {computed} from 'vue'

export type {DsSwitchSize} from './dsSwitchStyles'

import {
  dsSwitchLabelClass,
  dsSwitchThumbClass,
  dsSwitchTrackClass,
  type DsSwitchSize,
} from './dsSwitchStyles'

const getCustomColor = (value?: string) => value?.trim() || undefined

const props = withDefaults(
    defineProps<{
      modelValue: boolean
      disabled?: boolean
      ariaLabel?: string
      size?: DsSwitchSize
      activeBackgroundColor?: string
      inactiveBackgroundColor?: string
    }>(),
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

const trackClass = computed(() => dsSwitchTrackClass(props.size))

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

const thumbClass = computed(() => dsSwitchThumbClass({size: props.size, checked: props.modelValue}))

const labelClass = computed(() => dsSwitchLabelClass(props.size))

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
      :aria-checked="props.modelValue ? 'true' : 'false'"
      :aria-label="props.ariaLabel"
      :disabled="props.disabled"
      class="inline-flex items-center gap-2 select-none disabled:opacity-50 disabled:cursor-not-allowed"
      @click="toggle"
  >
    <span
        data-testid="ds-switch-track"
        :class="trackClass"
        :style="trackStyle"
    >
      <span
          data-testid="ds-switch-thumb"
          :class="thumbClass"
          aria-hidden="true"
      />
    </span>
    <span
        v-if="$slots.default"
        :class="labelClass"
    >
      <slot />
    </span>
  </button>
</template>