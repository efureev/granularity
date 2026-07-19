<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrInput } from '@feugene/granularity'

const name = ref('Operations dashboard')
</script>

<template>
  <GrFormField label="Workspace name" for-id="workspace-name">
    <GrInput id="workspace-name" v-model="name" placeholder="Enter workspace name" />
  </GrFormField>
</template>