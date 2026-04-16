<script setup lang="ts">
import { DsBadge, DsButton, DsList, DsListItem } from '@feugene/granularity'

const jobs = [
  { title: 'Publish release notes', description: 'Ready for review by marketing', status: 'Ready' },
  { title: 'Re-sync bank accounts', description: 'Waiting for background worker', status: 'Queued' },
  { title: 'Archive invoices', description: 'Needs manual confirmation', status: 'Review' },
]
</script>

<template>
  <DsList>
    <DsListItem
      v-for="job in jobs"
      :key="job.title"
      :title="job.title"
      :description="job.description"
    >
      <div class="flex items-center gap-2">
        <DsBadge size="sm" tone="success">
          {{ job.status }}
        </DsBadge>
        <DsButton size="sm" variant="outline">
          Open
        </DsButton>
      </div>
    </DsListItem>
  </DsList>
</template>