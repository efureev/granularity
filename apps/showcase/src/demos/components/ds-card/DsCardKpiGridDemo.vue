<script setup lang="ts">
import {DsCard, DsBadge} from "@feugene/granularity";
</script>
<template>
  <div class="grid gap-4 md:grid-cols-3">
    <DsCard class="grid gap-2 p-4">
      <div class="text-sm text-[var(--muted-fg)]">Error budget</div>
      <div class="text-2xl font-semibold text-[var(--fg)]">98.4%</div>
      <DsBadge size="sm" tone="success" radius="semi">Healthy</DsBadge>
    </DsCard>

    <DsCard class="grid gap-2 p-4">
      <div class="text-sm text-[var(--muted-fg)]">Pending reviews</div>
      <div class="text-2xl font-semibold text-[var(--fg)]">7</div>
      <DsBadge size="sm" tone="warning" radius="semi">Attention</DsBadge>
    </DsCard>

    <DsCard class="grid gap-2 p-4">
      <div class="text-sm text-[var(--muted-fg)]">Blocked pipelines</div>
      <div class="text-2xl font-semibold text-[var(--fg)]">2</div>
      <DsBadge size="sm" tone="danger" radius="semi">Escalate</DsBadge>
    </DsCard>
  </div>
</template>
