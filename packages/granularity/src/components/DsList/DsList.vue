<script setup lang="ts">
import DsCard from '../DsCard'

export interface DsListProps {
  /** Показывать ли горизонтальные разделители между элементами (по умолчанию — да). */
  divided?: boolean
}

withDefaults(defineProps<DsListProps>(), {
  divided: true,
})
</script>

<template>
  <DsCard>
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
  </DsCard>
</template>