<script setup lang="ts">
import { GrButton, GrToaster, useToast } from '@feugene/granularity'

import { useShowcaseToasterHost } from './showcaseToasterHost'

const { push } = useToast()
const { isActiveHost, activateHost } = useShowcaseToasterHost('stack')

const batch = [
  { title: 'invoice-2043.pdf', message: 'Uploaded to the shared folder.', tone: 'success' },
  { title: 'contract-final.docx', message: 'Uploaded to the shared folder.', tone: 'success' },
  { title: 'roadmap.key', message: 'Uploaded to the shared folder.', tone: 'success' },
  { title: 'archive.zip', message: 'Too large for the free plan.', tone: 'warning' },
  { title: 'notes.md', message: 'Uploaded to the shared folder.', tone: 'success' },
  { title: 'photos.heic', message: 'Format converted before upload.', tone: 'info' },
] as const

function uploadAll() {
  activateHost()
  for (const item of batch)
    push({ ...item, timeoutMs: 0 })
}
</script>

<template>
  <div class="grid gap-3">
    <GrButton size="sm" class="justify-self-start" @click="uploadAll">
      Upload six files
    </GrButton>

    <div class="text-xs text-[var(--gr-muted-fg)]">
      Шесть тостов занимают место одного. Наведи курсор на стопку — она развернётся
      в обычную колонку, и таймеры при этом встанут на паузу.
    </div>

    <GrToaster v-if="isActiveHost" :max-visible="6" />
  </div>
</template>
