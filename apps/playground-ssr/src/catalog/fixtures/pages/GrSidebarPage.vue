<script setup lang="ts">
import { GrSidebar, GrSidebarGroup, GrSidebarItem } from '@feugene/granularity'
</script>

<template>
  <GrSidebar title="Рабочая область" aria-label="Разделы">
    <GrSidebarGroup label="Основное">
      <GrSidebarItem label="Обзор" active />
      <GrSidebarItem label="Отчёты" />
    </GrSidebarGroup>
  </GrSidebar>
</template>
