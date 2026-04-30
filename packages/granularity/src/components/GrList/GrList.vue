<script setup lang="ts">
import GrCard from '../GrCard'

export interface GrListProps {
  /** Показывать ли горизонтальные разделители между элементами (по умолчанию — да). */
  divided?: boolean
}

withDefaults(defineProps<GrListProps>(), {
  divided: true,
})
</script>

<template>
  <GrCard>
    <div
      v-if="divided"
      role="list"
      class="divide-y divide-[var(--brd)]"
    >
      <slot />
    </div>
    <div
      v-else
      role="list"
    >
      <slot />
    </div>
  </GrCard>
</template>