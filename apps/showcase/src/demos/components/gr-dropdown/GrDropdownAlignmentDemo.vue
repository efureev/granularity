<script setup lang="ts">
import { GrButton, GrDropdown } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3">
    <GrDropdown placement="bottom-start" width="12rem">
      <template #trigger="{ triggerProps }">
        <GrButton variant="outline" v-bind="triggerProps">Left</GrButton>
      </template>

      <template #content>
        <div class="grid gap-1 px-3 py-2 text-sm">
          <div class="font-semibold">Left aligned</div>
          <div class="text-[var(--gr-muted-fg)]">
            Anchored to the left edge of a toolbar or list item.
          </div>
        </div>
      </template>
    </GrDropdown>

    <GrDropdown placement="top" :offset="16" :width="240">
      <template #trigger="{ triggerProps }">
        <GrButton v-bind="triggerProps">Center</GrButton>
      </template>

      <template #content>
        <div class="grid gap-1 px-3 py-2 text-sm">
          <div class="font-semibold">Center aligned</div>
          <div class="text-[var(--gr-muted-fg)]">
            Works well for compact pickers.
          </div>
        </div>
      </template>
    </GrDropdown>

    <GrDropdown placement="bottom-end" width="auto">
      <template #trigger="{ triggerProps }">
        <GrButton variant="ghost-border" v-bind="triggerProps">Auto width</GrButton>
      </template>

      <template #content>
        <div class="whitespace-nowrap px-3 py-2 text-sm">
          Width adapts to content width.
        </div>
      </template>
    </GrDropdown>
  </div>
</template>
