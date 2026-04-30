<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrPagination } from '@feugene/granularity'

const total = ref(137)
const page = ref(3)
const pageSize = ref(10)

const visibleRange = computed(() => {
  const start = (page.value - 1) * pageSize.value + 1
  const end = Math.min(total.value, page.value * pageSize.value)

  return `${start}-${end}`
})
</script>

<template>
  <div class="grid gap-3">
    <GrPagination v-model:page="page" v-model:page-size="pageSize" :total="total" />

    <div class="flex flex-wrap gap-2">
      <GrBadge>
        Page {{ page }}
      </GrBadge>
      <GrBadge>
        Page size {{ pageSize }}
      </GrBadge>
      <GrBadge>
        Showing {{ visibleRange }} of {{ total }}
      </GrBadge>
    </div>
  </div>
</template>