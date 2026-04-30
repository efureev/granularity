<script setup lang="ts">
import { computed, provide } from 'vue'

import type { GrButtonSize } from '../GrButton'
import GrButtonGroup from '../GrButtonGroup/GrButtonGroup.vue'
import GrRadio from '../GrRadio/GrRadio.vue'
import { GR_RADIO_GROUP_CONTEXT } from '../GrRadio'

export type GrRadioGroupVariant = 'radiobox' | 'button'
export interface GrRadioGroupOption { value: string, label: string }

/**
 * GrRadioGroup — контейнер группы `GrRadio`.
 *
 * Может работать как через слот (ручной рендер `GrRadio`), так и через проп `options`.
 * Предоставляет дочерним `GrRadio` общий `modelValue`/`disabled`/`size`/`name` через `inject`.
 */
export interface GrRadioGroupProps {
  modelValue: string
  options?: GrRadioGroupOption[]
  name?: string
  disabled?: boolean
  variant?: GrRadioGroupVariant
  size?: GrButtonSize
  ariaLabel?: string
}

const props = withDefaults(defineProps<GrRadioGroupProps>(), {
  options: undefined,
  name: undefined,
  disabled: false,
  variant: 'radiobox',
  size: 'md',
  ariaLabel: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function setValue(next: string): void {
  if (props.disabled)
    return
  emit('update:modelValue', next)
}

provide(GR_RADIO_GROUP_CONTEXT, {
  modelValue: computed(() => props.modelValue),
  name: computed(() => props.name),
  disabled: computed(() => props.disabled),
  size: computed(() => props.size),
  setValue,
})
</script>

<template>
  <div
    data-ds-radio-group
    role="radiogroup"
    :aria-label="ariaLabel"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <template v-if="$slots.default">
      <GrButtonGroup v-if="variant === 'button'">
        <slot />
      </GrButtonGroup>
      <div v-else class="grid gap-2">
        <slot />
      </div>
    </template>
    <template v-else>
      <GrButtonGroup v-if="variant === 'button'">
        <GrRadio
          v-for="opt in options ?? []"
          :key="opt.value"
          :value="opt.value"
          variant="button"
          :size="size"
        >
          {{ opt.label }}
        </GrRadio>
      </GrButtonGroup>
      <div v-else class="grid gap-2">
        <GrRadio v-for="opt in options ?? []" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </GrRadio>
      </div>
    </template>
  </div>
</template>
