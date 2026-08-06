<script setup lang="ts">
import { ref } from 'vue'

import type { GrTabsOrientation } from '@feugene/granularity'
import { GrSegmented, GrTabPanel, GrTabPanels, GrTabs } from '@feugene/granularity'

const tab = ref('overview')
const orientation = ref<GrTabsOrientation>('horizontal')
const manual = ref(true)

const tabs = [
  { value: 'overview', label: 'Обзор' },
  { value: 'activity', label: 'Активность', badge: '12' },
  { value: 'archive', label: 'Архив', disabled: true },
  { value: 'billing', label: 'Счета' },
]
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap items-center gap-4">
      <GrSegmented
        v-model="orientation"
        size="sm"
        :options="[
          { value: 'horizontal', label: 'horizontal' },
          { value: 'vertical', label: 'vertical' },
        ]"
      />
      <label class="flex items-center gap-2 text-sm text-[var(--gr-muted-fg)]">
        <input v-model="manual" type="checkbox">
        activationMode="manual"
      </label>
    </div>

    <div class="flex flex-wrap items-start gap-4">
      <GrTabs
        v-model="tab"
        :tabs="tabs"
        :orientation="orientation"
        :activation-mode="manual ? 'manual' : 'automatic'"
        id-base="activation-demo"
      />

      <GrTabPanels v-model="tab" id-base="activation-demo" class="min-w-[16rem] flex-1">
        <GrTabPanel v-for="item in tabs" :key="item.value" :value="item.value">
          Панель «{{ item.label }}»
        </GrTabPanel>
      </GrTabPanels>
    </div>

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] p-3 text-sm text-[var(--gr-muted-fg)]">
      В ручном режиме стрелки двигают только фокус — выбор подтверждает `Enter` или `Space`.
      Отключённая вкладка остаётся объявленной, но пропускается при переборе.
    </div>
  </div>
</template>
