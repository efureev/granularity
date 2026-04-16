<script setup lang="ts">
import { computed, inject } from 'vue'

export type { DsRadioVariant } from './dsRadioStyles'

import {
  dsRadioButtonClass,
  dsRadioControlClass,
  dsRadioDotBaseClass,
  dsRadioDotClass,
  dsRadioRootClass,
  type DsRadioVariant,
} from './dsRadioStyles'
import type { DsButtonSize, DsButtonTone, DsButtonVariant } from '../DsButton'

import { DS_RADIO_GROUP_CONTEXT } from './dsRadioGroupContext'

const hiddenInputStyle = {
  position: 'absolute',
  opacity: '0',
  width: '0',
  height: '0',
  pointerEvents: 'none',
} as const

const props = withDefaults(
  defineProps<{
    value: string
    modelValue?: string
    disabled?: boolean
    name?: string
    required?: boolean
    form?: string
    size?: DsButtonSize
    variant?: DsRadioVariant
    buttonVariant?: DsButtonVariant
    buttonTone?: DsButtonTone
    selectedButtonVariant?: DsButtonVariant
    selectedButtonTone?: DsButtonTone
    ariaLabel?: string
  }>(),
  {
    modelValue: undefined,
    disabled: undefined,
    name: undefined,
    required: false,
    form: undefined,
    size: undefined,
    variant: 'radiobox',
    buttonVariant: 'outline',
    buttonTone: 'neutral',
    selectedButtonVariant: 'primary',
    selectedButtonTone: 'primary',
    ariaLabel: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const group = inject(DS_RADIO_GROUP_CONTEXT, null)

const resolvedModelValue = computed(() => {
  if (props.modelValue !== undefined)
    return props.modelValue

  return group?.modelValue.value ?? ''
})

const resolvedDisabled = computed(() => {
  if (props.disabled !== undefined)
    return props.disabled

  return group?.disabled.value ?? false
})

const resolvedName = computed(() => {
  if (props.name)
    return props.name

  return group?.name.value
})

const resolvedSize = computed<DsButtonSize>(() => {
  if (props.size)
    return props.size

  return group?.size.value ?? 'md'
})

const checked = computed(() => resolvedModelValue.value === props.value)

const buttonClassName = computed(() => {
  return dsRadioButtonClass({
    checked: checked.value,
    disabled: resolvedDisabled.value,
    size: resolvedSize.value,
    buttonVariant: props.buttonVariant,
    buttonTone: props.buttonTone,
    selectedButtonVariant: props.selectedButtonVariant,
    selectedButtonTone: props.selectedButtonTone,
  })
})

const rootClassName = computed(() => dsRadioRootClass(resolvedDisabled.value))
const controlClassName = computed(() => dsRadioControlClass(checked.value))
const dotClassName = computed(() => dsRadioDotClass(checked.value))

function setValue(next: string): void {
  if (resolvedDisabled.value)
    return

  if (props.modelValue !== undefined) {
    emit('update:modelValue', next)
    return
  }

  group?.setValue(next)
}

function onButtonClick(): void {
  setValue(props.value)
}
</script>

<template>
  <div
    v-if="props.variant === 'button'"
    data-ds-button
    data-ds-radio
    role="radio"
    :aria-checked="checked ? 'true' : 'false'"
    :aria-label="props.ariaLabel"
    :aria-disabled="resolvedDisabled ? 'true' : undefined"
    :tabindex="resolvedDisabled ? -1 : 0"
    :class="buttonClassName"
    @click="onButtonClick"
    @keydown.space.prevent="onButtonClick"
    @keydown.enter.prevent="onButtonClick"
  >
    <input
      type="radio"
      :checked="checked"
      :disabled="resolvedDisabled"
      :name="resolvedName"
      :value="props.value"
      :required="props.required"
      :form="props.form"
      tabindex="-1"
      aria-hidden="true"
      :style="hiddenInputStyle"
    >

    <slot />
  </div>

  <div
    v-else
    data-ds-radio
    role="radio"
    :aria-checked="checked ? 'true' : 'false'"
    :aria-label="props.ariaLabel"
    :aria-disabled="resolvedDisabled ? 'true' : undefined"
    :tabindex="resolvedDisabled ? -1 : 0"
    class="inline-flex items-center gap-2 select-none focus-visible:outline-none focus-visible:rounded-[8px] focus-visible:shadow-[0_0_0_2px_var(--ring),0_0_0_4px_var(--bg)]"
    :class="rootClassName"
    @click="onButtonClick"
    @keydown.space.prevent="onButtonClick"
    @keydown.enter.prevent="onButtonClick"
  >
    <input
      type="radio"
      :checked="checked"
      :disabled="resolvedDisabled"
      :name="resolvedName"
      :value="props.value"
      :required="props.required"
      :form="props.form"
      tabindex="-1"
      aria-hidden="true"
      :style="hiddenInputStyle"
    >

    <span
      aria-hidden="true"
      class="h-4 w-4 rounded-full border flex items-center justify-center transition-colors duration-150"
      :class="controlClassName"
    >
      <span
        data-ds-radio-dot
        :class="[dsRadioDotBaseClass, dotClassName]"
      />
    </span>

    <span class="text-sm text-[var(--muted-fg)]">
      <slot />
    </span>
  </div>
</template>