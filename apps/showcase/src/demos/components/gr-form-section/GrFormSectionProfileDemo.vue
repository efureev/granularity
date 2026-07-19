<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrFormSection, GrInput, GrTextarea } from '@feugene/granularity'

const teamName = ref('Platform operations')
const summary = ref('Coordinates deployments, release notes and service health updates.')
</script>

<template>
  <GrFormSection
    title="Team profile"
    description="Use `GrFormSection` when a group of fields needs shared title and supporting copy."
  >
    <div class="grid gap-4 md:grid-cols-2">
      <GrFormField label="Team name" for-id="team-name">
        <GrInput id="team-name" v-model="teamName" placeholder="Operations" />
      </GrFormField>

      <GrFormField label="Summary" for-id="team-summary" class="md:col-span-2">
        <GrTextarea id="team-summary" v-model="summary" :rows="4" />
      </GrFormField>
    </div>
  </GrFormSection>
</template>