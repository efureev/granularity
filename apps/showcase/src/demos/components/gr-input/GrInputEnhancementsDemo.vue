<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrInput } from '@feugene/granularity'

const search = ref('Granularity')
const bio = ref('Design-system engineer')
const password = ref('s3cr3t-pass')
const token = ref('sk-live-4f2a90e2f')
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-2">
    <GrFormField label="Clearable">
      <GrInput v-model="search" clearable placeholder="Type to search" />
    </GrFormField>

    <GrFormField label="Password with visibility toggle">
      <GrInput v-model="password" type="password" password-toggle />
    </GrFormField>

    <GrFormField label="Character counter (maxlength)">
      <GrInput v-model="bio" :maxlength="60" show-count clearable />
    </GrFormField>

    <GrFormField label="Read-only">
      <GrInput v-model="token" readonly />
    </GrFormField>
  </div>
</template>
