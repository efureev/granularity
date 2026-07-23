<script setup lang="ts">
import { ref } from 'vue'

import { GrInputTag } from '@feugene/granularity'

const tags = ref(['critical', 'backend'])
</script>

<template>
  <div class="grid gap-4">
    <GrInputTag
      v-model="tags"
      placeholder="Type a tag and press Enter"
      add-on-blur
      :separators="[',', ';']"
    />

    <div class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-muted-fg)]">
      Current tags: <span class="font-semibold text-[var(--gr-fg)]">{{ tags.join(', ') || 'none' }}</span>
    </div>
  </div>
</template>