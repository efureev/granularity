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
  <GrList>
    <GrListItem title="Realtime alerts" description="Push incidents to the operations inbox.">
      <GrSwitch v-model="settings.alerts" />
    </GrListItem>
    <GrListItem title="Weekly summaries" description="Send a digest to workspace owners every Monday.">
      <GrSwitch v-model="settings.summaries" />
    </GrListItem>
    <GrListItem title="Approval reminders" description="Remind approvers about stale payout requests.">
      <GrSwitch v-model="settings.approvals" />
    </GrListItem>
  </GrList>
</template>