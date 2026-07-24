<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrFormSection, GrInput, GrTextarea } from '@feugene/granularity'

const projectName = ref('Granularity')
const apiToken = ref('')
const notes = ref('Rotate the token every 90 days.')
</script>

<template>
  <div class="grid gap-6">
    <!-- Прямоугольная рамка: класс проходит на корневой <section> секции. -->
    <GrFormSection
      title="Bordered section"
      description="Border via utility classes — GrFormSection forwards `class` to its root <section>."
      class="border border-[var(--gr-brd)] p-5"
    >
      <GrFormField label="Project name" for-id="bordered-project">
        <GrInput id="bordered-project" v-model="projectName" placeholder="Acme" />
      </GrFormField>
    </GrFormSection>

    <!-- Скруглённая рамка: те же классы + rounded-2xl и мягкая подложка. -->
    <GrFormSection
      title="Rounded-border section"
      description="Same wrapper with rounded corners and a card surface."
      class="rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-5"
    >
      <div class="grid gap-4">
        <GrFormField label="API token" for-id="rounded-token">
          <GrInput id="rounded-token" v-model="apiToken" placeholder="sk_live_…" />
        </GrFormField>

        <GrFormField label="Notes" for-id="rounded-notes">
          <GrTextarea id="rounded-notes" v-model="notes" :rows="3" />
        </GrFormField>
      </div>
    </GrFormSection>
  </div>
</template>
