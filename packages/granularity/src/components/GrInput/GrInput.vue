<script setup lang="ts">
import {computed, ref, useSlots} from 'vue'

import {addLen, useAddonMeasurement} from '../../composables/internal/useAddonMeasurement'
import {useGrFormFieldContext} from '../GrFormField/context'
import {useGranularityTranslations} from '../../internal/granularityI18n'
import type {InputHTMLAttributes} from 'vue'

import IconX from '~icons/lucide/x'
import IconEye from '~icons/lucide/eye'
import IconEyeOff from '~icons/lucide/eye-off'

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
      /** Только для чтения: значение видно и выделяемо, но не редактируется. */
      readonly?: boolean
      invalid?: boolean
      state?: 'default' | 'success' | 'warning' | 'danger'
      name?: string
      id?: string
      size?: GrInputSize

      /** Показывать кнопку очистки, когда есть значение (и не disabled/readonly). */
      clearable?: boolean
      /** i18n aria-label кнопки очистки. */
      clearLabel?: string
      /** Ограничение длины + основа для счётчика символов. */
      maxlength?: number
      /** Показывать счётчик символов (`len` или `len/maxlength`). */
      showCount?: boolean
      /** Кнопка показать/скрыть пароль (только при `type="password"`). */
      passwordToggle?: boolean
      /** i18n aria-label кнопки показать/скрыть пароль. */
      passwordShowLabel?: string
      passwordHideLabel?: string

      textAlign?: GrInputTextAlign

      prefixMinWidth?: string
      prefixMaxWidth?: string
      suffixMinWidth?: string
      suffixMaxWidth?: string
      /**
       * Фиксированная ширина у prefix/suffix: аддон получает жёсткую ширину
       * (из `*MaxWidth` → `*MinWidth` → дефолт), а контент обрезается по краю
       * (prefix — справа, suffix — слева). По умолчанию аддоны «растягиваются»
       * под контент (в пределах min/max), а излишек клипается оболочкой.
       */
      prefixFixed?: boolean
      suffixFixed?: boolean
    }>(),
    {
      type: 'text',
      placeholder: undefined,
      autocomplete: undefined,
      inputmode: undefined,
      disabled: false,
      readonly: false,
      invalid: false,
      state: 'default',
      name: undefined,
      id: undefined,
      size: 'md',

      clearable: false,
      clearLabel: undefined,
      maxlength: undefined,
      showCount: false,
      passwordToggle: false,
      passwordShowLabel: undefined,
      passwordHideLabel: undefined,

      textAlign: 'left',

      prefixMinWidth: undefined,
      prefixMaxWidth: undefined,
      suffixMinWidth: undefined,
      suffixMaxWidth: undefined,
      prefixFixed: false,
      suffixFixed: false,
    },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// Контекст `GrFormField` (если инпут внутри него): даёт id/aria-describedby/
// invalid/required как fallback, чтобы не прокидывать `forId` вручную.
const field = useGrFormFieldContext()
const resolvedId = computed(() => props.id ?? field?.id.value)
const isInvalid = computed(() => props.invalid || Boolean(field?.invalid.value))
const describedBy = computed(() => field?.describedById.value)
const isRequired = computed(() => Boolean(field?.required.value))

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

// Жёсткая ширина для fixed-режима: max → min → дефолт.
const prefixFixedWidth = computed(() => props.prefixMaxWidth ?? props.prefixMinWidth ?? defaultAddonMinWidth.value)
const suffixFixedWidth = computed(() => props.suffixMaxWidth ?? props.suffixMinWidth ?? defaultAddonMinWidth.value)

const { prefixEl, suffixEl, measuredPrefixWidth, measuredSuffixWidth } = useAddonMeasurement(hasPrefix, hasSuffix)

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
  const leftReserved = hasPrefix.value
    ? (props.prefixFixed ? prefixFixedWidth.value : measuredPrefixWidth.value ?? prefixMinWidth.value)
    : '0px'
  const rightReserved = hasSuffix.value
    ? (props.suffixFixed ? suffixFixedWidth.value : measuredSuffixWidth.value ?? suffixMinWidth.value)
    : '0px'

  // Keep the same visual text padding as without addons (px-*), but add it on top of reserved space.
  const left = hasPrefix.value ? addLen(leftReserved, basePaddingXLen.value) : undefined
  const rightSpace = addLen(rightReserved, trailingReserve.value)
  const right = (hasSuffix.value || trailingCount.value > 0)
    ? addLen(rightSpace, basePaddingXLen.value)
    : undefined

  return {
    paddingLeft: left,
    paddingRight: right,
  } as Record<string, string | undefined>
})

const prefixStyle = computed(() => {
  if (props.prefixFixed) {
    return {
      width: prefixFixedWidth.value,
      minWidth: prefixFixedWidth.value,
      maxWidth: prefixFixedWidth.value,
    } as Record<string, string | undefined>
  }

  return {
    minWidth: prefixMinWidth.value,
    maxWidth: props.prefixMaxWidth,
  } as Record<string, string | undefined>
})

