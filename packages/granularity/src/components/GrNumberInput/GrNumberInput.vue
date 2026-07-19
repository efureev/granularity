<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue'
import { computed, ref, useSlots } from 'vue'

import {
  grNumberInputInputClass,
  grNumberInputShellClass,
  type GrNumberInputControlsDirection,
  type GrNumberInputSize,
  type GrNumberInputState,
  type GrNumberInputTextAlign,
} from './grNumberInputStyles'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import { addLen, useAddonMeasurement } from '../../composables/internal/useAddonMeasurement'

defineOptions({
  inheritAttrs: false,
})

const ADDON_PX_BY_SIZE: Record<GrNumberInputSize, number> = {
  xs: 32,
  sm: 36,
  md: 40,
  lg: 48,
}

const BASE_PADDING_X_LEN_BY_SIZE: Record<GrNumberInputSize, string> = {
  xs: '10px',
  sm: '12px',
  md: '12px',
  lg: '16px',
}

function px(n: number): string {
  return `${n}px`
}

export interface GrNumberInputProps {
  /** Значение (строка — контролируем форматирование внутри). */
  modelValue: string
  placeholder?: string
  autocomplete?: string
  inputmode?: InputHTMLAttributes['inputmode']
  disabled?: boolean
  /** Быстрый флаг невалидности; эквивалент `state='danger'` + `aria-invalid`. */
  invalid?: boolean
  state?: GrNumberInputState
  name?: string
  id?: string
  size?: GrNumberInputSize

  textAlign?: GrNumberInputTextAlign

  decimalSeparator?: string
  step?: number
  min?: number
  max?: number
  precision?: number

  /** Показывать кнопки +/-. */
  controls?: boolean
  controlsDirection?: GrNumberInputControlsDirection

  prefixMinWidth?: string
  prefixMaxWidth?: string
  suffixMinWidth?: string
  suffixMaxWidth?: string
  /**
   * Фиксированная ширина у prefix/suffix: жёсткая ширина (из `*MaxWidth` →
   * `*MinWidth` → дефолт) + обрезка контента по краю (prefix — справа,
   * suffix — слева). По умолчанию аддоны растягиваются под контент.
   */
  prefixFixed?: boolean
  suffixFixed?: boolean

  /** i18n-friendly aria-label для кнопки "увеличить". */
  increaseLabel?: string
  /** i18n-friendly aria-label для кнопки "уменьшить". */
  decreaseLabel?: string
}

