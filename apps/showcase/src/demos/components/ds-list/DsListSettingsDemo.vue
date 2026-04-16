<script setup lang="ts">
import { reactive } from 'vue'

import { DsList, DsListItem, DsSwitch } from '@feugene/granularity'

const settings = reactive({
  alerts: true,
  summaries: false,
  approvals: true,
})
</script>

<template>
  <DsList>
    <DsListItem title="Realtime alerts" description="Push incidents to the operations inbox.">
      <DsSwitch v-model="settings.alerts" />
    </DsListItem>
    <DsListItem title="Weekly summaries" description="Send a digest to workspace owners every Monday.">
      <DsSwitch v-model="settings.summaries" />
    </DsListItem>
    <DsListItem title="Approval reminders" description="Remind approvers about stale payout requests.">
      <DsSwitch v-model="settings.approvals" />
    </DsListItem>
  </DsList>
</template>