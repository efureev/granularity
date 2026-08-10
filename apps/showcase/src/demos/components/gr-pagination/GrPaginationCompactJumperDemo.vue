<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrDivider, GrPagination } from '@feugene/granularity'

const total = ref(482)
const page = ref(7)
const pageSize = ref(20)
</script>

<template>
  <div class="grid gap-4">
    <GrDivider label="compact" align="start" />
    <GrPagination v-model:page="page" v-model:page-size="pageSize" :total="total" compact />

    <GrDivider label="show-jumper" align="start" />
    <GrPagination v-model:page="page" v-model:page-size="pageSize" :total="total" show-jumper />

    <GrDivider label="compact + show-jumper" align="start" />
    <GrPagination v-model:page="page" v-model:page-size="pageSize" :total="total" compact show-jumper />

    <GrDivider />
    <div class="flex flex-wrap gap-2">
      <GrBadge>Page {{ page }}</GrBadge>
      <GrBadge>Page size {{ pageSize }}</GrBadge>
      <GrBadge>Total {{ total }}</GrBadge>
    </div>
  </div>
</template>
