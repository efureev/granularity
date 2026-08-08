<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'

import type { ComponentPublicInstance } from 'vue'
import IconLoader from '~icons/lucide/loader-circle'

import {
  grSegmentedIndicatorClass,
  grSegmentedItemClass,
  grSegmentedItemIconClass,
  grSegmentedItemLabelClass,
  grSegmentedItemSpinnerClass,
  grSegmentedRootClass,
  grSegmentedRootStyle,
  type GrSegmentedOption,
  type GrSegmentedSize,
  type GrSegmentedValue,
  type GrSegmentedVariant,
} from './grSegmentedStyles'

type IndicatorGeometry = {
  width: number
  height: number
  x: number
  y: number
}

/**
 * Пропсы публичного GR-примитива «Segmented».
 */
export interface GrSegmentedProps {
  modelValue: GrSegmentedValue
  options: GrSegmentedOption[]
  variant?: GrSegmentedVariant
  size?: GrSegmentedSize
  /** Длительность анимации индикатора в мс. */
  indicatorDuration?: number
  /** Растягивать сегмент на всю ширину контейнера. */
  block?: boolean
  disabled?: boolean
  /** Только для чтения: выбор видно, но он не меняется. */
  readonly?: boolean
  /** Визуальное и ARIA-состояние ошибки. */
  invalid?: boolean
  /** Обязательное поле (`aria-required`). */
  required?: boolean
  /** Имя скрытых radio-inputs для интеграции с нативной формой. */
  name?: string
  ariaLabel?: string
}

const props = withDefaults(
  defineProps<GrSegmentedProps>(),
  {
    variant: undefined,
    size: undefined,
    indicatorDuration: 300,
    block: false,
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
    name: undefined,
    ariaLabel: undefined,
  },
)

// Эффективный размер: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrSegmented' })
const resolvedVariant = useGrComponentProp('GrSegmented', 'variant', () => props.variant, 'pills')

const emit = defineEmits<{
  (e: 'update:modelValue', value: GrSegmentedValue): void
  (e: 'change', value: GrSegmentedValue, option: GrSegmentedOption): void
}>()

// `useId()` стабилен между сервером и клиентом, в отличие от `instance.uid`.
const fallbackName = `gr-segmented-${useId()}`

// Контекст `GrFormField` + общий контракт форм-контрола.
const field = useGrFormFieldContext()
const fieldId = computed(() => field?.id.value)
const describedBy = computed(() => field?.describedById.value)
const labelledBy = computed(() => (props.ariaLabel ? undefined : field?.labelId.value))
const {
  disabled: isDisabled,
  invalid: isInvalid, required: isRequired, readonly: isReadonly } = useGrFormControl(() => props)

const rootRef = ref<HTMLElement | null>(null)

function focus(): void {
  rootRef.value?.querySelector<HTMLElement>('[data-gr-segmented-item][tabindex="0"]')?.focus()
}

function blur(): void {
  rootRef.value?.querySelector<HTMLElement>('[data-gr-segmented-item][tabindex="0"]')?.blur()
}

defineExpose({ focus, blur })
const itemRefs = ref(new Map<string, HTMLElement>())
const indicatorGeometry = ref<IndicatorGeometry | null>(null)
const indicatorReady = ref(false)

let resizeObserver: ResizeObserver | null = null
let observedRoot: HTMLElement | null = null
let observedItem: HTMLElement | null = null
let scheduled = false

const selectedIndex = computed(() => props.options.findIndex(option => option.value === props.modelValue))
const selectedOption = computed(() => props.options[selectedIndex.value] ?? null)
const enabledOptions = computed(() => props.options.filter(option => !resolveOptionDisabled(option)))
const indicatorDuration = computed(() => Math.max(0, Math.round(props.indicatorDuration)))
const rootClassName = computed(() => grSegmentedRootClass({
  variant: resolvedVariant.value,
  block: props.block,
  disabled: isDisabled.value,
}))
const rootStyle = computed<Record<string, string>>(() => ({
  ...grSegmentedRootStyle({
    variant: resolvedVariant.value,
    size: resolvedSize.value,
  }),
  gridTemplateColumns: props.options.length > 0
    ? props.options.map(() => props.block ? 'minmax(0,1fr)' : 'minmax(0,max-content)').join(' ')
    : 'none',
}))
const indicatorClassName = computed(() => grSegmentedIndicatorClass(resolvedVariant.value))
const resolvedName = computed(() => props.name ?? fallbackName)
const hasIndicator = computed(() => selectedIndex.value !== -1 && indicatorGeometry.value !== null)

const indicatorStyle = computed<Record<string, string>>(() => {
  const geometry = indicatorGeometry.value
  if (!geometry) {
    return {
      opacity: '0',
      width: '0px',
      height: '0px',
      transitionDuration: `${indicatorDuration.value}ms`,
      transform: 'translate3d(0px, 0px, 0px)',
    }
  }

  return {
    opacity: indicatorReady.value ? '1' : '0',
    width: `${geometry.width}px`,
    height: `${geometry.height}px`,
    transitionDuration: `${indicatorDuration.value}ms`,
    transform: `translate3d(${geometry.x}px, ${geometry.y}px, 0)`,
  }
})

