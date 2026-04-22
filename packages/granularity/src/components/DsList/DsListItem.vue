<script setup lang="ts">
import { computed, useSlots } from 'vue'

export type DsListItemDensity = 'compact' | 'regular'

export interface DsListItemProps {
  /** Заголовок строки. Если передан слот `#title`, проп игнорируется. */
  title?: string
  /** Описание под заголовком. Если передан слот `#description`, проп игнорируется. */
  description?: string
  /** Плотность вертикальных отступов: `regular` — 12px, `compact` — 8px. */
  density?: DsListItemDensity
}

const props = withDefaults(defineProps<DsListItemProps>(), {
  title: undefined,
  description: undefined,
  density: 'regular',
})

const slots = useSlots()

const paddingClass = computed(() =>
  props.density === 'compact' ? 'px-4 py-2' : 'px-4 py-3',
)

const hasTitle = computed(() => !!slots.title || !!props.title)
const hasDescription = computed(() => !!slots.description || !!props.description)
</script>

<template>
  <div
    role="listitem"
    class="flex items-start justify-between gap-4"
    :class="paddingClass"
  >
    <div v-if="$slots.prefix" class="shrink-0">
      <slot name="prefix" />
    </div>
    <div class="min-w-0 flex-1">
      <div v-if="hasTitle" class="text-[13px] font-700">
        <slot name="title">{{ title }}</slot>
      </div>
      <div
        v-if="hasDescription"
        class="text-[13px] ds-muted mt-0.5"
      >
        <slot name="description">{{ description }}</slot>
      </div>
    </div>
    <div v-if="$slots.default" class="shrink-0">
      <slot />
    </div>
  </div>
</template>