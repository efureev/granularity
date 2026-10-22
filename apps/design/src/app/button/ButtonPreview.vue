<script setup lang="ts">
import IconEllipsis from '~icons/lucide/ellipsis'
</script>

<template>
  <GrButton size="sm">
    Сохранить
  </GrButton>
  <GrButton size="sm" variant="secondary" tone="neutral">
    Отмена
  </GrButton>
  <GrButton size="sm" variant="ghost" tone="neutral" square aria-label="Ещё">
    <GrIcon><IconEllipsis /></GrIcon>
  </GrButton>
</template>
