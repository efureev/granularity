<script setup lang="ts">
import { ref } from 'vue'

import { DsInputTag } from '@feugene/granularity'

const environments = ref(['production', 'staging'])
</script>

<template>
  <div class="grid gap-4">
    <DsInputTag
      v-model="environments"
      placeholder="Environment alias"
      tag-tone="warning"
      tag-dark
    >
      <template #tag="{ tag, index }">
        <span class="inline-flex items-center gap-2">
          <span class="inline-flex h-2 w-2 rounded-full bg-current opacity-70" />
          <span>{{ index + 1 }}. {{ tag }}</span>
        </span>
      </template>
    </DsInputTag>

    <div class="text-sm text-[var(--muted-fg)]">
      Custom tag slot lets host screens inject status markers, counters or semantic labels.
    </div>
  </div>
</template>