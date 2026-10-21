<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import DocSection from '../parts/DocSection.vue'
import { foundationSection } from '../tokens'
import { useViewedTheme } from '../viewedTheme'

const theme = useViewedTheme()
const motion = computed(() => foundationSection(theme.value, 'Motion'))
const durations = computed(() => motion.value.filter(token => token.name.startsWith('--gr-duration-')))
const easings = computed(() => motion.value.filter(token => token.name.startsWith('--gr-ease-')))

const durationUse: Record<string, string> = {
  '--gr-duration-fast': 'наведение, цвет, нажатие',
  '--gr-duration-base': 'модальные окна, шторки, раскрытие секций, тосты',
  '--gr-duration-slow': 'перенос элементов между списками',
}

const easingUse: Record<string, string> = {
  '--gr-ease-out': 'появление: быстро стартует, мягко садится',
  '--gr-ease-in': 'уход: разгоняется к концу',
}

/** Точки кривой для SVG 100×100: ось Y перевёрнута. */
function curvePath(value: string): string {
  const numbers = value.match(/-?\d*\.?\d+/g)?.map(Number) ?? [0, 0, 1, 1]
  const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = numbers
  return `M0 100 C${x1 * 100} ${100 - y1 * 100} ${x2 * 100} ${100 - y2 * 100} 100 0`
}

const played = ref(false)

const reducedMotion = ref(false)
let query: MediaQueryList | undefined

function syncReduced(): void {
  reducedMotion.value = query?.matches ?? false
}

onMounted(() => {
  query = matchMedia('(prefers-reduced-motion: reduce)')
  syncReduced()
  query.addEventListener('change', syncReduced)
})

onBeforeUnmount(() => query?.removeEventListener('change', syncReduced))
</script>

<template>
  <div class="flex flex-col gap-14">
    <DocSection title="Длительности" lead="Три ступени. Чем крупнее то, что движется, и чем дальше оно едет, тем дольше переход.">
      <div class="flex flex-col gap-4 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5">
        <GrButton class="self-start" variant="secondary" tone="neutral" size="sm" @click="played = !played">
          {{ played ? 'Вернуть' : 'Проиграть' }}
        </GrButton>
        <ul class="flex flex-col gap-3">
          <li v-for="token in durations" :key="token.name" class="grid grid-cols-[minmax(0,240px)_minmax(0,1fr)] items-center gap-4">
            <span class="flex flex-col">
              <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">{{ token.name }} · {{ token.value }}</code>
              <span class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">{{ durationUse[token.name] }}</span>
            </span>
            <span class="relative h-8 rounded-[var(--gr-radius-control)] bg-[var(--gr-muted)]">
              <span
                class="motion-dot"
                :class="{ 'is-played': played }"
                :style="{ transitionDuration: `var(${token.name})` }"
              />
            </span>
          </li>
        </ul>
      </div>
    </DocSection>

    <DocSection title="Кривые" lead="Две: появление и уход. Линейной кривой у перемещений нет — она читается механической.">
      <ul class="grid gap-4 md:grid-cols-2">
        <li
          v-for="token in easings"
          :key="token.name"
          class="flex items-center gap-5 rounded-[var(--gr-radius-lg)] border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5"
        >
          <svg viewBox="-4 -4 108 108" class="h-24 w-24 shrink-0 overflow-visible" aria-hidden="true">
            <path d="M0 100 L100 0" class="stroke-[var(--gr-brd)]" stroke-dasharray="3 3" fill="none" />
            <path :d="curvePath(token.value)" class="stroke-[var(--gr-primary)]" stroke-width="3" fill="none" stroke-linecap="round" />
          </svg>
          <span class="flex min-w-0 flex-col gap-1">
            <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)]">{{ token.name }}</code>
            <code class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-2xs)] leading-[var(--gr-leading-2xs)] text-[var(--gr-muted-fg)]">{{ token.value }}</code>
            <span class="text-[length:var(--gr-text-sm)] leading-[var(--gr-leading-sm)]">{{ easingUse[token.name] }}</span>
          </span>
        </li>
      </ul>
    </DocSection>

    <DocSection
      title="«Уменьшить движение»"
      lead="С системной настройкой пропадают сдвиги и масштаб, а смена цвета остаётся: состояние по-прежнему видно, просто ничего не едет. Индикаторы загрузки не выключаются, а замедляются — другого сигнала у них нет."
    >
      <GrAlert :tone="reducedMotion ? 'warning' : 'info'">
        {{ reducedMotion
          ? 'У вас включено «уменьшить движение»: точки выше переедут сразу, без перехода.'
          : 'Движение в системе не ограничено. Включите «уменьшить движение» в настройках системы, чтобы увидеть разницу на примере выше.' }}
      </GrAlert>
    </DocSection>
  </div>
</template>

<style scoped>
.motion-dot {
  position: absolute;
  inset-block: 4px;
  inset-inline-start: 4px;
  width: 24px;
  border-radius: var(--gr-radius-sm);
  background: var(--gr-primary);
  transition-property: inset-inline-start;
  transition-timing-function: var(--gr-ease-out);
}

.motion-dot.is-played {
  inset-inline-start: calc(100% - 28px);
}

@media (prefers-reduced-motion: reduce) {
  .motion-dot {
    transition-duration: 0ms !important;
  }
}
</style>
