<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

import { useGrFormFieldContext } from '../GrFormField/context'

import {
  sliderFillClass,
  sliderMarkLabelClass,
  sliderMarkTickClass,
  sliderRailClass,
  sliderRootClass,
  sliderThumbClass,
  sliderTooltipClass,
  sliderTrackHeightBySize,
  type GrSliderMarks,
  type GrSliderModelValue,
  type GrSliderSize,
} from './grSliderStyles'

export type {
  GrSliderMarks,
  GrSliderModelValue,
  GrSliderSize,
} from './grSliderStyles'

/**
 * Публичный GR-примитив «Slider» (WAI-ARIA slider pattern).
 *
 * Поддерживает одиночное значение и диапазон (`range` — два бегунка), шаг, метки
 * делений, всплывающее значение (tooltip), полную клавиатурную навигацию
 * (стрелки / PageUp/Down / Home / End) и `role="slider"` с
 * `aria-valuemin`/`max`/`now` на каждом бегунке.
 */
export interface GrSliderProps {
  /** `number` — одиночное значение; `[lo, hi]` — диапазон (при `range=true`). */
  modelValue: GrSliderModelValue
  min?: number
  max?: number
  step?: number
  /** Диапазон с двумя бегунками; модель — кортеж `[lo, hi]`. */
  range?: boolean
  disabled?: boolean
  size?: GrSliderSize
  /** Метки делений: `{ [value]: label }` или массив значений. */
  marks?: GrSliderMarks
  /** Всплывающее значение над бегунком: `true`/`'hover'` — при hover/drag/focus, `'always'` — всегда. */
  showTooltip?: boolean | 'always' | 'hover'
  /** Форматирование значения в tooltip. */
  formatTooltip?: (value: number) => string
  ariaLabel?: string
}

const props = withDefaults(
  defineProps<GrSliderProps>(),
  {
    min: 0,
    max: 100,
    step: 1,
    range: false,
    disabled: false,
    size: 'md',
    marks: undefined,
    showTooltip: false,
    formatTooltip: undefined,
    ariaLabel: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: GrSliderModelValue): void
  /** Значение зафиксировано (отпущен бегунок / клавиша). */
  (e: 'change', value: GrSliderModelValue): void
}>()

// Контекст `GrFormField`: id/aria-describedby/invalid/required как fallback.
const field = useGrFormFieldContext()
const resolvedId = computed(() => field?.id.value)
const isInvalid = computed(() => Boolean(field?.invalid.value))
const describedBy = computed(() => field?.describedById.value)
const isRequired = computed(() => Boolean(field?.required.value))

const trackEl = ref<HTMLElement | null>(null)
const thumbEls = ref<HTMLElement[]>([])

// Нормализованные границы (гард от max<=min).
const span = computed(() => (props.max > props.min ? props.max - props.min : 1))

const stepDecimals = computed(() => {
  const s = String(props.step)
  const dot = s.indexOf('.')
  return dot >= 0 ? s.length - dot - 1 : 0
})

function clamp(value: number): number {
  return Math.min(props.max, Math.max(props.min, value))
}

function snap(value: number): number {
  const stepped = Math.round((value - props.min) / props.step) * props.step + props.min
  return Number(clamp(stepped).toFixed(stepDecimals.value))
}

function percent(value: number): number {
  return ((clamp(value) - props.min) / span.value) * 100
}

// ————— Значения бегунков как массив (single = один бегунок).
const values = computed<number[]>(() => {
  if (props.range) {
    const v = Array.isArray(props.modelValue) ? props.modelValue : [props.min, props.min]
    return [snap(v[0] ?? props.min), snap(v[1] ?? props.min)]
  }
  const v = Array.isArray(props.modelValue) ? (props.modelValue[0] ?? props.min) : props.modelValue
  return [snap(v)]
})

const fillStyle = computed(() => {
  if (props.range) {
    const lo = Math.min(percent(values.value[0]), percent(values.value[1]))
    const hi = Math.max(percent(values.value[0]), percent(values.value[1]))
    return { left: `${lo}%`, right: `${100 - hi}%` }
  }
  return { left: '0%', right: `${100 - percent(values.value[0])}%` }
})

// ————— Метки делений.
type SliderMark = { value: number, label: string }
const normalizedMarks = computed<SliderMark[]>(() => {
  if (!props.marks) return []
  if (Array.isArray(props.marks)) return props.marks.map(v => ({ value: v, label: String(v) }))
  return Object.entries(props.marks).map(([value, label]) => ({ value: Number(value), label }))
})

function tooltipText(value: number): string {
  return props.formatTooltip ? props.formatTooltip(value) : String(value)
}

// ————— Обновление значения конкретного бегунка.
function emitValue(next: number[], commit: boolean): void {
  const payload: GrSliderModelValue = props.range ? [next[0], next[1]] : next[0]
  emit('update:modelValue', payload)
  if (commit) emit('change', payload)
}

function setThumb(index: number, value: number, commit: boolean): void {
  const next = values.value.slice()
  next[index] = snap(value)

  // range: не даём бегункам «перепрыгнуть» друг друга.
  if (props.range) {
    if (index === 0) next[0] = Math.min(next[0], next[1])
    else next[1] = Math.max(next[1], next[0])
  }

  emitValue(next, commit)
}

