<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { ComponentPublicInstance } from 'vue'

import {
  dsSegmentedIndicatorClass,
  dsSegmentedItemClass,
  dsSegmentedItemIconClass,
  dsSegmentedItemLabelClass,
  dsSegmentedRootClass,
  dsSegmentedRootStyle,
  type DsSegmentedOption,
  type DsSegmentedSize,
  type DsSegmentedValue,
  type DsSegmentedVariant,
} from './dsSegmentedStyles'

const hiddenInputStyle = {
  position: 'absolute',
  opacity: '0',
  width: '0',
  height: '0',
  pointerEvents: 'none',
} as const

type IndicatorGeometry = {
  width: number
  height: number
  x: number
  y: number
}

const props = withDefaults(
  defineProps<{
    modelValue: DsSegmentedValue
    options: DsSegmentedOption[]
    variant?: DsSegmentedVariant
    size?: DsSegmentedSize
    indicatorDuration?: number
    block?: boolean
    disabled?: boolean
    name?: string
    ariaLabel?: string
  }>(),
  {
    variant: 'pills',
    size: 'md',
    indicatorDuration: 300,
    block: false,
    disabled: false,
    name: undefined,
    ariaLabel: undefined,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: DsSegmentedValue): void
  (event: 'change', value: DsSegmentedValue, option: DsSegmentedOption): void
}>()

const instance = getCurrentInstance()
const fallbackName = `ds-segmented-${instance?.uid ?? Math.random()}`

const rootRef = ref<HTMLElement | null>(null)
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
const rootClassName = computed(() => dsSegmentedRootClass({
  variant: props.variant,
  block: props.block,
  disabled: props.disabled,
}))
const rootStyle = computed<Record<string, string>>(() => ({
  ...dsSegmentedRootStyle({
    variant: props.variant,
    size: props.size,
  }),
  gridTemplateColumns: props.options.length > 0
    ? props.options.map(() => props.block ? 'minmax(0,1fr)' : 'minmax(0,max-content)').join(' ')
    : 'none',
}))
const indicatorClassName = computed(() => dsSegmentedIndicatorClass(props.variant))
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

function getOptionKey(value: DsSegmentedValue): string {
  return String(value)
}

function resolveOptionDisabled(option: DsSegmentedOption): boolean {
  return props.disabled || Boolean(option.disabled)
}

function isOptionSelected(option: DsSegmentedOption): boolean {
  return option.value === props.modelValue
}

function isIconOnlyOption(option: DsSegmentedOption): boolean {
  return Boolean(option.icon) && !option.label
}

function isFocusableOption(option: DsSegmentedOption, index: number): boolean {
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

function setItemRef(value: DsSegmentedValue, element: Element | ComponentPublicInstance | null): void {
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

function emitValue(option: DsSegmentedOption): void {
  if (resolveOptionDisabled(option) || option.value === props.modelValue) {
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
    if (option && !resolveOptionDisabled(option)) {
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
  if (props.disabled) {
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
watch(() => props.variant, () => scheduleMeasure())
watch(() => props.size, () => scheduleMeasure())
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
    ref="rootRef"
    data-ds-segmented
    :data-variant="props.variant"
    role="radiogroup"
    :aria-label="props.ariaLabel"
    :aria-disabled="props.disabled ? 'true' : undefined"
    :class="rootClassName"
    :style="rootStyle"
  >
    <span
      v-if="hasIndicator"
      data-ds-segmented-indicator
      aria-hidden="true"
      :class="indicatorClassName"
      :style="indicatorStyle"
    />

    <button
      v-for="(option, index) in props.options"
      :key="option.value"
      :ref="element => setItemRef(option.value, element)"
      data-ds-segmented-item
      :data-value="String(option.value)"
      type="button"
      role="radio"
      :aria-checked="isOptionSelected(option) ? 'true' : 'false'"
      :aria-disabled="resolveOptionDisabled(option) ? 'true' : undefined"
      :disabled="resolveOptionDisabled(option)"
      :tabindex="isFocusableOption(option, index) ? 0 : -1"
      :class="dsSegmentedItemClass({
        variant: props.variant,
        selected: isOptionSelected(option),
        disabled: resolveOptionDisabled(option),
        iconOnly: isIconOnlyOption(option),
      })"
      @click="emitValue(option)"
      @keydown="onKeydown($event, index)"
    >
      <input
        type="radio"
        tabindex="-1"
        aria-hidden="true"
        :name="resolvedName"
        :value="option.value"
        :checked="isOptionSelected(option)"
        :disabled="resolveOptionDisabled(option)"
        :style="hiddenInputStyle"
      >

      <slot
        :option="option"
        :selected="isOptionSelected(option)"
        :disabled="resolveOptionDisabled(option)"
      >
        <component
          :is="option.icon"
          v-if="option.icon"
          aria-hidden="true"
          :class="dsSegmentedItemIconClass"
        />
        <span v-if="option.label" :class="dsSegmentedItemLabelClass">
          {{ option.label }}
        </span>
      </slot>
    </button>
  </div>
</template>