<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrDrawer } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <GrButton class="justify-self-start" @click="open = true">
      Open filters drawer
    </GrButton>

    <GrDrawer v-model="open" title="Report filters" size="sm">
      <div class="grid gap-4 text-sm text-[var(--muted-fg)]">
        <label class="grid gap-2">
          <span class="text-[var(--fg)]">Owner</span>
          <input class="rounded-lg border border-[var(--brd)] bg-transparent px-3 py-2" value="Operations" />
        </label>

        <label class="grid gap-2">
          <span class="text-[var(--fg)]">Date range</span>
          <input class="rounded-lg border border-[var(--brd)] bg-transparent px-3 py-2" value="Last 30 days" />
        </label>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <GrButton variant="outline" @click="open = false">
            Reset
          </GrButton>
          <GrButton @click="open = false">
            Apply filters
          </GrButton>
        </div>
      </template>
    </GrDrawer>
  </div>
</template>