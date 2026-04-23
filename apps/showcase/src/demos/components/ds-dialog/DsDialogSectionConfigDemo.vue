<script setup lang="ts">
import {ref} from 'vue'

import {DsButton, DsDialog, DsCheckbox} from '@feugene/granularity'

const open = ref(false)
const confirmed = ref(false)

function openDialog() {
  confirmed.value = false
  open.value = true
}
</script>

<template>
  <div class="grid gap-3">
    <DsButton variant="outline" class="justify-self-start" @click="openDialog">
      Open stateful dialog
    </DsButton>

    <div class="text-xs text-[var(--muted-fg)]">
      Footer action enabled: <span class="font-medium text-[var(--fg)]">{{ confirmed ? 'yes' : 'no' }}</span>
    </div>

    <DsDialog
        v-model="open"
        title="Share workspace"
        :header-config="{ paddingX: 'px-4', paddingY: 'py-3' }"
        :footer-config="{ paddingX: 'px-4', paddingY: 'py-3', bordered: false }"
    >
      <div class="grid gap-4 text-sm text-[var(--muted-fg)]">
        <p>
          Внутреннее состояние формы продолжает жить внутри dialog-shell, а section config помогает адаптировать
          плотность под compact workflows.
        </p>

        <div class="flex items-start gap-3 rounded-lg border border-[var(--brd)] p-3 text-[var(--fg)]">
          <DsCheckbox v-model="confirmed">I reviewed access levels and notification scope.</DsCheckbox>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <DsButton variant="outline" @click="open = false">
            Later
          </DsButton>
          <DsButton :disabled="!confirmed" @click="open = false">
            Share workspace
          </DsButton>
        </div>
      </template>
    </DsDialog>
  </div>
</template>