const suffixStyle = computed(() => {
  if (props.suffixFixed) {
    return {
      width: suffixFixedWidth.value,
      minWidth: suffixFixedWidth.value,
      maxWidth: suffixFixedWidth.value,
    } as Record<string, string | undefined>
  }

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

// Border/ring/disabled — на оболочке (`focus-within`), размеры/выравнивание — на инпуте.
const shellClass = computed(() => {
  const state = props.state

  const borderByState: Record<typeof state, string> = {
    default: 'border-[var(--brd)]',
    success: 'border-[var(--gr-success)] focus-within:ring-[var(--gr-success)]',
    warning: 'border-[var(--gr-warning)] focus-within:ring-[var(--gr-warning)]',
    danger: 'border-[var(--gr-danger)] focus-within:ring-[var(--gr-danger)]',
  }

  return [
    isInvalid.value ? borderByState.danger : borderByState[state],
    props.disabled ? 'opacity-50 cursor-not-allowed' : '',
  ].filter(Boolean).join(' ')
})

const className = computed(() => {
  return [
    sizeClass.value,
    textAlignClass.value,
  ].join(' ')
})

function onInput(e: Event): void {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

// ————— Trailing-контролы: очистка, переключатель пароля, счётчик символов.
const { t } = useGranularityTranslations()
const resolvedClearLabel = computed(() => props.clearLabel ?? t('gr.input.clear', 'Clear'))
const resolvedPasswordShowLabel = computed(() => props.passwordShowLabel ?? t('gr.input.showPassword', 'Show password'))
const resolvedPasswordHideLabel = computed(() => props.passwordHideLabel ?? t('gr.input.hidePassword', 'Hide password'))

const passwordVisible = ref(false)
// Тип поля с учётом переключателя пароля.
const resolvedType = computed(() => (props.type === 'password' && passwordVisible.value ? 'text' : props.type))

const showPasswordToggle = computed(() => props.passwordToggle && props.type === 'password' && !props.disabled)
const showClear = computed(() => props.clearable && props.modelValue.length > 0 && !props.disabled && !props.readonly)

const trailingCount = computed(() => (showClear.value ? 1 : 0) + (showPasswordToggle.value ? 1 : 0))
const trailingReserve = computed(() => (trailingCount.value > 0 ? `${trailingCount.value * 28}px` : '0px'))

// Счётчик символов: `len` или `len / maxlength`.
const countText = computed(() =>
  props.maxlength !== undefined ? `${props.modelValue.length} / ${props.maxlength}` : String(props.modelValue.length),
)

function clear(): void {
  emit('update:modelValue', '')
  inputEl.value?.focus()
}

function togglePassword(): void {
  passwordVisible.value = !passwordVisible.value
  inputEl.value?.focus()
}
</script>

<template>
  <div data-gr-input class="w-full">
    <div
        class="relative w-full overflow-hidden rounded-md border bg-[var(--bg)] transition-colors duration-150 focus-within:ring-2 focus-within:ring-[var(--ring)]"
        :class="shellClass"
    >
      <div
          v-if="$slots.prefix"
          ref="prefixEl"
          data-testid="gr-input-prefix"
          class="absolute inset-y-0 left-0 flex items-center justify-center border-r border-[var(--brd)] px-2 text-[var(--muted-fg)] pointer-events-none select-none truncate"
          :style="prefixStyle"
          aria-hidden="true"
      >
        <slot name="prefix" />
      </div>

      <input
          :id="resolvedId"
          ref="inputEl"
          v-bind="$attrs"
          :name="props.name"
          :type="resolvedType"
          :inputmode="props.inputmode"
          :autocomplete="props.autocomplete"
          :placeholder="props.placeholder"
          :disabled="props.disabled"
          :readonly="props.readonly"
          :maxlength="props.maxlength"
          :value="props.modelValue"
          :aria-invalid="isInvalid ? 'true' : undefined"
          :aria-describedby="describedBy"
          :aria-required="isRequired ? 'true' : undefined"
          class="w-full bg-transparent text-[var(--fg)] placeholder:text-[var(--muted-fg)] focus:placeholder:text-transparent focus:outline-none disabled:cursor-not-allowed"
          :class="className"
          :style="inputStyle"
          @input="onInput"
      >

      <div
          v-if="trailingCount > 0"
          data-gr-input-trailing
          class="absolute inset-y-0 right-1 flex items-center gap-0.5"
      >
        <button
            v-if="showClear"
            type="button"
            data-gr-input-clear
            :aria-label="resolvedClearLabel"
            class="flex h-6 w-6 items-center justify-center rounded text-[var(--muted-fg)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            tabindex="-1"
            @click="clear"
        >
          <IconX class="h-4 w-4" aria-hidden="true" />
        </button>

        <button
            v-if="showPasswordToggle"
            type="button"
            data-gr-input-password-toggle
            :aria-label="passwordVisible ? resolvedPasswordHideLabel : resolvedPasswordShowLabel"
            :aria-pressed="passwordVisible ? 'true' : 'false'"
            class="flex h-6 w-6 items-center justify-center rounded text-[var(--muted-fg)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            tabindex="-1"
            @click="togglePassword"
        >
          <IconEyeOff v-if="passwordVisible" class="h-4 w-4" aria-hidden="true" />
          <IconEye v-else class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div
          v-if="$slots.suffix"
          ref="suffixEl"
          data-testid="gr-input-suffix"
          class="absolute inset-y-0 right-0 flex items-center justify-center border-l border-[var(--brd)] px-2 text-[var(--muted-fg)] pointer-events-none select-none truncate"
          :class="suffixFixed ? '[direction:rtl]' : ''"
          :style="suffixStyle"
          aria-hidden="true"
      >
        <slot name="suffix" />
      </div>
    </div>

    <div
        v-if="showCount"
        data-gr-input-count
        class="mt-1 text-right text-xs text-[var(--muted-fg)] tabular-nums"
    >
      {{ countText }}
    </div>
  </div>
</template>
