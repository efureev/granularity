<script setup lang="ts">
import { ref } from 'vue'

import { GrPagination } from '@feugene/granularity'

const page = ref(1)
const pageSize = ref(10)
const narrowPage = ref(1)
const narrowSize = ref(10)
</script>

<template>
  <div class="grid gap-6">
    <!-- Подвал таблицы шириной 560px: переносится ряд, но не навигация. -->
    <div data-demo="pagination-560" class="w-[560px] max-w-full rounded-xl border border-[var(--gr-brd)] p-3">
      <GrPagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="137"
        :page-sizes="[10, 20, 50]"
        show-total
        show-page-size
        show-jumper
      />
    </div>

    <!-- 360px: даже один кластер навигации не помещается — здесь нужен `compact`. -->
    <div data-demo="pagination-360" class="w-[360px] max-w-full rounded-xl border border-[var(--gr-brd)] p-3">
      <GrPagination
        v-model:page="narrowPage"
        v-model:page-size="narrowSize"
        :total="137"
        :page-sizes="[10, 20, 50]"
        show-total
        show-page-size
        show-jumper
        compact
      />
    </div>
  </div>
</template>