function getOptionKey(value: GrSegmentedValue): string {
  return String(value)
}

function resolveOptionDisabled(option: GrSegmentedOption): boolean {
  return isDisabled.value || Boolean(option.disabled)
}

/**
 * Занятый сегмент не «недоступен», а работает: нативный `disabled` и
 * `aria-disabled` ему не ставим — состояние несёт `aria-busy`. Но выбор он не
 * принимает, поэтому блокировка считается отдельно от `disabled`.
 */
function isOptionBusy(option: GrSegmentedOption): boolean {
  return Boolean(option.loading)
}

function isOptionBlocked(option: GrSegmentedOption): boolean {
  return resolveOptionDisabled(option) || isOptionBusy(option)
}

function isOptionSelected(option: GrSegmentedOption): boolean {
  return option.value === props.modelValue
}

function isIconOnlyOption(option: GrSegmentedOption): boolean {
  return Boolean(option.icon) && !option.label
}

function isFocusableOption(option: GrSegmentedOption, index: number): boolean {
  if (resolveOptionDisabled(option)) {
    return false
  }

  if (isOptionSelected(option)) {
    return true
  }

  if (selectedIndex.value !== -1) {
    return false
  }

  return enabledOptions.value[0]?.value === props.options[index]?.value
}

function setItemRef(value: GrSegmentedValue, element: Element | ComponentPublicInstance | null): void {
  const key = getOptionKey(value)

  if (!(element instanceof HTMLElement)) {
    itemRefs.value.delete(key)
    return
  }

  itemRefs.value.set(key, element)
}

function isSameGeometry(left: IndicatorGeometry | null, right: IndicatorGeometry | null): boolean {
  if (left === right) {
    return true
  }

  if (!left || !right) {
    return false
  }

  return left.width === right.width
    && left.height === right.height
    && left.x === right.x
    && left.y === right.y
}

function measureIndicator(): void {
  const root = rootRef.value
  const option = selectedOption.value
  if (!root || !option) {
    if (indicatorGeometry.value !== null)
      indicatorGeometry.value = null

    if (indicatorReady.value)
      indicatorReady.value = false

    return
  }

  const selectedItem = itemRefs.value.get(getOptionKey(option.value))
  if (!selectedItem) {
    return
  }

  const rootRect = root.getBoundingClientRect()
  const itemRect = selectedItem.getBoundingClientRect()

  const nextGeometry = {
    width: Math.max(Math.round(itemRect.width), 0),
    height: Math.max(Math.round(itemRect.height), 0),
    x: Math.round(itemRect.left - rootRect.left),
    y: Math.max(Math.round(itemRect.top - rootRect.top) - 1, 0),
  } satisfies IndicatorGeometry

  if (!isSameGeometry(indicatorGeometry.value, nextGeometry)) {
    indicatorGeometry.value = nextGeometry
  }

  const nextReady = nextGeometry.width > 0 && nextGeometry.height > 0
  if (indicatorReady.value !== nextReady) {
    indicatorReady.value = nextReady
  }
}

function refreshObserver(): void {
  if (typeof ResizeObserver === 'undefined') {
    return
  }

  const root = rootRef.value
  const option = selectedOption.value
  const selectedItem = option
    ? itemRefs.value.get(getOptionKey(option.value)) ?? null
    : null

  if (!resizeObserver) {
    resizeObserver = new ResizeObserver(() => scheduleMeasure())
  }

  if (!root) {
    resizeObserver.disconnect()
    observedRoot = null
    observedItem = null
    return
  }

  if (observedRoot === root && observedItem === selectedItem) {
    return
  }

  resizeObserver.disconnect()
  resizeObserver.observe(root)

  if (selectedItem) {
    resizeObserver.observe(selectedItem)
  }

  observedRoot = root
  observedItem = selectedItem
}

function scheduleMeasure(): void {
  if (scheduled) {
    return
  }

  scheduled = true
  void nextTick(() => {
    scheduled = false
    measureIndicator()
    refreshObserver()
  })
}

function emitValue(option: GrSegmentedOption): void {
  // Один guard на все пути: проверяй `readonly` только клавиатура, и клик по
  // сегменту менял бы значение вопреки заявленному контракту.
  if (isReadonly.value || isOptionBlocked(option) || option.value === props.modelValue) {
    return
  }

  emit('update:modelValue', option.value)
  emit('change', option.value, option)
}

function getNextEnabledIndex(startIndex: number, direction: 1 | -1): number {
  if (props.options.length === 0) {
    return -1
  }

  let cursor = startIndex
  for (let step = 0; step < props.options.length; step += 1) {
    cursor = (cursor + direction + props.options.length) % props.options.length
    const option = props.options[cursor]
    if (option && !isOptionBlocked(option)) {
      return cursor
    }
  }

  return -1
}

