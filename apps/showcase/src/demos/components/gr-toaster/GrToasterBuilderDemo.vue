<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  GrButton,
  GrCard,
  GrFormField,
  GrInput,
  GrRadioGroup,
  GrSelect,
  GrToaster,
  type GrToastTone,
  type GrToasterPlacement,
  useToast,
} from '@feugene/granularity'

import { useFintI18n } from '@feugene/fint-i18n/vue'

import CodeBlock from '../../../components/doc/CodeBlock.vue'
import { useShowcaseToasterHost } from './showcaseToasterHost'

const { t } = useFintI18n()
const { push, clear } = useToast()
const { isActiveHost, activateHost } = useShowcaseToasterHost('builder')

const tone = ref<GrToastTone>('info')
const placement = ref<GrToasterPlacement>('top-right')
const title = ref('Workspace updated')
const message = ref('Your changes are visible to the entire team.')
const timeoutMs = ref(3500)
const dismissLabel = ref('Dismiss')
const regionLabel = ref('Notifications')

const toneOptions = [
  { value: 'primary', label: 'Primary' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'danger', label: 'Danger' },
  { value: 'info', label: 'Info' },
  { value: 'slate', label: 'Slate' },
  { value: 'azure', label: 'Azure' },
] satisfies Array<{ value: GrToastTone, label: string }>

const placementOptions = [
  { value: 'top-left', label: 'TL' },
  { value: 'top-right', label: 'TR' },
  { value: 'bottom-left', label: 'BL' },
  { value: 'bottom-right', label: 'BR' },
] satisfies Array<{ value: GrToasterPlacement, label: string }>

const effectiveTitle = computed(() => title.value.trim() || 'Workspace updated')
const effectiveMessage = computed(() => message.value.trim())

const previewSummary = computed(() => {
  if (timeoutMs.value <= 0)
    return t('components.GrToaster.Sticky toasts (timeoutMs ≤ 0) stay until the user dismisses them — handy for warnings that need acknowledgement')

  if (tone.value === 'warning' || tone.value === 'danger')
    return t('components.GrToaster.Warning and danger tones use role=alert and aria-live=assertive to interrupt the screen reader')

  return t('components.GrToaster.Tweak tone, placement and timeoutMs to validate the toast contract before wiring useToast into a real flow')
})

function escapeAttribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
}

function pushToast() {
  activateHost()
  clear()
  push({
    tone: tone.value,
    title: effectiveTitle.value,
    message: effectiveMessage.value || undefined,
    timeoutMs: timeoutMs.value,
  })
}

function clearStore() {
  activateHost()
  clear()
}

const previewCode = computed(() => {
  const toasterAttributes = [
    `placement="${placement.value}"`,
    `dismiss-label="${escapeAttribute(dismissLabel.value || 'Dismiss')}"`,
    `region-label="${escapeAttribute(regionLabel.value || 'Notifications')}"`,
  ]

  const pushPayload: string[] = [
    `  tone: '${tone.value}',`,
    `  title: '${effectiveTitle.value.replaceAll('\'', '\\\'')}',`,
  ]

  if (effectiveMessage.value)
    pushPayload.push(`  message: '${effectiveMessage.value.replaceAll('\'', '\\\'')}',`)

  pushPayload.push(`  timeoutMs: ${timeoutMs.value},`)

  return [
    '<script setup lang="ts">',
    'import { GrButton, GrToaster, useToast } from \'@feugene/granularity\'',
    '',
    'const { push } = useToast()',
    '',
    'function notify() {',
    '  push({',
    ...pushPayload.map(line => `  ${line}`),
    '  })',
    '}',
    '<\/script>',
    '',
    '<template>',
    '  <GrButton size="sm" @click="notify">Push toast</GrButton>',
    '',
    '  <GrToaster',
    ...toasterAttributes.map(attribute => `    ${attribute}`),
    '  />',
    '</template>',
  ].join('\n')
})
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_320px]">
    <div class="grid gap-4">
      <div
        class="relative grid min-h-[280px] rounded-[24px] border border-dashed border-[var(--preview-brd)] bg-[image:var(--preview-surface)] p-6 pb-[72px]"
      >
        <div class="flex h-full flex-col items-center justify-center gap-4 text-center">
          <div class="showcase-demo-caption text-xs">
            Preview
          </div>

          <div class="flex flex-wrap justify-center gap-2">
            <GrButton size="sm" @click="pushToast">
              Push toast
            </GrButton>
            <GrButton size="sm" variant="ghost" @click="clearStore">
              Clear store
            </GrButton>
          </div>

          <div class="text-xs text-[var(--muted-fg)]">
            Active host: <span class="font-medium text-[var(--fg)]">{{ isActiveHost ? 'this preview' : 'another preview' }}</span>
          </div>

          <div
            class="pointer-events-none absolute inset-x-6 bottom-6 flex justify-center border-t border-dashed border-[var(--preview-brd)] pt-2"
          >
            <div class="showcase-demo-text max-w-[40ch] text-center text-sm">
              {{ previewSummary }}
            </div>
          </div>
        </div>
      </div>

      <CodeBlock :code="previewCode" language="vue" title="Rendered snippet" />
    </div>

    <div class="showcase-demo-panel grid gap-4 rounded-[28px] border p-4 lg:p-5">
      <div class="showcase-demo-title text-sm font-semibold">
        {{ t('Properties') }}
      </div>

      <div class="grid gap-4">
        <GrFormField label="Tone">
          <GrSelect v-model="tone" :options="toneOptions" aria-label="Toast tone" />
        </GrFormField>

        <GrFormField label="Placement">
          <GrRadioGroup v-model="placement" :options="placementOptions" variant="button" size="sm" />
        </GrFormField>

        <GrFormField label="Title">
          <GrInput v-model="title" placeholder="Workspace updated" aria-label="Toast title" />
        </GrFormField>

        <GrFormField label="Message">
          <GrInput v-model="message" placeholder="Optional supporting text" aria-label="Toast message" />
        </GrFormField>

        <GrFormField label="Timeout (ms, 0 = sticky)">
          <GrInput
            v-model.number="timeoutMs"
            type="number"
            placeholder="3500"
            aria-label="Toast timeout in milliseconds"
          />
        </GrFormField>

        <GrFormField label="Dismiss label">
          <GrInput v-model="dismissLabel" placeholder="Dismiss" aria-label="Dismiss button label" />
        </GrFormField>

        <GrFormField label="Region label">
          <GrInput v-model="regionLabel" placeholder="Notifications" aria-label="Toaster region label" />
        </GrFormField>
      </div>

      <GrCard class="grid gap-2 p-4 text-xs text-[var(--muted-fg)]">
        <div>
          <span class="font-medium text-[var(--fg)]">Tip:</span> set timeout to 0 for warnings that require acknowledgement.
        </div>
        <div>
          Active host pattern keeps a single `GrToaster` rendered for the shared `useToast` store.
        </div>
      </GrCard>
    </div>

    <GrToaster
      v-if="isActiveHost"
      :placement="placement"
      :dismiss-label="dismissLabel || 'Dismiss'"
      :region-label="regionLabel || 'Notifications'"
    />
  </div>
</template>
