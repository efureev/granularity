<script setup lang="ts">
import { ref } from 'vue'

import { GrFormFile, GrSwitch } from '@feugene/granularity'

const gallery = ref<File[]>([])
const locked = ref(false)
</script>

<template>
  <div class="grid gap-4">
    <GrSwitch v-model="locked">
      Read-only
    </GrSwitch>

    <GrFormFile
      v-model="gallery"
      multiple
      preview
      :readonly="locked"
      accept="image/*,application/pdf"
      placeholder="Pick images to see thumbnails"
      upload-text="Add files"
      change-text="Add more"
      clear-all-text="Clear all"
    />

    <div class="rounded-2xl border border-dashed border-[var(--gr-brd)] bg-[var(--gr-card)] p-4 text-sm text-[var(--gr-muted-fg)]">
      Thumbnails appear for images only — a PDF stays a plain row. Switch the field to read-only and the set stays
      visible while every way to change it goes away: no remove buttons, and dropping a file does nothing.
    </div>
  </div>
</template>
