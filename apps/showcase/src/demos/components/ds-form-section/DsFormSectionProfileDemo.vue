<script setup lang="ts">
import { ref } from 'vue'

import { DsFormField, DsFormSection, DsInput, DsTextarea } from '@feugene/granularity'

const teamName = ref('Platform operations')
const summary = ref('Coordinates deployments, release notes and service health updates.')
</script>

<template>
  <DsFormSection
    title="Team profile"
    description="Use `DsFormSection` when a group of fields needs shared title and supporting copy."
  >
    <div class="grid gap-4 md:grid-cols-2">
      <DsFormField label="Team name" for-id="team-name">
        <DsInput id="team-name" v-model="teamName" placeholder="Operations" />
      </DsFormField>

      <DsFormField label="Summary" for-id="team-summary" class="md:col-span-2">
        <DsTextarea id="team-summary" v-model="summary" :rows="4" />
      </DsFormField>
    </div>
  </DsFormSection>
</template>