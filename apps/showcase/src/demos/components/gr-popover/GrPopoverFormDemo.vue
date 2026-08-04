<script setup lang="ts">
import { ref } from 'vue'

import { GrButton, GrFormField, GrInput, GrPopover } from '@feugene/granularity'

const open = ref(false)
const name = ref('Weekly digest')
const recipients = ref('team@acme.io')

function save(): void {
  open.value = false
}
</script>

<template>
  <GrPopover v-model:open="open" aria-label="Report settings" placement="bottom-start">
    <template #trigger="{ triggerProps }">
      <GrButton variant="outline" v-bind="triggerProps">
        Report settings
      </GrButton>
    </template>

    <template #content>
      <div class="grid w-64 gap-3">
        <GrFormField label="Name">
          <GrInput v-model="name" size="sm" />
        </GrFormField>

        <GrFormField label="Recipients">
          <GrInput v-model="recipients" size="sm" />
        </GrFormField>

        <div class="flex justify-end gap-2">
          <GrButton variant="ghost" size="sm" @click="open = false">
            Cancel
          </GrButton>
          <GrButton size="sm" @click="save">
            Save
          </GrButton>
        </div>
      </div>
    </template>
  </GrPopover>
</template>
