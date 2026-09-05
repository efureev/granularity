<script setup lang="ts">
import type { GrComponentSize } from '../shared/sizes'
import {
  controlSignalState,
  controlStateFallbackText,
  controlStateIconClass,
  controlStateIconColors,
  controlStateTextKey,
} from '../shared/controlState'
import { computed, ref, useId } from 'vue'

import { useControlAddons } from '../../composables/internal/useControlAddons'
import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import type { InputHTMLAttributes } from 'vue'

import { addonInlinePrefixClass, addonInlineSuffixClass, addonSegmentPrefixClass, addonSegmentSuffixClass, grInputFieldClass, grInputShellClass, paddingX } from './grInputStyles'

import IconLoader from '~icons/lucide/loader-2'
import IconX from '~icons/lucide/x'
import IconCheckCircle from '~icons/lucide/check-circle'
import IconAlertTriangle from '~icons/lucide/alert-triangle'
import IconEye from '~icons/lucide/eye'
import IconEyeOff from '~icons/lucide/eye-off'

export interface GrInputProps {
  /**
     * Значение поля. Необязательное: без `v-model` поле рисуется пустым.
     * Дефолт — пустая строка, а не `undefined`: длина значения читается
     * напрямую (`showClear`), и `undefined` уронил бы рендер.
     */
  modelValue?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'
  placeholder?: string
  autocomplete?: string
  inputmode?: InputHTMLAttributes['inputmode']
  disabled?: boolean
  /** Только для чтения: значение видно и выделяемо, но не редактируется. */
  readonly?: boolean
  invalid?: boolean
  /** Обязательное поле (`aria-required`). Складывается с `required` у `GrFormField`. */
  required?: boolean
  /** Доступное имя вне `GrFormField`. */
  ariaLabel?: string
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
  /**
     * Фоновая работа по полю (проверка занятости логина, автосохранение):
     * спиннер в trailing-области + `aria-busy`. Ввод не блокируется —
     * для этого есть `disabled`/`readonly`.
     */
  loading?: boolean
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
  /**
     * Как выглядят аддоны `#prefix`/`#suffix`.
     *
     * `segment` (по умолчанию) — отдельный отсек, отрезанный рамкой и выровненный
     * по ступени размера: так поле с «₽» и поле с «USD» стоят в колонку.
     * `inline` — украшение внутри рамки: ни разделителя, ни своей ширины.
     *
     * Разница не косметическая. Поисковая строка с лупой в сегменте читается
     * составным элементом — полем с приклеенной кнопкой, — а не одним полем;
     * именно поэтому иконку внутри рамки нельзя было выразить аддоном, и
     * потребители отказывались от неё вовсе.
     */
  addon?: 'segment' | 'inline'
}

