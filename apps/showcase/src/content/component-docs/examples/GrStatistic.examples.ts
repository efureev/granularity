import type { ShowcaseComponentExampleDoc } from '../types'

export const grStatisticExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'statistic-basic',
    title: 'KPI row',
    description: 'Показатель с подписью, иконкой, приписками и форматированием: `precision` фиксирует знаки, разряды разделяются автоматически.',
    status: 'ready',
    previewKey: 'gr-statistic-basic',
    code: `<script setup lang="ts">
import { GrCard, GrStatistic } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-3">
    <GrCard class="p-4">
      <GrStatistic
        title="Revenue"
        :value="1284500"
        :precision="0"
        prefix="$"
        icon="i-lucide-wallet"
      />
    </GrCard>

    <GrCard class="p-4">
      <GrStatistic
        title="Active users"
        :value="18342"
        icon="i-lucide-users"
      />
    </GrCard>

    <GrCard class="p-4">
      <GrStatistic
        title="Conversion"
        :value="4.8"
        :precision="1"
        suffix="%"
        icon="i-lucide-target"
      />
    </GrCard>
  </div>
</template>`,
  },
  {
    id: 'statistic-trend',
    title: 'Trend and loading',
    description: '`trend` + `trend-text` добавляют строку динамики со стрелкой и цветом, `loading` подменяет значение плейсхолдером той же высоты — блок не прыгает.',
    status: 'ready',
    previewKey: 'gr-statistic-trend',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrCard, GrStatistic } from '@feugene/granularity'

const loading = ref(false)

function refresh(): void {
  loading.value = true
  setTimeout(() => { loading.value = false }, 1200)
}
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-4 sm:grid-cols-3">
      <GrCard class="p-4">
        <GrStatistic
          title="Orders"
          :value="2148"
          tone="success"
          trend="up"
          trend-text="+12.5% week over week"
          :loading="loading"
        />
      </GrCard>

      <GrCard class="p-4">
        <GrStatistic
          title="Refunds"
          :value="97"
          tone="danger"
          trend="down"
          trend-text="-3.1% week over week"
          :loading="loading"
        />
      </GrCard>

      <GrCard class="p-4">
        <GrStatistic
          title="Average check"
          :value="5980.4"
          :precision="2"
          suffix="₽"
          trend="flat"
          trend-text="No change"
          :loading="loading"
        />
      </GrCard>
    </div>

    <div>
      <GrButton size="sm" @click="refresh">
        Refresh data
      </GrButton>
    </div>
  </div>
</template>`,
    note: 'Плейсхолдер помечен `role="status"` и `aria-busy`, поэтому обновление данных не остаётся незамеченным.',
  },
  {
    id: 'statistic-slots',
    title: 'Slots and non-numeric values',
    description: 'Слоты `#icon`, `#trend`, `#prefix`/`#suffix` подставляют любой контент, а нечисловое значение («2 h 15 min») выводится как есть.',
    status: 'ready',
    previewKey: 'gr-statistic-slots',
    code: `<script setup lang="ts">
import { GrBadge, GrCard, GrStatistic } from '@feugene/granularity'

const uptime = '99.982'
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <GrCard class="p-4">
      <GrStatistic title="Uptime" :value="uptime" :precision="3" suffix="%" size="lg" tone="success">
        <template #trend>
          <GrBadge tone="success" size="xs">
            SLA met
          </GrBadge>
        </template>
      </GrStatistic>
    </GrCard>

    <GrCard class="p-4">
      <GrStatistic title="Time to first response" value="2 h 15 min" size="sm">
        <template #icon>
          <span class="i-lucide-clock block h-4 w-4" aria-hidden="true" />
        </template>
        <template #trend>
          <span>Target — under 4 hours</span>
        </template>
      </GrStatistic>
    </GrCard>
  </div>
</template>`,
  },
]
