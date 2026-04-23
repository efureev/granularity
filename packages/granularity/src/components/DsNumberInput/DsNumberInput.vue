<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue'
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useSlots } from 'vue'

import {
  dsNumberInputInputClass,
  dsNumberInputShellClass,
  type DsNumberInputControlsDirection,
  type DsNumberInputSize,
  type DsNumberInputState,
  type DsNumberInputTextAlign,
} from './dsNumberInputStyles'

defineOptions({
  inheritAttrs: false,
})

const ADDON_PX_BY_SIZE: Record<DsNumberInputSize, number> = {
  xs: 32,
  sm: 36,
  md: 40,
  lg: 48,
}

const BASE_PADDING_X_LEN_BY_SIZE: Record<DsNumberInputSize, string> = {
  xs: '10px',
  sm: '12px',
  md: '12px',
  lg: '16px',
}

function px(n: number): string {
  return `${n}px`
}

export interface DsNumberInputProps {
  /** Значение (строка — контролируем форматирование внутри). */
  modelValue: string
  placeholder?: string
  autocomplete?: string
  inputmode?: InputHTMLAttributes['inputmode']
  disabled?: boolean
  /** Быстрый флаг невалидности; эквивалент `state='danger'` + `aria-invalid`. */
  invalid?: boolean
  state?: DsNumberInputState
  name?: string
  id?: string
  size?: DsNumberInputSize

  textAlign?: DsNumberInputTextAlign

  decimalSeparator?: string
  step?: number
  min?: number
  max?: number
  precision?: number

  /** Показывать кнопки +/-. */
  controls?: boolean
  controlsDirection?: DsNumberInputControlsDirection

  prefixMinWidth?: string
  prefixMaxWidth?: string
  suffixMinWidth?: string
  suffixMaxWidth?: string

  /** i18n-friendly aria-label для кнопки "увеличить". */
  increaseLabel?: string
  /** i18n-friendly aria-label для кнопки "уменьшить". */
  decreaseLabel?: string
}

const props = withDefaults(defineProps<DsNumberInputProps>(), {
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

  increaseLabel: 'Increase',
  decreaseLabel: 'Decrease',
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

const prefixEl = ref<HTMLElement | null>(null)
const suffixEl = ref<HTMLElement | null>(null)

const measuredPrefixWidth = ref<string | undefined>(undefined)
const measuredSuffixWidth = ref<string | undefined>(undefined)

let ro: ResizeObserver | null = null
let scheduled = false

function readWidthPx(el: HTMLElement | null): string | undefined {
  if (!el) return undefined

  const width = Math.ceil(el.getBoundingClientRect().width || 0)
  if (width <= 0) return undefined

  return `${width}px`
}

function measure(): void {
  measuredPrefixWidth.value = hasPrefix.value ? readWidthPx(prefixEl.value) : undefined
  measuredSuffixWidth.value = hasSuffix.value ? readWidthPx(suffixEl.value) : undefined
}

function refreshObserver(): void {
  if (typeof ResizeObserver === 'undefined') return
  if (!ro) ro = new ResizeObserver(() => measure())

  ro.disconnect()
  if (prefixEl.value) ro.observe(prefixEl.value)
  if (suffixEl.value) ro.observe(suffixEl.value)
}

function scheduleMeasure(): void {
  if (scheduled) return
  scheduled = true

  void nextTick(() => {
    scheduled = false
    measure()
    refreshObserver()
  })
}

onMounted(() => scheduleMeasure())
onUpdated(() => scheduleMeasure())
onBeforeUnmount(() => ro?.disconnect())

function addLen(a: string, b: string): string {
  if (a === '0px') return b
  if (b === '0px') return a

  const apx = a.endsWith('px') ? Number(a.slice(0, -2)) : null
  const bpx = b.endsWith('px') ? Number(b.slice(0, -2)) : null

  if (apx !== null && Number.isFinite(apx) && bpx !== null && Number.isFinite(bpx))
    return `${apx + bpx}px`

  return `calc(${a} + ${b})`
}

const prefixLen = computed(() => (hasPrefix.value ? measuredPrefixWidth.value ?? prefixMinWidth.value : '0px'))
const suffixLen = computed(() => (hasSuffix.value ? measuredSuffixWidth.value ?? suffixMinWidth.value : '0px'))

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
  return {
    right: '0px',
    minWidth: suffixMinWidth.value,
    maxWidth: props.suffixMaxWidth,
  }
})

