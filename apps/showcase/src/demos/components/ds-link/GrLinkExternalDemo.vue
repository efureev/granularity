<script setup lang="ts">
import { GrIcon, GrLink } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-3 text-sm">
    <GrLink href="https://example.com/docs/showcase" external size="md">
      Open external documentation
      <GrIcon size="sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-full w-full">
          <path d="M7 17 17 7" />
          <path d="M9 7h8v8" />
        </svg>
      </GrIcon>
    </GrLink>

    <div class="rounded-xl border border-[var(--brd)] bg-[var(--bg)] p-4 text-[var(--muted-fg)]">
      Use `external` when the link should automatically resolve `target="_blank"` и безопасный `rel`.
    </div>
  </div>
</template>