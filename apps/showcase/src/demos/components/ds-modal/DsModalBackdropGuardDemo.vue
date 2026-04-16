<script setup lang="ts">
import { ref } from 'vue'

import { DsButton, DsModal } from '@feugene/granularity'

const open = ref(false)
</script>

<template>
  <div class="grid gap-3">
    <div class="text-sm text-[var(--muted-fg)]">
      Попробуйте кликнуть по backdrop: модалка останется открытой, пока пользователь не выберет явное действие.
    </div>

    <DsButton variant="outline" class="justify-self-start" @click="open = true">
      Open guarded modal
    </DsButton>

    <DsModal v-model="open" :close-on-backdrop="false" size="md">
      <div class="grid gap-4">
        <div class="grid gap-1">
          <div class="text-sm font-semibold text-[var(--fg)]">
            Draft protection
          </div>
          <div class="text-sm text-[var(--muted-fg)]">
            Используйте этот режим для wizard/confirm flow, где нельзя случайно потерять черновик.
          </div>
        </div>

        <div class="rounded-2xl border border-[var(--brd)] bg-[var(--muted)]/40 p-3 text-sm text-[var(--muted-fg)]">
          Unsaved changes: pricing rules, SLA exceptions, recipients.
        </div>

        <div class="flex flex-wrap gap-3">
          <DsButton variant="outline" @click="open = false">
            Cancel
          </DsButton>
          <DsButton @click="open = false">
            Save draft
          </DsButton>
        </div>
      </div>
    </DsModal>
  </div>
</template>