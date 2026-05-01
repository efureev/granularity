<script setup lang="ts">
import {computed, ref, watch} from 'vue'

import {
  GrCard,
  GrFormField,
  GrInput,
  GrRadioGroup,
  GrSelect,
  GrSwitch,
  type GrSelectOptionsView,
  type GrSelectSize,
  type GrSelectUnderline,
  type GrSelectVariant,
  type GrSelectView,
} from '@feugene/granularity'

import CodeBlock from '../../../components/doc/CodeBlock.vue'
import {useFintI18n} from '@feugene/fint-i18n/vue'

const {t} = useFintI18n()

const view = ref<GrSelectView>('default')
const size = ref<GrSelectSize>('md')
const variant = ref<GrSelectVariant>('primary')
const underline = ref<GrSelectUnderline>('auto')
const optionsView = ref<GrSelectOptionsView>('native')
const placeholder = ref('Pick workspace')
const ariaLabel = ref('Pick workspace')
const customValuePlaceholder = ref('Add value…')

const multiple = ref(false)
const clearable = ref(false)
const disabled = ref(false)
const allowCustomValue = ref(false)
const closeOnSelect = ref(true)

const singleValue = ref<string>('')
const multipleValue = ref<string[]>([])

const demoOptions = [
  {value: 'alpha', label: 'Alpha workspace'},
  {value: 'beta', label: 'Beta workspace'},
  {value: 'gamma', label: 'Gamma workspace'},
  {value: 'delta', label: 'Delta workspace: very long label that should wrap'},
]

const viewOptions = [
  {value: 'default', label: 'Default'},
  {value: 'link', label: 'Link'},
] satisfies Array<{ value: GrSelectView, label: string }>

const sizeOptions = [
  {value: 'xs', label: 'XS'},
  {value: 'sm', label: 'SM'},
  {value: 'md', label: 'MD'},
  {value: 'lg', label: 'LG'},
] satisfies Array<{ value: GrSelectSize, label: string }>

const variantOptions = [
  {value: 'primary', label: 'Primary'},
  {value: 'default', label: 'Default'},
  {value: 'muted', label: 'Muted'},
  {value: 'danger', label: 'Danger'},
] satisfies Array<{ value: GrSelectVariant, label: string }>

const underlineOptions = [
  {value: 'auto', label: 'Auto'},
  {value: 'always', label: 'Always'},
  {value: 'none', label: 'None'},
] satisfies Array<{ value: GrSelectUnderline, label: string }>

const optionsViewOptions = [
  {value: 'native', label: 'Native'},
  {value: 'panel', label: 'Panel'},
] satisfies Array<{ value: GrSelectOptionsView, label: string }>

watch(multiple, (next) => {
  if (next) {
    if (!Array.isArray(multipleValue.value))
      multipleValue.value = []
  }
  else {
    singleValue.value = ''
  }
})

const effectiveAriaLabel = computed(() => ariaLabel.value.trim() || placeholder.value.trim() || 'Select value')

const previewSummary = computed(() => {
  if (disabled.value)
    return t('components.GrSelect.Disabled preserves the visual contract of the selected view/size while turning off interactivity and pointer events')

  if (allowCustomValue.value)
    return t('components.GrSelect.Allow custom value enables free-form input alongside the existing options — useful for tag-like pickers')

  if (multiple.value && optionsView.value === 'panel')
    return t('components.GrSelect.Panel mode with multiple selection acts as a mini-picker — combine with `close-on-select=false` for filter-like UX')

  if (view.value === 'link')
    return t('components.GrSelect.Link view aligns the trigger with `GrLink` styling — good for inline switchers and toolbar actions')

  return t('components.GrSelect.Combine `view`, `size`, `optionsView`, and state switches to quickly verify the select contract before shipping to a product scenario')
})

function escapeAttribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
}

