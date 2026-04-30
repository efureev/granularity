<script setup lang="ts">
import {computed, ref} from 'vue'

import {
  GrFormField,
  GrInput,
  GrRadioGroup,
  GrSwitch,
  type GrSwitchSize,
} from '@feugene/granularity'

import CodeBlock from '../../../components/doc/CodeBlock.vue'

const checked = ref(true)
const disabled = ref(false)
const size = ref<GrSwitchSize>('md')
const label = ref('Email notifications')
const ariaLabel = ref('')
const activeBackgroundColor = ref('')
const inactiveBackgroundColor = ref('')

const sizeOptions = [
  {value: 'sm', label: 'SM'},
  {value: 'md', label: 'MD'},
  {value: 'lg', label: 'LG'},
] satisfies Array<{ value: GrSwitchSize, label: string }>

const switchText = computed(() => {
  return label.value.trim() || 'Email notifications'
})

const resolvedAriaLabel = computed(() => {
  return ariaLabel.value.trim() || undefined
})

const resolvedActiveBackgroundColor = computed(() => {
  return activeBackgroundColor.value.trim() || undefined
})

const resolvedInactiveBackgroundColor = computed(() => {
  return inactiveBackgroundColor.value.trim() || undefined
})

const previewSummary = computed(() => {
  if (disabled.value)
    return 'Disabled switch блокирует изменение состояния, но сохраняет визуальный контекст текущей настройки.'

  if (resolvedActiveBackgroundColor.value || resolvedInactiveBackgroundColor.value) {
    return 'Локальные color overrides помогают встроить switch в особый сценарий, не меняя глобальные theme tokens.'
  }

  if (checked.value)
    return 'Во включённом состоянии трек использует primary-акцент и хорошо подходит для ключевых feature toggles.'

  return 'Подберите size, подпись и optional accessibility/color props, чтобы быстро собрать нужный контракт переключателя.'
})

function escapeAttribute(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
}

const previewCode = computed(() => {
  const attributes = [
    `:model-value="${checked.value ? 'true' : 'false'}"`,
    `size="${size.value}"`,
  ]

  if (disabled.value)
    attributes.push('disabled')

  if (resolvedAriaLabel.value && resolvedAriaLabel.value !== switchText.value) {
    attributes.push(`aria-label="${escapeAttribute(resolvedAriaLabel.value)}"`)
  }

  if (resolvedActiveBackgroundColor.value) {
    attributes.push(`active-background-color="${escapeAttribute(resolvedActiveBackgroundColor.value)}"`)
  }

  if (resolvedInactiveBackgroundColor.value) {
    attributes.push(`inactive-background-color="${escapeAttribute(resolvedInactiveBackgroundColor.value)}"`)
  }

  return ['<GrSwitch', ...attributes.map(attribute => `  ${attribute}`), '>', `  ${switchText.value}`, '</GrSwitch>'].join('\n')
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

          <GrSwitch
              :model-value="checked"
              :disabled="disabled"
              :size="size"
              :aria-label="resolvedAriaLabel"
              :active-background-color="resolvedActiveBackgroundColor"
              :inactive-background-color="resolvedInactiveBackgroundColor"
              @update:model-value="checked = $event"
          >
            {{ switchText }}
          </GrSwitch>

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
        Свойства переключателя
      </div>

      <div class="grid gap-4">
        <GrFormField label="Size">
          <GrRadioGroup v-model="size" :options="sizeOptions" variant="button" size="sm"/>
        </GrFormField>

        <GrFormField label="Label">
          <GrInput
              v-model="label"
              placeholder="Email notifications"
              aria-label="Switch label"
          />
        </GrFormField>

        <GrFormField label="Accessibility label">
          <GrInput
              v-model="ariaLabel"
              placeholder="Used when visible label is not enough"
              aria-label="Switch accessibility label"
          />
        </GrFormField>

        <GrFormField label="Active background color">
          <GrInput
              v-model="activeBackgroundColor"
              placeholder="#22c55e / var(--primary)"
              aria-label="Switch active background color"
          />
        </GrFormField>

        <GrFormField label="Inactive background color">
          <GrInput
              v-model="inactiveBackgroundColor"
              placeholder="#e5e7eb / var(--muted)"
              aria-label="Switch inactive background color"
          />
        </GrFormField>
      </div>

      <div class="grid gap-3 rounded-2xl border border-[var(--brd)] bg-[var(--card)] p-4">
        <GrSwitch v-model="checked" size="sm">
          Checked
        </GrSwitch>
        <GrSwitch v-model="disabled" size="sm">
          Disabled
        </GrSwitch>
      </div>
    </div>
  </div>
</template>