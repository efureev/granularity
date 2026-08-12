<script setup lang="ts">
import { computed, inject, onUnmounted, ref, useId, useSlots } from 'vue'

import { useGrComponentSize } from '../GrConfigProvider/context'

import type { GrButtonSize, GrButtonTone, GrButtonVariant } from '../GrButton'

import {
  grRadioButtonClass,
  grRadioControlClass,
  grRadioDescriptionSizes,
  grRadioDotBaseClass,
  grRadioDotClass,
  grRadioDotSizes,
  grRadioLabelClassFor,
  grRadioRootClass,
  type GrRadioVariant,
} from './grRadioStyles'
import { GR_RADIO_GROUP_CONTEXT, type GrRadioValue } from './grRadioGroupContext'

export type { GrRadioValue } from './grRadioGroupContext'

/**
 * GrRadio — одиночный элемент группы выбора.
 *
 * Может работать автономно (через `v-model`) либо внутри `GrRadioGroup`
 * (тогда `modelValue`/`disabled`/`size`/`name`/`invalid` приходят через `inject`).
 *
 * @prop value — значение этого элемента, сравнивается с `modelValue` группы.
 * @prop variant — визуальное представление: `radiobox` (круг+dot) или `button` (стиль `GrButton`).
 *
 * Доступным контролом является сам элемент с `role="radio"`: он держит фокус,
 * `aria-checked` и клавиатуру. Внутрь него ничего интерактивного не вкладывается —
 * `role="radio"` объявляет потомков презентационными, и вложенный native `<input>`
 * (даже скрытый и с `tabindex="-1"`) ломает виджет для скринридеров и падает
 * в axe на `nested-interactive`. Для отправки нативной формой рядом рендерится
 * `input[type="hidden"]` — он не фокусируется и не является интерактивным.
 */
export interface GrRadioProps {
  value: GrRadioValue
  modelValue?: GrRadioValue
  disabled?: boolean
  /** Визуальное и ARIA-состояние ошибки. Складывается с `invalid` группы. */
  invalid?: boolean
  name?: string
  required?: boolean
  form?: string
  id?: string
  size?: GrButtonSize
  variant?: GrRadioVariant
  buttonVariant?: GrButtonVariant
  buttonTone?: GrButtonTone
  selectedButtonVariant?: GrButtonVariant
  selectedButtonTone?: GrButtonTone
  ariaLabel?: string
}

export interface GrRadioEmits {
  (e: 'update:modelValue', value: GrRadioValue): void
}

const props = withDefaults(defineProps<GrRadioProps>(), {
  modelValue: undefined,
  disabled: undefined,
  invalid: false,
  name: undefined,
  required: false,
  form: undefined,
  id: undefined,
  size: undefined,
  variant: 'radiobox',
  buttonVariant: 'outline',
  buttonTone: 'neutral',
  selectedButtonVariant: 'primary',
  selectedButtonTone: 'primary',
  ariaLabel: undefined,
})

const emit = defineEmits<GrRadioEmits>()

const slots = useSlots()
const group = inject(GR_RADIO_GROUP_CONTEXT, null)

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

const resolvedReadonly = computed(() => group?.readonly.value ?? false)

// «Или», а не `??`: ошибку может объявить и группа, и сам переключатель.
const resolvedInvalid = computed(() => props.invalid || (group?.invalid.value ?? false))

const resolvedName = computed(() => {
  if (props.name)
    return props.name

  return group?.name.value
})

// Приоритет: локальный проп → размер группы → `GrConfigProvider` → `md`.
// Группа специфичнее конфига, поэтому её значение подаётся как «локальное».
const resolvedSize = useGrComponentSize(
  () => props.size ?? group?.size.value,
  { component: 'GrRadio' },
)

const checked = computed(() => resolvedModelValue.value === props.value)

/** В DOM значение живёт строкой: `data-value` и скрытый input иначе не умеют. */
const domValue = computed(() => String(props.value))

// Нативная форма получает значение только от выбранного и не-disabled элемента —
// ровно как поступил бы native radio. Без `name` отправлять нечего.
const submitsValue = computed(
  () => checked.value && !resolvedDisabled.value && Boolean(resolvedName.value),
)

const descriptionId = useId()
const hasDescription = computed(() => Boolean(slots.description))

const buttonClassName = computed(() => {
  return grRadioButtonClass({
    checked: checked.value,
    disabled: resolvedDisabled.value,
    readonly: resolvedReadonly.value,
    size: resolvedSize.value,
    buttonVariant: props.buttonVariant,
    buttonTone: props.buttonTone,
    selectedButtonVariant: props.selectedButtonVariant,
    selectedButtonTone: props.selectedButtonTone,
  })
})

