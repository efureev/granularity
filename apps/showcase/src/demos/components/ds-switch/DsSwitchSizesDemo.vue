<script setup lang="ts">
import { ref } from 'vue'

import { DsSwitch } from '@feugene/granularity'

const smValue = ref(false)
const mdValue = ref(true)
const lgValue = ref(true)
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <DsSwitch v-model="smValue" size="sm">Small</DsSwitch>
    <DsSwitch v-model="mdValue" size="md">Medium</DsSwitch>
    <DsSwitch v-model="lgValue" size="lg">Large</DsSwitch>
  </div>
</template>