<script setup lang="ts">
import GrDateTimePicker from '../GrDateTimePicker/GrDateTimePicker.vue'
import type { GrDateTimeModel } from '../../types'

/**
 * `GrDatePicker` — пресет `GrDateTimePicker` с зафиксированным `mode="date"`
 * (календарь без времени). Остальные пропсы/слоты прозрачно пробрасываются.
 */
defineOptions({ inheritAttrs: false })
defineProps<{ modelValue?: GrDateTimeModel }>()
defineEmits<{ (e: 'update:modelValue', value: GrDateTimeModel): void }>()
</script>

<template>
  <GrDateTimePicker
    v-bind="$attrs"
    mode="date"
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template v-for="(_slot, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </GrDateTimePicker>
</template>
