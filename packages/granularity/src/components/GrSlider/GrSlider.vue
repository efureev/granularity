<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

import { useGrComponentSize } from '../GrConfigProvider/context'

import { useGrFormFieldContext } from '../GrFormField/context'
import { bigStep } from '../shared/numericStep'
import { useDragGesture } from '../../composables/useDragGesture'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useFocusWithin } from '../../composables/internal/useFocusWithin'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import {
  sliderFillClass,
  sliderMarkLabelClassFor,
  sliderMarkTickClass,
  sliderRailClass,
  sliderRootClass,
  sliderThumbClass,
  sliderTooltipClass,
  sliderTrackHeightBySize,
  sliderTrackVerticalLengthClass,
  sliderTrackWidthBySize,
  sliderFillOrientationClass,
  type GrSliderMarks,
  type GrSliderModelValue,
  type GrSliderOrientation,
  type GrSliderSize,
} from './grSliderStyles'

export type {
  GrSliderMarks,
  GrSliderModelValue,
  GrSliderOrientation,
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
  /** Только для чтения: значение видно, но не меняется. */
  readonly?: boolean
  /** Визуальное и ARIA-состояние ошибки. */
  invalid?: boolean
  /** Обязательное поле (`aria-required`). */
  required?: boolean
  size?: GrSliderSize
  /** Метки делений: `{ [value]: label }` или массив значений. */
  marks?: GrSliderMarks
  /** Всплывающее значение над бегунком: `true`/`'hover'` — при hover/drag/focus, `'always'` — всегда. */
  showTooltip?: boolean | 'always' | 'hover'
  /** Форматирование значения в tooltip. Оно же уходит в `aria-valuetext`. */
  formatTooltip?: (value: number) => string
  /** Ориентация дорожки. В вертикальной минимум внизу. */
  orientation?: GrSliderOrientation
  /**
   * Эмитить `update:modelValue` только по завершении жеста: во время
   * перетаскивания значение ведёт сам слайдер. Клавиатура коммитит сразу —
   * нажатие клавиши дискретно, придерживать его нечего.
   */
  lazy?: boolean
  ariaLabel?: string
  /** Имя для нативной формы: hidden input на значение, при `range` — два с одним именем. */
  name?: string
}

export interface GrSliderEmits {
  (e: 'update:modelValue', value: GrSliderModelValue): void
  /** Значение зафиксировано (отпущен бегунок / клавиша). */
  (e: 'change', value: GrSliderModelValue): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(
  defineProps<GrSliderProps>(),
  {
    min: 0,
    max: 100,
    step: 1,
    range: false,
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
    size: undefined,
    marks: undefined,
    showTooltip: false,
    formatTooltip: undefined,
    orientation: 'horizontal',
    lazy: false,
    ariaLabel: undefined,
    name: undefined,
  },
)

const { t } = useGranularityTranslations()

const isVertical = computed(() => props.orientation === 'vertical')

// Эффективный размер: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentSize(() => props.size, {
  component: 'GrSlider',
  supported: ['xs', 'sm', 'md', 'lg'],
})

const emit = defineEmits<GrSliderEmits>()

// Контекст `GrFormField`: id/aria-describedby/invalid/required как fallback.
const field = useGrFormFieldContext()
const resolvedId = computed(() => field?.id.value)
const {
  disabled: isDisabled,
  invalid: isInvalid,
  required: isRequired,
  readonly: isReadonly,
} = useGrFormControl(() => props)
const describedBy = computed(() => field?.describedById.value)

const trackEl = ref<HTMLElement | null>(null)
const rootEl = ref<HTMLElement | null>(null)

// У диапазона два бегунка, и фокус ходит между ними: без границы переход с
// одного на другой давал бы потребителю пару `blur` + `focus`.
const { onFocusIn, onFocusOut } = useFocusWithin(rootEl, {
  enter: event => emit('focus', event),
  leave: event => emit('blur', event),
})

const thumbEls = ref<HTMLElement[]>([])

function focus(): void {
  thumbEls.value[0]?.focus()
}

function blur(): void {
  thumbEls.value[0]?.blur()
}

defineExpose({ focus, blur })

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

// Черновик жеста: при `lazy` значение до отпускания живёт здесь, а наружу не
// уходит — иначе смысл режима теряется.
const draftValues = ref<number[] | null>(null)

// Не доехавшее значение (промах вызова, асинхронный стор) увело бы в `NaN`
// и смещение бегунка, и `aria-valuenow`; нижняя граница — честный старт.
function toFiniteValue(value: number | undefined): number {
  return Number.isFinite(value) ? (value as number) : props.min
}

// ————— Значения бегунков как массив (single = один бегунок).
const modelValues = computed<number[]>(() => {
  if (props.range) {
    const v = Array.isArray(props.modelValue) ? props.modelValue : [props.min, props.min]
    return [snap(toFiniteValue(v[0])), snap(toFiniteValue(v[1]))]
  }
  const v = Array.isArray(props.modelValue) ? props.modelValue[0] : props.modelValue
  return [snap(toFiniteValue(v))]
})

