<script setup lang="ts">
import { GrBreadcrumbs, type GrBreadcrumbItem } from '@feugene/granularity'

const path: GrBreadcrumbItem[] = [
  { label: 'Home', href: '#/', icon: 'i-lucide-house' },
  { label: 'Team', href: '#/team', icon: 'i-lucide-users' },
  { label: 'Ada Lovelace', icon: 'i-lucide-user' },
]
</script>

<template>
  <GrBreadcrumbs :items="path" separator="›" size="lg" />
</template>
