<script setup lang="ts">
import type { GrDescriptionItem } from '@feugene/granularity'
import { GrBadge, GrDescriptionList } from '@feugene/granularity'

const items: GrDescriptionItem[] = [
  { label: 'Status', value: 'Active', name: 'status' },
  { label: 'Created', value: '17 August 2026' },
  { label: 'Owner', value: 'billing-team' },
  { label: 'X-Request-Id', value: 'req_01HXQZ8K3M7N2P4R6T8V0W1Y3Z' },
  { label: 'Archived at', value: null },
]
</script>

<template>
  <GrDescriptionList :items="items" label-width="9rem" divided>
    <!-- Слот адресуется по `name` пары: в парах регулярно стоят бейджи,
         относительное время и ссылки, а не только строки. -->
    <template #value-status>
      <GrBadge tone="success">
        Active
      </GrBadge>
    </template>
  </GrDescriptionList>
</template>