if (__GR_DEV__) {
  watchEffect(() => {
    const missing = props.range
      ? !Array.isArray(props.modelValue)
      : !Number.isFinite(props.modelValue)

    if (missing) {
      console.warn(
        `[granularity] GrSlider: обязательный проп \`modelValue\` должен быть ${props.range ? 'парой чисел' : 'числом'} — получено ${String(props.modelValue)}.`,
      )
    }
  })
}

const values = computed<number[]>(() => draftValues.value ?? modelValues.value)

// `[touch-action:none]` обязателен: без него вертикальный свайп по бегунку
// уходит в скролл страницы, браузер шлёт `pointercancel`, и слайдер пальцем
// неуправляем. Утилиты `touch-none` нет ни в `presetMini`, ни в extra-rules —
// поэтому arbitrary-значение.
const trackClass = computed(() => (isVertical.value
  ? `[touch-action:none] ${sliderTrackWidthBySize[resolvedSize.value]} ${sliderTrackVerticalLengthClass}`
  : `[touch-action:none] w-full ${sliderTrackHeightBySize[resolvedSize.value]}`))

/** Смещение вдоль дорожки: по горизонтали слева, по вертикали снизу. */
function offsetStyle(value: number): Record<string, string> {
  return isVertical.value ? { bottom: `${percent(value)}%` } : { left: `${percent(value)}%` }
}

const fillStyle = computed(() => {
  const start = props.range
    ? Math.min(percent(values.value[0]), percent(values.value[1]))
    : 0
  const end = props.range
    ? Math.max(percent(values.value[0]), percent(values.value[1]))
    : percent(values.value[0])

  return isVertical.value
    ? { bottom: `${start}%`, top: `${100 - end}%` }
    : { left: `${start}%`, right: `${100 - end}%` }
})

// ————— Метки делений.
type SliderMark = { value: number, label: string }
const normalizedMarks = computed<SliderMark[]>(() => {
  if (!props.marks)
    return []
  if (Array.isArray(props.marks))
    return props.marks.map(v => ({ value: v, label: String(v) }))
  return Object.entries(props.marks).map(([value, label]) => ({ value: Number(value), label }))
})

function tooltipText(value: number): string {
  return props.formatTooltip ? props.formatTooltip(value) : String(value)
}

// ————— Обновление значения конкретного бегунка.
function emitValue(next: number[], commit: boolean): void {
  const payload: GrSliderModelValue = props.range ? [next[0], next[1]] : next[0]
  emit('update:modelValue', payload)
  if (commit)
    emit('change', payload)
}

function setThumb(index: number, value: number, commit: boolean): void {
  const next = values.value.slice()
  next[index] = snap(value)

  // range: не даём бегункам «перепрыгнуть» друг друга.
  if (props.range) {
    if (index === 0)
      next[0] = Math.min(next[0], next[1])
    else next[1] = Math.max(next[1], next[0])
  }

  // `lazy` придерживает только непрерывный жест: `commit` приходит от клавиатуры
  // и от отпускания, и там значение уходит наружу как обычно.
  if (props.lazy && !commit) {
    draftValues.value = next
    return
  }

  draftValues.value = null
  emitValue(next, commit)
}

// ————— Pointer-драг.
const activeThumb = ref<number | null>(null)
const hoveredThumb = ref<number | null>(null)

function valueFromPointer(event: { clientX: number, clientY: number }): number {
  const rect = trackEl.value?.getBoundingClientRect()
  if (!rect)
    return props.min

  // В вертикали минимум внизу, поэтому доля отсчитывается от нижнего края.
  const ratio = isVertical.value
    ? (rect.height === 0 ? 0 : 1 - (event.clientY - rect.top) / rect.height)
    : (rect.width === 0 ? 0 : (event.clientX - rect.left) / rect.width)

  return props.min + Math.min(1, Math.max(0, ratio)) * span.value
}

/**
 * Какой бегунок повезёт клик. При равенстве расстояний берём верхний: иначе
 * схлопнувшийся в точку диапазон не развести мышью — нижний бегунок упирается
 * в верхний и оба стоят на месте.
 */
function nearestThumb(value: number): number {
  if (!props.range)
    return 0

  const [lo, hi] = values.value
  if (value < lo)
    return 0
  if (value > hi)
    return 1

  return Math.abs(value - lo) < Math.abs(value - hi) ? 0 : 1
}

function endDrag(commit: boolean): void {
  if (activeThumb.value !== null && commit) {
    // Финальный commit значения: у `lazy` он же и единственный `update:modelValue`.
    const next = values.value.slice()
    draftValues.value = null
    emitValue(next, true)
  }
  // Оборванный жест (`pointercancel`: браузер забрал указатель) значения не
  // коммитит — черновик просто отбрасывается, бегунок возвращается к модели.
  draftValues.value = null
  activeThumb.value = null
}

