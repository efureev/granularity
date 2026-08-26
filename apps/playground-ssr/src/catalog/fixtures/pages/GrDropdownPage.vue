<script setup lang="ts">
import { GrButton, GrDropdown } from '@feugene/granularity'

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