const rootClassName = computed(() => grRadioRootClass({
  disabled: resolvedDisabled.value,
  readonly: resolvedReadonly.value,
}))
const controlClassName = computed(() => grRadioControlClass({
  size: resolvedSize.value,
  checked: checked.value,
  disabled: resolvedDisabled.value,
  invalid: resolvedInvalid.value,
}))
const dotClassName = computed(() => grRadioDotClass({
  checked: checked.value,
  disabled: resolvedDisabled.value,
}))
const labelClassName = computed(() => grRadioLabelClassFor(resolvedSize.value, checked.value))
const dotSizeClassName = computed(() => grRadioDotSizes[resolvedSize.value])
const descriptionClassName = computed(() => grRadioDescriptionSizes[resolvedSize.value])

function setValue(next: GrRadioValue): void {
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

// Паттерн radiogroup: группа — одна остановка Tab, внутрь попадают стрелками.
// Вне группы (одиночный `GrRadio`) переключатель остаётся обычной остановкой.
const rovingTabindex = computed(() => {
  if (resolvedDisabled.value) return -1
  if (!group) return 0
  return group.rovingValue.value === props.value ? 0 : -1
})

const rootEl = ref<HTMLElement | null>(null)

/** Кольцо ведёт группа: только она знает состав и порядок. */
function onKeydown(event: KeyboardEvent): void {
  if (!group || resolvedDisabled.value) return

  group.handleNavigationKeys(event)
}

const unregister = group?.register({
  value: () => props.value,
  disabled: () => resolvedDisabled.value,
  el: () => rootEl.value,
})

onUnmounted(() => unregister?.())
</script>

<template>
  <div
    v-if="variant === 'button'"
    :id="id"
    ref="rootEl"
    data-gr-button
    data-gr-radio
    role="radio"
    :aria-checked="checked ? 'true' : 'false'"
    :aria-label="ariaLabel"
    :aria-disabled="resolvedDisabled ? 'true' : undefined"
    :aria-invalid="resolvedInvalid ? 'true' : undefined"
    :aria-required="required ? 'true' : undefined"
    :data-value="domValue"
    :tabindex="rovingTabindex"
    :class="buttonClassName"
    @click="onButtonClick"
    @keydown.space.prevent="onButtonClick"
    @keydown.enter.prevent="onButtonClick"
    @keydown="onKeydown"
  >
    <input
      v-if="submitsValue"
      type="hidden"
      :name="resolvedName"
      :value="domValue"
      :form="form"
    >

    <slot />
  </div>

  <div
    v-else
    :id="id"
    ref="rootEl"
    data-gr-radio
    role="radio"
    :aria-checked="checked ? 'true' : 'false'"
    :aria-label="ariaLabel"
    :aria-disabled="resolvedDisabled ? 'true' : undefined"
    :aria-invalid="resolvedInvalid ? 'true' : undefined"
    :aria-required="required ? 'true' : undefined"
    :aria-describedby="hasDescription ? descriptionId : undefined"
    :data-value="domValue"
    :tabindex="rovingTabindex"
    class="inline-flex items-start gap-2 select-none focus-visible:outline-none focus-visible:rounded-[var(--gr-radius-md)] focus-visible:shadow-[0_0_0_2px_var(--gr-ring),0_0_0_4px_var(--gr-bg)]"
    :class="rootClassName"
    @click="onButtonClick"
    @keydown.space.prevent="onButtonClick"
    @keydown.enter.prevent="onButtonClick"
    @keydown="onKeydown"
  >
    <input
      v-if="submitsValue"
      type="hidden"
      :name="resolvedName"
      :value="domValue"
      :form="form"
    >

    <span
      data-gr-radio-control
      aria-hidden="true"
      class="mt-0.5 shrink-0 rounded-[var(--gr-radius-full)] border flex items-center justify-center transition-colors duration-[var(--gr-duration-fast)]"
      :class="controlClassName"
    >
      <span
        data-gr-radio-dot
        :class="[grRadioDotBaseClass, dotSizeClassName, dotClassName]"
      />
    </span>

    <span class="grid gap-0.5">
      <span data-gr-radio-label :class="labelClassName">
        <slot />
      </span>

      <span
        v-if="hasDescription"
        :id="descriptionId"
        data-gr-radio-description
        :class="descriptionClassName"
      >
        <slot name="description" />
      </span>
    </span>
  </div>
</template>
