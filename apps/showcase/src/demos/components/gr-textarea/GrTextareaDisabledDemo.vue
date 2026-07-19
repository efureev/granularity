<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrSwitch, GrTextarea } from '@feugene/granularity'

const disabled = ref(false)
const summary = ref('Subscribers will receive a digest every Monday at 09:00.')
</script>

<template>
  <div class="grid gap-4">
    <div class="flex items-center gap-3">
      <GrSwitch v-model="disabled" size="sm">
        Disable textarea
      </GrSwitch>
    </div>

    <GrFormField label="Operational notes">
      <GrTextarea
        v-model="summary"
        :disabled="disabled"
        :rows="6"
        placeholder="Editable summary"
      />
    </GrFormField>
  </div>
</template>