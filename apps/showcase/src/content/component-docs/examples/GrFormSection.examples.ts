import type { ShowcaseComponentExampleDoc } from '../types'

export const grFormSectionExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'form-section-profile-layout',
    title: 'Section heading with profile fields',
    description: 'Показываем базовую роль `GrFormSection`: лёгкий heading-wrapper для связанных полей и описания секции.',
    status: 'ready',
    previewKey: 'ds-form-section-profile-layout',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrFormField, GrFormSection, GrInput, GrTextarea } from '@feugene/granularity'

const teamName = ref('Platform operations')
const summary = ref('Coordinates deployments, release notes and service health updates.')
</script>

<template>
  <GrFormSection
    title="Team profile"
    description="Use \`GrFormSection\` when a group of fields needs shared title and supporting copy."
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
</template>`,
  },
  {
    id: 'form-section-nested-groups',
    title: 'Grouped controls inside one section',
    description: 'Отдельный пример фиксирует composition-паттерн, где `GrFormSection` оборачивает и form fields, и более свободные control groups.',
    status: 'ready',
    previewKey: 'ds-form-section-nested-groups',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrCheckbox, GrFormField, GrFormSection, GrInput } from '@feugene/granularity'

const channel = ref('release-updates')
const includeStakeholders = ref(true)
const requireApproval = ref(false)
</script>

<template>
  <GrFormSection
    title="Notification routing"
    description="Section wrappers keep longer forms readable when fields are grouped by intent."
  >
    <div class="grid gap-4">
      <GrFormField label="Slack channel" for-id="notify-channel">
        <GrInput id="notify-channel" v-model="channel" placeholder="release-updates" />
      </GrFormField>

      <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
        <GrCheckbox v-model="includeStakeholders">
          Include business stakeholders in the launch message
        </GrCheckbox>
        <GrCheckbox v-model="requireApproval">
          Require manual approval before notifications are sent
        </GrCheckbox>
      </div>
    </div>
  </GrFormSection>
</template>`,
  },
  {
    id: 'form-section-stacked-flow',
    title: 'Stacked multi-section flow',
    description: 'Такой сценарий показывает, что несколько `GrFormSection` подряд могут собирать skeleton полноценной settings-страницы без тяжёлой layout-обвязки.',
    status: 'ready',
    previewKey: 'ds-form-section-stacked-flow',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { GrBadge, GrFormField, GrFormSection, GrInput } from '@feugene/granularity'

const owner = ref('release-manager@company.dev')
const runbook = ref('docs/runbooks/incident-handoff')
</script>

<template>
  <div class="grid gap-6">
    <GrFormSection title="Ownership">
      <GrFormField label="Primary owner" for-id="incident-owner">
        <GrInput id="incident-owner" v-model="owner" placeholder="name@company.dev" />
      </GrFormField>
    </GrFormSection>

    <GrFormSection title="Operational assets" description="Multiple sections can be stacked to create a light-weight form page skeleton.">
      <div class="grid gap-4">
        <GrFormField label="Runbook path" for-id="runbook-path">
          <GrInput id="runbook-path" v-model="runbook" placeholder="docs/runbooks/..." />
        </GrFormField>

        <div class="flex flex-wrap gap-2">
          <GrBadge tone="success" radius="round">Owner assigned</GrBadge>
          <GrBadge tone="info" radius="round">Runbook linked</GrBadge>
        </div>
      </div>
    </GrFormSection>
  </div>
</template>`,
  },
]
