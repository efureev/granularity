<script setup lang="ts">
import { computed, ref } from 'vue'

import { DsBadge, DsInputTag } from '@feugene/granularity'

const skills = ref(['vue', 'typescript'])
const remaining = computed(() => 4 - skills.value.length)
</script>

<template>
  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2">
      <DsBadge tone="neutral" radius="round">{{ skills.length }}/4 selected</DsBadge>
      <DsBadge tone="secondary" radius="round">{{ remaining }} slots left</DsBadge>
    </div>

    <DsInputTag
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