<script setup lang="ts">
import { GrCard, GrDescriptionList } from '@feugene/granularity'

const items = [
  { label: 'Gross', value: '$26,100' },
  { label: 'Refunds', value: '$1,355' },
  { label: 'Net', value: '$24,745' },
]
</script>

<template>
  <div class="grid gap-4">
    <!--
      `title` печатается настоящим `h2`…`h6`, а не жирной строкой: отчёт из
      нескольких карточек иначе нечем обойти по структуре — после `h1` страницы
      заголовков в нём нет.
    -->
    <GrCard
      title="Revenue by channel"
      description="August 2026, excluding refunds"
      :heading-level="3"
      variant="outlined"
      padding="md"
    >
      <GrDescriptionList :items="items" label-width="7rem" />
    </GrCard>

    <!--
      Типовая карточка отчёта: `padding` оставлен дефолтным, чтобы содержимое
      шло край в край, — и шапка всё равно с отступом. Она принадлежит самой
      карточке, а не содержимому, и прижатой к рамке быть не должна.
    -->
    <GrCard title="Documents" variant="outlined">
      <GrDescriptionList :items="items" layout="flow" class="px-4 py-3" />
    </GrCard>

    <!-- `#header` сильнее пропов: нестандартная шапка остаётся за потребителем. -->
    <GrCard variant="outlined" padding="md">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <h3 class="m-0 text-[length:var(--gr-text-sm)] font-600">
            Custom header
          </h3>
          <span class="text-[length:var(--gr-text-xs)] text-[var(--gr-muted-fg)]">updated 2 min ago</span>
        </div>
      </template>

      Слот занят — `title` и `description` не рендерятся вовсе.
    </GrCard>
  </div>
</template>
