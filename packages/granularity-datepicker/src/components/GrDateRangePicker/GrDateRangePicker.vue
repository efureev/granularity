<script setup lang="ts">
import GrDateTimePicker from '../GrDateTimePicker/GrDateTimePicker.vue'
import type { GrDateRangeValue } from '../../types'

/**
 * `GrDateRangePicker` — пресет `GrDateTimePicker` с `mode="date"` и `range`
 * (выбор диапазона дат). Модель — массив из двух границ (`GrDateRangeValue`).
 */
defineOptions({ inheritAttrs: false })
defineProps<{ modelValue?: GrDateRangeValue }>()
defineEmits<{ (e: 'update:modelValue', value: GrDateRangeValue): void }>()
</script>

<template>
  <GrDateTimePicker
    v-bind="$attrs"
    mode="date"
    range
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event as GrDateRangeValue)"
  >
    <template v-for="(_slot, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </GrDateTimePicker>
</template>