export interface GrInputEmits {
  (e: 'update:modelValue', value: string): void
  /** Значение зафиксировано нативным `change` — по `blur` или `Enter`. */
  (e: 'change', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  /**
   * Значение стёрто кнопкой очистки. Отдельное событие потому, что по
   * `update:modelValue` программную очистку от ручного стирания не отличить.
   */
  (e: 'clear'): void
}

defineOptions({
  inheritAttrs: false,
})

export type GrInputSize = GrComponentSize
export type GrInputTextAlign = 'left' | 'center' | 'right'

const props = withDefaults(
  defineProps<GrInputProps>(),
  {
    modelValue: '',
    type: 'text',
    placeholder: undefined,
    autocomplete: undefined,
    inputmode: undefined,
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
    ariaLabel: undefined,
    state: 'default',
    name: undefined,
    id: undefined,
    size: undefined,

    // Настраивается через `GrConfigProvider`; дефолт — в резолвере ниже.
    clearable: undefined,
    clearLabel: undefined,
    maxlength: undefined,
    showCount: false,
    loading: false,
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
    addon: 'segment',
  },
)

const emit = defineEmits<GrInputEmits>()
defineSlots<{
  /** Аддон слева от поля: иконка, код валюты, метка. */
  prefix?: () => any
  /** Аддон справа от поля: единица измерения, подсказка. */
  suffix?: () => any
}>()

// Контекст `GrFormField` (если инпут внутри него): даёт id/aria-describedby/
// invalid/required как fallback, чтобы не прокидывать `forId` вручную.
const field = useGrFormFieldContext()

// Эффективные значения: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrInput' })
const resolvedClearable = useGrComponentProp('GrInput', 'clearable', () => props.clearable, false)

const resolvedId = computed(() => props.id ?? field?.id.value)

// Счётчик обязан быть частью описания поля: иначе «12 / 60» видно глазами, но
// не слышно — при том, что ограничение длины и есть смысл счётчика.
const countId = useId()
const {
  disabled: isDisabled,
  invalid: isInvalid,
  required: isRequired,
  readonly: isReadonly,
} = useGrFormControl(() => props)

const inputEl = ref<HTMLInputElement | null>(null)

function focus(): void {
  inputEl.value?.focus()
}

function blur(): void {
  inputEl.value?.blur()
}

/** Выделить содержимое — спутник `focus()` для «подставили значение, перезапишите». */
function select(): void {
  inputEl.value?.select()
}

defineExpose({
  focus,
  blur,
  select,
})

const ADDON_MIN_WIDTH_BY_SIZE: Record<GrInputSize, string> = {
  xs: '2rem', // w-8
  sm: '2.25rem', // w-9
  md: '2.5rem', // w-10
  lg: '3rem', // w-12
}

const passwordVisible = ref(false)
// Тип поля с учётом переключателя пароля.
const resolvedType = computed(() => (props.type === 'password' && passwordVisible.value ? 'text' : props.type))

const showPasswordToggle = computed(() => props.passwordToggle && props.type === 'password' && !isDisabled.value)
const showClear = computed(() => resolvedClearable.value && props.modelValue.length > 0 && !isDisabled.value && !isReadonly.value)

/**
 * Небуквенный признак состояния: иконка для глаз плюс скрытая подпись для
 * скринридера. Смысл `success`/`warning` иначе несёт один цвет рамки — WCAG
 * 1.4.1. Подробности и почему `danger` его не получает — `shared/controlState`.
 */
const signalState = computed(() => controlSignalState(props.state, isInvalid.value))
const stateIcon = computed(() => (signalState.value === 'success' ? IconCheckCircle : IconAlertTriangle))
const stateIconClass = computed(() => (signalState.value
  ? `${controlStateIconClass} ${controlStateIconColors[signalState.value]}`
  : ''))

const stateTextId = useId()
const describedBy = computed(() =>
  [field?.describedById.value, props.showCount ? countId : undefined, signalState.value ? stateTextId : undefined]
    .filter(Boolean)
    .join(' ') || undefined,
)

const trailingCount = computed(() => (showClear.value ? 1 : 0) + (showPasswordToggle.value ? 1 : 0) + (props.loading ? 1 : 0) + (signalState.value ? 1 : 0))
const trailingReserve = computed(() => (trailingCount.value > 0 ? `${trailingCount.value * 28}px` : '0px'))

const isInlineAddon = computed(() => props.addon === 'inline')

const prefixAddonClass = computed(() => (isInlineAddon.value ? addonInlinePrefixClass : addonSegmentPrefixClass))
const suffixAddonClass = computed(() => (isInlineAddon.value ? addonInlineSuffixClass : addonSegmentSuffixClass))

const {
  prefixEl,
  suffixEl,
  prefixStyle,
  suffixStyle,
  fieldPadding: inputStyle,
} = useControlAddons(() => props, {
  // У украшения своей ширины нет — иначе иконка висела бы в пустом отсеке
  // шириной со ступень размера.
  defaultMinWidth: () => (isInlineAddon.value ? '0px' : ADDON_MIN_WIDTH_BY_SIZE[resolvedSize.value]),
  paddingX: () => paddingX[resolvedSize.value],
  trailingReserve: () => trailingReserve.value,
})

// Border/ring/disabled — на оболочке (`focus-within`), размеры/выравнивание — на инпуте.
const shellClass = computed(() => grInputShellClass({
  state: props.state,
  invalid: isInvalid.value,
  disabled: isDisabled.value,
}))

const className = computed(() => grInputFieldClass({
  size: resolvedSize.value,
  align: props.textAlign,
}))

function onInput(e: Event): void {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

// Объявленный emit уходит из `$attrs`, поэтому нативные события переизлучаем
// руками — иначе `@change`/`@focus`/`@blur` у потребителя перестали бы работать.
function onChange(e: Event): void {
  emit('change', (e.target as HTMLInputElement).value)
}

function onFocus(e: FocusEvent): void {
  emit('focus', e)
}

function onBlur(e: FocusEvent): void {
  emit('blur', e)
}

// ————— Trailing-контролы: очистка, переключатель пароля, счётчик символов.
const { t } = useGranularityTranslations()

const stateText = computed(() => (signalState.value
  ? t(controlStateTextKey[signalState.value], controlStateFallbackText[signalState.value])
  : ''))
const resolvedClearLabel = computed(() => props.clearLabel ?? t('gr.input.clear', 'Clear'))
const resolvedPasswordShowLabel = computed(() => props.passwordShowLabel ?? t('gr.input.showPassword', 'Show password'))
const resolvedPasswordHideLabel = computed(() => props.passwordHideLabel ?? t('gr.input.hidePassword', 'Hide password'))

// Счётчик символов: `len` или `len / maxlength`.
const countText = computed(() =>
  props.maxlength !== undefined ? `${props.modelValue.length} / ${props.maxlength}` : String(props.modelValue.length),
)

/**
 * Живой регион объявляет только исчерпание лимита. Читать вслух каждый символ
 * нельзя — диктор захлебнётся, а сам счётчик и так связан с полем через
 * `aria-describedby` и читается при фокусе.
 */
const limitReached = computed(() =>
  props.maxlength !== undefined && props.modelValue.length >= props.maxlength,
)
const liveMessage = computed(() =>
  limitReached.value ? t('gr.input.limitReached', 'Character limit reached') : '',
)

function clear(): void {
  emit('update:modelValue', '')
  // Очистка — такая же фиксация значения, как уход фокуса: без `change`
  // подписка «значение установилось» пропускала бы ровно её.
  emit('change', '')
  emit('clear')
  inputEl.value?.focus()
}

function togglePassword(): void {
  passwordVisible.value = !passwordVisible.value
  inputEl.value?.focus()
}
</script>

<template>
  <div data-gr-input class="w-full">
    <div :class="shellClass">
      <div
          v-if="$slots.prefix"
          ref="prefixEl"
          data-testid="gr-input-prefix"
          class="absolute inset-y-0 left-0 flex items-center justify-center text-[var(--gr-muted-fg)] pointer-events-none select-none truncate"
          :class="prefixAddonClass"
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
          :disabled="isDisabled"
          :readonly="isReadonly"
          :maxlength="props.maxlength"
          :value="props.modelValue"
          :aria-invalid="isInvalid ? 'true' : undefined"
          :aria-describedby="describedBy"
          :aria-required="isRequired ? 'true' : undefined"
          :aria-readonly="isReadonly ? 'true' : undefined"
          :aria-label="ariaLabel"
          :aria-busy="props.loading ? 'true' : undefined"
          class="w-full bg-transparent text-[var(--gr-fg)] placeholder:text-[var(--gr-muted-fg)] focus:placeholder:text-transparent focus:outline-none disabled:cursor-not-allowed disabled:text-[var(--gr-muted-fg)]"
          :class="className"
          :style="inputStyle"
          @input="onInput"
          @change="onChange"
          @focus="onFocus"
          @blur="onBlur"
      >

      <div
          v-if="trailingCount > 0"
          data-gr-input-trailing
          class="absolute inset-y-0 right-1 flex items-center gap-0.5"
      >
        <span
            v-if="signalState"
            data-gr-input-state
            :class="stateIconClass"
            aria-hidden="true"
        >
          <component :is="stateIcon" class="h-4 w-4" />
        </span>

        <span
            v-if="loading"
            data-gr-input-spinner
            class="flex h-6 w-6 items-center justify-center text-[var(--gr-muted-fg)]"
            aria-hidden="true"
        >
          <IconLoader class="h-4 w-4 animate-spin" />
        </span>

        <button
            v-if="showClear"
            type="button"
            data-gr-input-clear
            :aria-label="resolvedClearLabel"
            class="flex h-6 w-6 items-center justify-center rounded-[var(--gr-radius-sm)] text-[var(--gr-muted-fg)] transition-colors hover:bg-[var(--gr-muted)] hover:text-[var(--gr-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
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
            class="flex h-6 w-6 items-center justify-center rounded-[var(--gr-radius-sm)] text-[var(--gr-muted-fg)] transition-colors hover:bg-[var(--gr-muted)] hover:text-[var(--gr-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
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
          class="absolute inset-y-0 right-0 flex items-center justify-center text-[var(--gr-muted-fg)] pointer-events-none select-none truncate"
          :class="[suffixAddonClass, suffixFixed ? '[direction:rtl]' : '']"
          :style="suffixStyle"
          aria-hidden="true"
      >
        <slot name="suffix" />
      </div>
    </div>

    <span v-if="signalState" :id="stateTextId" data-gr-input-state-text class="sr-only">{{ stateText }}</span>

    <div
        v-if="showCount"
        :id="countId"
        data-gr-input-count
        class="mt-1 text-right text-[length:var(--gr-control-text-xs)] leading-[var(--gr-leading-xs)] text-[var(--gr-muted-fg)] tabular-nums"
    >
      {{ countText }}
    </div>

    <span
        v-if="showCount"
        data-gr-input-live
        class="sr-only"
        role="status"
        aria-live="polite"
    >{{ liveMessage }}</span>
  </div>
</template>
