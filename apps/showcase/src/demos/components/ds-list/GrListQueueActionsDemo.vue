<script setup lang="ts">
import { GrBadge, GrButton, GrList, GrListItem } from '@feugene/granularity'

const jobs = [
  { title: 'Publish release notes', description: 'Ready for review by marketing', status: 'Ready' },
  { title: 'Re-sync bank accounts', description: 'Waiting for background worker', status: 'Queued' },
  { title: 'Archive invoices', description: 'Needs manual confirmation', status: 'Review' },
]
</script>

<template>
  <GrList>
    <GrListItem
      v-for="job in jobs"
      :key="job.title"
      :title="job.title"
      :description="job.description"
    >
      <div class="flex items-center gap-2">
        <GrBadge size="sm" tone="success">
          {{ job.status }}
        </GrBadge>
        <GrButton size="sm" variant="outline">
          Open
        </GrButton>
      </div>
    </GrListItem>
  </GrList>
</template>