const props = withDefaults(defineProps<GrNumberInputProps>(), {
  placeholder: undefined,
  autocomplete: undefined,
  inputmode: 'decimal',
  disabled: false,
  invalid: false,
  state: 'default',
  name: undefined,
  id: undefined,
  size: 'md',

  textAlign: 'left',

  decimalSeparator: '.',
  step: 1,
  min: undefined,
  max: undefined,
  precision: undefined,

  controls: false,
  controlsDirection: 'vertical',

  prefixMinWidth: undefined,
  prefixMaxWidth: undefined,
  suffixMinWidth: undefined,
  suffixMaxWidth: undefined,
  prefixFixed: false,
  suffixFixed: false,

  increaseLabel: undefined,
  decreaseLabel: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const inputEl = ref<HTMLInputElement | null>(null)

function focus(): void {
  inputEl.value?.focus()
}

defineExpose({
  focus,
})

const slots = useSlots()

const { t } = useGranularityTranslations()
const resolvedIncreaseLabel = computed(() => props.increaseLabel ?? t('gr.numberInput.increase', 'Increase'))
const resolvedDecreaseLabel = computed(() => props.decreaseLabel ?? t('gr.numberInput.decrease', 'Decrease'))

const hasPrefix = computed(() => Boolean(slots.prefix))
const hasSuffix = computed(() => Boolean(slots.suffix))

const hasHorizontalControls = computed(() => props.controls && props.controlsDirection === 'horizontal')
const hasVerticalControls = computed(() => props.controls && props.controlsDirection === 'vertical')

const addonPx = computed(() => ADDON_PX_BY_SIZE[props.size])
const addonLen = computed(() => px(addonPx.value))
const basePaddingXLen = computed(() => BASE_PADDING_X_LEN_BY_SIZE[props.size])

const defaultAddonMinWidth = computed(() => addonLen.value)
const prefixMinWidth = computed(() => props.prefixMinWidth ?? defaultAddonMinWidth.value)
const suffixMinWidth = computed(() => props.suffixMinWidth ?? defaultAddonMinWidth.value)

// Жёсткая ширина для fixed-режима: max → min → дефолт.
const prefixFixedWidth = computed(() => props.prefixMaxWidth ?? props.prefixMinWidth ?? defaultAddonMinWidth.value)
const suffixFixedWidth = computed(() => props.suffixMaxWidth ?? props.suffixMinWidth ?? defaultAddonMinWidth.value)

const { prefixEl, suffixEl, measuredPrefixWidth, measuredSuffixWidth } = useAddonMeasurement(hasPrefix, hasSuffix)

const prefixLen = computed(() => {
  if (!hasPrefix.value) return '0px'
  return props.prefixFixed ? prefixFixedWidth.value : measuredPrefixWidth.value ?? prefixMinWidth.value
})
const suffixLen = computed(() => {
  if (!hasSuffix.value) return '0px'
  return props.suffixFixed ? suffixFixedWidth.value : measuredSuffixWidth.value ?? suffixMinWidth.value
})

function addonStyle(side: 'left' | 'right', offset: string): Record<string, string> {
  return {
    width: addonLen.value,
    [side]: offset,
  }
}

const inputStyle = computed(() => {
  const leftControls = hasHorizontalControls.value ? addonLen.value : '0px'
  const rightControlsCount = (hasHorizontalControls.value ? 1 : 0) + (hasVerticalControls.value ? 1 : 0)
  const rightControls = rightControlsCount > 0 ? px(addonPx.value * rightControlsCount) : '0px'

  const leftReserved = addLen(prefixLen.value, leftControls)
  const rightReserved = addLen(suffixLen.value, rightControls)

  const left = hasPrefix.value || hasHorizontalControls.value ? addLen(leftReserved, basePaddingXLen.value) : undefined
  const right = hasSuffix.value || rightControlsCount > 0 ? addLen(rightReserved, basePaddingXLen.value) : undefined

  return {
    paddingLeft: left,
    paddingRight: right,
  } as Record<string, string | undefined>
})

const suffixStyle = computed(() => {
  if (props.suffixFixed) {
    return {
      right: '0px',
      width: suffixFixedWidth.value,
      minWidth: suffixFixedWidth.value,
      maxWidth: suffixFixedWidth.value,
    }
  }

  return {
    right: '0px',
    minWidth: suffixMinWidth.value,
    maxWidth: props.suffixMaxWidth,
  }
})

const prefixStyle = computed(() => {
  if (props.prefixFixed) {
    return {
      width: prefixFixedWidth.value,
      minWidth: prefixFixedWidth.value,
      maxWidth: prefixFixedWidth.value,
    }
  }

  return {
    minWidth: prefixMinWidth.value,
    maxWidth: props.prefixMaxWidth,
  }
})

const verticalControlsStyle = computed(() => addonStyle('right', suffixLen.value))
const horizontalLeftControlsStyle = computed(() => addonStyle('left', prefixLen.value))
const horizontalRightControlsStyle = computed(() => addonStyle('right', suffixLen.value))

const shellClassName = computed(() => {
  return grNumberInputShellClass({
    disabled: props.disabled,
    state: props.invalid ? 'danger' : props.state,
  })
})

const inputClassName = computed(() => {
  return grNumberInputInputClass({
    size: props.size,
    textAlign: props.textAlign,
  })
})

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9'
}

function sanitize(raw: string): string {
  const sep = props.decimalSeparator || '.'

  let out = ''
  let hasSepLocal = false

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]

    // Ведущий минус: разрешаем один в начале, чтобы можно было ввести
    // отрицательное значение с клавиатуры (границы проверит `clamp` на change).
    if (ch === '-' && out.length === 0) {
      out += '-'
      continue
    }

    if (isDigit(ch)) {
      out += ch
      continue
    }

    if ((ch === sep || ch === '.' || ch === ',') && !hasSepLocal) {
      out += sep
      hasSepLocal = true
    }
  }

  return out
}

