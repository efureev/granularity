<script setup lang="ts">
import { computed } from 'vue'

import { skeletonRoundedByVariant, type GrSkeletonVariant } from './grSkeletonStyles'

export type { GrSkeletonVariant } from './grSkeletonStyles'

/**
 * GrSkeleton — заглушка-плейсхолдер для загружающегося контента.
 *
 * Помечен `aria-hidden="true"`, чтобы скринридер не озвучивал «пустой» узел;
 * внешний контейнер обычно имеет `aria-busy="true"` + `aria-live`.
 */
export interface GrSkeletonProps {
  /**
   * Форма, а не размеры: `width`/`height` остаются на потребителе, потому что
   * высота заглушки диктуется соседним контентом, а не шкалой компонента.
   */
  variant?: GrSkeletonVariant
  height?: string
  width?: string
  /** Радиус точечно. Не задан — берётся из `variant`. */
  rounded?: string
  /** Сколько заглушек подряд. Больше одной — они уезжают в общую обёртку. */
  count?: number
}

const props = withDefaults(defineProps<GrSkeletonProps>(), {
  variant: 'text',
  // Дефолты живут в резолверах ниже: иначе форма не смогла бы задать свои.
  height: undefined,
  width: undefined,
  rounded: undefined,
  count: 1,
})

/** Круг — единственная форма, у которой размер и пропорция связаны. */
const DEFAULT_CIRCLE_SIZE = '2.5rem'

const resolvedWidth = computed(() => props.width ?? (props.variant === 'circle' ? DEFAULT_CIRCLE_SIZE : '100%'))

// У круга высота повторяет ширину, пока её не задали явно: иначе одна заданная
// сторона превращала бы его в овал.
const resolvedHeight = computed(() => {
  if (props.height !== undefined)
    return props.height
  return props.variant === 'circle' ? resolvedWidth.value : '12px'
})

const resolvedRounded = computed(() => props.rounded ?? skeletonRoundedByVariant[props.variant])

const items = computed(() => Math.max(Math.floor(props.count) || 1, 1))

/**
 * Последняя строка текста короче — так блок читается как абзац, а не как
 * список одинаковых полос. У прямоугольников и кругов «недописанной строки» не
 * бывает, поэтому правило только для `text`.
 */
const LAST_LINE_WIDTH = '60%'

function widthOf(index: number): string {
  const isLast = index === items.value - 1
  return isLast && items.value > 1 && props.variant === 'text' && props.width === undefined
    ? LAST_LINE_WIDTH
    : resolvedWidth.value
}

function styleOf(index: number): Record<string, string> {
  return { height: resolvedHeight.value, width: widthOf(index), borderRadius: resolvedRounded.value }
}
</script>

<template>
  <div
    v-if="items > 1"
    data-gr-skeleton-group
    class="grid gap-2"
    aria-hidden="true"
  >
    <div
      v-for="(_, index) in items"
      :key="index"
      data-gr-skeleton
      class="bg-[var(--gr-muted)] border border-[var(--gr-brd)]"
      :style="styleOf(index)"
    />
  </div>

  <div
    v-else
    data-gr-skeleton
    aria-hidden="true"
    class="bg-[var(--gr-muted)] border border-[var(--gr-brd)]"
    :style="styleOf(0)"
  />
</template>

<style>
@keyframes gr-skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

[data-gr-skeleton] {
  animation: gr-skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@media (prefers-reduced-motion: reduce) {
  [data-gr-skeleton] {
    animation: none;
  }
}
</style>
