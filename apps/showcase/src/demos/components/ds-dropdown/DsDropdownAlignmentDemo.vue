<script setup lang="ts">
import { DsButton, DsDropdown } from '@feugene/granularity'
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-3">
    <DsDropdown align="left" width="48">
      <template #trigger>
        <DsButton variant="outline">Left</DsButton>
      </template>

      <template #content>
        <div class="grid gap-1 px-3 py-2 text-sm">
          <div class="font-semibold">Left aligned</div>
          <div class="text-[var(--muted-fg)]">
            Привязка к левому краю toolbar или list item.
          </div>
        </div>
      </template>
    </DsDropdown>

    <DsDropdown align="center" width="60">
      <template #trigger>
        <DsButton>Center</DsButton>
      </template>

      <template #content>
        <div class="grid gap-1 px-3 py-2 text-sm">
          <div class="font-semibold">Center aligned</div>
          <div class="text-[var(--muted-fg)]">
            Хорошо подходит для компактных pickers.
          </div>
        </div>
      </template>
    </DsDropdown>

    <DsDropdown align="right" width="auto">
      <template #trigger>
        <DsButton variant="ghost-border">Auto width</DsButton>
      </template>

      <template #content>
        <div class="whitespace-nowrap px-3 py-2 text-sm">
          Width adapts to content width.
        </div>
      </template>
    </DsDropdown>
  </div>
</template>