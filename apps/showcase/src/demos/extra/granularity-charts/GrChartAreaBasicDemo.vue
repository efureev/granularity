<script setup lang="ts">
import { computed, ref } from 'vue'

import { GR_TONES, GrButton, type GrTone } from '@feugene/granularity'

// `GrChartArea` подставляется авто-импортом (`unplugin-vue-components`).

/**
 * Площадь вместо линии берут тогда, когда важен не только уровень, но и объём:
 * «сколько всего набежало». Заливка гаснет к базовой линии — сплошная плашка
 * утяжелила бы низ графика, где смотреть не на что.
 */
const traffic = Array.from({ length: 14 }, (_, day) => ({
  x: new Date(2026, 6, day + 1),
  y: Math.round(1800 + Math.sin(day / 2.2) * 420 + day * 55),
}))

/**
 * Линия и заливка красятся **ролями темы**, а не готовыми цветами: при
 * переключении light/dark ничего не пересоздаётся — значение роли меняет себя
 * само. Отсюда `var(--gr-…)`, а не hex.
 */
const toneColor: Record<GrTone, string> = {
  primary: 'var(--gr-primary)',
  neutral: 'var(--gr-secondary)',
  success: 'var(--gr-success)',
  warning: 'var(--gr-warning)',
  danger: 'var(--gr-danger)',
  info: 'var(--gr-info)',
  slate: 'var(--gr-slate)',
  azure: 'var(--gr-azure)',
}

const lineTone = ref<GrTone>('primary')
const fillTone = ref<GrTone>('primary')

const series = computed(() => [{
  id: 'sessions',
  label: 'Сессии',
  data: traffic,
  color: toneColor[lineTone.value],
  // Заливка — своя роль: линия обязана читаться на фоне, а площадь под ней —
  // не спорить с сеткой. Совпадение цветов частый случай, но не закон.
  fillColor: toneColor[fillTone.value],
}])
</script>

<template>
  <div class="grid gap-3">
    <span class="text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
      Сессии, две недели
    </span>

    <GrChartArea
      :series="series"
      :height="220"
      curve="smooth"
      include-zero
      aria-label="Сессии за две недели"
    />

    <div class="flex flex-wrap items-center gap-2">
      <span class="w-16 shrink-0 text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Линия
      </span>
      <GrButton
        v-for="tone in GR_TONES"
        :key="tone"
        size="sm"
        :variant="lineTone === tone ? 'primary' : 'outline'"
        :tone="tone"
        @click="lineTone = tone"
      >
        {{ tone }}
      </GrButton>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <span class="w-16 shrink-0 text-[length:var(--gr-control-text-sm)] text-[var(--gr-muted-fg)]">
        Заливка
      </span>
      <GrButton
        v-for="tone in GR_TONES"
        :key="tone"
        size="sm"
        :variant="fillTone === tone ? 'primary' : 'outline'"
        :tone="tone"
        @click="fillTone = tone"
      >
        {{ tone }}
      </GrButton>
    </div>
  </div>
</template>
