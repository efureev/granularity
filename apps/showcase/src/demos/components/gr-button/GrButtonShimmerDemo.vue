<script setup lang="ts">
import { ref } from 'vue'

const saving = ref(false)

function save(): void {
  saving.value = true
  setTimeout(() => {
    saving.value = false
  }, 2400)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <GrButton tone="neutral" loading-indicator="shimmer" :loading="saving" @click="save">
      Save draft
    </GrButton>
    <GrButton variant="outline" tone="neutral" loading-indicator="shimmer" loading>
      Publishing
    </GrButton>
    <GrButton variant="outline" tone="neutral" loading>
      Spinner
    </GrButton>
  </div>
</template>
