<script setup lang="ts">
import { ref } from 'vue'

import { GrSwitch } from '@feugene/granularity'

const smValue = ref(false)
const mdValue = ref(true)
const lgValue = ref(true)
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <GrSwitch v-model="smValue" size="sm">Small</GrSwitch>
    <GrSwitch v-model="mdValue" size="md">Medium</GrSwitch>
    <GrSwitch v-model="lgValue" size="lg">Large</GrSwitch>
  </div>
</template>