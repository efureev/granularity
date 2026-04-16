<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsDrawer } from '@feugene/granularity'

const open = ref(false)
const activeItem = ref('Overview')

const items = ['Overview', 'Approvals', 'Members', 'Security']
</script>

<template>
  <div class="grid gap-3">
    <DsButton variant="outline" class="justify-self-start" @click="open = true">
      Open left rail
    </DsButton>

    <div class="text-xs text-[var(--muted-fg)]">
      Active section: <span class="font-medium text-[var(--fg)]">{{ activeItem }}</span>
    </div>

    <DsDrawer v-model="open" title="Workspace sections" side="left" size="sm">
      <div class="grid gap-2">
        <button
          v-for="item in items"
          :key="item"
          type="button"
          class="rounded-lg px-3 py-2 text-left text-sm transition"
          :class="item === activeItem ? 'bg-[var(--accent)] text-[var(--accent-fg)]' : 'border border-[var(--brd)] text-[var(--muted-fg)]'"
          @click="activeItem = item"
        >
          {{ item }}
        </button>
      </div>
    </DsDrawer>
  </div>
</template>