const drag = useDragGesture({
  disabled: () => isDisabled.value || isReadonly.value,
  onStart: (event) => {
    const value = valueFromPointer(event)
    const index = nearestThumb(value)
    activeThumb.value = index
    // Фокусируем активный бегунок сразу — чтобы клавиатура работала после клика по
    // дорожке (div не получает фокус по клику автоматически, только через `.focus()`).
    thumbEls.value[index]?.focus()
    setThumb(index, value, false)
  },
  onMove: (event) => {
    if (activeThumb.value === null)
      return
    event.preventDefault()
    setThumb(activeThumb.value, valueFromPointer(event), false)
  },
  onEnd: () => endDrag(true),
  onCancel: () => endDrag(false),
})

// ————— Клавиатура.
function keyboardBigStep(): number {
  // Границы передаются от нормализованного размаха, а не от сырых пропов:
  // `span` уже подставил единицу вместо вырожденного `max <= min`.
  return bigStep(props.step, props.min, props.min + span.value)
}

function onThumbKeydown(event: KeyboardEvent, index: number): void {
  if (isDisabled.value || isReadonly.value)
    return
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
      next = current + keyboardBigStep()
      break
    case 'PageDown':
      next = current - keyboardBigStep()
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

function showTooltipFor(index: number): boolean {
  if (props.showTooltip === 'always')
    return true
  if (!props.showTooltip)
    return false
  return activeThumb.value === index || hoveredThumb.value === index
}

function thumbAriaLabel(index: number): string | undefined {
  if (!props.ariaLabel)
    return undefined
  if (!props.range)
    return props.ariaLabel

  const bound = index === 0 ? t('gr.slider.min', 'min') : t('gr.slider.max', 'max')
  return `${props.ariaLabel} (${bound})`
}

// `aria-valuetext` нужен, только когда число само по себе не читается: «1200»
// против «$1 200». Без своего формата атрибут не добавляем.
function thumbValueText(value: number): string | undefined {
  return props.formatTooltip ? props.formatTooltip(value) : undefined
}
</script>

<template>
  <div
    ref="rootEl"
    data-gr-slider
    :data-orientation="orientation"
    :class="sliderRootClass({ size: resolvedSize, disabled: isDisabled, hasMarks: normalizedMarks.length > 0, orientation })"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <!-- Нативная форма: роль-виджет не labelable и в submit не попадает.
         Сериализуется модель (snapped), а не черновик жеста. -->
    <template v-if="name">
      <input
        v-for="(value, index) in modelValues"
        :key="index"
        type="hidden"
        :name="name"
        :value="String(value)"
      >
    </template>
    <div
      ref="trackEl"
      data-gr-slider-track
      class="relative"
      :class="trackClass"
      @pointerdown="drag.start"
    >
      <div :class="sliderRailClass" />
      <div
        data-gr-slider-fill
        :class="[sliderFillClass(isDisabled), sliderFillOrientationClass[orientation]]"
        :style="fillStyle"
      />

      <!-- Метки делений. -->
      <template v-for="mark in normalizedMarks" :key="mark.value">
        <span
          data-gr-slider-mark
          :class="sliderMarkTickClass(orientation)"
          :style="offsetStyle(mark.value)"
          aria-hidden="true"
        />
        <!-- Подпись метки дублирует значение, которое диктор читает с бегунка:
             как отдельный текст внутри слайдера она только мешает. -->
        <span
          data-gr-slider-mark-label
          :class="sliderMarkLabelClassFor(percent(mark.value), { orientation, disabled: isDisabled })"
          :style="offsetStyle(mark.value)"
          aria-hidden="true"
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
        :class="sliderThumbClass({ size: resolvedSize, disabled: isDisabled, orientation })"
        :style="offsetStyle(value)"
        role="slider"
        :tabindex="isDisabled ? -1 : 0"
        :aria-valuemin="range && index === 1 ? values[0] : min"
        :aria-valuemax="range && index === 0 ? values[1] : max"
        :aria-valuenow="value"
        :aria-valuetext="thumbValueText(value)"
        :aria-orientation="orientation"
        :aria-label="thumbAriaLabel(index)"
        :aria-disabled="isDisabled ? 'true' : undefined"
        :aria-invalid="isInvalid ? 'true' : undefined"
        :aria-describedby="index === 0 ? describedBy : undefined"
        :aria-required="isRequired && index === 0 ? 'true' : undefined"
        :aria-readonly="isReadonly ? 'true' : undefined"
        @keydown="onThumbKeydown($event, index)"
        @mouseenter="hoveredThumb = index"
        @mouseleave="hoveredThumb = null"
        @focus="hoveredThumb = index"
        @blur="hoveredThumb = null"
      >
        <span
          v-if="showTooltipFor(index)"
          data-gr-slider-tooltip
          :class="sliderTooltipClass(orientation)"
        >
          {{ tooltipText(value) }}
        </span>
      </div>
    </div>
  </div>
</template>
