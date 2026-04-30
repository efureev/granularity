<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrCheckbox } from '@feugene/granularity'

const marketing = ref(true)
const productUpdates = ref(false)
const submission = ref('Submit the form to inspect native checkbox values.')

function onSubmit(event: SubmitEvent): void {
  event.preventDefault()

  const formData = new FormData(event.currentTarget as HTMLFormElement)

  submission.value = JSON.stringify(Object.fromEntries(formData.entries()), null, 2)
}
</script>

<template>
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
    <form class="grid gap-3" @submit="onSubmit">
      <GrCheckbox v-model="marketing" name="marketing" value="enabled">
        Marketing updates
      </GrCheckbox>
      <GrCheckbox v-model="productUpdates" name="productUpdates" value="beta">
        Beta feature updates
      </GrCheckbox>

      <div class="flex items-center gap-3 pt-2">
        <GrButton type="submit" size="sm">Read form data</GrButton>
      </div>
    </form>

    <pre class="overflow-x-auto rounded-2xl border border-[var(--brd)] bg-[var(--fg)] p-4 text-xs text-[var(--bg)]">{{ submission }}</pre>
  </div>
</template>