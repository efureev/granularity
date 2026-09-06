<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'

import { useGrComponentProp, useGrComponentSize } from '../../composables/useGrComponentConfig'
import { useGrFormControl } from '../../composables/useGrFormControl'

import {
  caretClass,
  fieldClass,
  grOtpInputCellClass,
  grOtpInputRootClass,
  placeholderClass,
  separatorClass,
  type GrOtpInputSize,
} from './grOtpInputStyles'
import {
  createOtpMatcher,
  isOtpGroupsValid,
  normalizeOtpInput,
  OTP_TYPE_INPUT_MODES,
  otpSeparatorIndexes,
  sanitizeOtpValue,
  type GrOtpInputType,
} from './otpValue'

export type { GrOtpInputSize } from './grOtpInputStyles'
export type { GrOtpInputType } from './otpValue'

export interface GrOtpInputProps {
  /** Код целиком, без разделителей. */
  modelValue?: string
  /** Число ячеек. */
  length?: number
  /** Допустимый алфавит и раскладка мобильной клавиатуры. */
  type?: GrOtpInputType
  /** Свой алфавит регуляркой на **один символ**. Перекрывает `type`. */
  pattern?: string
  /** Разбивка на группы: `[3, 3]` рисует `123 – 456`. Сумма обязана равняться `length`. */
  groups?: number[]
  /** Точки вместо символов — сценарий PIN. На `modelValue` не влияет. */
  masked?: boolean
  /** Знак в пустой ячейке. */
  placeholder?: string
  size?: GrOtpInputSize
  autofocus?: boolean
  /** `autocomplete="one-time-code"`: код из SMS подставляется на iOS и macOS. */
  oneTimeCode?: boolean
  /**
   * Приём кода из SMS на Android через WebOTP. Выключен: требует HTTPS и
   * особого хвоста в тексте сообщения, который добавляет бэкенд.
   */
  webOtp?: boolean
  /** Имя поля для нативной отправки формы. */
  name?: string
  /** `id` формы, если поле лежит вне неё. */
  form?: string
  disabled?: boolean
  readonly?: boolean
  invalid?: boolean
  required?: boolean
  ariaLabel?: string
}

export interface GrOtpInputEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  /** Код набран целиком. Точка автосабмита. */
  (e: 'complete', value: string): void
}

const props = withDefaults(
  defineProps<GrOtpInputProps>(),
  {
    modelValue: '',
    // `length`, `size` и `masked` настраиваются через `GrConfigProvider`,
    // поэтому их дефолты живут в резолверах ниже, а не в `withDefaults`.
    length: undefined,
    type: 'numeric',
    pattern: undefined,
    groups: undefined,
    masked: undefined,
    placeholder: '',
    size: undefined,
    autofocus: false,
    oneTimeCode: true,
    webOtp: false,
    name: undefined,
    form: undefined,
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
    ariaLabel: undefined,
  },
)

const emit = defineEmits<GrOtpInputEmits>()

defineSlots<{
  /** Своё оформление ячейки. Размер и рамку по-прежнему держит компонент. */
  cell?: (props: {
    char: string
    index: number
    active: boolean
    filled: boolean
    masked: boolean
  }) => any
  /** Знак между группами. По умолчанию — тире. */
  separator?: (props: { index: number }) => any
}>()

const {
  disabled: isDisabled,
  invalid: isInvalid,
  required: isRequired,
  readonly: isReadonly,
  id: fieldId,
  describedBy,
} = useGrFormControl(() => props)

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrOtpInput' })
const resolvedLength = useGrComponentProp('GrOtpInput', 'length', () => props.length, 6)
const resolvedMasked = useGrComponentProp('GrOtpInput', 'masked', () => props.masked, false)

const fieldEl = ref<HTMLInputElement | null>(null)
const caret = ref(0)
const focused = ref(false)

const matcher = computed(() => createOtpMatcher(props.type, props.pattern))

/** Коды печатают капсом, и раскладка «то ли a, то ли A» тут только мешает. */
const uppercase = computed(() => props.type === 'alphanumeric' && props.pattern === undefined)

const value = computed(() => sanitizeOtpValue(props.modelValue, {
  length: resolvedLength.value,
  matcher: matcher.value,
  uppercase: uppercase.value,
}))

