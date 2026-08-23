<script setup lang="ts">
import type { InputHTMLAttributes } from 'vue'

import { useGrComponentProp, useGrComponentSize } from '../GrConfigProvider/context'
import { computed, onBeforeUnmount, ref } from 'vue'

import {
  clearButtonClass,
  stepperCompactClass,
  stepperWideClass,
  grNumberInputInputClass,
  grNumberInputShellClass,
  type GrNumberInputControlsDirection,
  type GrNumberInputSize,
  type GrNumberInputState,
  type GrNumberInputTextAlign,
} from './grNumberInputStyles'
import { addStep, bigStep } from './numberInputMath'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import GrIcon from '../GrIcon/GrIcon.vue'
import IconChevronDown from '~icons/lucide/chevron-down'
import IconChevronLeft from '~icons/lucide/chevron-left'
import IconChevronRight from '~icons/lucide/chevron-right'
import IconChevronUp from '~icons/lucide/chevron-up'
import IconX from '~icons/lucide/x'
import { addLen } from '../../composables/internal/useAddonMeasurement'
import { useControlAddons } from '../../composables/internal/useControlAddons'

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
  /**
   * Значение поля. `null` — пусто.
   *
   * Незавершённый ввод («-», «1,») числом не является и в модель не попадает:
   * пока он набирается, поле держит его во внутреннем черновике, а модель
   * честно говорит «числа пока нет».
   */
  modelValue: number | null
  placeholder?: string
  autocomplete?: string
  inputmode?: InputHTMLAttributes['inputmode']
  disabled?: boolean
  /** Быстрый флаг невалидности; эквивалент `state='danger'` + `aria-invalid`. */
  invalid?: boolean
  /** Только для чтения: значение видно и уходит в форму, но не редактируется. */
  readonly?: boolean
  /** Обязательное поле (`aria-required`). Складывается с `required` у `GrFormField`. */
  required?: boolean
  /** Доступное имя вне `GrFormField`. */
  ariaLabel?: string
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

  /** Кнопка очистки значения. */
  clearable?: boolean
  /** A11y-подпись кнопки очистки. */
  clearLabel?: string
  /**
   * BCP-47 локаль для отображения значения (группировка разрядов и разделители
   * через `Intl.NumberFormat`). Работает вместе с `useGrouping`.
   */
  locale?: string
  /**
   * Группировать разряды при отображении (когда поле не в фокусе). При фокусе
   * показывается «сырое» значение для редактирования. По умолчанию выключено.
   */
  useGrouping?: boolean

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

export interface GrNumberInputEmits {
  (e: 'update:modelValue', value: number | null): void
  (e: 'change', value: number | null): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  /** Значение стёрто кнопкой очистки. */
  (e: 'clear'): void
}

// Контекст `GrFormField` — fallback для id/описания/невалидности, как в `GrInput`.
const field = useGrFormFieldContext()

