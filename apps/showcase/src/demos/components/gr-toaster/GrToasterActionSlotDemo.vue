<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrToaster, useToast } from '@feugene/granularity'

import { useShowcaseToasterHost } from './showcaseToasterHost'

const { push } = useToast()
const { isActiveHost, activateHost } = useShowcaseToasterHost('action-slot')

const status = ref('—')

function notify() {
  activateHost()
  status.value = 'Awaiting review'

  push({
    title: 'Deploy ready',
    message: 'Review the build and promote it to production.',
    tone: 'success',
    timeoutMs: 0,
  })
}
</script>

<template>
  <div class="grid gap-3">
    <GrButton size="sm" @click="notify">
      Notify with custom actions
    </GrButton>
    <span class="text-xs text-[var(--gr-muted-fg)]">
      Status: <span class="font-medium text-[var(--gr-fg)]">{{ status }}</span>
    </span>

    <GrToaster v-if="isActiveHost">
      <!-- Кнопки действий передаём через слот. `dismiss` закрывает этот тост. -->
      <template #actions="{ toast, dismiss }">
        <GrButton
          size="sm"
          variant="primary"
          @click="() => { status = `Promoted: ${toast.title}`; dismiss() }"
        >
          Promote
        </GrButton>
        <GrButton size="sm" variant="ghost" @click="dismiss">
          Later
        </GrButton>
      </template>
    </GrToaster>
  </div>
</template>
