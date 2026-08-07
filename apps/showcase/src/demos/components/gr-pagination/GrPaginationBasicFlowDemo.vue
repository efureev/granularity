<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrPagination } from '@feugene/granularity'

const total = ref(137)
const page = ref(3)
const pageSize = ref(10)
</script>

<template>
  <div class="grid gap-3">
    <GrPagination v-model:page="page" v-model:page-size="pageSize" :total="total" show-total />

    <div class="flex flex-wrap gap-2">
      <GrBadge>
        Page {{ page }}
      </GrBadge>
      <GrBadge>
        Page size {{ pageSize }}
      </GrBadge>
    </div>
  </div>
</template>