const prefixStyle = computed(() => {
  return {
    minWidth: prefixMinWidth.value,
    maxWidth: props.prefixMaxWidth,
  }
})

const verticalControlsStyle = computed(() => addonStyle('right', suffixLen.value))
const horizontalLeftControlsStyle = computed(() => addonStyle('left', prefixLen.value))
const horizontalRightControlsStyle = computed(() => addonStyle('right', suffixLen.value))

const shellClassName = computed(() => {
  return dsNumberInputShellClass({
    disabled: props.disabled,
    state: props.invalid ? 'danger' : props.state,
  })
})

const inputClassName = computed(() => {
  return dsNumberInputInputClass({
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

  let s = p === undefined ? String(n) : n.toFixed(Math.max(0, p))
  if (sep !== '.') s = s.replace('.', sep)
  return s
}

function onInput(e: Event): void {
  const el = e.target as HTMLInputElement
  const next = sanitize(el.value)
  if (el.value !== next) el.value = next
  emit('update:modelValue', next)
}

function onChange(e: Event): void {
  const el = e.target as HTMLInputElement
  const next = sanitize(el.value)
  if (el.value !== next) el.value = next
  emit('change', next)
}

function stepBy(dir: 1 | -1): void {
  if (props.disabled) return

  const current = toNumber(props.modelValue) ?? 0
  const next = clamp(normalize(current + (props.step ?? 1) * dir))
  const nextStr = format(next)

  emit('update:modelValue', nextStr)
  emit('change', nextStr)
  focus()
}
</script>

<template>
  <div
    data-ds-number-input
    class="relative w-full overflow-hidden rounded-md border bg-[var(--bg)] transition-colors duration-150 focus-within:ring-2 focus-within:ring-[var(--ring)]"
    :class="shellClassName"
  >
    <div
      v-if="$slots.prefix"
      ref="prefixEl"
      data-testid="number-input-prefix"
      data-ds-number-input-prefix
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
      :aria-invalid="invalid ? 'true' : undefined"
      class="w-full bg-transparent text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:placeholder:text-transparent focus:outline-none disabled:cursor-not-allowed"
      :class="inputClassName"
      :style="inputStyle"
      @input="onInput"
      @change="onChange"
    >

    <div
      v-if="$slots.suffix"
      ref="suffixEl"
      data-testid="number-input-suffix"
      data-ds-number-input-suffix
      class="absolute inset-y-0 flex items-center justify-center border-l border-[var(--brd)] px-2 text-[var(--muted-fg)] pointer-events-none select-none truncate"
      :style="suffixStyle"
      aria-hidden="true"
    >
      <slot name="suffix" />
    </div>

    <div
      v-if="hasVerticalControls"
      data-testid="number-input-controls-vertical"
      data-ds-number-input-controls="vertical"
      class="absolute inset-y-0 flex items-center justify-center border-l border-[var(--brd)]"
      :style="verticalControlsStyle"
    >
      <div class="flex flex-col justify-center gap-1">
        <button
          type="button"
          class="h-4 w-7 inline-flex items-center justify-center rounded text-[10px] text-[var(--muted-fg)] hover:bg-[var(--muted)] active:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="disabled"
          :aria-label="increaseLabel"
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
          :aria-label="decreaseLabel"
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
      data-ds-number-input-controls="horizontal-left"
      class="absolute inset-y-0 flex items-stretch justify-center border-r border-[var(--brd)]"
      :style="horizontalLeftControlsStyle"
    >
      <button
        type="button"
        class="h-full w-full inline-flex items-center justify-center text-[var(--muted-fg)] hover:bg-[var(--muted)] active:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        :disabled="disabled"
        :aria-label="decreaseLabel"
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
      data-ds-number-input-controls="horizontal-right"
      class="absolute inset-y-0 flex items-stretch justify-center border-l border-[var(--brd)]"
      :style="horizontalRightControlsStyle"
    >
      <button
        type="button"
        class="h-full w-full inline-flex items-center justify-center text-[var(--muted-fg)] hover:bg-[var(--muted)] active:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        :disabled="disabled"
        :aria-label="increaseLabel"
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