const props = withDefaults(defineProps<GrNumberInputProps>(), {
  placeholder: undefined,
  autocomplete: undefined,
  inputmode: 'decimal',
  disabled: false,
  invalid: false,
  readonly: false,
  required: false,
  ariaLabel: undefined,
  state: 'default',
  name: undefined,
  id: undefined,
  size: undefined,

  textAlign: 'left',

  decimalSeparator: '.',
  step: 1,
  min: undefined,
  max: undefined,
  precision: undefined,
  locale: undefined,
  useGrouping: false,
  clearable: undefined,
  clearLabel: undefined,

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

// Эффективный размер: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrNumberInput' })

const resolvedId = computed(() => props.id ?? field?.id.value)
const describedBy = computed(() => field?.describedById.value)
const {
  disabled: isDisabled,
  invalid: isInvalid,
  required: isRequired,
  readonly: isReadonly,
} = useGrFormControl(() => props)

const emit = defineEmits<GrNumberInputEmits>()
defineSlots<{
  /** Аддон слева от поля: знак валюты, иконка. */
  prefix?: () => any
  /** Аддон справа от поля: единица измерения. */
  suffix?: () => any
}>()

const inputEl = ref<HTMLInputElement | null>(null)

// В фокусе поле показывает «сырое» значение: группировка мешала бы правке.
const isFocused = ref(false)

/**
 * Строка ровно в том виде, в каком её набирают. Модель к этому моменту может
 * быть `null` («-», «1,» — не числа), и без черновика поле стирало бы под
 * пальцами то, что печатают. Коммит (`change`/`blur`) черновик снимает.
 */
const draft = ref<string | null>(null)

function focus(): void {
  inputEl.value?.focus()
}

function blur(): void {
  inputEl.value?.blur()
}

defineExpose({ focus, blur })

const { t, locale } = useGranularityTranslations()

/**
 * Локаль форматирования: свой проп → локаль i18n-адаптера → окружение. Без
 * второго шага мультиязычное приложение передавало бы `locale` каждому полю.
 */
const resolvedLocale = computed(() => props.locale ?? locale.value)
const resolvedIncreaseLabel = computed(() => props.increaseLabel ?? t('gr.numberInput.increase', 'Increase'))
const resolvedDecreaseLabel = computed(() => props.decreaseLabel ?? t('gr.numberInput.decrease', 'Decrease'))

const hasHorizontalControls = computed(() => props.controls && props.controlsDirection === 'horizontal')
const hasVerticalControls = computed(() => props.controls && props.controlsDirection === 'vertical')

const addonPx = computed(() => ADDON_PX_BY_SIZE[resolvedSize.value])
const addonLen = computed(() => px(addonPx.value))
const basePaddingXLen = computed(() => BASE_PADDING_X_LEN_BY_SIZE[resolvedSize.value])

/** Кнопки ± справа: вертикальный стек — одна колонка, горизонтальный — вторая. */
const rightControlsCount = computed(() =>
  (hasHorizontalControls.value ? 1 : 0) + (hasVerticalControls.value ? 1 : 0))

const {
  prefixEl,
  suffixEl,
  prefixLen,
  suffixLen,
  prefixStyle,
  suffixStyle,
  fieldPadding: inputStyle,
} = useControlAddons(() => props, {
  defaultMinWidth: () => addonLen.value,
  paddingX: () => basePaddingXLen.value,
  leadingReserve: () => (hasHorizontalControls.value ? addonLen.value : '0px'),
  trailingReserve: () => (rightControlsCount.value > 0 ? px(addonPx.value * rightControlsCount.value) : '0px'),
  // Суффикс позиционируется абсолютно: без якоря он уехал бы от правого края.
  anchorSuffixRight: true,
})

function addonStyle(side: 'left' | 'right', offset: string): Record<string, string> {
  return {
    width: addonLen.value,
    [side]: offset,
  }
}

const verticalControlsStyle = computed(() => addonStyle('right', suffixLen.value))

/**
 * Крестик очистки живёт левее правой зоны (суффикс + кнопки ±) — иначе он лёг бы
 * на них. Ширины там же, где их считает поле, поэтому переиспользуем расчёт.
 */
const clearButtonStyle = computed(() => {
  const controls = rightControlsCount.value > 0 ? px(addonPx.value * rightControlsCount.value) : '0px'

  return { right: addLen(addLen(suffixLen.value, controls), '6px') }
})
const horizontalLeftControlsStyle = computed(() => addonStyle('left', prefixLen.value))
const horizontalRightControlsStyle = computed(() => addonStyle('right', suffixLen.value))

const shellClassName = computed(() => {
  return grNumberInputShellClass({
    disabled: isDisabled.value,
    state: props.state,
    invalid: isInvalid.value,
  })
})

const inputClassName = computed(() => {
  return grNumberInputInputClass({
    size: resolvedSize.value,
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
  if (value.trim() === '')
    return null
  const sep = props.decimalSeparator || '.'
  const normalized = sep === '.' ? value : value.replace(sep, '.')
  const n = Number(normalized)
  if (!Number.isFinite(n))
    return null
  return n
}

function clamp(v: number): number {
  if (props.min !== undefined)
    v = Math.max(props.min, v)
  if (props.max !== undefined)
    v = Math.min(props.max, v)
  return v
}

function normalize(v: number): number {
  if (props.precision === undefined)
    return v
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
  if (sep !== '.')
    s = s.replace('.', sep)
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

  draft.value = next

  const num = toNumber(next)
  if (num !== props.modelValue)
    emit('update:modelValue', num)
}

/**
 * Коммит набранного: границы и точность применяются здесь, а не на каждом
 * нажатии, — иначе `min=10` не дал бы набрать «1» как начало «15».
 */
function commit(): void {
  // Без черновика коммитится сама модель: значение вне границ обязано
  // выправиться и тогда, когда его выставили снаружи, а не набрали руками.
  const num = draft.value !== null ? toNumber(draft.value) : props.modelValue
  const next = num === null ? null : clamp(normalize(num))

  draft.value = null

  if (next !== props.modelValue)
    emit('update:modelValue', next)
  emit('change', next)
}

function onChange(): void {
  // Клампинг границ (`min`/`max`) и нормализация — на `change`/`blur`, а не только
  // в кнопках: иначе ручной ввод «999» при `max=10` останется невалидным.
  commit()
}

function setValue(n: number): void {
  const next = clamp(normalize(n))
  // Шаг завершает набор: черновик снимается, показ считается от модели.
  draft.value = null
  emit('update:modelValue', next)
  emit('change', next)
}

/**
 * Шаг значения. Фокус не трогаем: кнопка ± обязана оставаться под фокусом,
 * иначе клавиатурный пользователь после первого Enter теряет её и повторно
 * нажать не может. Поле фокусирует тот, кто шагает от него самого.
 */
function stepBy(dir: 1 | -1, step: number = props.step ?? 1): void {
  if (isDisabled.value || isReadonly.value)
    return

  const current = props.modelValue ?? 0
  setValue(addStep(current, step * dir))
}

// Интервал уже шагал: финальный `click` при отпускании — не намерение
// пользователя сделать ещё один шаг, а хвост того же жеста.
let repeatFired = false

/** Клик кнопки «±»: шаг, если это не хвост только что завершённого удержания. */
function onStepClick(dir: 1 | -1, event: MouseEvent): void {
  // Enter/Space на кнопке дают click без указателя (`detail === 0`) — хвостом
  // жеста он быть не может. Иначе удержание, кончившееся без клика (отпускание
  // вне кнопки, `pointercancel` на таче), оставляло бы флаг взведённым, и
  // спинбаттон молча терял бы нажатие у клавиатуры и вспомогательных технологий.
  if (event.detail === 0) {
    repeatFired = false
    stepBy(dir)
    return
  }

  if (repeatFired) {
    repeatFired = false
    return
  }
  stepBy(dir)
}

function onKeydown(e: KeyboardEvent): void {
  if (isDisabled.value)
    return
  // Readonly-поле ведёт себя как текст: стрелки и Home/End отдаются нативной
  // каретке, значение не меняется.
  if (isReadonly.value)
    return

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault()
      stepBy(1)
      break
    case 'ArrowDown':
      e.preventDefault()
      stepBy(-1)
      break
    case 'PageUp':
      e.preventDefault()
      stepBy(1, bigStep(props.step ?? 1, props.min, props.max))
      break
    case 'PageDown':
      e.preventDefault()
      stepBy(-1, bigStep(props.step ?? 1, props.min, props.max))
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
const ariaValueNow = computed(() => props.modelValue ?? undefined)

// На пределе кнопка ± гаснет: активная кнопка, у которой `clamp` съедает
// результат, читается как сломанная.
const numericValue = computed(() => props.modelValue)

const canIncrease = computed(() => {
  if (props.max === undefined)
    return true
  const current = numericValue.value
  return current === null || normalize(current) < props.max
})

const canDecrease = computed(() => {
  if (props.min === undefined)
    return true
  const current = numericValue.value
  return current === null || normalize(current) > props.min
})

// Локале-зависимое отображение: при фокусе показываем «сырое» значение для
// редактирования, иначе — сгруппированное через `Intl.NumberFormat`.
function formatGrouped(num: number): string {
  const sep = props.decimalSeparator || '.'
  // formatToParts позволяет оставить локале-зависимый групповой разделитель,
  // но принудительно подставить наш десятичный разделитель (`decimalSeparator`),
  // корректно работая для любой локали (в т.ч. de-DE, где группа — '.').
  return new Intl.NumberFormat(resolvedLocale.value, {
    useGrouping: true,
    minimumFractionDigits: props.precision ?? 0,
    maximumFractionDigits: props.precision ?? 20,
  })
    .formatToParts(num)
    .map(part => (part.type === 'decimal' ? sep : part.value))
    .join('')
}

/**
 * `aria-valuetext` нужен только при группировке: без неё `aria-valuenow` уже
 * несёт то же самое число, и дублировать его текстом незачем.
 */
const ariaValueText = computed(() => {
  if (!props.useGrouping)
    return undefined
  return props.modelValue === null ? undefined : formatGrouped(props.modelValue)
})

/**
 * Что показывает поле: набираемый черновик, пока он есть, иначе — модель.
 * Группировка только вне фокуса: при правке разделители разрядов мешают.
 */
const displayValue = computed(() => {
  if (draft.value !== null)
    return draft.value
  if (props.modelValue === null)
    return ''
  if (props.useGrouping && !isFocused.value)
    return formatGrouped(props.modelValue)
  return format(props.modelValue)
})

function onFocus(event: FocusEvent): void {
  isFocused.value = true
  emit('focus', event)
}

function onBlur(event: FocusEvent): void {
  isFocused.value = false
  // `change` до `blur` доходит не всегда (значение могло вернуться к исходному),
  // а черновик обязан сняться в любом случае — иначе поле застынет на нём.
  draft.value = null
  emit('blur', event)
  stopRepeat()
}

// ————— Удержание кнопки ±: шаг повторяется, пока кнопку держат.
const REPEAT_DELAY_MS = 400
const REPEAT_INTERVAL_MS = 60

let repeatDelay: ReturnType<typeof setTimeout> | null = null
let repeatTimer: ReturnType<typeof setInterval> | null = null

function stopRepeat(): void {
  if (repeatDelay !== null) {
    clearTimeout(repeatDelay)
    repeatDelay = null
  }
  if (repeatTimer !== null) {
    clearInterval(repeatTimer)
    repeatTimer = null
  }
}

function canStep(dir: 1 | -1): boolean {
  return dir === 1 ? canIncrease.value : canDecrease.value
}

/**
 * `pointerdown`, а не `mousedown`: на тач-устройствах второго не бывает.
 * Повтор останавливается на границе — иначе таймер крутился бы вхолостую.
 */
function startRepeat(dir: 1 | -1): void {
  if (isDisabled.value || isReadonly.value)
    return

  stopRepeat()
  repeatFired = false
  repeatDelay = setTimeout(() => {
    repeatTimer = setInterval(() => {
      if (!canStep(dir)) {
        stopRepeat()
        return
      }
      repeatFired = true
      stepBy(dir)
    }, REPEAT_INTERVAL_MS)
  }, REPEAT_DELAY_MS)
}

onBeforeUnmount(stopRepeat)

// ————— Очистка значения.
const resolvedClearable = useGrComponentProp('GrNumberInput', 'clearable', () => props.clearable, false)
const resolvedClearLabel = computed(() => props.clearLabel ?? t('gr.input.clear', 'Clear'))

const clearVisible = computed(() =>
  resolvedClearable.value && !isDisabled.value && !isReadonly.value && props.modelValue !== null,
)

function clear(): void {
  draft.value = null
  emit('update:modelValue', null)
  emit('change', null)
  emit('clear')
  focus()
}
</script>

<template>
  <div
    data-gr-number-input
    class="relative w-full overflow-hidden rounded-[var(--gr-radius-control)] border bg-[var(--gr-bg)] transition-colors duration-[var(--gr-duration-fast)] focus-within:ring-2 focus-within:ring-[var(--gr-ring)]"
    :class="shellClassName"
  >
    <div
      v-if="$slots.prefix"
      ref="prefixEl"
      data-testid="number-input-prefix"
      data-gr-number-input-prefix
      class="absolute inset-y-0 left-0 flex items-center justify-center border-r border-[var(--gr-brd)] px-2 text-[var(--gr-muted-fg)] pointer-events-none select-none truncate"
      :style="prefixStyle"
      aria-hidden="true"
    >
      <slot name="prefix" />
    </div>

    <input
      :id="resolvedId"
      ref="inputEl"
      v-bind="$attrs"
      :name="name"
      type="text"
      :inputmode="inputmode"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :value="displayValue"
      role="spinbutton"
      :aria-valuenow="ariaValueNow"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuetext="ariaValueText"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :aria-describedby="describedBy"
      :aria-required="isRequired ? 'true' : undefined"
      :aria-readonly="isReadonly ? 'true' : undefined"
      :aria-label="ariaLabel"
      :readonly="isReadonly"
      class="w-full bg-transparent text-[var(--gr-fg)] placeholder:text-[var(--gr-muted-fg)] focus:placeholder:text-transparent focus:outline-none disabled:cursor-not-allowed"
      :class="inputClassName"
      :style="inputStyle"
      @input="onInput"
      @change="onChange"
      @keydown="onKeydown"
      @focus="onFocus"
      @blur="onBlur"
    >

    <div
      v-if="$slots.suffix"
      ref="suffixEl"
      data-testid="number-input-suffix"
      data-gr-number-input-suffix
      class="absolute inset-y-0 flex items-center justify-center border-l border-[var(--gr-brd)] px-2 text-[var(--gr-muted-fg)] pointer-events-none select-none truncate"
      :class="suffixFixed ? '[direction:rtl]' : ''"
      :style="suffixStyle"
      aria-hidden="true"
    >
      <slot name="suffix" />
    </div>

    <button
      v-if="clearVisible"
      type="button"
      data-gr-number-input-clear
      :class="clearButtonClass"
      :style="clearButtonStyle"
      :aria-label="resolvedClearLabel"
      @mousedown.prevent
      @click="clear"
    >
      <GrIcon :size="14">
        <IconX />
      </GrIcon>
    </button>

    <div
      v-if="hasVerticalControls"
      data-testid="number-input-controls-vertical"
      data-gr-number-input-controls="vertical"
      class="absolute inset-y-0 flex items-center justify-center border-l border-[var(--gr-brd)]"
      :style="verticalControlsStyle"
    >
      <div class="flex flex-col justify-center gap-1">
        <button
          type="button"
          data-gr-number-input-increase
          :class="stepperCompactClass"
          :disabled="isDisabled || isReadonly || !canIncrease"
          :aria-label="resolvedIncreaseLabel"
          @mousedown.prevent
          @pointerdown="startRepeat(1)"
          @pointerup="stopRepeat"
          @pointerleave="stopRepeat"
          @pointercancel="stopRepeat"
          @click="onStepClick(1, $event)"
        >
          <GrIcon :size="12">
            <IconChevronUp />
          </GrIcon>
        </button>
        <button
          type="button"
          data-gr-number-input-decrease
          :class="stepperCompactClass"
          :disabled="isDisabled || isReadonly || !canDecrease"
          :aria-label="resolvedDecreaseLabel"
          @mousedown.prevent
          @pointerdown="startRepeat(-1)"
          @pointerup="stopRepeat"
          @pointerleave="stopRepeat"
          @pointercancel="stopRepeat"
          @click="onStepClick(-1, $event)"
        >
          <GrIcon :size="12">
            <IconChevronDown />
          </GrIcon>
        </button>
      </div>
    </div>

    <div
      v-if="hasHorizontalControls"
      data-testid="number-input-controls-horizontal-left"
      data-gr-number-input-controls="horizontal-left"
      class="absolute inset-y-0 flex items-stretch justify-center border-r border-[var(--gr-brd)]"
      :style="horizontalLeftControlsStyle"
    >
      <button
        type="button"
        data-gr-number-input-decrease
        :class="stepperWideClass"
        :disabled="isDisabled || isReadonly || !canDecrease"
        :aria-label="resolvedDecreaseLabel"
        @mousedown.prevent
        @pointerdown="startRepeat(-1)"
        @pointerup="stopRepeat"
        @pointerleave="stopRepeat"
        @pointercancel="stopRepeat"
        @click="onStepClick(-1, $event)"
      >
        <GrIcon :size="12">
          <IconChevronLeft />
        </GrIcon>
      </button>
    </div>

    <div
      v-if="hasHorizontalControls"
      data-testid="number-input-controls-horizontal-right"
      data-gr-number-input-controls="horizontal-right"
      class="absolute inset-y-0 flex items-stretch justify-center border-l border-[var(--gr-brd)]"
      :style="horizontalRightControlsStyle"
    >
      <button
        type="button"
        data-gr-number-input-increase
        :class="stepperWideClass"
        :disabled="isDisabled || isReadonly || !canIncrease"
        :aria-label="resolvedIncreaseLabel"
        @mousedown.prevent
        @pointerdown="startRepeat(1)"
        @pointerup="stopRepeat"
        @pointerleave="stopRepeat"
        @pointercancel="stopRepeat"
        @click="onStepClick(1, $event)"
      >
        <GrIcon :size="12">
          <IconChevronRight />
        </GrIcon>
      </button>
    </div>
  </div>
</template>
