import type { ShowcaseComponentExampleDoc } from '../types'

export const dsCollapseExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'collapse-accordion-flow',
    title: 'Accordion with controlled active item',
    description: 'Базовый controlled-сценарий: в `accordion` режиме одновременно открыт только один раздел, а текущий state можно вывести рядом.',
    status: 'ready',
    previewKey: 'ds-collapse-accordion-flow',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { DsBadge, DsCollapse, DsCollapseItem } from '@feugene/granularity'

const active = ref<string | number | undefined>('profile')

const activeLabel = computed(() => {
  if (active.value === 'profile')
    return 'Profile setup'

  if (active.value === 'notifications')
    return 'Notifications'

  if (active.value === 'security')
    return 'Security review'

  return 'Collapsed'
})
</script>

<template>
  <div class="grid gap-3">
    <div class="flex items-center gap-2 text-sm text-[var(--muted-fg)]">
      <span>Open panel:</span>
      <DsBadge tone="secondary">{{ activeLabel }}</DsBadge>
    </div>

    <DsCollapse v-model="active" accordion>
      <DsCollapseItem name="profile" title="Profile setup">...</DsCollapseItem>
      <DsCollapseItem name="notifications" title="Notifications">...</DsCollapseItem>
      <DsCollapseItem name="security" title="Security review">...</DsCollapseItem>
    </DsCollapse>
  </div>
</template>`,
  },
  {
    id: 'collapse-multi-section',
    title: 'Multi-expand sections with custom title slot',
    description: 'Показываем `accordion = false`, массив в `v-model` и richer `title` slot для badge/counter сценариев.',
    status: 'ready',
    previewKey: 'ds-collapse-multi-section',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsCollapse, DsCollapseItem } from '@feugene/granularity'

const expanded = ref<Array<string | number>>(['summary', 'alerts'])
</script>

<template>
  <DsCollapse v-model="expanded" :divided="false">
    <DsCollapseItem name="summary">
      <template #title>
        <div class="flex items-center gap-2 text-sm font-600">
          Executive summary
          <DsBadge size="sm" tone="success">Ready</DsBadge>
        </div>
      </template>
    </DsCollapseItem>
  </DsCollapse>
</template>`,
  },
  {
    id: 'collapse-disabled-state',
    title: 'Parent disabled mode and item-level guard',
    description: 'Отдельно проверяем whole-group `disabled` и `disabled` на уровне конкретного `DsCollapseItem`.',
    status: 'ready',
    previewKey: 'ds-collapse-disabled-state',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsCollapse, DsCollapseItem } from '@feugene/granularity'

const disabled = ref(false)
const expanded = ref<Array<string | number>>(['active'])
</script>

<template>
  <DsButton variant="outline" @click="disabled = !disabled">
    {{ disabled ? 'Unlock' : 'Lock' }} all sections
  </DsButton>

  <DsCollapse v-model="expanded" :disabled="disabled">
    <DsCollapseItem name="blocked" title="Individually disabled item" disabled>...</DsCollapseItem>
  </DsCollapse>
</template>`,
  },
]
