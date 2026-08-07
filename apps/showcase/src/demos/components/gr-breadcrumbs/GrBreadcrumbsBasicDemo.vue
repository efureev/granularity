<script setup lang="ts">
import { GrBreadcrumbs, type GrBreadcrumbItem } from '@feugene/granularity'

const path: GrBreadcrumbItem[] = [
  { label: 'Dashboard', href: '#/dashboard' },
  { label: 'Projects', href: '#/projects' },
  { label: 'Granularity', href: '#/projects/granularity' },
  { label: 'Settings' },
]
</script>

<template>
  <GrBreadcrumbs :items="path" />
</template>
