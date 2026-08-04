<script setup lang="ts">
import { ref } from 'vue'

import { GrPagination } from '@feugene/granularity'

const sizes = ['xs', 'sm', 'md', 'lg'] as const

const page = ref(4)
const pageSize = ref(20)
</script>

<template>
  <div class="grid gap-4">
    <div v-for="size in sizes" :key="size" class="grid gap-2">
      <div class="text-xs font-semibold text-[var(--gr-muted-fg)]">
        size="{{ size }}"
      </div>

      <GrPagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="240"
        :size="size"
      />
    </div>
  </div>
</template>
