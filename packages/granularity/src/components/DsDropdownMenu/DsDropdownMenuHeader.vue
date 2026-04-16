<script setup lang="ts">
import { computed, useSlots } from 'vue'

export type DsDropdownMenuHeaderAlign = 'left' | 'center' | 'right'

const props = withDefaults(
  defineProps<{
    title?: string
    align?: DsDropdownMenuHeaderAlign
    uppercase?: boolean
  }>(),
  {
    title: undefined,
    align: 'left',
    uppercase: true,
  },
)

const slots = useSlots()

const isVisible = computed(() => Boolean(props.title) || Boolean(slots.default))

const titleAlignClass = computed(() => {
  const map: Record<DsDropdownMenuHeaderAlign, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return map[props.align]
})
</script>

<template>
  <div
    v-if="isVisible"
    class="px-4 py-2 text-[11px] tracking-wide text-[var(--muted-fg)]"
    :class="[titleAlignClass, { uppercase: props.uppercase }]"
  >
    <slot>{{ props.title }}</slot>
  </div>
</template>