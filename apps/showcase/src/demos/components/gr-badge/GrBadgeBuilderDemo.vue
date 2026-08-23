<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  GrBadge,
  GrFormField,
  GrInput,
  GrRadioGroup,
  GrSelect,
  GrSwitch,
  type GrBadgeRadius,
  type GrBadgeSize,
  type GrBadgeTone,
} from '@feugene/granularity'

import CodeBlock from '../../../components/doc/CodeBlock.vue'

const tone = ref<GrBadgeTone>('primary')
const size = ref<GrBadgeSize>('sm')
const radius = ref<GrBadgeRadius>('round')
const label = ref('Beta')
const dark = ref(false)
const uppercase = ref(false)

const toneOptions = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'primary', label: 'Primary' },
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'danger', label: 'Danger' },
  { value: 'slate', label: 'Slate' },
  { value: 'azure', label: 'Azure' },
] satisfies Array<{ value: GrBadgeTone, label: string }>

const sizeOptions = [
  { value: 'xs', label: 'XS' },
  { value: 'sm', label: 'SM' },
  { value: 'md', label: 'MD' },
  { value: 'lg', label: 'LG' },
] satisfies Array<{ value: GrBadgeSize, label: string }>

const radiusOptions = [
  { value: 'square', label: 'Square' },
  { value: 'semi', label: 'Semi' },
  { value: 'round', label: 'Round' },
] satisfies Array<{ value: GrBadgeRadius, label: string }>

const badgeText = computed(() => {
  const value = label.value.trim()

  return value || 'Beta'
})

const previewSummary = computed(() => {
  if (dark.value)
    return 'A filled (`dark`) badge works better as a bright status indicator inside tables, toolbar counters and alert summaries.'

  if (radius.value === 'square')
    return 'A square badge gives the densest silhouette and suits compact row-level labels and counters.'

  if (radius.value === 'semi')
    return 'The semi radius is visually closer to a filter chip and is handy where you need a slightly stricter outline without a full pill effect.'

  if (tone.value === 'neutral')
    return 'A neutral light badge is a safe default for metadata, secondary statuses and supporting captions.'

  return 'Assemble the right combination of `tone`, `size`, `radius` and `dark` to quickly check the badge before using it in the interface.'
})

const previewLabelClass = computed(() => {
  return uppercase.value ? 'uppercase tracking-[0.08em]' : ''
})

const previewCode = computed(() => {
  const attributes = [
    `tone="${tone.value}"`,
    `size="${size.value}"`,
    `radius="${radius.value}"`,
  ]

  if (dark.value)
    attributes.push('dark')

  const content = uppercase.value ? badgeText.value.toUpperCase() : badgeText.value

  return ['<GrBadge', ...attributes.map(attribute => `  ${attribute}`), '>', `  ${content}`, '</GrBadge>'].join('\n')
})
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_320px]">
    <div class="grid gap-4">
      <div
          class="relative grid min-h-[240px] rounded-[24px] border border-dashed border-[var(--preview-brd)] bg-[image:var(--preview-surface)] p-6 pb-[72px]"
>
        <div class="flex h-full flex-col items-center justify-center gap-5 text-center">
          <div class="showcase-demo-caption text-xs">
            Preview
          </div>

          <div class="flex flex-wrap items-center justify-center gap-3">
            <GrBadge :tone="tone" :size="size" :radius="radius" :dark="dark">
              <span :class="previewLabelClass">{{ uppercase ? badgeText.toUpperCase() : badgeText }}</span>
            </GrBadge>

            <span class="showcase-demo-text text-sm text-[var(--gr-muted-fg)]">
              SLA status
            </span>
          </div>

          <div class="pointer-events-none absolute inset-x-6 bottom-6 flex justify-center border-t border-dashed border-[var(--preview-brd)] pt-2">
            <div class="showcase-demo-text max-w-[44ch] text-center text-sm">
              {{ previewSummary }}
            </div>
          </div>
        </div>
      </div>

      <CodeBlock :code="previewCode" language="vue" expanded title="Rendered snippet" />
    </div>

    <div class="showcase-demo-panel grid gap-4 rounded-[28px] border p-4 lg:p-5">
      <div class="showcase-demo-title text-sm font-semibold">
        Badge properties
      </div>

      <div class="grid gap-4">
        <GrFormField label="Tone">
          <GrSelect v-model="tone" :options="toneOptions" aria-label="Badge tone" />
        </GrFormField>

        <GrFormField label="Size">
          <GrRadioGroup v-model="size" :options="sizeOptions" variant="button" size="sm" />
        </GrFormField>

        <GrFormField label="Radius">
          <GrRadioGroup v-model="radius" :options="radiusOptions" variant="button" size="sm" />
        </GrFormField>

        <GrFormField label="Label">
          <GrInput v-model="label" placeholder="Beta" aria-label="Badge label" />
        </GrFormField>
      </div>

      <div class="grid gap-3 rounded-2xl border border-[var(--gr-brd)] bg-[var(--gr-card)] p-4">
        <GrSwitch v-model="dark" size="sm">
          Filled / dark mode
        </GrSwitch>
        <GrSwitch v-model="uppercase" size="sm">
          Uppercase label
        </GrSwitch>
      </div>
    </div>
  </div>
</template>
