<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useSlots} from 'vue'
import type {InputHTMLAttributes} from 'vue'

defineOptions({
  inheritAttrs: false,
})

export type GrInputSize = 'xs' | 'sm' | 'md' | 'lg'
export type GrInputTextAlign = 'left' | 'center' | 'right'

const props = withDefaults(
    defineProps<{
      modelValue: string
      type?: 'text' | 'email' | 'password' | 'number' | 'search'
      placeholder?: string
      autocomplete?: string
      inputmode?: InputHTMLAttributes['inputmode']
      disabled?: boolean
      invalid?: boolean
      state?: 'default' | 'success' | 'warning' | 'danger'
      name?: string
      id?: string
      size?: GrInputSize

      textAlign?: GrInputTextAlign

      prefixMinWidth?: string
      prefixMaxWidth?: string
      suffixMinWidth?: string
      suffixMaxWidth?: string
    }>(),
    {
      type: 'text',
      placeholder: undefined,
      autocomplete: undefined,
      inputmode: undefined,
      disabled: false,
      invalid: false,
      state: 'default',
      name: undefined,
      id: undefined,
      size: 'md',

      textAlign: 'left',

      prefixMinWidth: undefined,
      prefixMaxWidth: undefined,
      suffixMinWidth: undefined,
      suffixMaxWidth: undefined,
    },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
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

const defaultAddonMinWidth = computed(() => {
  const map: Record<NonNullable<typeof props.size>, string> = {
    xs: '2rem', // w-8
    sm: '2.25rem', // w-9
    md: '2.5rem', // w-10
    lg: '3rem', // w-12
  }

  return map[props.size]
})

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
  // jsdom often reports 0; don't overwrite fallback minWidth in that case.
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

  if (apx !== null && Number.isFinite(apx) && bpx !== null && Number.isFinite(bpx)) {
    return `${apx + bpx}px`
  }

  return `calc(${a} + ${b})`
}

const basePaddingXLen = computed(() => {
  // Must mirror `sizeClass` horizontal padding (px-*) because inline paddings override class paddings.
  const map: Record<NonNullable<typeof props.size>, string> = {
    xs: '10px', // px-2.5
    sm: '12px', // px-3
    md: '12px', // px-3
    lg: '16px', // px-4
  }

  return map[props.size]
})

const inputStyle = computed(() => {
  const leftReserved = hasPrefix.value ? measuredPrefixWidth.value ?? prefixMinWidth.value : '0px'
  const rightReserved = hasSuffix.value ? measuredSuffixWidth.value ?? suffixMinWidth.value : '0px'

  // Keep the same visual text padding as without addons (px-*), but add it on top of reserved space.
  const left = hasPrefix.value ? addLen(leftReserved, basePaddingXLen.value) : undefined
  const right = hasSuffix.value ? addLen(rightReserved, basePaddingXLen.value) : undefined

  return {
    paddingLeft: left,
    paddingRight: right,
  } as Record<string, string | undefined>
})

const prefixStyle = computed(() => {
  return {
    minWidth: prefixMinWidth.value,
    maxWidth: props.prefixMaxWidth,
  } as Record<string, string | undefined>
})

const suffixStyle = computed(() => {
  return {
    minWidth: suffixMinWidth.value,
    maxWidth: props.suffixMaxWidth,
  } as Record<string, string | undefined>
})

const sizeClass = computed(() => {
  const map: Record<NonNullable<typeof props.size>, string> = {
    xs: 'h-7 px-2.5 text-[12px]',
    sm: 'h-8 px-3 text-[13px]',
    md: 'h-10 px-3 text-[14px]',
    lg: 'h-11 px-4 text-[16px]',
  }

  return map[props.size]
})

const textAlignClass = computed(() => {
  const map: Record<NonNullable<typeof props.textAlign>, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return map[props.textAlign]
})

const className = computed(() => {
  const state = props.state

  const borderByState: Record<typeof state, string> = {
    default: 'border-[var(--brd)]',
    success: 'border-[var(--ds-success)] focus-visible:ring-[var(--ds-success)]',
    warning: 'border-[var(--ds-warning)] focus-visible:ring-[var(--ds-warning)]',
    danger: 'border-[var(--ds-danger)] focus-visible:ring-[var(--ds-danger)]',
  }

  return [
    sizeClass.value,
    textAlignClass.value,
    props.invalid ? borderByState.danger : borderByState[state],
  ].join(' ')
})

function onInput(e: Event): void {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="relative w-full">
    <div
        v-if="$slots.prefix"
        ref="prefixEl"
        data-testid="ds-input-prefix"
        class="absolute inset-y-0 left-0 flex items-center justify-center border-r border-[var(--brd)] px-2 text-[var(--muted-fg)] pointer-events-none select-none truncate"
        :style="prefixStyle"
        aria-hidden="true"
    >
      <slot name="prefix"/>
    </div>

    <input
        :id="props.id"
        ref="inputEl"
        v-bind="$attrs"
        :name="props.name"
        :type="props.type"
        :inputmode="props.inputmode"
        :autocomplete="props.autocomplete"
        :placeholder="props.placeholder"
        :disabled="props.disabled"
        :value="props.modelValue"
        :aria-invalid="props.invalid ? 'true' : undefined"
        class="w-full rounded-md border bg-[var(--bg)] text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:placeholder:text-transparent transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-50 disabled:cursor-not-allowed"
        :class="className"
        :style="inputStyle"
        @input="onInput"
    >

    <div
        v-if="$slots.suffix"
        ref="suffixEl"
        data-testid="ds-input-suffix"
        class="absolute inset-y-0 right-0 flex items-center justify-center border-l border-[var(--brd)] px-2 text-[var(--muted-fg)] pointer-events-none select-none truncate"
        :style="suffixStyle"
        aria-hidden="true"
    >
      <slot name="suffix"/>
    </div>
  </div>
</template>
