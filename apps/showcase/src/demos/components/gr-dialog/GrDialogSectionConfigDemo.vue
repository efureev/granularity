<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrDialog, GrCheckbox } from '@feugene/granularity'

const open = ref(false)
const confirmed = ref(false)

function openDialog() {
  confirmed.value = false
  open.value = true
}
</script>

<template>
  <div class="grid gap-3">
    <GrButton variant="outline" class="justify-self-start" @click="openDialog">
      Open stateful dialog
    </GrButton>

    <div class="text-xs text-[var(--gr-muted-fg)]">
      Footer action enabled: <span class="font-medium text-[var(--gr-fg)]">{{ confirmed ? 'yes' : 'no' }}</span>
    </div>

    <GrDialog
        v-model="open"
        title="Share workspace"
        :header-config="{ paddingX: 'px-4', paddingY: 'py-3' }"
        :footer-config="{ paddingX: 'px-4', paddingY: 'py-3', bordered: false }"
    >
      <div class="grid gap-4 text-sm text-[var(--gr-muted-fg)]">
        <p>
          The internal form state keeps living inside the dialog shell, while section config helps adapt density to compact workflows.
        </p>

        <div class="flex items-start gap-3 rounded-lg border border-[var(--gr-brd)] p-3 text-[var(--gr-fg)]">
          <GrCheckbox v-model="confirmed">I reviewed access levels and notification scope.</GrCheckbox>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <GrButton variant="outline" @click="open = false">
            Later
          </GrButton>
          <GrButton :disabled="!confirmed" @click="open = false">
            Share workspace
          </GrButton>
        </div>
      </template>
    </GrDialog>
  </div>
</template>