function focusIndex(index: number): void {
  const option = props.options[index]
  if (!option) {
    return
  }

  itemRefs.value.get(getOptionKey(option.value))?.focus()
}

function onKeydown(event: KeyboardEvent, index: number): void {
  if (isDisabled.value || isReadonly.value) {
    return
  }

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault()
    const nextIndex = getNextEnabledIndex(index, 1)
    if (nextIndex === -1) {
      return
    }

    const option = props.options[nextIndex]
    if (option) {
      emitValue(option)
      focusIndex(nextIndex)
    }
    return
  }

  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault()
    const nextIndex = getNextEnabledIndex(index, -1)
    if (nextIndex === -1) {
      return
    }

    const option = props.options[nextIndex]
    if (option) {
      emitValue(option)
      focusIndex(nextIndex)
    }
    return
  }

  if (event.key === 'Home') {
    event.preventDefault()
    const firstOption = enabledOptions.value[0]
    if (!firstOption) {
      return
    }

    emitValue(firstOption)
    focusIndex(props.options.findIndex(option => option.value === firstOption.value))
    return
  }

  if (event.key === 'End') {
    event.preventDefault()
    const lastOption = enabledOptions.value.at(-1)
    if (!lastOption) {
      return
    }

    emitValue(lastOption)
    focusIndex(props.options.findIndex(option => option.value === lastOption.value))
    return
  }

  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    const option = props.options[index]
    if (option) {
      emitValue(option)
    }
  }
}

watch(() => props.modelValue, () => scheduleMeasure())
watch(() => props.options, () => scheduleMeasure(), { deep: true })
watch(resolvedVariant, () => scheduleMeasure())
watch(resolvedSize, () => scheduleMeasure())
watch(() => props.block, () => scheduleMeasure())

onMounted(() => scheduleMeasure())
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  observedRoot = null
  observedItem = null
})
</script>

<template>
  <div
    :id="fieldId"
    ref="rootRef"
    data-gr-segmented
    :data-variant="resolvedVariant"
    role="radiogroup"
    :aria-label="ariaLabel"
    :aria-labelledby="labelledBy"
    :aria-describedby="describedBy"
    :aria-invalid="isInvalid ? 'true' : undefined"
    :aria-required="isRequired ? 'true' : undefined"
    :aria-readonly="isReadonly ? 'true' : undefined"
    :aria-disabled="isDisabled ? 'true' : undefined"
    :class="rootClassName"
    :style="rootStyle"
  >
    <!-- Значение для нативной формы уходит одним скрытым полем рядом с
         сегментами, а не вложенным в каждый `role="radio"`: роль объявляет своих
         потомков презентационными, и вложенный интерактивный контрол ломает
         виджет для скринридеров (axe: `nested-interactive`). Скрытое поле не
         фокусируется и интерактивным не считается. -->
    <input
      v-if="selectedOption && !resolveOptionDisabled(selectedOption)"
      type="hidden"
      :name="resolvedName"
      :value="String(selectedOption.value)"
    >

    <span
      v-if="hasIndicator"
      data-gr-segmented-indicator
      aria-hidden="true"
      :class="indicatorClassName"
      :style="indicatorStyle"
    />

    <button
      v-for="(option, index) in options"
      :key="option.value"
      :ref="element => setItemRef(option.value, element)"
      data-gr-segmented-item
      :data-value="String(option.value)"
      type="button"
      role="radio"
      :aria-label="option.ariaLabel"
      :aria-checked="isOptionSelected(option) ? 'true' : 'false'"
      :aria-disabled="resolveOptionDisabled(option) ? 'true' : undefined"
      :aria-busy="isOptionBusy(option) ? 'true' : undefined"
      :disabled="resolveOptionDisabled(option)"
      :tabindex="isFocusableOption(option, index) ? 0 : -1"
      :class="grSegmentedItemClass({
        variant: resolvedVariant,
        selected: isOptionSelected(option),
        disabled: resolveOptionDisabled(option),
        iconOnly: isIconOnlyOption(option),
      })"
      @click="emitValue(option)"
      @keydown="onKeydown($event, index)"
    >
      <slot
        :option="option"
        :selected="isOptionSelected(option)"
        :disabled="resolveOptionDisabled(option)"
        :loading="isOptionBusy(option)"
      >
        <!-- Спиннер занимает место иконки: две крутилки рядом читались бы как ошибка. -->
        <IconLoader
          v-if="isOptionBusy(option)"
          data-gr-segmented-spinner
          aria-hidden="true"
          :class="grSegmentedItemSpinnerClass"
        />
        <component
          :is="option.icon"
          v-else-if="option.icon"
          aria-hidden="true"
          :class="grSegmentedItemIconClass"
        />
        <span v-if="option.label" :class="grSegmentedItemLabelClass">
          {{ option.label }}
        </span>
      </slot>
    </button>
  </div>
</template>