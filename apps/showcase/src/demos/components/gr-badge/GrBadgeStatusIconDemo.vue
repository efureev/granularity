<script setup lang="ts">
import IconCheck from '~icons/lucide/check'
import IconLoader from '~icons/lucide/loader-circle'
import IconX from '~icons/lucide/x'

import { GrBadge } from '@feugene/granularity'
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-wrap items-center gap-2">
      <GrBadge tone="warning">
        <template #icon>
          <IconLoader class="h-full w-full animate-spin" />
        </template>
        На распознании
      </GrBadge>

      <GrBadge tone="success">
        <template #icon>
          <IconCheck class="h-full w-full" />
        </template>
        Распознано
      </GrBadge>

      <GrBadge tone="danger">
        <template #icon>
          <IconX class="h-full w-full" />
        </template>
        Ошибка распознавания
      </GrBadge>

      <GrBadge tone="neutral">
        Не распознан
      </GrBadge>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <GrBadge v-for="size in (['xs', 'sm', 'md', 'lg'] as const)" :key="size" :size tone="warning">
        <template #icon>
          <IconLoader class="h-full w-full animate-spin" />
        </template>
        {{ size }} — на распознании
      </GrBadge>
    </div>
  </div>
</template>
