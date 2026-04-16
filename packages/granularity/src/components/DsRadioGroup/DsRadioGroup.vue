<script setup lang="ts">
import { computed, provide } from 'vue'

import type { DsButtonSize } from '../DsButton'
import DsButtonGroup from '../DsButtonGroup/DsButtonGroup.vue'
import DsRadio from '../DsRadio/DsRadio.vue'
import { DS_RADIO_GROUP_CONTEXT } from '../DsRadio'

export type DsRadioGroupVariant = 'radiobox' | 'button'
export type DsRadioGroupOption = { value: string, label: string }

const props = withDefaults(
  defineProps<{
    modelValue: string
    options?: DsRadioGroupOption[]
    name?: string
    disabled?: boolean
    variant?: DsRadioGroupVariant
    size?: DsButtonSize
  }>(),
  {
    options: undefined,
    name: undefined,
    disabled: false,
    variant: 'radiobox',
    size: 'md',
  },
)

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
  <div role="radiogroup" :aria-disabled="props.disabled ? 'true' : undefined">
    <template v-if="$slots.default">
      <DsButtonGroup v-if="props.variant === 'button'">
        <slot />
      </DsButtonGroup>
      <div v-else class="grid gap-2">
        <slot />
      </div>
    </template>

    <template v-else>
      <DsButtonGroup v-if="props.variant === 'button'">
        <DsRadio
          v-for="opt in props.options ?? []"
          :key="opt.value"
          :value="opt.value"
          variant="button"
          :size="props.size"
        >
          {{ opt.label }}
        </DsRadio>
      </DsButtonGroup>

      <div v-else class="grid gap-2">
        <DsRadio v-for="opt in props.options ?? []" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </DsRadio>
      </div>
    </template>
  </div>
</template>