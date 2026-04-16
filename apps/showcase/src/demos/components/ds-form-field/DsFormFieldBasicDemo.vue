<script setup lang="ts">
import { ref } from 'vue'

import { DsFormField, DsInput } from '@feugene/granularity'

const name = ref('Operations dashboard')
</script>

<template>
  <DsFormField label="Workspace name" for-id="workspace-name">
    <DsInput id="workspace-name" v-model="name" placeholder="Enter workspace name" />
  </DsFormField>
</template>