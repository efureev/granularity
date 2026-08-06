<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrButton, GrToaster, useToast } from '@feugene/granularity'

import { useShowcaseToasterHost } from './showcaseToasterHost'

const { push, clear } = useToast()
const { isActiveHost, activateHost } = useShowcaseToasterHost('focus-hotkey')

const lastAction = ref('—')

function notify() {
  activateHost()
  clear()
  lastAction.value = '—'

  push({
    title: 'Отчёт удалён',
    message: 'Нажмите F6 — фокус уедет на уведомление, дальше Tab до кнопки.',
    tone: 'warning',
    timeoutMs: 0,
    action: {
      label: 'Вернуть',
      size: 'sm',
      onClick: () => {
        lastAction.value = 'Отчёт восстановлен с клавиатуры'
      },
    },
  })
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-2">
      <GrButton size="sm" @click="notify">
        Показать уведомление
      </GrButton>
      <span class="text-xs text-[var(--gr-muted-fg)]">
        Тосты живут в конце body — без хоткея кнопка «Вернуть» была бы за
        десятками нажатий Tab.
      </span>
    </div>

    <GrBadge :tone="lastAction === '—' ? 'neutral' : 'success'">
      {{ lastAction }}
    </GrBadge>

    <GrToaster v-if="isActiveHost" placement="bottom-right" :width="420" />
  </div>
</template>
