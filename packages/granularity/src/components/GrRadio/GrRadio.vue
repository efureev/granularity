<script setup lang="ts">
import { computed, inject, nextTick, onUnmounted, ref } from 'vue'

import { useGrComponentSize } from '../GrConfigProvider/context'

import type { GrButtonSize, GrButtonTone, GrButtonVariant } from '../GrButton'

import {
  grRadioButtonClass,
  grRadioControlClass,
  grRadioDotBaseClass,
  grRadioDotClass,
  grRadioRootClass,
  type GrRadioVariant,
} from './grRadioStyles'
import { GR_RADIO_GROUP_CONTEXT } from './grRadioGroupContext'

/**
 * GrRadio — одиночный элемент группы выбора.
 *
 * Может работать автономно (через `v-model`) либо внутри `GrRadioGroup`
 * (тогда `modelValue`/`disabled`/`size`/`name` приходят через `inject`).
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
  value: string
  modelValue?: string
  disabled?: boolean
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

const props = withDefaults(defineProps<GrRadioProps>(), {
  modelValue: undefined,
  disabled: undefined,
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

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

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

// Нативная форма получает значение только от выбранного и не-disabled элемента —
// ровно как поступил бы native radio. Без `name` отправлять нечего.
const submitsValue = computed(
  () => checked.value && !resolvedDisabled.value && Boolean(resolvedName.value),
)

const buttonClassName = computed(() => {
  return grRadioButtonClass({
    checked: checked.value,
    disabled: resolvedDisabled.value,
    size: resolvedSize.value,
    buttonVariant: props.buttonVariant,
    buttonTone: props.buttonTone,
    selectedButtonVariant: props.selectedButtonVariant,
    selectedButtonTone: props.selectedButtonTone,
  })
})

const rootClassName = computed(() => grRadioRootClass(resolvedDisabled.value))
const controlClassName = computed(() => grRadioControlClass(checked.value))
const dotClassName = computed(() => grRadioDotClass(checked.value))

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

// Паттерн radiogroup: группа — одна остановка Tab, внутрь попадают стрелками.
// Вне группы (одиночный `GrRadio`) переключатель остаётся обычной остановкой.
const rovingTabindex = computed(() => {
  if (resolvedDisabled.value) return -1
  if (!group) return 0
  return group.rovingValue.value === props.value ? 0 : -1
})

const rootEl = ref<HTMLElement | null>(null)

function onArrow(direction: 1 | -1, event: KeyboardEvent): void {
  if (!group || resolvedDisabled.value) return

  event.preventDefault()
  const next = group.moveSelection(props.value, direction)
  if (next === undefined) return

  // Фокус переезжает вслед за выбором — иначе следующая стрелка отсчитывалась бы
  // от прежнего элемента.
  void nextTick(() => {
    rootEl.value
      ?.closest('[data-gr-radio-group]')
      ?.querySelector<HTMLElement>(`[data-gr-radio][data-value="${next}"]`)
      ?.focus()
  })
}

const unregister = group?.register({
  value: () => props.value,
  disabled: () => resolvedDisabled.value,
})

onUnmounted(() => unregister?.())
</script>

<template>
  <div
    v-if="variant === 'button'"
    ref="rootEl"
    :id="id"
    data-gr-button
    data-gr-radio
    role="radio"
    :aria-checked="checked ? 'true' : 'false'"
    :aria-label="ariaLabel"
    :aria-disabled="resolvedDisabled ? 'true' : undefined"
    :aria-required="required ? 'true' : undefined"
    :data-value="value"
    :tabindex="rovingTabindex"
    :class="buttonClassName"
    @click="onButtonClick"
    @keydown.space.prevent="onButtonClick"
    @keydown.enter.prevent="onButtonClick"
    @keydown.down="onArrow(1, $event)"
    @keydown.right="onArrow(1, $event)"
    @keydown.up="onArrow(-1, $event)"
    @keydown.left="onArrow(-1, $event)"
  >
    <input
      v-if="submitsValue"
      type="hidden"
      :name="resolvedName"
      :value="value"
      :form="form"
    >

    <slot />
  </div>

  <div
    v-else
    ref="rootEl"
    :id="id"
    data-gr-radio
    role="radio"
    :aria-checked="checked ? 'true' : 'false'"
    :aria-label="ariaLabel"
    :aria-disabled="resolvedDisabled ? 'true' : undefined"
    :aria-required="required ? 'true' : undefined"
    :data-value="value"
    :tabindex="rovingTabindex"
    class="inline-flex items-center gap-2 select-none focus-visible:outline-none focus-visible:rounded-[8px] focus-visible:shadow-[0_0_0_2px_var(--gr-ring),0_0_0_4px_var(--gr-bg)]"
    :class="rootClassName"
    @click="onButtonClick"
    @keydown.space.prevent="onButtonClick"
    @keydown.enter.prevent="onButtonClick"
    @keydown.down="onArrow(1, $event)"
    @keydown.right="onArrow(1, $event)"
    @keydown.up="onArrow(-1, $event)"
    @keydown.left="onArrow(-1, $event)"
  >
    <input
      v-if="submitsValue"
      type="hidden"
      :name="resolvedName"
      :value="value"
      :form="form"
    >

    <span
      data-gr-radio-control
      aria-hidden="true"
      class="h-4 w-4 rounded-full border flex items-center justify-center transition-colors duration-150"
      :class="controlClassName"
    >
      <span
        data-gr-radio-dot
        :class="[grRadioDotBaseClass, dotClassName]"
      />
    </span>

    <span class="text-sm text-[var(--gr-muted-fg)]">
      <slot />
    </span>
  </div>
</template>
