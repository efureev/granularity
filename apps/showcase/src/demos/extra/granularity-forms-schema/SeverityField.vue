<script setup lang="ts">
import { computed } from 'vue'

import { GrButtonGroup, GrButton } from '@feugene/granularity'

/**
 * Свой контрол на три кнопки.
 *
 * Ровно тот минимум, которого требует контракт форм-контрола ядра: принимает
 * `modelValue`, отдаёт `update:modelValue`, уважает `disabled`/`readonly` и
 * умеет показать себя ошибочным. Больше форме ничего и не нужно — подпись,
 * обязательность, вывод ошибки и связь по `aria` берёт на себя обёртка поля.
 */
const props = defineProps<{
  modelValue?: unknown
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  ariaLabel?: string
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const LEVELS = [
  { value: 'low', label: 'Низкая' },
  { value: 'normal', label: 'Обычная' },
  { value: 'high', label: 'Срочная' },
]

const current = computed(() => String(props.modelValue ?? ''))

function pick(value: string): void {
  if (props.disabled || props.readonly)
    return

  emit('update:modelValue', value)
}
</script>

<template>
  <GrButtonGroup :aria-label="ariaLabel" :class="invalid ? 'rounded-[var(--gr-radius-md)] ring-1 ring-[var(--gr-danger)]' : undefined">
    <GrButton
      v-for="level in LEVELS"
      :key="level.value"
      size="sm"
      :variant="current === level.value ? 'primary' : 'outline'"
      :disabled="disabled || readonly"
      :aria-pressed="current === level.value"
      @click="pick(level.value)"
    >
      {{ level.label }}
    </GrButton>
  </GrButtonGroup>
</template>
