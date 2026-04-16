<script setup lang="ts">
import {computed, ref} from 'vue'

import {
  DsFormField,
  DsInput,
  DsLink,
  DsRadioGroup,
  DsSelect,
  DsSwitch,
  type DsLinkSize,
  type DsLinkUnderline,
  type DsLinkVariant,
} from '@feugene/granularity'

import CodeBlock from '../../../components/doc/CodeBlock.vue'

type DsLinkTargetMode = 'auto' | '_self' | '_blank' | 'custom'
type DsLinkRelMode = 'auto' | 'noopener noreferrer' | 'nofollow' | 'custom'

const variant = ref<DsLinkVariant>('primary')
const size = ref<DsLinkSize>('md')
const underline = ref<DsLinkUnderline>('auto')
const label = ref('Open workspace settings')
const href = ref('/settings/workspace')
const ariaLabel = ref('Open workspace settings')
const external = ref(false)
const disabled = ref(false)
const targetMode = ref<DsLinkTargetMode>('auto')
const customTarget = ref('')
const relMode = ref<DsLinkRelMode>('auto')
const customRel = ref('')

const variantOptions = [
  {value: 'primary', label: 'Primary'},
  {value: 'default', label: 'Default'},
  {value: 'muted', label: 'Muted'},
  {value: 'danger', label: 'Danger'},
] satisfies Array<{ value: DsLinkVariant, label: string }>

const sizeOptions = [
  {value: 'sm', label: 'SM'},
  {value: 'md', label: 'MD'},
  {value: 'lg', label: 'LG'},
] satisfies Array<{ value: DsLinkSize, label: string }>

const underlineOptions = [
  {value: 'auto', label: 'Auto'},
  {value: 'always', label: 'Always'},
  {value: 'none', label: 'None'},
] satisfies Array<{ value: DsLinkUnderline, label: string }>

const targetOptions = [
  {value: 'auto', label: 'Auto'},
  {value: '_self', label: '_self'},
  {value: '_blank', label: '_blank'},
  {value: 'custom', label: 'Custom'},
] satisfies Array<{ value: DsLinkTargetMode, label: string }>

const relOptions = [
  {value: 'auto', label: 'Auto'},
  {value: 'noopener noreferrer', label: 'noopener noreferrer'},
  {value: 'nofollow', label: 'nofollow'},
  {value: 'custom', label: 'Custom'},
] satisfies Array<{ value: DsLinkRelMode, label: string }>

const linkText = computed(() => {
  return label.value.trim() || 'Open workspace settings'
})

const effectiveAriaLabel = computed(() => {
  return ariaLabel.value.trim() || linkText.value
})

const resolvedHref = computed(() => {
  return href.value.trim() || '/settings/workspace'
})

const resolvedTarget = computed(() => {
  if (targetMode.value === 'custom')
    return customTarget.value.trim() || undefined

  if (targetMode.value === 'auto')
    return undefined

  return targetMode.value
})

const resolvedRel = computed(() => {
  if (relMode.value === 'custom')
    return customRel.value.trim() || undefined

  if (relMode.value === 'auto')
    return undefined

  return relMode.value
})

const previewSummary = computed(() => {
  if (disabled.value)
    return 'Disabled link рендерится как неинтерактивный inline-элемент и сохраняет типографику текста.'

  if (external.value)
    return 'External mode автоматически проставляет `target="_blank"` и `rel="noopener noreferrer"`, если вручную их не переопределять.'

  if (underline.value === 'always')
    return 'Always underline подходит для важных inline-actions, которые должны быть заметны даже без hover.'

  return 'Настройте tone, size, underline и навигационные атрибуты, чтобы быстро собрать нужный contract ссылки.'
})

function escapeAttribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
}

