<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrFormField, GrInput } from '@feugene/granularity'

const slug = ref('')

const error = computed(() => {
  if (!slug.value)
    return 'Slug is required for deploy previews.'

  return /^[a-z0-9-]+$/.test(slug.value)
    ? undefined
    : 'Use lowercase latin letters, numbers and dashes only.'
})
</script>

<template>
  <GrFormField label="Preview slug" for-id="preview-slug" :error="error">
    <GrInput id="preview-slug" v-model="slug" :invalid="Boolean(error)" placeholder="team-dashboard" />
  </GrFormField>
</template>