<script setup lang="ts">
import { GrBadge, GrButton, GrCard } from '@feugene/granularity'
</script>

<template>
  <GrCard padding="md" body-class="grid gap-2">
    <template #header>
      <div class="flex flex-wrap items-center gap-2">
        <h3 class="m-0 text-sm font-semibold text-[var(--gr-fg)]">
          Release checklist
        </h3>
        <GrBadge size="sm" tone="info" radius="semi">
          2 blockers
        </GrBadge>
      </div>
    </template>

    <div class="text-sm text-[var(--gr-muted-fg)]">
      Шапка и подвал — слоты карточки: разделители и отступы она расставляет сама.
    </div>

    <template #footer>
      <div class="flex flex-wrap justify-end gap-2">
        <GrButton size="sm" variant="outline">
          Open runbook
        </GrButton>
        <GrButton size="sm">
          Resolve blockers
        </GrButton>
      </div>
    </template>
  </GrCard>
</template>
