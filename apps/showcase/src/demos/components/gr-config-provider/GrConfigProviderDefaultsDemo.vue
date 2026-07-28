<script setup lang="ts">
import { ref } from 'vue'

import {
  GrBadge,
  GrButton,
  GrConfigProvider,
  GrInput,
  type GrComponentDefaults,
} from '@feugene/granularity'

const value = ref('Igor Petrov')

// Оформление всего поддерева задаётся одним объектом: у самих компонентов
// ни `variant`, ни `tone`, ни `clearable` не указаны.
const brandDefaults: GrComponentDefaults = {
  GrButton: { variant: 'outline', tone: 'azure' },
  GrInput: { clearable: true },
  GrBadge: { tone: 'azure', radius: 'semi' },
}

const enabled = ref(true)
</script>

<template>
  <div class="grid gap-4">
    <GrButton size="sm" variant="ghost" @click="enabled = !enabled">
      {{ enabled ? 'Turn defaults off' : 'Turn defaults on' }}
    </GrButton>

    <GrConfigProvider :component-defaults="enabled ? brandDefaults : undefined">
      <div class="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
        <GrInput v-model="value" class="max-w-[16rem]" aria-label="Full name" />
        <GrButton>Invite</GrButton>
        <GrButton>Copy link</GrButton>
        <GrBadge>Pro</GrBadge>
      </div>
    </GrConfigProvider>

    <p class="text-sm text-[var(--gr-muted-fg)]">
      Локальный проп всегда сильнее конфига — у кнопки-переключателя выше явно задан
      <code>variant="ghost"</code>, и она не меняется.
    </p>
  </div>
</template>
