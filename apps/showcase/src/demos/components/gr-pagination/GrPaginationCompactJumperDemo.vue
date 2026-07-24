<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrPagination } from '@feugene/granularity'

const total = ref(482)
const page = ref(7)
const pageSize = ref(20)
</script>

<template>
  <div class="grid gap-6">
    <div class="grid gap-2">
      <div class="showcase-demo-caption text-xs">
        Compact — «current / total» indicator
      </div>
      <GrPagination v-model:page="page" v-model:page-size="pageSize" :total="total" compact />
    </div>

    <div class="grid gap-2">
      <div class="showcase-demo-caption text-xs">
        Jumper — type a page number and press Enter
      </div>
      <GrPagination v-model:page="page" v-model:page-size="pageSize" :total="total" show-jumper />
    </div>

    <div class="grid gap-2">
      <div class="showcase-demo-caption text-xs">
        Compact + jumper together
      </div>
      <GrPagination v-model:page="page" v-model:page-size="pageSize" :total="total" compact show-jumper />
    </div>

    <div class="flex flex-wrap gap-2">
      <GrBadge>Page {{ page }}</GrBadge>
      <GrBadge>Page size {{ pageSize }}</GrBadge>
      <GrBadge>Total {{ total }}</GrBadge>
    </div>
  </div>
</template>
