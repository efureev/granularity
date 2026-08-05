import type { ShowcaseComponentExampleDoc } from '../types'

export const grCardExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'card-variants',
    title: 'Варианты поверхности и карточка-кнопка',
    description: '`elevated` / `outlined` / `ghost` и полиморфный корень: `clickable` делает интерактивной всю поверхность.',
    status: 'ready',
    previewKey: 'gr-card-variants',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrCard } from '@feugene/granularity'

const opened = ref('—')
</script>

<template>
  <div class="grid gap-4">
    <div class="grid gap-3 md:grid-cols-3">
      <GrCard padding="md" body-class="grid gap-1">
        <div class="text-sm font-semibold text-[var(--gr-fg)]">
          elevated
        </div>
        <div class="text-sm text-[var(--gr-muted-fg)]">
          Рамка, фон и тень — вид по умолчанию.
        </div>
      </GrCard>

      <GrCard padding="md" variant="outlined" body-class="grid gap-1">
        <div class="text-sm font-semibold text-[var(--gr-fg)]">
          outlined
        </div>
        <div class="text-sm text-[var(--gr-muted-fg)]">
          Без тени: плотные сетки не рябят.
        </div>
      </GrCard>

      <GrCard padding="md" variant="ghost" body-class="grid gap-1">
        <div class="text-sm font-semibold text-[var(--gr-fg)]">
          ghost
        </div>
        <div class="text-sm text-[var(--gr-muted-fg)]">
          Без рамки: карточка внутри карточки.
        </div>
      </GrCard>
    </div>

    <!-- Внутри кликабельной карточки не должно быть кнопок и ссылок:
         интерактив внутри интерактива ломает и клавиатуру, и скринридер. -->
    <GrCard clickable padding="md" body-class="grid gap-1" @click="opened = 'Отчёт за июль'">
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Отчёт за июль
      </div>
      <div class="text-sm text-[var(--gr-muted-fg)]">
        Вся поверхность кликабельна и достижима \`Tab\`.
      </div>
    </GrCard>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Открыто: <span class="font-semibold text-[var(--gr-fg)]">{{ opened }}</span>
    </div>
  </div>
</template>`,
  },
  {
    id: 'card-basic-surface',
    title: 'Basic surface with host-controlled spacing',
    description: 'Показываем главный contract `GrCard`: компонент отвечает за surface/border, а внутренние spacing/layout decisions остаются у страницы через `class`.',
    status: 'ready',
    previewKey: 'gr-card-basic-surface',
    code: `<script setup lang="ts">
import { GrButton, GrCard } from '@feugene/granularity'
</script>

<template>
  <!-- Отступ и раскладка тела — пропами карточки, а не \`class\` снаружи. -->
  <GrCard padding="md" body-class="grid gap-4">
    <div>
      <div class="text-sm font-semibold text-[var(--gr-fg)]">
        Basic card
      </div>
      <div class="mt-1 text-sm text-[var(--gr-muted-fg)]">
        Карточка задаёт поверхность и отступы сама — потребителю остаётся содержимое.
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <GrButton size="sm">
        Primary action
      </GrButton>
      <GrButton size="sm" variant="outline">
        Secondary
      </GrButton>
    </div>
  </GrCard>
</template>`,
  },
  {
    id: 'card-kpi-grid',
    title: 'Cards as metric tiles',
    description: 'Один из самых частых use-case — KPI/stat tiles, где `GrCard` даёт единый surface для компактных dashboard-блоков.',
    status: 'ready',
    previewKey: 'gr-card-kpi-grid',
    code: `<script setup lang="ts">
import { GrBadge, GrCard } from '@feugene/granularity'

const metrics = [
  { id: 'budget', label: 'Error budget', value: '98.4%', tone: 'success', badge: 'Healthy' },
  { id: 'reviews', label: 'Pending reviews', value: '7', tone: 'warning', badge: 'Attention' },
  { id: 'pipelines', label: 'Blocked pipelines', value: '2', tone: 'danger', badge: 'Escalate' },
] as const
</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <GrCard
      v-for="metric in metrics"
      :key="metric.id"
      padding="sm"
      variant="outlined"
      body-class="grid gap-2"
    >
      <div class="text-sm text-[var(--gr-muted-fg)]">
        {{ metric.label }}
      </div>
      <div class="text-2xl font-semibold text-[var(--gr-fg)]">
        {{ metric.value }}
      </div>
      <GrBadge size="sm" :tone="metric.tone" radius="semi">
        {{ metric.badge }}
      </GrBadge>
    </GrCard>
  </div>
</template>`,
  },
  {
    id: 'card-action-panel',
    title: 'Action panel with badges and CTA group',
    description: 'Документируем composed pattern, где карточка работает контейнером для actions, helper badges и explanatory copy.',
    status: 'ready',
    previewKey: 'gr-card-action-panel',
    code: `<script setup lang="ts">
import { GrBadge, GrButton, GrCard } from '@feugene/granularity'
</script>

<template>
  <GrCard padding="md" body-class="grid gap-2">
    <template #header>
      <div class="flex flex-wrap items-center gap-2">
        <h3 class="m-0 text-sm font-semibold text-[var(--gr-fg)]">
          Release checklist
        </h3>
        <GrBadge size="sm" tone="info" radius="semi">
          2 blockers
        </GrBadge>
      </div>
    </template>

    <div class="text-sm text-[var(--gr-muted-fg)]">
      Шапка и подвал — слоты карточки: разделители и отступы она расставляет сама.
    </div>

    <template #footer>
      <div class="flex flex-wrap justify-end gap-2">
        <GrButton size="sm" variant="outline">
          Open runbook
        </GrButton>
        <GrButton size="sm">
          Resolve blockers
        </GrButton>
      </div>
    </template>
  </GrCard>
</template>`,
  },
]
