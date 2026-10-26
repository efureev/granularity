<script setup lang="ts">
defineProps<{
  /** Что показывает образец: имя компонента или вида. */
  title: string
  note?: string
  /** Образец во всю ширину сетки секции. */
  wide?: boolean
}>()
</script>

<template>
  <div class="flex min-w-0 flex-col gap-3" :class="wide ? 'lg:col-span-2' : ''">
    <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <h4 class="font-[var(--gr-font-mono)] text-[length:var(--gr-text-xs)] font-500 leading-[var(--gr-leading-xs)] text-[var(--gr-fg)]">
        {{ title }}
      </h4>
      <p v-if="note" class="text-[length:var(--gr-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)]">
        {{ note }}
      </p>
    </div>
    <div class="flex min-w-0 flex-col gap-3">
      <slot />
    </div>
  </div>
</template>
