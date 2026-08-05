<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrCard, GrCollapse, GrCollapseItem } from '@feugene/granularity'

const expanded = ref<Array<string | number>>(['filters'])
</script>

<template>
  <!-- Аккордеон уже внутри карточки: borderless снимает вторую рамку и вторую тень. -->
  <GrCard class="p-4">
    <h2 class="m-0 mb-3 text-base font-600 text-[var(--gr-fg)]">
      Report settings
    </h2>

    <GrCollapse
      v-model="expanded"
      borderless
      size="sm"
      :heading-level="3"
      expand-icon-position="start"
      :divided="false"
    >
      <GrCollapseItem name="filters" title="Filters">
        <template #extra>
          <GrBadge size="sm" tone="primary">
            3
          </GrBadge>
        </template>

        Keep the accordion flush with the surrounding card: no border, no shadow, no double padding.
      </GrCollapseItem>

      <GrCollapseItem name="columns" title="Columns">
        <template #extra>
          <GrButton size="xs" variant="ghost">
            Reset
          </GrButton>
        </template>

        The `#extra` slot renders next to the trigger, so an action inside it stays a separate control.
      </GrCollapseItem>

      <GrCollapseItem name="schedule" title="Delivery schedule">
        Chevron on the left reads as a tree-like sidebar; on the right — as a classic accordion.
      </GrCollapseItem>
    </GrCollapse>
  </GrCard>
</template>
