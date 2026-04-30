<script setup lang="ts">
import { GrButton, GrDropdown } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3">
    <GrDropdown align="left" width="48">
      <template #trigger>
        <GrButton variant="outline">Left</GrButton>
      </template>

      <template #content>
        <div class="grid gap-1 px-3 py-2 text-sm">
          <div class="font-semibold">Left aligned</div>
          <div class="text-[var(--muted-fg)]">
            Привязка к левому краю toolbar или list item.
          </div>
        </div>
      </template>
    </GrDropdown>

    <GrDropdown align="center" width="60">
      <template #trigger>
        <GrButton>Center</GrButton>
      </template>

      <template #content>
        <div class="grid gap-1 px-3 py-2 text-sm">
          <div class="font-semibold">Center aligned</div>
          <div class="text-[var(--muted-fg)]">
            Хорошо подходит для компактных pickers.
          </div>
        </div>
      </template>
    </GrDropdown>

    <GrDropdown align="right" width="auto">
      <template #trigger>
        <GrButton variant="ghost-border">Auto width</GrButton>
      </template>

      <template #content>
        <div class="whitespace-nowrap px-3 py-2 text-sm">
          Width adapts to content width.
        </div>
      </template>
    </GrDropdown>
  </div>
</template>