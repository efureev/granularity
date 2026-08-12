<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrSortableList } from '@feugene/granularity'

type Step = { id: string, title: string, owner: string }

const steps = ref<Step[]>([
  { id: 'brief', title: 'Бриф и требования', owner: 'Продукт' },
  { id: 'design', title: 'Макет', owner: 'Дизайн' },
  { id: 'build', title: 'Сборка', owner: 'Разработка' },
  { id: 'review', title: 'Ревью и приёмка', owner: 'QA' },
])
</script>

<template>
  <div class="grid gap-4">
    <GrSortableList v-model="steps" item-key="id">
      <template #item="{ item, index }">
        <div class="flex items-center justify-between gap-3">
          <span>
            <GrBadge tone="neutral">{{ index + 1 }}</GrBadge>
            {{ item.title }}
          </span>
          <span class="text-sm text-[var(--gr-muted-fg)]">{{ item.owner }}</span>
        </div>
      </template>
    </GrSortableList>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Порядок:
      <code>{{ steps.map(step => step.id).join(', ') }}</code>
      — тяните за ручку или доведите фокус до строки и нажмите Space, стрелки, Space.
    </p>
  </div>
</template>
