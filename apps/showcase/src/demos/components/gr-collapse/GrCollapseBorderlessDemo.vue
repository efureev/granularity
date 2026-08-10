<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrCard, GrCollapse, GrCollapseItem } from '@feugene/granularity'

const expanded = ref<Array<string | number>>(['filters'])
</script>

<template>
  <!-- Аккордеон уже внутри карточки: borderless снимает вторую рамку и вторую тень. -->
  <GrCard padding="md" body-class="grid gap-3">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <h3 class="m-0 text-base font-600 text-[var(--gr-fg)]">
          Report settings
        </h3>
        <GrButton size="xs" variant="ghost">
          Reset all
        </GrButton>
      </div>
    </template>

    <GrCollapse
      v-model="expanded"
      borderless
      size="sm"
      :heading-level="4"
      expand-icon-position="start"
      :divided="false"
    >
      <GrCollapseItem name="filters">
        <template #title>
          <span class="flex items-center gap-2 font-600">
            Filters
            <GrBadge size="xs" tone="primary">3</GrBadge>
          </span>
        </template>
        Статус секции живёт в самом заголовке: подсветка строки накрывает его целиком, и правый край
        держат отступы карточки, а не отдельная колонка.
      </GrCollapseItem>

      <GrCollapseItem name="columns">
        <template #title>
          <span class="flex items-center gap-2 font-600">
            Columns
            <GrBadge size="xs" tone="neutral">12 of 18</GrBadge>
          </span>
        </template>
        Без рамки и разделителей строку структурирует только hover — поэтому он обязан доходить до
        правого края, а не обрываться на середине.
      </GrCollapseItem>

      <GrCollapseItem name="schedule" title="Delivery schedule">
        Шеврон слева читается как дерево в сайдбаре, справа — как классический аккордеон.
      </GrCollapseItem>
    </GrCollapse>
  </GrCard>
</template>
