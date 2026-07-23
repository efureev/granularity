<script setup lang="ts">
import {GrCard, GrBadge} from "@feugene/granularity";
</script>
<template>
  <div class="grid gap-4 md:grid-cols-3">
    <GrCard class="grid gap-2 p-4">
      <div class="text-sm text-[var(--gr-muted-fg)]">Error budget</div>
      <div class="text-2xl font-semibold text-[var(--gr-fg)]">98.4%</div>
      <GrBadge size="sm" tone="success" radius="semi">Healthy</GrBadge>
    </GrCard>

    <GrCard class="grid gap-2 p-4">
      <div class="text-sm text-[var(--gr-muted-fg)]">Pending reviews</div>
      <div class="text-2xl font-semibold text-[var(--gr-fg)]">7</div>
      <GrBadge size="sm" tone="warning" radius="semi">Attention</GrBadge>
    </GrCard>

    <GrCard class="grid gap-2 p-4">
      <div class="text-sm text-[var(--gr-muted-fg)]">Blocked pipelines</div>
      <div class="text-2xl font-semibold text-[var(--gr-fg)]">2</div>
      <GrBadge size="sm" tone="danger" radius="semi">Escalate</GrBadge>
    </GrCard>
  </div>
</template>
