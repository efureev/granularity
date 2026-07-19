<script setup lang="ts">
/**
 * GrSkeleton — заглушка-плейсхолдер для загружающегося контента.
 *
 * Помечен `aria-hidden="true"`, чтобы скринридер не озвучивал «пустой» узел;
 * внешний контейнер обычно имеет `aria-busy="true"` + `aria-live`.
 */
export interface GrSkeletonProps {
  height?: string
  width?: string
  rounded?: string
}

withDefaults(defineProps<GrSkeletonProps>(), {
  height: '12px',
  width: '100%',
  rounded: '9999px',
})
</script>

<template>
  <div
      data-gr-skeleton
      aria-hidden="true"
      class="bg-[var(--muted)] border border-[var(--brd)]"
      :style="{ height, width, borderRadius: rounded }"
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
