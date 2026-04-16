<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsCollapse, DsCollapseItem } from '@feugene/granularity'

const disabled = ref(false)
const expanded = ref<Array<string | number>>(['active'])
</script>

<template>
  <div class="grid gap-3">
    <DsButton class="justify-self-start" variant="outline" @click="disabled = !disabled">
      {{ disabled ? 'Unlock' : 'Lock' }} all sections
    </DsButton>

    <DsCollapse v-model="expanded" :disabled="disabled">
      <DsCollapseItem name="active" title="Available section">
        Switch the whole collapse to a read-only state during background sync or permission checks.
      </DsCollapseItem>
      <DsCollapseItem name="blocked" title="Individually disabled item" disabled>
        Some items can remain unavailable even when the rest of the group is interactive.
      </DsCollapseItem>
      <DsCollapseItem name="notes" title="Operational notes">
        Disabled styling is inherited from the parent and still preserves the overall layout.
      </DsCollapseItem>
    </DsCollapse>
  </div>
</template>