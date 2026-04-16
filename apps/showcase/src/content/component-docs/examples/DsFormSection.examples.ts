import type { ShowcaseComponentExampleDoc } from '../types'

export const dsFormSectionExamples: ShowcaseComponentExampleDoc[] = [
  {
    id: 'form-section-profile-layout',
    title: 'Section heading with profile fields',
    description: 'Показываем базовую роль `DsFormSection`: лёгкий heading-wrapper для связанных полей и описания секции.',
    status: 'ready',
    previewKey: 'ds-form-section-profile-layout',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsFormField, DsFormSection, DsInput, DsTextarea } from '@feugene/granularity'

const teamName = ref('Platform operations')
const summary = ref('Coordinates deployments, release notes and service health updates.')
</script>

<template>
  <DsFormSection
    title="Team profile"
    description="Use \`DsFormSection\` when a group of fields needs shared title and supporting copy."
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
</template>`,
  },
  {
    id: 'form-section-nested-groups',
    title: 'Grouped controls inside one section',
    description: 'Отдельный пример фиксирует composition-паттерн, где `DsFormSection` оборачивает и form fields, и более свободные control groups.',
    status: 'ready',
    previewKey: 'ds-form-section-nested-groups',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsCheckbox, DsFormField, DsFormSection, DsInput } from '@feugene/granularity'

const channel = ref('release-updates')
const includeStakeholders = ref(true)
const requireApproval = ref(false)
</script>

<template>
  <DsFormSection
    title="Notification routing"
    description="Section wrappers keep longer forms readable when fields are grouped by intent."
  >
    <div class="grid gap-4">
      <DsFormField label="Slack channel" for-id="notify-channel">
        <DsInput id="notify-channel" v-model="channel" placeholder="release-updates" />
      </DsFormField>

      <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
        <DsCheckbox v-model="includeStakeholders">
          Include business stakeholders in the launch message
        </DsCheckbox>
        <DsCheckbox v-model="requireApproval">
          Require manual approval before notifications are sent
        </DsCheckbox>
      </div>
    </div>
  </DsFormSection>
</template>`,
  },
  {
    id: 'form-section-stacked-flow',
    title: 'Stacked multi-section flow',
    description: 'Такой сценарий показывает, что несколько `DsFormSection` подряд могут собирать skeleton полноценной settings-страницы без тяжёлой layout-обвязки.',
    status: 'ready',
    previewKey: 'ds-form-section-stacked-flow',
    code: `<script setup lang="ts">
import { ref } from 'vue'

import { DsBadge, DsFormField, DsFormSection, DsInput } from '@feugene/granularity'

const owner = ref('release-manager@company.dev')
const runbook = ref('docs/runbooks/incident-handoff')
</script>

<template>
  <div class="grid gap-6">
    <DsFormSection title="Ownership">
      <DsFormField label="Primary owner" for-id="incident-owner">
        <DsInput id="incident-owner" v-model="owner" placeholder="name@company.dev" />
      </DsFormField>
    </DsFormSection>

    <DsFormSection title="Operational assets" description="Multiple sections can be stacked to create a light-weight form page skeleton.">
      <div class="grid gap-4">
        <DsFormField label="Runbook path" for-id="runbook-path">
          <DsInput id="runbook-path" v-model="runbook" placeholder="docs/runbooks/..." />
        </DsFormField>

        <div class="flex flex-wrap gap-2">
          <DsBadge tone="success" radius="round">Owner assigned</DsBadge>
          <DsBadge tone="info" radius="round">Runbook linked</DsBadge>
        </div>
      </div>
    </DsFormSection>
  </div>
</template>`,
  },
]
