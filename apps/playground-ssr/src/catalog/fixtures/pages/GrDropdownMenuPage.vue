<script setup lang="ts">
import { GrButton, GrDropdownMenu } from '@feugene/granularity'

import type { GrDropdownMenuEntry } from '@feugene/granularity'

const items: GrDropdownMenuEntry[] = [
  { key: 'rename', label: 'Переименовать' },
  { key: 'remove', label: 'Удалить', variant: 'danger' },
]
</script>

<template>
  <GrDropdownMenu :items="items">
    <template #trigger="{ triggerProps }">
      <GrButton v-bind="triggerProps" variant="outline">
        Действия
      </GrButton>
    </template>
  </GrDropdownMenu>
</template>
