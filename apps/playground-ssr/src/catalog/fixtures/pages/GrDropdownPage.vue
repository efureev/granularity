<script setup lang="ts">
import { GrButton } from '@feugene/granularity/components/GrButton'
import { GrDropdown } from '@feugene/granularity/components/GrDropdown'

/** `triggerProps` обязаны попасть на сам интерактивный элемент — иначе `aria-expanded` читается не с того узла. */
</script>

<template>
  <GrDropdown>
    <template #trigger="{ triggerProps }">
      <GrButton v-bind="triggerProps">
        Меню
      </GrButton>
    </template>
    <template #content>
      <p>Содержимое панели</p>
    </template>
  </GrDropdown>
</template>
