<script setup lang="ts">
/**
 * DsSkeleton — заглушка-плейсхолдер для загружающегося контента.
 *
 * Помечен `aria-hidden="true"`, чтобы скринридер не озвучивал «пустой» узел;
 * внешний контейнер обычно имеет `aria-busy="true"` + `aria-live`.
 */
export interface DsSkeletonProps {
  height?: string
  width?: string
  rounded?: string
}

withDefaults(defineProps<DsSkeletonProps>(), {
  height: '12px',
  width: '100%',
  rounded: '9999px',
})
</script>

<template>
  <div
    data-ds-skeleton
    aria-hidden="true"
    class="animate-pulse bg-[var(--muted)] border border-[var(--brd)]"
    :style="{ height, width, borderRadius: rounded }"
  />
</template>
