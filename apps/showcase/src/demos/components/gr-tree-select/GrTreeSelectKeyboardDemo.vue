<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrTreeSelect } from '@feugene/granularity'

type Region = {
  id: string
  label: string
  children?: Region[]
}

const catalog: Region[] = [
  {
    id: 'eu',
    label: 'Europe',
    children: [
      { id: 'eu-central', label: 'Central' },
      { id: 'eu-north', label: 'North' },
    ],
  },
  {
    id: 'us',
    label: 'Americas',
    children: [
      { id: 'us-east', label: 'East' },
      { id: 'us-west', label: 'West' },
    ],
  },
]

const data = ref<Region[]>([])
const loading = ref(false)
const value = ref<string | null>(null)

async function load() {
  loading.value = true
  data.value = []

  await new Promise(resolve => setTimeout(resolve, 900))

  data.value = catalog
  loading.value = false
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
    <div class="grid gap-3">
      <GrTreeSelect
        v-model="value"
        :data="data"
        :loading="loading"
        node-key="id"
        filterable
        clearable
        placeholder="Регион размещения"
        aria-label="Регион размещения"
      />

      <div>
        <GrButton size="sm" variant="outline" @click="load">
          Загрузить справочник
        </GrButton>
      </div>
    </div>

    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-muted-fg)]">
      <ul class="grid gap-1">
        <li>Стрелка вниз на поле открывает панель и уводит в поиск.</li>
        <li>Ещё одна стрелка — фокус уже в дереве, дальше клавиши GrTree.</li>
        <li><code>Esc</code> закрывает панель и возвращает фокус на поле.</li>
        <li>Пока данные едут, панель показывает индикатор, а не «нет данных».</li>
      </ul>
    </div>
  </div>
</template>
