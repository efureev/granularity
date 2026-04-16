<script setup lang="ts">
import { DsIcon, DsLink } from '@feugene/granularity'

const items = [
  'Sync billing status every 5 minutes',
  'Re-run failed payout webhooks automatically',
  'Publish audit log snapshots to support inbox',
]
</script>

<template>
  <div class="grid gap-3">
    <div
      v-for="item in items"
      :key="item"
      class="flex items-start gap-3 rounded-xl border border-[var(--brd)] bg-[var(--bg)] p-4"
    >
      <DsIcon size="md" class="mt-0.5 text-[var(--primary)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-full w-full">
          <path d="M4 12h16" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </DsIcon>

      <div class="min-w-0 text-sm text-[var(--fg)]">
        {{ item }}
      </div>
    </div>

    <DsLink href="https://example.com" external size="md">
      Explore icon usage inside inline content
    </DsLink>
  </div>
</template>