const characters = computed(() => {
  const chars = value.value.split('')
  return Array.from({ length: resolvedLength.value }, (_, index) => chars[index] ?? '')
})

const separators = computed(() => otpSeparatorIndexes(resolvedLength.value, props.groups))

const activeIndex = computed(() => {
  if (!focused.value || isDisabled.value || isReadonly.value)
    return -1

  return Math.min(caret.value, resolvedLength.value - 1)
})

const rootClass = computed(() => grOtpInputRootClass(resolvedSize.value))

function cellClass(index: number): string {
  return grOtpInputCellClass({
    size: resolvedSize.value,
    active: index === activeIndex.value,
    invalid: isInvalid.value,
    disabled: isDisabled.value,
  })
}

/**
 * Значение живёт в пропе, а поле — в DOM, и после каждой правки их надо свести:
 * браузер уже применил свою вставку, а нормализация могла дать другую строку.
 */
function writeField(next: string, nextCaret: number): void {
  const el = fieldEl.value
  if (!el)
    return

  if (el.value !== next)
    el.value = next

  const position = Math.min(nextCaret, next.length)
  el.setSelectionRange(position, position)
  caret.value = position
}

function commit(next: string, nextCaret: number): void {
  writeField(next, nextCaret)

  if (next !== value.value) {
    emit('update:modelValue', next)
    emit('change', next)
  }
}

function onInput(event: Event): void {
  const el = event.target as HTMLInputElement
  const normalized = normalizeOtpInput({
    previous: value.value,
    raw: el.value,
    caret: el.selectionStart ?? el.value.length,
    length: resolvedLength.value,
    matcher: matcher.value,
    uppercase: uppercase.value,
  })

  commit(normalized.value, normalized.caret)
}

function syncCaret(): void {
  const el = fieldEl.value
  if (el)
    caret.value = el.selectionStart ?? 0
}

/**
 * Клик ставит каретку в первую пустую ячейку, а не туда, куда пришёлся курсор.
 *
 * Ячейки — декорация: попадание мышью по невидимому тексту ничего осмысленного
 * не значит, а «продолжить с того места, где остановился» — единственное, чего
 * от кода ждут. Редактирование середины остаётся за стрелками.
 */
function onPointerUp(): void {
  const el = fieldEl.value
  if (!el || isDisabled.value || isReadonly.value)
    return

  const position = value.value.length
  el.setSelectionRange(position, position)
  caret.value = position
}

function onFocus(event: FocusEvent): void {
  focused.value = true
  syncCaret()
  emit('focus', event)
}

function onBlur(event: FocusEvent): void {
  focused.value = false
  emit('blur', event)
}

function focus(): void {
  fieldEl.value?.focus()
}

function blur(): void {
  fieldEl.value?.blur()
}

/** Штатный сценарий: сервер отверг код, поле чистится и снова ждёт ввода. */
function clear(): void {
  commit('', 0)
  focus()
}

defineExpose({ focus, blur, clear })

// Значение пришло снаружи — поле обязано его показать. Санитайз уже прошёл в
// `value`, поэтому сюда доезжает то же, что видят ячейки.
watch(value, (next) => {
  const el = fieldEl.value
  if (el && el.value !== next)
    writeField(next, next.length)
}, { flush: 'post' })

/**
 * Повторный `complete` на том же значении не шлётся: правка последней ячейки
 * туда-обратно не должна вызывать второй запрос на проверку кода.
 */
const completed = ref<string | null>(null)

watch(value, (next) => {
  if (next.length < resolvedLength.value) {
    completed.value = null
    return
  }

  if (completed.value === next)
    return

  completed.value = next
  emit('complete', next)
}, { immediate: true })

let otpRequest: AbortController | undefined

function abortWebOtp(): void {
  otpRequest?.abort()
  otpRequest = undefined
}

/**
 * WebOTP — второй канал автоподстановки, закрывающий Android так же, как
 * `one-time-code` закрывает iOS.
 *
 * Живёт в `onMounted`, а не в теле setup: `navigator` на сервере роняет рендер
 * (`docs/ssr.md`). Отказ пользователя, отсутствие API и отмена — не ошибки:
 * поле просто остаётся пустым и ждёт ручного ввода.
 */
