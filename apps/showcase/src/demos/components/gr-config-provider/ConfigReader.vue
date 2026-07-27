<script setup lang="ts">
import { GrBadge, useGrConfig } from '@feugene/granularity'

// Любой компонент может прочитать конфиг ближайшего GrConfigProvider.
const config = useGrConfig()
</script>

<template>
  <div class="grid gap-2 rounded-lg border border-[var(--gr-brd)] bg-[var(--gr-bg)] p-3 text-sm">
    <div class="flex items-center gap-2">
      <span class="text-[var(--gr-muted-fg)]">size</span>
      <GrBadge tone="info">{{ config.size.value ?? '—' }}</GrBadge>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-[var(--gr-muted-fg)]">zIndexBase</span>
      <GrBadge tone="slate">{{ config.zIndexBase.value ?? '—' }}</GrBadge>
    </div>
    <div class="flex items-center gap-2">
      <span class="text-[var(--gr-muted-fg)]">GrButton default variant</span>
      <GrBadge tone="success">{{ config.componentDefaults.value.GrButton?.variant ?? '—' }}</GrBadge>
    </div>
  </div>
</template>
