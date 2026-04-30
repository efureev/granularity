<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrButton, GrPagination } from '@feugene/granularity'

const total = ref(58)
const page = ref(5)
const pageSize = ref(12)
const pageSizes = [6, 12, 24]

const pageCount = computed(() => {
  return Math.max(1, Math.ceil(total.value / pageSize.value))
})

function clampPage() {
  page.value = Math.min(page.value, pageCount.value)
}

function setTotal(nextTotal: number) {
  total.value = nextTotal
  clampPage()
}
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2">
      <GrButton size="sm" :variant="total === 58 ? 'primary' : 'outline'" @click="setTotal(58)">
        58 items
      </GrButton>
      <GrButton size="sm" :variant="total === 23 ? 'primary' : 'outline'" @click="setTotal(23)">
        23 items
      </GrButton>
      <GrButton size="sm" :variant="total === 8 ? 'primary' : 'outline'" @click="setTotal(8)">
        8 items
      </GrButton>
    </div>

    <GrPagination
      v-model:page="page"
      v-model:page-size="pageSize"
      :page-sizes="pageSizes"
      :total="total"
      @update:page-size="clampPage"
    />

    <div class="flex flex-wrap gap-2">
      <GrBadge>
        Total {{ total }}
      </GrBadge>
      <GrBadge>
        Last available page {{ pageCount }}
      </GrBadge>
      <GrBadge>
        Active page {{ page }}
      </GrBadge>
    </div>
  </div>
</template>