const previewCode = computed(() => {
  const attributes: string[] = []

  attributes.push(`v-model="${multiple.value ? 'selectedValues' : 'selectedValue'}"`)
  attributes.push(':options="options"')
  attributes.push(`view="${view.value}"`)
  attributes.push(`size="${size.value}"`)
  attributes.push(`options-view="${optionsView.value}"`)

  if (view.value === 'link') {
    attributes.push(`variant="${variant.value}"`)
    attributes.push(`underline="${underline.value}"`)
  }

  if (placeholder.value.trim())
    attributes.push(`placeholder="${escapeAttribute(placeholder.value.trim())}"`)

  attributes.push(`aria-label="${escapeAttribute(effectiveAriaLabel.value)}"`)

  if (multiple.value)
    attributes.push('multiple')

  if (clearable.value)
    attributes.push('clearable')

  if (disabled.value)
    attributes.push('disabled')

  if (allowCustomValue.value) {
    attributes.push('allow-custom-value')

    if (customValuePlaceholder.value.trim())
      attributes.push(`custom-value-placeholder="${escapeAttribute(customValuePlaceholder.value.trim())}"`)
  }

  if (optionsView.value === 'panel' && !closeOnSelect.value)
    attributes.push(':close-on-select="false"')

  return ['<GrSelect', ...attributes.map(attribute => `  ${attribute}`), '/>'].join('\n')
})

const linkVariantDisabled = computed(() => view.value !== 'link')
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

          <div class="w-full max-w-[320px]">
            <GrSelect
                v-if="multiple"
                v-model="multipleValue"
                :options="demoOptions"
                :view="view"
                :size="size"
                :variant="variant"
                :underline="underline"
                :options-view="optionsView"
                :placeholder="placeholder"
                :aria-label="effectiveAriaLabel"
                :multiple="true"
                :clearable="clearable"
                :disabled="disabled"
                :allow-custom-value="allowCustomValue"
                :custom-value-placeholder="customValuePlaceholder"
                :close-on-select="closeOnSelect"
            />
            <GrSelect
                v-else
                v-model="singleValue"
                :options="demoOptions"
                :view="view"
                :size="size"
                :variant="variant"
                :underline="underline"
                :options-view="optionsView"
                :placeholder="placeholder"
                :aria-label="effectiveAriaLabel"
                :clearable="clearable"
                :disabled="disabled"
                :allow-custom-value="allowCustomValue"
                :custom-value-placeholder="customValuePlaceholder"
                :close-on-select="closeOnSelect"
            />
          </div>

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
        <GrFormField label="View">
          <GrRadioGroup v-model="view" :options="viewOptions" variant="button" size="sm"/>
        </GrFormField>

        <GrFormField label="Size">
          <GrRadioGroup v-model="size" :options="sizeOptions" variant="button" size="sm"/>
        </GrFormField>

        <GrFormField label="Options view">
          <GrRadioGroup v-model="optionsView" :options="optionsViewOptions" variant="button" size="sm"/>
        </GrFormField>

        <GrFormField label="Variant (link only)">
          <GrSelect
              v-model="variant"
              :options="variantOptions"
              :disabled="linkVariantDisabled"
              aria-label="Select variant"
          />
        </GrFormField>

        <GrFormField label="Underline (link only)">
          <GrRadioGroup
              v-model="underline"
              :options="underlineOptions"
              :disabled="linkVariantDisabled"
              variant="button"
              size="sm"
          />
        </GrFormField>

        <GrFormField label="Placeholder">
          <GrInput v-model="placeholder" placeholder="Pick workspace" aria-label="Placeholder"/>
        </GrFormField>

        <GrFormField label="Accessibility label">
          <GrInput v-model="ariaLabel" placeholder="Optional override for screen readers" aria-label="Accessibility label"/>
        </GrFormField>

        <GrFormField label="Custom value placeholder">
          <GrInput
              v-model="customValuePlaceholder"
              :disabled="!allowCustomValue || optionsView !== 'panel'"
              placeholder="Add value…"
              aria-label="Custom value placeholder"
          />
        </GrFormField>
      </div>

      <GrCard class="grid gap-3 p-4">
        <GrSwitch v-model="multiple" size="sm">
          Multiple
        </GrSwitch>
        <GrSwitch v-model="clearable" size="sm">
          Clearable
        </GrSwitch>
        <GrSwitch v-model="disabled" size="sm">
          Disabled
        </GrSwitch>
        <GrSwitch v-model="allowCustomValue" size="sm">
          Allow custom value
        </GrSwitch>
        <GrSwitch v-model="closeOnSelect" size="sm" :disabled="optionsView !== 'panel'">
          Close on select (panel)
        </GrSwitch>
      </GrCard>
    </div>
  </div>
</template>
