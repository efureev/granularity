<script setup lang="ts">
import { ref } from 'vue'

import { GrSwitch } from '@feugene/granularity'
import { useFintI18n } from '@feugene/fint-i18n/vue'

const { t } = useFintI18n()
const notifications = ref(true)
const disabled = ref(false)

const syncing = ref(false)
const backup = ref(false)

function saveBackup(value: boolean): void {
  syncing.value = true
  window.setTimeout(() => {
    backup.value = value
    syncing.value = false
  }, 1200)
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
    <div class="grid gap-3">
      <GrSwitch v-model="notifications" :disabled="disabled">
        {{ t('components.GrSwitch.disabled.emailNotifications') }}
      </GrSwitch>
      <GrSwitch :model-value="true" disabled>
        {{ t('components.GrSwitch.disabled.alwaysOn') }}
      </GrSwitch>
      <GrSwitch
        :model-value="backup"
        :loading="syncing"
        label-position="start"
        @change="saveBackup"
      >
        {{ t('components.GrSwitch.disabled.backup') }}
      </GrSwitch>
    </div>

    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
      <GrSwitch v-model="disabled" size="sm">
        {{ t('components.GrSwitch.disabled.disableLabeled') }}
      </GrSwitch>
    </div>
  </div>
</template>
