<script setup lang="ts">
import {DsIcon} from '@feugene/granularity'

const sizes = [12, 16, 20, 28, 36]
</script>

<template>
  <div class="flex flex-wrap items-end gap-5">
    <div
        v-for="size in sizes"
        :key="size"
        class="flex flex-col items-center gap-2 text-xs text-[var(--muted-fg)]"
    >
      <DsIcon :size="size">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="h-full w-full">
          <path d="M12 3 14.8 8.7 21 9.6 16.5 14l1 6.1L12 17.1 6.5 20.1l1-6.1L3 9.6l6.2-.9L12 3Z"/>
        </svg>
      </DsIcon>

      <span>{{ size }}px</span>
    </div>
  </div>
</template>