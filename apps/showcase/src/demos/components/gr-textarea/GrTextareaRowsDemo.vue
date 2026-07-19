<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrTextarea } from '@feugene/granularity'

const shortNote = ref('Release notes highlight the latest API additions.')
const longNote = ref('This textarea starts taller and fits editorial copy, migration notes or incident postmortems.')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrFormField label="Default rows">
      <GrTextarea v-model="shortNote" placeholder="Write a short note" />
    </GrFormField>

    <GrFormField label="Expanded rows">
      <GrTextarea v-model="longNote" :rows="8" placeholder="Long-form content" />
    </GrFormField>
  </div>
</template>