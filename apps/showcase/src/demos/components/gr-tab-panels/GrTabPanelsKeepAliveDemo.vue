<script setup lang="ts">
import { ref } from 'vue'

import { GrInput, GrTabPanel, GrTabPanels, GrTabs } from '@feugene/granularity'

const tab = ref('draft')
const draft = ref('Черновик переживает переключение вкладок')
const mounted = ref<string[]>([])

const tabs = [
  { value: 'draft', label: 'Черновик' },
  { value: 'preview', label: 'Предпросмотр' },
  { value: 'history', label: 'История' },
]

function markMounted(value: string): string {
  if (!mounted.value.includes(value))
    mounted.value = [...mounted.value, value]

  return value
}
</script>

<template>
  <div class="grid gap-4">
    <GrTabs v-model="tab" :tabs="tabs" id-base="keep-alive-demo" />

    <!-- `keepAlive` + `lazy`: панель монтируется при первом показе и дальше живёт. -->
    <GrTabPanels v-model="tab" id-base="keep-alive-demo">
      <GrTabPanel value="draft" keep-alive lazy>
        <div class="grid gap-2 p-3">
          <span class="text-sm text-[var(--gr-muted-fg)]">{{ markMounted('draft') }} — состояние поля не теряется</span>
          <GrInput v-model="draft" size="sm" aria-label="Черновик" />
        </div>
      </GrTabPanel>

      <GrTabPanel value="preview" keep-alive lazy>
        <div class="p-3 text-sm">
          {{ markMounted('preview') }}: {{ draft || '—' }}
        </div>
      </GrTabPanel>

      <GrTabPanel value="history" keep-alive lazy>
        <div class="p-3 text-sm text-[var(--gr-muted-fg)]">
          {{ markMounted('history') }} — панель смонтировалась только сейчас
        </div>
      </GrTabPanel>
    </GrTabPanels>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      Смонтированы: <span class="font-semibold text-[var(--gr-fg)]">{{ mounted.join(', ') || '—' }}</span>.
      Панель появляется в DOM при первом показе и дальше не разрушается.
    </div>
  </div>
</template>