function requestWebOtp(): void {
  abortWebOtp()

  if (typeof window === 'undefined' || !('OTPCredential' in window))
    return

  const controller = new AbortController()
  otpRequest = controller

  // WebOTP нет в `lib.dom`, поэтому форма запроса описана здесь: тип узкий и
  // ровно тот, что читается ниже.
  const credentials = navigator.credentials as unknown as {
    get: (options: unknown) => Promise<{ code?: string } | null>
  }

  credentials
    .get({ otp: { transport: ['sms'] }, signal: controller.signal })
    .then((credential: { code?: string } | null) => {
      if (otpRequest !== controller || !credential?.code)
        return

      const normalized = sanitizeOtpValue(credential.code, {
        length: resolvedLength.value,
        matcher: matcher.value,
        uppercase: uppercase.value,
      })

      commit(normalized, normalized.length)
    })
    .catch(() => {})
}

onMounted(() => {
  if (props.autofocus)
    focus()

  if (props.webOtp)
    requestWebOtp()
})

// Код набран — ждать сообщение больше незачем, а незакрытый запрос переживает
// уход со страницы.
watch(value, (next) => {
  if (next.length >= resolvedLength.value)
    abortWebOtp()
})

onBeforeUnmount(abortWebOtp)

if (__GR_DEV__) {
  watchEffect(() => {
    if (!isOtpGroupsValid(resolvedLength.value, props.groups)) {
      console.warn(
        `[granularity] GrOtpInput: сумма \`groups\` не равна \`length\` (${resolvedLength.value}) `
        + '— разбивка игнорируется целиком. Половина разбивки хуже её отсутствия: '
        + 'разделитель встал бы не там, где группа кончается.',
      )
    }

    if (resolvedLength.value < 1) {
      console.warn('[granularity] GrOtpInput: `length` меньше единицы — рисовать нечего.')
    }
  })
}
</script>

<template>
  <div
      data-testid="gr-otp-input"
      data-gr-otp-input
      :class="rootClass"
  >
    <template v-for="(char, index) in characters" :key="index">
      <span
          v-if="separators.has(index)"
          data-gr-otp-input-separator
          :class="separatorClass"
          aria-hidden="true"
      >
        <slot name="separator" :index="index">—</slot>
      </span>

      <span
          data-testid="gr-otp-input-cell"
          data-gr-otp-input-cell
          :class="cellClass(index)"
          aria-hidden="true"
      >
        <slot
            name="cell"
            :char="char"
            :index="index"
            :active="index === activeIndex"
            :filled="char !== ''"
            :masked="resolvedMasked"
        >
          <template v-if="char">{{ resolvedMasked ? '•' : char }}</template>
          <span v-else-if="placeholder" :class="placeholderClass">{{ placeholder }}</span>
        </slot>

        <span
            v-if="index === activeIndex && !char"
            data-gr-otp-input-caret
            :class="caretClass"
        />
      </span>
    </template>

    <input
        :id="fieldId"
        ref="fieldEl"
        data-testid="gr-otp-input-field"
        data-gr-otp-input-field
        type="text"
        :class="fieldClass"
        :value="value"
        :name="name"
        :form="form"
        :disabled="isDisabled"
        :readonly="isReadonly"
        :required="isRequired"
        :aria-label="ariaLabel"
        :aria-describedby="describedBy"
        :aria-invalid="isInvalid ? 'true' : undefined"
        :aria-required="isRequired ? 'true' : undefined"
        :inputmode="OTP_TYPE_INPUT_MODES[type]"
        :autocomplete="oneTimeCode ? 'one-time-code' : 'off'"
        autocapitalize="none"
        autocorrect="off"
        spellcheck="false"
        @input="onInput"
        @select="syncCaret"
        @keyup="syncCaret"
        @pointerup="onPointerUp"
        @focus="onFocus"
        @blur="onBlur"
    >
  </div>
</template>

<style>
/*
 * Каретка своя, потому что настоящая скрыта вместе с текстом поля. Мигание —
 * CSS-анимация, а значит подчиняется глобальному клампу движения пакета
 * (`docs/motion.md`) и не требует своего reduce-блока.
 */
@keyframes gr-otp-input-caret {
  0%,
  45% {
    opacity: 1;
  }

  55%,
  100% {
    opacity: 0;
  }
}

[data-gr-otp-input-caret] {
  animation: gr-otp-input-caret 1.1s steps(1, end) infinite;
}
</style>
