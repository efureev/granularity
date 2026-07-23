<script setup lang="ts">
/**
 * GrKbd — GR-примитив для отображения клавиш/сочетаний (`<kbd>`).
 *
 * Пример: `<GrKbd>⌘</GrKbd> <GrKbd>K</GrKbd>`.
 */
export type GrKbdSize = 'sm' | 'md'

withDefaults(defineProps<{ size?: GrKbdSize }>(), {
  size: 'md',
})
</script>

<template>
  <kbd
    data-gr-kbd
    class="inline-flex items-center justify-center rounded-md border border-[var(--gr-brd)] bg-[var(--gr-muted)] font-medium leading-none text-[var(--gr-muted-fg)] shadow-[var(--gr-shadow-1)] tabular-nums"
    :class="size === 'sm'
      ? 'min-w-[1.25rem] h-5 px-1 text-[11px]'
      : 'min-w-[1.5rem] h-6 px-1.5 text-xs'"
  ><slot /></kbd>
</template>