const previewCode = computed(() => {
  const attributes = [
    `href="${escapeAttribute(resolvedHref.value)}"`,
    `variant="${variant.value}"`,
    `size="${size.value}"`,
    `underline="${underline.value}"`,
  ]

  if (external.value)
    attributes.push('external')

  if (disabled.value)
    attributes.push('disabled')

  if (resolvedTarget.value)
    attributes.push(`target="${escapeAttribute(resolvedTarget.value)}"`)

  if (resolvedRel.value)
    attributes.push(`rel="${escapeAttribute(resolvedRel.value)}"`)

  if (effectiveAriaLabel.value !== linkText.value)
    attributes.push(`aria-label="${escapeAttribute(effectiveAriaLabel.value)}"`)

  return ['<DsLink', ...attributes.map(attribute => `  ${attribute}`), '>', `  ${linkText.value}`, '</DsLink>'].join('\n')
})
</script>

<template>
  <div class="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_320px]">
    <div class="grid gap-4">
      <div
          class="relative grid min-h-[280px] rounded-[24px] border border-dashed border-[var(--preview-brd)] bg-[image:var(--preview-surface)] p-6 pb-[72px]">
        <div class="flex h-full flex-col items-center justify-center gap-4 text-center">
          <div class="showcase-demo-caption text-xs">
            Preview
          </div>

          <DsLink
              :href="resolvedHref"
              :variant="variant"
              :size="size"
              :underline="underline"
              :external="external"
              :disabled="disabled"
              :target="resolvedTarget"
              :rel="resolvedRel"
              :aria-label="effectiveAriaLabel"
          >
            {{ linkText }}
          </DsLink>

          <div class="pointer-events-none absolute inset-x-6 bottom-6 flex justify-center border-t border-dashed border-[var(--preview-brd)] pt-2">
            <div class="showcase-demo-text max-w-[42ch] text-center text-sm">
              {{ previewSummary }}
            </div>
          </div>
        </div>
      </div>

      <CodeBlock :code="previewCode" language="vue" title="Rendered snippet"/>
    </div>

    <div class="showcase-demo-panel grid gap-4 rounded-[28px] border p-4 lg:p-5">
      <div class="showcase-demo-title text-sm font-semibold">
        Свойства ссылки
      </div>

      <div class="grid gap-4">
        <DsFormField label="Variant">
          <DsSelect v-model="variant" :options="variantOptions" aria-label="Link variant"/>
        </DsFormField>

        <DsFormField label="Size">
          <DsRadioGroup v-model="size" :options="sizeOptions" variant="button" size="sm"/>
        </DsFormField>

        <DsFormField label="Underline">
          <DsRadioGroup v-model="underline" :options="underlineOptions" variant="button" size="sm"/>
        </DsFormField>

        <DsFormField label="Label">
          <DsInput
              v-model="label"
              placeholder="Open workspace settings"
              aria-label="Link label"
          />
        </DsFormField>

        <DsFormField label="Href">
          <DsInput
              v-model="href"
              placeholder="/settings/workspace"
              aria-label="Link href"
          />
        </DsFormField>

        <DsFormField label="Accessibility label">
          <DsInput
              v-model="ariaLabel"
              placeholder="Used by screen readers when needed"
              aria-label="Link accessibility label"
          />
        </DsFormField>

        <DsFormField label="Target">
          <DsRadioGroup v-model="targetMode" :options="targetOptions" variant="button" size="sm"/>
          <DsInput
              v-if="targetMode === 'custom'"
              v-model="customTarget"
              class="mt-3"
              placeholder="workspace-frame"
              aria-label="Custom target"
          />
        </DsFormField>

        <DsFormField label="Rel">
          <DsSelect v-model="relMode" :options="relOptions" aria-label="Link rel"/>
          <DsInput
              v-if="relMode === 'custom'"
              v-model="customRel"
              class="mt-3"
              placeholder="author noopener"
              aria-label="Custom rel"
          />
        </DsFormField>
      </div>

      <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
        <DsSwitch v-model="external" size="sm">
          External
        </DsSwitch>
        <DsSwitch v-model="disabled" size="sm">
          Disabled
        </DsSwitch>
      </div>
    </div>
  </div>
</template>