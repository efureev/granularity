<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrSegmented, GrToaster, useToast, type GrToasterPlacement } from '@feugene/granularity'

import { useShowcaseToasterHost } from './showcaseToasterHost'

const { push } = useToast()
const { isActiveHost, activateHost } = useShowcaseToasterHost('swipe')

const placement = ref<GrToasterPlacement>('bottom-right')
const swipeDismiss = ref(true)

const placements = [
  { value: 'bottom-right', label: 'Справа' },
  { value: 'bottom-left', label: 'Слева' },
]

function notify() {
  activateHost()

  push({
    title: 'Черновик сохранён',
    message: swipeDismiss.value
      ? 'Смахните уведомление к своему краю экрана — или нажмите Delete, доведя до него фокус клавишей F6.'
      : 'Жест выключен: закрыть можно кнопкой или клавишей Delete.',
    tone: 'success',
    timeoutMs: 0,
  })
}
</script>

<template>
  <div class="grid gap-3">
    <div class="flex flex-wrap items-center gap-3">
      <GrButton size="sm" @click="notify">
        Показать уведомление
      </GrButton>

      <GrSegmented v-model="placement" size="sm" :options="placements" aria-label="Край экрана" />

      <label class="flex items-center gap-2 text-xs">
        <input v-model="swipeDismiss" type="checkbox">
        Смахивание включено
      </label>
    </div>

    <p class="text-xs text-[var(--gr-muted-fg)]">
      Сторона смахивания идёт за стеком: у правого края тост уходит вправо, у левого — влево.
      Отпустите раньше порога — вернётся на место; оборвите жест — тоже вернётся.
    </p>

    <GrToaster
      v-if="isActiveHost"
      :placement="placement"
      :swipe-dismiss="swipeDismiss"
      :width="420"
    />
  </div>
</template>
