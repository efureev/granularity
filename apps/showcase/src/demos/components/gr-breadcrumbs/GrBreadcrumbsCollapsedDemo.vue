<script setup lang="ts">
import { GrBreadcrumbs, type GrBreadcrumbItem } from '@feugene/granularity'

// Длинный путь из файлового менеджера: середина сворачивается, начало и конец
// остаются на виду.
const path: GrBreadcrumbItem[] = [
  { label: 'Storage', href: '#/storage' },
  { label: 'Workspaces', href: '#/storage/workspaces' },
  { label: 'Design system', href: '#/storage/workspaces/design-system' },
  { label: 'Releases', href: '#/storage/workspaces/design-system/releases' },
  { label: '0.15.0', href: '#/storage/workspaces/design-system/releases/0-15-0' },
  { label: 'CHANGELOG.md' },
]
</script>

<template>
  <GrBreadcrumbs
    :items="path"
    :max-items="4"
    :items-before-collapse="1"
    :items-after-collapse="2"
  />
</template>
