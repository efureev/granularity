<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsDrawer } from '@feugene/granularity'

const open = ref(false)
const size = ref<'md' | 'lg'>('md')

function openDrawer(nextSize: 'md' | 'lg') {
  size.value = nextSize
  open.value = true
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap gap-3">
      <DsButton variant="outline" @click="openDrawer('md')">
        Open review drawer
      </DsButton>
      <DsButton @click="openDrawer('lg')">
        Open wide drawer
      </DsButton>
    </div>

    <DsDrawer v-model="open" :title="`Escalation summary (${size})`" :size="size" :close-on-backdrop="false">
      <div class="grid gap-3 text-sm text-[var(--muted-fg)]">
        <p>Размер drawer удобно переключать под compact review или широкие inspector-сценарии.</p>
        <p>Backdrop закрытие отключено, чтобы случайный клик не сбрасывал прогресс.</p>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <DsButton variant="outline" @click="open = false">
            Continue later
          </DsButton>
          <DsButton @click="open = false">
            Resolve now
          </DsButton>
        </div>
      </template>
    </DsDrawer>
  </div>
</template>