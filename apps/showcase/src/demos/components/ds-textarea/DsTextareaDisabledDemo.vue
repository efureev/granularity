<script setup lang="ts">
import { ref } from 'vue'

import { DsFormField, DsSwitch, DsTextarea } from '@feugene/granularity'

const disabled = ref(false)
const summary = ref('Subscribers will receive a digest every Monday at 09:00.')
</script>

<template>
  <div class="grid gap-4">
    <div class="flex items-center gap-3">
      <DsSwitch v-model="disabled" size="sm">
        Disable textarea
      </DsSwitch>
    </div>

    <DsFormField label="Operational notes">
      <DsTextarea
        v-model="summary"
        :disabled="disabled"
        :rows="6"
        placeholder="Editable summary"
      />
    </DsFormField>
  </div>
</template>