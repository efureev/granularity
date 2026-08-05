import type { ShowcaseComponentExampleDoc } from '../types'

export const grCollapseExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'collapse-accordion-flow',
    title: 'Accordion with controlled active item',
    description: 'Базовый controlled-сценарий: в `accordion` режиме одновременно открыт только один раздел, а текущий state можно вывести рядом.',
    status: 'ready',
    previewKey: 'gr-collapse-accordion-flow',
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrCollapse, GrCollapseItem } from '@feugene/granularity'

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
    <div class="flex items-center gap-2 text-sm text-[var(--gr-muted-fg)]">
      <span>Open panel:</span>
      <GrBadge tone="neutral">{{ activeLabel }}</GrBadge>
    </div>

    <GrCollapse v-model="active" accordion>
      <GrCollapseItem name="profile" title="Profile setup">
        Keep onboarding steps in a single accordion so only one block stays expanded at a time.
      </GrCollapseItem>
      <GrCollapseItem name="notifications" title="Notifications">
        Group less-frequent preferences into a secondary panel without overwhelming the main settings form.
      </GrCollapseItem>
      <GrCollapseItem name="security" title="Security review">
        Reserve the last section for sensitive actions or audit details.
      </GrCollapseItem>
    </GrCollapse>
  </div>
</template>`,
  },
  {
    id: 'collapse-multi-section',
    title: 'Multi-expand sections with custom title slot',
    description: 'Показываем `accordion = false`, массив в `v-model` и richer `title` slot для badge/counter сценариев.',
    status: 'ready',
    previewKey: 'gr-collapse-multi-section',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrCollapse, GrCollapseItem } from '@feugene/granularity'

const expanded = ref<Array<string | number>>(['summary', 'alerts'])
</script>

<template>
  <div class="grid gap-3">
    <div class="text-sm text-[var(--gr-muted-fg)]">
      Multi-expand mode works well for dense dashboards where several sections should stay visible together.
    </div>

    <GrCollapse v-model="expanded" :divided="false">
      <GrCollapseItem name="summary">
        <template #title>
          <div class="flex items-center gap-2 text-sm font-600">
            Executive summary
            <GrBadge size="sm" tone="success">Ready</GrBadge>
          </div>
        </template>

        Key financial highlights, ownership notes and recent approvals can stay open side by side.
      </GrCollapseItem>

      <GrCollapseItem name="alerts">
        <template #title>
          <div class="flex items-center gap-2 text-sm font-600">
            Risk alerts
            <GrBadge size="sm" tone="warning">2 active</GrBadge>
          </div>
        </template>

        Use a custom title slot when you need counters, badges or richer inline status markers.
      </GrCollapseItem>

      <GrCollapseItem name="history" title="Change history">
        Keep audit notes collapsed by default until the operator explicitly opens them.
      </GrCollapseItem>
    </GrCollapse>
  </div>
</template>`,
  },
  {
    id: 'collapse-disabled-state',
    title: 'Parent disabled mode and item-level guard',
    description: 'Отдельно проверяем whole-group `disabled` и `disabled` на уровне конкретного `GrCollapseItem`.',
    status: 'ready',
    previewKey: 'gr-collapse-disabled-state',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrCollapse, GrCollapseItem } from '@feugene/granularity'

const disabled = ref(false)
const expanded = ref<Array<string | number>>(['active'])
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" variant="outline" @click="disabled = !disabled">
      {{ disabled ? 'Unlock' : 'Lock' }} all sections
    </GrButton>

    <GrCollapse v-model="expanded" :disabled="disabled">
      <GrCollapseItem name="active" title="Available section">
        Switch the whole collapse to a read-only state during background sync or permission checks.
      </GrCollapseItem>
      <GrCollapseItem name="blocked" title="Individually disabled item" disabled>
        Some items can remain unavailable even when the rest of the group is interactive.
      </GrCollapseItem>
      <GrCollapseItem name="notes" title="Operational notes">
        Disabled styling is inherited from the parent and still preserves the overall layout.
      </GrCollapseItem>
    </GrCollapse>
  </div>
</template>`,
  },
  {
    id: 'collapse-borderless',
    title: 'Borderless accordion inside a card',
    description: 'Аккордеон внутри чужой поверхности не должен рисовать вторую рамку: `borderless` снимает обёртку в `GrCard`, `expandIconPosition` и слот `#extra` доводят заголовок до вида настроек.',
    status: 'ready',
    previewKey: 'gr-collapse-borderless',
    code: `<script setup lang="ts">
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

        The \`#extra\` slot renders next to the trigger, so an action inside it stays a separate control.
      </GrCollapseItem>

      <GrCollapseItem name="schedule" title="Delivery schedule">
        Chevron on the left reads as a tree-like sidebar; on the right — as a classic accordion.
      </GrCollapseItem>
    </GrCollapse>
  </GrCard>
</template>`,
  },
  {
    id: 'collapse-guard',
    title: 'Async guard before collapsing',
    description: '`beforeChange` успевает спросить «сохранить изменения?» и отменить переключение: пока guard думает, повторный клик по заголовку игнорируется.',
    status: 'ready',
    previewKey: 'gr-collapse-guard',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrCollapse, GrCollapseItem, GrFormField, GrInput, GrSwitch } from '@feugene/granularity'

const expanded = ref<Array<string | number>>(['draft'])
const draft = ref('Quarterly report')
const dirty = ref(true)
const lastDecision = ref('—')

// Guard может быть async: пока он не ответил, повторный клик по заголовку
// игнорируется, поэтому диалог не откроется дважды.
async function beforeChange(name: string | number, expanding: boolean): Promise<boolean> {
  if (name !== 'draft' || expanding || !dirty.value) {
    lastDecision.value = \`allowed: \${String(name)} \${expanding ? 'expanded' : 'collapsed'}\`
    return true
  }

  await new Promise(resolve => setTimeout(resolve, 400))
  lastDecision.value = 'collapse of "draft" blocked: unsaved changes'
  return false
}
</script>

<template>
  <div class="grid gap-3">
    <GrCollapse v-model="expanded" :before-change="beforeChange">
      <GrCollapseItem name="draft" title="Draft with unsaved changes">
        <div class="grid gap-3">
          <GrFormField label="Draft title">
            <GrInput v-model="draft" size="sm" />
          </GrFormField>
          <GrSwitch v-model="dirty" size="sm">
            Treat the draft as unsaved
          </GrSwitch>
        </div>
      </GrCollapseItem>

      <GrCollapseItem name="history" title="Change history">
        This section opens and closes freely — the guard only protects the draft above.
      </GrCollapseItem>
    </GrCollapse>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Last guard decision: <span class="font-semibold text-[var(--gr-fg)]">{{ lastDecision }}</span>
    </div>
  </div>
</template>`,
  },
]
