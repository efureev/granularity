<script setup lang="ts">
import { computed, useSlots } from 'vue'

/**
 * GrDivider — разделитель контента.
 *
 * - `orientation="horizontal"` (по умолчанию) — линия на всю ширину; с `label`
 *   или default-слотом рисует текст по центру/краю между отрезками линии.
 * - `orientation="vertical"` — тонкая вертикальная линия (для inline-разделения,
 *   например в тулбарах).
 */
export type GrDividerOrientation = 'horizontal' | 'vertical'
export type GrDividerAlign = 'start' | 'center' | 'end'

const props = withDefaults(
  defineProps<{
    orientation?: GrDividerOrientation
    label?: string
    align?: GrDividerAlign
  }>(),
  {
    orientation: 'horizontal',
    label: undefined,
    align: 'center',
  },
)

const slots = useSlots()
const hasLabel = computed(() =>
  props.orientation === 'horizontal' && (Boolean(props.label) || Boolean(slots.default)),
)
</script>

<template>
  <div
    v-if="orientation === 'vertical'"
    data-gr-divider
    role="separator"
    aria-orientation="vertical"
    class="inline-block w-px self-stretch bg-[var(--brd)]"
  />

  <div
    v-else-if="hasLabel"
    data-gr-divider
    role="separator"
    aria-orientation="horizontal"
    class="flex w-full items-center gap-3 text-xs text-[var(--muted-fg)]"
  >
    <span v-if="align !== 'start'" class="h-px flex-1 bg-[var(--brd)]" />
    <span class="shrink-0"><slot>{{ label }}</slot></span>
    <span v-if="align !== 'end'" class="h-px flex-1 bg-[var(--brd)]" />
  </div>

  <hr
    v-else
    data-gr-divider
    class="h-px w-full border-0 bg-[var(--brd)]"
  >
</template>