function toNumber(value: string): number | null {
  if (value.trim() === '') return null
  const sep = props.decimalSeparator || '.'
  const normalized = sep === '.' ? value : value.replace(sep, '.')
  const n = Number(normalized)
  if (!Number.isFinite(n)) return null
  return n
}

function clamp(v: number): number {
  if (props.min !== undefined) v = Math.max(props.min, v)
  if (props.max !== undefined) v = Math.min(props.max, v)
  return v
}

function normalize(v: number): number {
  if (props.precision === undefined) return v
  const p = Math.max(0, props.precision)
  return Number(v.toFixed(p))
}

function format(n: number): string {
  const sep = props.decimalSeparator || '.'
  const p = props.precision

  // Без `precision` избегаем экспоненциальной записи (`String(1e21)` → `"1e+21"`),
  // форматируя через `Intl` без группировки разрядов.
  let s = p === undefined
    ? n.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 20 })
    : n.toFixed(Math.max(0, p))
  if (sep !== '.') s = s.replace('.', sep)
  return s
}

function onInput(e: Event): void {
  const el = e.target as HTMLInputElement
  const raw = el.value
  const next = sanitize(raw)

  if (raw !== next) {
    // Сохраняем позицию каретки: считаем, сколько валидных символов было ДО
    // каретки, и ставим её после стольких же в очищенной строке — иначе при
    // редактировании середины числа каретка прыгала в конец.
    const caret = el.selectionStart ?? raw.length
    const keptBefore = sanitize(raw.slice(0, caret)).length
    el.value = next
    el.setSelectionRange(keptBefore, keptBefore)
  }

  emit('update:modelValue', next)
}

function commit(el: HTMLInputElement): void {
  const num = toNumber(sanitize(el.value))
  // Пустое значение (или незавершённый ввод `-`) оставляем как есть.
  const next = num === null ? sanitize(el.value) : format(clamp(normalize(num)))

  if (el.value !== next) el.value = next
  if (next !== props.modelValue) emit('update:modelValue', next)
  emit('change', next)
}

function onChange(e: Event): void {
  // Клампинг границ (`min`/`max`) и нормализация — на `change`/`blur`, а не только
  // в кнопках: раньше ручной ввод «999» при `max=10` оставался невалидным.
  commit(e.target as HTMLInputElement)
}

function setValue(n: number): void {
  const nextStr = format(clamp(normalize(n)))
  emit('update:modelValue', nextStr)
  emit('change', nextStr)
}

function stepBy(dir: 1 | -1): void {
  if (props.disabled) return

  const current = toNumber(props.modelValue) ?? 0
  setValue(current + (props.step ?? 1) * dir)
  focus()
}

// Клавиатура спинбаттона (WAI-ARIA spinbutton): стрелки шагают, Home/End —
// к границам `min`/`max` (если заданы).
function onKeydown(e: KeyboardEvent): void {
  if (props.disabled) return

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault()
      stepBy(1)
      break
    case 'ArrowDown':
      e.preventDefault()
      stepBy(-1)
      break
    case 'Home':
      if (props.min !== undefined) {
        e.preventDefault()
        setValue(props.min)
      }
      break
    case 'End':
      if (props.max !== undefined) {
        e.preventDefault()
        setValue(props.max)
      }
      break
  }
}

// `aria-valuenow` — числовое значение для скринридеров; отсутствует, если поле пусто.
const ariaValueNow = computed(() => toNumber(props.modelValue) ?? undefined)
</script>

