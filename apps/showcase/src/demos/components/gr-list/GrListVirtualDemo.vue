<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrList, GrListItem } from '@feugene/granularity'

type Build = { id: number, title: string, description: string, status: string }

const builds: Build[] = Array.from({ length: 5000 }, (_, index) => ({
  id: index + 1,
  title: `Сборка #${index + 1}`,
  description: `Ветка feature/${1000 + index} · 2 мин 14 с`,
  status: index % 7 === 0 ? 'Упала' : 'Успешно',
}))

const list = ref<{ scrollToIndex: (index: number, align?: 'auto' | 'start' | 'center' | 'end') => void } | null>(null)
</script>

<template>
  <div class="grid gap-3">
    <GrButton size="sm" variant="outline" @click="list?.scrollToIndex(2499, 'start')">
      Показать сборку #2500
    </GrButton>

    <!-- `aria` из слота обязателен: в DOM живёт окно, и без setsize/posinset
         диктор объявил бы «12 из 12» вместо «1 из 5000». -->
    <GrList
      ref="list"
      :items="builds"
      item-key="id"
      virtual
      :max-height="320"
    >
      <template #item="{ item, aria }">
        <GrListItem v-bind="aria" :title="item.title" :description="item.description">
          <GrBadge size="sm" :tone="item.status === 'Успешно' ? 'success' : 'danger'">
            {{ item.status }}
          </GrBadge>
        </GrListItem>
      </template>
    </GrList>
  </div>
</template>
