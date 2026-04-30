<script setup lang="ts">
import { computed, ref } from 'vue'

import { GrBadge, GrInputTag } from '@feugene/granularity'

const skills = ref(['vue', 'typescript'])
const remaining = computed(() => 4 - skills.value.length)
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2">
      <GrBadge tone="neutral" radius="round">{{ skills.length }}/4 selected</GrBadge>
      <GrBadge tone="neutral" radius="round">{{ remaining }} slots left</GrBadge>
    </div>

    <GrInputTag
      v-model="skills"
      :max="4"
      state="success"
      placeholder="Add skill tags"
      tag-tone="primary"
      tag-radius="round"
    />

    <div class="text-sm text-[var(--muted-fg)]">
      Use `max` to keep curated lists compact in profile or filter forms.
    </div>
  </div>
</template>