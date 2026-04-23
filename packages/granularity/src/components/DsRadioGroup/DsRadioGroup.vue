<script setup lang="ts">
import { computed, provide } from 'vue'

import type { DsButtonSize } from '../DsButton'
import DsButtonGroup from '../DsButtonGroup/DsButtonGroup.vue'
import DsRadio from '../DsRadio/DsRadio.vue'
import { DS_RADIO_GROUP_CONTEXT } from '../DsRadio'

export type DsRadioGroupVariant = 'radiobox' | 'button'
export interface DsRadioGroupOption { value: string, label: string }

/**
 * DsRadioGroup — контейнер группы `DsRadio`.
 *
 * Может работать как через слот (ручной рендер `DsRadio`), так и через проп `options`.
 * Предоставляет дочерним `DsRadio` общий `modelValue`/`disabled`/`size`/`name` через `inject`.
 */
export interface DsRadioGroupProps {
  modelValue: string
  options?: DsRadioGroupOption[]
  name?: string
  disabled?: boolean
  variant?: DsRadioGroupVariant
  size?: DsButtonSize
  ariaLabel?: string
}

const props = withDefaults(defineProps<DsRadioGroupProps>(), {
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

provide(DS_RADIO_GROUP_CONTEXT, {
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
      <DsButtonGroup v-if="variant === 'button'">
        <slot />
      </DsButtonGroup>
      <div v-else class="grid gap-2">
        <slot />
      </div>
    </template>
    <template v-else>
      <DsButtonGroup v-if="variant === 'button'">
        <DsRadio
          v-for="opt in options ?? []"
          :key="opt.value"
          :value="opt.value"
          variant="button"
          :size="size"
        >
          {{ opt.label }}
        </DsRadio>
      </DsButtonGroup>
      <div v-else class="grid gap-2">
        <DsRadio v-for="opt in options ?? []" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </DsRadio>
      </div>
    </template>
  </div>
</template>
