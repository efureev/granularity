<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrButton, GrList, GrListItem, GrSegmented } from '@feugene/granularity'

type Mode = 'items' | 'empty' | 'loading'

const mode = ref<Mode>('items')

const presets = computed(() => (mode.value === 'items'
  ? [
      { id: 'retention', title: 'Retention policy', description: 'Archive old reports after 90 days.' },
      { id: 'export', title: 'Export history', description: 'Keep downloadable exports for 30 days.' },
    ]
  : []))
</script>

<template>
  <div class="grid gap-3">
    <GrSegmented
      v-model="mode"
      size="sm"
      :options="[
        { value: 'items', label: 'Пункты' },
        { value: 'empty', label: 'Пусто' },
        { value: 'loading', label: 'Загрузка' },
      ]"
    />

    <!-- Ни `v-if` вокруг списка, ни ручного переключения `divided`: пустоту
         список видит по слоту сам. -->
    <GrList :loading="mode === 'loading'">
      <GrListItem
        v-for="preset in presets"
        :key="preset.id"
        :title="preset.title"
        :description="preset.description"
      />

      <template #empty>
        <div class="grid justify-items-center gap-2">
          <span>Ни одного архивного пресета</span>
          <GrButton size="sm" @click="mode = 'items'">
            Показать примеры
          </GrButton>
        </div>
      </template>
    </GrList>
  </div>
</template>
