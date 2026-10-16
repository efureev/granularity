<script setup lang="ts">
import { GrButton } from '@feugene/granularity/components/GrButton'
import { GrDropdownMenu } from '@feugene/granularity/components/GrDropdownMenu'

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