<template>
  <div
    data-gr-number-input
    class="relative w-full overflow-hidden rounded-md border bg-[var(--bg)] transition-colors duration-150 focus-within:ring-2 focus-within:ring-[var(--ring)]"
    :class="shellClassName"
  >
    <div
      v-if="$slots.prefix"
      ref="prefixEl"
      data-testid="number-input-prefix"
      data-gr-number-input-prefix
      class="absolute inset-y-0 left-0 flex items-center justify-center border-r border-[var(--brd)] px-2 text-[var(--muted-fg)] pointer-events-none select-none truncate"
      :style="prefixStyle"
      aria-hidden="true"
    >
      <slot name="prefix" />
    </div>

    <input
      :id="id"
      ref="inputEl"
      v-bind="$attrs"
      :name="name"
      type="text"
      :inputmode="inputmode"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :disabled="disabled"
      :value="modelValue"
      role="spinbutton"
      :aria-valuenow="ariaValueNow"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-invalid="invalid ? 'true' : undefined"
      class="w-full bg-transparent text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:placeholder:text-transparent focus:outline-none disabled:cursor-not-allowed"
      :class="inputClassName"
      :style="inputStyle"
      @input="onInput"
      @change="onChange"
      @keydown="onKeydown"
    >

    <div
      v-if="$slots.suffix"
      ref="suffixEl"
      data-testid="number-input-suffix"
      data-gr-number-input-suffix
      class="absolute inset-y-0 flex items-center justify-center border-l border-[var(--brd)] px-2 text-[var(--muted-fg)] pointer-events-none select-none truncate"
      :class="suffixFixed ? '[direction:rtl]' : ''"
      :style="suffixStyle"
      aria-hidden="true"
    >
      <slot name="suffix" />
    </div>

    <div
      v-if="hasVerticalControls"
      data-testid="number-input-controls-vertical"
      data-gr-number-input-controls="vertical"
      class="absolute inset-y-0 flex items-center justify-center border-l border-[var(--brd)]"
      :style="verticalControlsStyle"
    >
      <div class="flex flex-col justify-center gap-1">
        <button
          type="button"
          class="h-4 w-7 inline-flex items-center justify-center rounded text-[10px] text-[var(--muted-fg)] hover:bg-[var(--muted)] active:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="disabled"
          :aria-label="resolvedIncreaseLabel"
          @mousedown.prevent
          @click="stepBy(1)"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M7 14l5-5 5 5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          class="h-4 w-7 inline-flex items-center justify-center rounded text-[10px] text-[var(--muted-fg)] hover:bg-[var(--muted)] active:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="disabled"
          :aria-label="resolvedDecreaseLabel"
          @mousedown.prevent
          @click="stepBy(-1)"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M7 10l5 5 5-5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <div
      v-if="hasHorizontalControls"
      data-testid="number-input-controls-horizontal-left"
      data-gr-number-input-controls="horizontal-left"
      class="absolute inset-y-0 flex items-stretch justify-center border-r border-[var(--brd)]"
      :style="horizontalLeftControlsStyle"
    >
      <button
        type="button"
        class="h-full w-full inline-flex items-center justify-center text-[var(--muted-fg)] hover:bg-[var(--muted)] active:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        :disabled="disabled"
        :aria-label="resolvedDecreaseLabel"
        @mousedown.prevent
        @click="stepBy(-1)"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M14 7l-5 5 5 5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <div
      v-if="hasHorizontalControls"
      data-testid="number-input-controls-horizontal-right"
      data-gr-number-input-controls="horizontal-right"
      class="absolute inset-y-0 flex items-stretch justify-center border-l border-[var(--brd)]"
      :style="horizontalRightControlsStyle"
    >
      <button
        type="button"
        class="h-full w-full inline-flex items-center justify-center text-[var(--muted-fg)] hover:bg-[var(--muted)] active:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        :disabled="disabled"
        :aria-label="resolvedIncreaseLabel"
        @mousedown.prevent
        @click="stepBy(1)"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M10 7l5 5-5 5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
