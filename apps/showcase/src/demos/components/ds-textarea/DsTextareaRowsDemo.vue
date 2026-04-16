<script setup lang="ts">
import { ref } from 'vue'

import { DsFormField, DsTextarea } from '@feugene/granularity'

const shortNote = ref('Release notes highlight the latest API additions.')
const longNote = ref('This textarea starts taller and fits editorial copy, migration notes or incident postmortems.')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <DsFormField label="Default rows">
      <DsTextarea v-model="shortNote" placeholder="Write a short note" />
    </DsFormField>

    <DsFormField label="Expanded rows">
      <DsTextarea v-model="longNote" :rows="8" placeholder="Long-form content" />
    </DsFormField>
  </div>
</template>