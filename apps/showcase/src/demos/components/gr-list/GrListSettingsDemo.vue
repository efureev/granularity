<script setup lang="ts">
import { reactive } from 'vue'

import { GrList, GrListItem, GrSwitch } from '@feugene/granularity'

const settings = reactive({
  alerts: true,
  summaries: false,
  approvals: true,
})
</script>

<template>
  <!-- Заголовок пункта переключателю не принадлежит: он живёт рядом, а не в его
       разметке. Без aria-label скринридер объявит просто «переключатель». -->
  <GrList>
    <GrListItem title="Realtime alerts" description="Push incidents to the operations inbox.">
      <GrSwitch v-model="settings.alerts" aria-label="Realtime alerts" />
    </GrListItem>
    <GrListItem title="Weekly summaries" description="Send a digest to workspace owners every Monday.">
      <GrSwitch v-model="settings.summaries" aria-label="Weekly summaries" />
    </GrListItem>
    <GrListItem title="Approval reminders" description="Remind approvers about stale payout requests.">
      <GrSwitch v-model="settings.approvals" aria-label="Approval reminders" />
    </GrListItem>
  </GrList>
</template>
