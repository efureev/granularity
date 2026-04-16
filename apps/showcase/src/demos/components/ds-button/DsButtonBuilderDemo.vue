<script setup lang="ts">
import {computed, ref} from 'vue'

import {
  DsButton,
  DsFormField,
  DsInput,
  DsRadioGroup,
  DsSelect,
  DsSwitch,
  DsCard,
  type DsButtonSize,
  type DsButtonTone,
  type DsButtonVariant,
} from '@feugene/granularity'
import IconSparkles from '~icons/lucide/sparkles'

import CodeBlock from '../../../components/doc/CodeBlock.vue'
import {useFintI18n} from '@feugene/fint-i18n/vue'

const {t } = useFintI18n()
type DsButtonType = 'button' | 'submit' | 'reset'

const variant = ref<DsButtonVariant>('primary')
const tone = ref<DsButtonTone>('primary')
const size = ref<DsButtonSize>('md')
const type = ref<DsButtonType>('button')
const label = ref('Create workspace')
const ariaLabel = ref('Create workspace')
const loading = ref(false)
const disabled = ref(false)
const square = ref(false)

const variantOptions = [
  {value: 'primary', label: 'Primary'},
  {value: 'secondary', label: 'Secondary'},
  {value: 'outline', label: 'Outline'},
  {value: 'ghost', label: 'Ghost'},
  {value: 'ghost-border', label: 'Ghost border'},
] satisfies Array<{ value: DsButtonVariant, label: string }>

const toneOptions = [
  {value: 'primary', label: 'Primary'},
  {value: 'neutral', label: 'Neutral'},
  {value: 'success', label: 'Success'},
  {value: 'warning', label: 'Warning'},
  {value: 'danger', label: 'Danger'},
  {value: 'info', label: 'Info'},
  {value: 'slate', label: 'Slate'},
  {value: 'azure', label: 'Azure'},
] satisfies Array<{ value: DsButtonTone, label: string }>

const sizeOptions = [
  {value: 'xs', label: 'XS'},
  {value: 'sm', label: 'SM'},
  {value: 'md', label: 'MD'},
  {value: 'lg', label: 'LG'},
] satisfies Array<{ value: DsButtonSize, label: string }>

const typeOptions = [
  {value: 'button', label: 'button'},
  {value: 'submit', label: 'submit'},
  {value: 'reset', label: 'reset'},
] satisfies Array<{ value: DsButtonType, label: string }>

const buttonText = computed(() => {
  if (loading.value && !square.value)
    return 'Saving…'

  return label.value.trim() || 'Create workspace'
})

const effectiveAriaLabel = computed(() => {
  return ariaLabel.value.trim() || buttonText.value
})

const previewSummary = computed(() => {
  if (square.value)
    return t('components.DsButton.Square mode makes the button icon-only, so `aria-label` should describe the action for screen readers')

  if (loading.value)
    return t('components.DsButton.Loading automatically disables the button and helps prevent repeated submit actions in async scenarios')

  if (disabled.value)
    return t('components.DsButton.Disabled preserves the visual contract of the selected variant/tone while turning off interactivity and pointer events')

  if (variant.value === 'ghost' || variant.value === 'ghost-border')
    return t('components.DsButton.Ghost variants work best in toolbars and dense action areas where a filled CTA would feel too heavy')

  return t('components.DsButton.Combine `variant`, `tone`, `size`, and `type` to quickly verify the button contract before shipping it to a product scenario')
})

function escapeAttribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
}

const previewCode = computed(() => {
  const attributes = [
    `variant="${variant.value}"`,
    `tone="${tone.value}"`,
    `size="${size.value}"`,
    `type="${type.value}"`,
  ]

  if (loading.value)
    attributes.push('loading')

  if (disabled.value)
    attributes.push('disabled')

  if (square.value)
    attributes.push('square')

  if (square.value || effectiveAriaLabel.value !== buttonText.value)
    attributes.push(`aria-label="${escapeAttribute(effectiveAriaLabel.value)}"`)

  const content = square.value && !loading.value
      ? '  <IconSparkles class="h-4 w-4" aria-hidden="true" />'
      : `  ${buttonText.value}`

  return ['<DsButton', ...attributes.map(attribute => `  ${attribute}`), '>', content, '</DsButton>'].join('\n')
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

          <DsButton
              :variant="variant"
              :tone="tone"
              :size="size"
              :type="type"
              :loading="loading"
              :disabled="disabled"
              :square="square"
              :aria-label="effectiveAriaLabel"
          >
            <IconSparkles v-if="square && !loading" class="h-4 w-4" aria-hidden="true"/>
            <template v-else>
              {{ buttonText }}
            </template>
          </DsButton>

          <div
              class="pointer-events-none absolute inset-x-6 bottom-6 flex justify-center border-t border-dashed border-[var(--preview-brd)] pt-2">
            <div class="showcase-demo-text max-w-[40ch] text-center text-sm">
              {{ previewSummary }}
            </div>
          </div>
        </div>
      </div>

      <CodeBlock :code="previewCode" language="vue" title="Rendered snippet"/>
    </div>

    <div class="showcase-demo-panel grid gap-4 rounded-[28px] border p-4 lg:p-5">
      <div class="showcase-demo-title text-sm font-semibold">
        {{ t('Properties') }}
      </div>

      <div class="grid gap-4">
        <DsFormField label="Variant">
          <DsSelect v-model="variant" :options="variantOptions" aria-label="Button variant"/>
        </DsFormField>

        <DsFormField label="Tone">
          <DsSelect v-model="tone" :options="toneOptions" aria-label="Button tone"/>
        </DsFormField>

        <DsFormField label="Size">
          <DsRadioGroup v-model="size" :options="sizeOptions" variant="button" size="sm"/>
        </DsFormField>

        <DsFormField label="Type">
          <DsRadioGroup v-model="type" :options="typeOptions" variant="button" size="sm"/>
        </DsFormField>

        <DsFormField label="Button label">
          <DsInput
              v-model="label"
              :disabled="square"
              placeholder="Create workspace"
              aria-label="Button label"
          />
        </DsFormField>

        <DsFormField label="Accessibility label">
          <DsInput
              v-model="ariaLabel"
              :placeholder="square ? 'Required for icon-only state' : 'Optional override for screen readers'"
              aria-label="Accessibility label"
          />
        </DsFormField>
      </div>

      <DsCard class="grid gap-3 p-4">
        <DsSwitch v-model="loading" size="sm">
          Loading
        </DsSwitch>
        <DsSwitch v-model="disabled" size="sm">
          Disabled
        </DsSwitch>
        <DsSwitch v-model="square" size="sm">
          Square / icon-only
        </DsSwitch>
      </DsCard>
    </div>
  </div>
</template>