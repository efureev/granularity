<script setup lang="ts">
import { useGrComponentSize } from '../GrConfigProvider/context'
import type { GrComponentSize } from '../shared/sizes'
/**
 * GrKbd — GR-примитив для отображения клавиш/сочетаний (`<kbd>`).
 *
 * Пример: `<GrKbd>⌘</GrKbd> <GrKbd>K</GrKbd>`.
 */
export type GrKbdSize = GrComponentSize

const props = withDefaults(defineProps<{ size?: GrKbdSize }>(), {
  size: undefined,
})

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrKbd' })
</script>

<template>
  <kbd
    data-gr-kbd
    class="inline-flex items-center justify-center rounded-md border border-[var(--gr-brd)] bg-[var(--gr-muted)] font-medium leading-none text-[var(--gr-muted-fg)] shadow-[var(--gr-shadow-1)] tabular-nums"
    :class="resolvedSize === 'sm'
      ? 'min-w-[1.5rem] h-6 px-1.5 text-xs'
      : 'min-w-[1.75rem] h-7 px-2 text-sm'"
  ><slot /></kbd>
</template>