// ————— Pointer-драг.
const activeThumb = ref<number | null>(null)
const hoveredThumb = ref<number | null>(null)

function valueFromClientX(clientX: number): number {
  const rect = trackEl.value?.getBoundingClientRect()
  if (!rect || rect.width === 0) return props.min
  const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  return props.min + ratio * span.value
}

function nearestThumb(value: number): number {
  if (!props.range) return 0
  return Math.abs(value - values.value[0]) <= Math.abs(value - values.value[1]) ? 0 : 1
}

function onTrackPointerDown(event: PointerEvent): void {
  if (props.disabled) return
  const value = valueFromClientX(event.clientX)
  const index = nearestThumb(value)
  activeThumb.value = index
  // Фокусируем активный бегунок сразу — чтобы клавиатура работала после клика по
  // дорожке (div не получает фокус по клику автоматически, только через `.focus()`).
  thumbEls.value[index]?.focus()
  setThumb(index, value, false)

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
}

function onPointerMove(event: PointerEvent): void {
  if (activeThumb.value === null) return
  event.preventDefault()
  setThumb(activeThumb.value, valueFromClientX(event.clientX), false)
}

function onPointerUp(): void {
  if (activeThumb.value !== null) {
    // Финальный commit значения.
    emitValue(values.value.slice(), true)
  }
  activeThumb.value = null
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})

// ————— Клавиатура.
function bigStep(): number {
  // PageUp/Down: 10 шагов либо 10% диапазона (что крупнее).
  return Math.max(props.step * 10, Math.round((span.value / 10) / props.step) * props.step || props.step)
}

function onThumbKeydown(event: KeyboardEvent, index: number): void {
  if (props.disabled) return
  const current = values.value[index]
  let next: number | null = null

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      next = current + props.step
      break
    case 'ArrowLeft':
    case 'ArrowDown':
      next = current - props.step
      break
    case 'PageUp':
      next = current + bigStep()
      break
    case 'PageDown':
      next = current - bigStep()
      break
    case 'Home':
      next = props.min
      break
    case 'End':
      next = props.max
      break
    default:
      return
  }

  event.preventDefault()
  setThumb(index, next, true)
}

const showTooltipFor = (index: number): boolean => {
  if (props.showTooltip === 'always') return true
  if (!props.showTooltip) return false
  return activeThumb.value === index || hoveredThumb.value === index
}

function thumbAriaLabel(index: number): string | undefined {
  if (props.ariaLabel) return props.range ? `${props.ariaLabel} (${index === 0 ? 'min' : 'max'})` : props.ariaLabel
  return undefined
}
</script>

<template>
  <div
    data-gr-slider
    :class="sliderRootClass({ size, disabled })"
  >
    <div
      ref="trackEl"
      data-gr-slider-track
      class="relative w-full"
      :class="sliderTrackHeightBySize[size]"
      @pointerdown="onTrackPointerDown"
    >
      <div :class="sliderRailClass" />
      <div data-gr-slider-fill :class="sliderFillClass" :style="fillStyle" />

      <!-- Метки делений. -->
      <template v-for="mark in normalizedMarks" :key="mark.value">
        <span
          data-gr-slider-mark
          :class="sliderMarkTickClass"
          :style="{ left: `${percent(mark.value)}%` }"
          aria-hidden="true"
        />
        <span
          data-gr-slider-mark-label
          :class="sliderMarkLabelClass"
          :style="{ left: `${percent(mark.value)}%` }"
        >
          {{ mark.label }}
        </span>
      </template>

      <!-- Бегунки. -->
      <div
        v-for="(value, index) in values"
        :id="index === 0 ? resolvedId : undefined"
        :key="index"
        :ref="(el) => { if (el) thumbEls[index] = el as HTMLElement }"
        data-gr-slider-thumb
        :data-testid="`gr-slider-thumb-${index}`"
        :class="sliderThumbClass({ size, disabled })"
        :style="{ left: `${percent(value)}%` }"
        role="slider"
        :tabindex="disabled ? -1 : 0"
        :aria-valuemin="range && index === 1 ? values[0] : min"
        :aria-valuemax="range && index === 0 ? values[1] : max"
        :aria-valuenow="value"
        :aria-orientation="'horizontal'"
        :aria-label="thumbAriaLabel(index)"
        :aria-disabled="disabled ? 'true' : undefined"
        :aria-invalid="isInvalid ? 'true' : undefined"
        :aria-describedby="index === 0 ? describedBy : undefined"
        :aria-required="isRequired && index === 0 ? 'true' : undefined"
        @keydown="onThumbKeydown($event, index)"
        @mouseenter="hoveredThumb = index"
        @mouseleave="hoveredThumb = null"
        @focus="hoveredThumb = index"
        @blur="hoveredThumb = null"
      >
        <span
          v-if="showTooltipFor(index)"
          data-gr-slider-tooltip
          :class="sliderTooltipClass"
        >
          {{ tooltipText(value) }}
        </span>
      </div>
    </div>
  </div>
</template>
