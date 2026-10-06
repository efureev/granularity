<script setup lang="ts">
/**
 * GrTextarea — многострочное поле ввода GR-примитива.
 *
 * Состояния:
 * - `state`: визуальный оттенок рамки (`default | success | warning | danger`).
 * - `invalid`: форсирует `danger`-состояние и проставляет `aria-invalid="true"`.
 */
import { computed, ref, useId } from 'vue'
import {
  countClass,
  countRowClass,
  lineCountClass,
  disabledSurfaceClass,
  enabledSurfaceClass,
  grTextareaClass,
  resizeClass,
  sizes,
  type GrTextareaResize,
  type GrTextareaSize,
  type GrTextareaState,
} from './grTextareaStyles'
import IconX from '~icons/lucide/x'
import IconCheckCircle from '~icons/lucide/check-circle'
import IconAlertTriangle from '~icons/lucide/alert-triangle'
import { vAutosize } from '../../directives'
import { useGrComponentProp, useGrComponentSize } from '../shared/configContext'
import { useGrFormFieldContext } from '../shared/formFieldContext'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import {
  controlSignalState,
  controlStateFallbackText,
  controlStateIconClass,
  controlStateIconColors,
  controlStateTextKey,
} from '../shared/controlState'
import { useControlAria } from '../../composables/internal/useControlAria'

export interface GrTextareaProps {
  /** Текст поля (`v-model`). */
  modelValue: string
  /** Подсказка в пустом поле. Подпись не заменяет: имя даёт `GrFormField` или `ariaLabel`. */
  placeholder?: string
  /** Нативный `autocomplete`: чем браузеру заполнять поле — например, `street-address`. */
  autocomplete?: string
  /** Выключить поле: значение не редактируется и не уходит в форму. Складывается с `GrFormField`. */
  disabled?: boolean
  /** Только для чтения: значение видно и уходит в форму, но не редактируется. */
  readonly?: boolean
  /** Ошибка валидации: danger-рамка и `aria-invalid`. Складывается с ошибкой `GrFormField`. */
  invalid?: boolean
  /** Обязательное поле (`aria-required`). Складывается с `required` у `GrFormField`. */
  required?: boolean
  /** Доступное имя вне `GrFormField`. */
  ariaLabel?: string
  /**
   * Подсветка рамки по решению разработчика. `success` и `warning` добавляют иконку
   * и скрытую подпись; `invalid` сильнее. По умолчанию `default`.
   */
  state?: GrTextareaState
  /** Нативный `name` — имя поля при отправке формы. */
  name?: string
  /** `id` поля. Не задан — берётся из `GrFormField`, чтобы подпись нашла поле. */
  id?: string
  /** Высота в строках; с `autosize` — стартовая и минимальная. По умолчанию `4`. */
  rows?: number
  /** Кегль и отступы по шкале контролов. По умолчанию `md`; берётся из `GrConfigProvider`. */
  size?: GrTextareaSize
  /** Ограничение длины + основа для счётчика символов. */
  maxlength?: number
  /** Показывать счётчик символов (`len` или `len/maxlength`). */
  showCount?: boolean
  /**
   * Показывать счётчик строк. Считаются **логические** строки (переводы строки), а
   * не визуальные переносы: при `autosize` число не меняется от ширины поля.
   */
  showLineCount?: boolean
  /**
   * Ориентир по числу строк для счётчика (`3 / 10`). Ввод не ограничивает: обрезать
   * набранный текст за пользователя компонент не вправе.
   */
  maxLines?: number
  /** Подгонять высоту под содержимое (директива `v-autosize`). */
  autosize?: boolean
  /** Кнопка очистки значения. Настраивается через `GrConfigProvider`. */
  clearable?: boolean
  /** A11y-подпись кнопки очистки. */
  clearLabel?: string
  /** Ручное изменение размера пользователем. */
  resize?: GrTextareaResize
}

export interface GrTextareaEmits {
  /** Текст изменился (`v-model`) — на каждый ввод и при очистке. */
  (e: 'update:modelValue', value: string): void
  /** Значение зафиксировано нативным `change` — по `blur`. */
  (e: 'change', value: string): void
  /** Значение стёрто кнопкой очистки. */
  (e: 'clear'): void
  /** Фокус пришёл в поле. */
  (e: 'focus', event: FocusEvent): void
  /** Фокус ушёл из поля. */
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<GrTextareaProps>(), {
  placeholder: undefined,
  autocomplete: undefined,
  disabled: false,
  readonly: false,
  invalid: false,
  required: false,
  ariaLabel: undefined,
  state: 'default',
  name: undefined,
  id: undefined,
  rows: 4,
  size: undefined,
  maxlength: undefined,
  showCount: false,
  autosize: false,
  clearable: undefined,
  clearLabel: undefined,
  resize: 'vertical',
})

defineOptions({
  // Иначе атрибуты потребителя (`data-*`, `aria-*`, `name`) садятся на корень,
  // а корень со `showCount` — обёртка счётчика, а не само поле.
  inheritAttrs: false,
})

const slots = defineSlots<{
  /**
   * Своя формулировка счётчика символов вместо `12 / 60` — «осталось 48»,
   * «почти предел» и что угодно ещё. Встроенных счётчиков два, но оба
   * фиксированы по форме, и вторая готовая формулировка первой не заменяет.
   */
  count?: (props: { length: number, maxlength?: number, remaining?: number }) => any
}>()

const emit = defineEmits<GrTextareaEmits>()

// Fallback из контекста `GrFormField` (id/aria-describedby/invalid/required).
const field = useGrFormFieldContext()
const resolvedId = computed(() => props.id ?? field?.id.value)

// Счётчик обязан быть частью описания поля: иначе «12 / 60» видно глазами, но
// не слышно — при том что ограничение длины и есть его смысл.
const countId = useId()
const lineCountId = useId()
const stateTextId = useId()

/**
 * Слот считается за просьбу показать счётчик: заданный `#count` без
 * `show-count` не рисовал бы ничего, и потребитель искал бы опечатку в имени
 * слота, а не забытый проп.
 */
const hasCharCount = computed(() => props.showCount || Boolean(slots.count))

/** Обёртка нужна любому из счётчиков — и кнопке очистки. */
const hasCounters = computed(() => hasCharCount.value || props.showLineCount)

const lineCount = computed(() => props.modelValue.split('\n').length)

const countText = computed(() =>
  props.maxlength !== undefined ? `${props.modelValue.length} / ${props.maxlength}` : String(props.modelValue.length),
)

/**
 * `remaining` не зажимается в ноль: `maxlength` держит ввод с клавиатуры, но
 * значение, пришедшее в `v-model` из кода, ограничение перешагивает — и «-3»
 * там честнее нуля.
 */
const countSlotProps = computed(() => ({
  length: props.modelValue.length,
  maxlength: props.maxlength,
  remaining: props.maxlength === undefined ? undefined : props.maxlength - props.modelValue.length,
}))
const {
  disabled: isDisabled,
  invalid: isInvalid,
  required: isRequired,
  readonly: isReadonly,
} = useGrFormControl(() => props)

const aria = useControlAria()

/**
 * Небуквенный признак состояния: иконка для глаз, скрытая подпись для
 * скринридера. Разбор — `shared/controlState`.
 */
const signalState = computed(() => controlSignalState(props.state, isInvalid.value))
const stateIcon = computed(() => (signalState.value === 'success' ? IconCheckCircle : IconAlertTriangle))
const stateIconClass = computed(() => (signalState.value
  ? `${controlStateIconClass} ${controlStateIconColors[signalState.value]}`
  : ''))

const describedBy = computed(() =>
  [
    field?.describedById.value,
    hasCharCount.value ? countId : undefined,
    props.showLineCount ? lineCountId : undefined,
    signalState.value ? stateTextId : undefined,
  ]
    .filter(Boolean)
    .join(' ') || undefined,
)

const textareaEl = ref<HTMLTextAreaElement | null>(null)

function focus(): void {
  textareaEl.value?.focus()
}

function blur(): void {
  textareaEl.value?.blur()
}

defineExpose({
  /** Фокус в поле из кода. */
  focus,
  /** Снять фокус с поля. */
  blur,
})

const resolvedSize = useGrComponentSize(() => props.size, { component: 'GrTextarea' })
const resolvedClearable = useGrComponentProp('GrTextarea', 'clearable', () => props.clearable, false)

const { t } = useGranularityTranslations()

const stateText = computed(() => (signalState.value
  ? t(controlStateTextKey[signalState.value], controlStateFallbackText[signalState.value])
  : ''))
const resolvedClearLabel = computed(() => props.clearLabel ?? t('gr.input.clear', 'Clear'))

/** С `maxLines` — «3 / 10», без него — локализованная подпись с формой числа. */
const lineCountText = computed(() => (
  props.maxLines !== undefined
    ? `${lineCount.value} / ${props.maxLines}`
    : t('gr.textarea.lines', '{n} lines', { n: lineCount.value })
))

const showClear = computed(() =>
  resolvedClearable.value && !isDisabled.value && !isReadonly.value && props.modelValue !== '',
)

/**
 * Место под кнопку очистки и признак состояния справа: они лежат поверх поля в
 * его верхнем углу, и без отступа первая строка уходила под «×». Резерв —
 * пока кнопка **может** появиться, а не только когда видна: иначе первый же
 * символ переносил бы строку.
 */
const fieldEndPadding = computed(() => {
  const clearSlot = resolvedClearable.value && !isDisabled.value && !isReadonly.value
  const slots = (clearSlot ? 1 : 0) + (signalState.value ? 1 : 0)
  if (slots === 0)
    return undefined

  // Кнопка — 1.5rem у `right-2`, признак — 1rem у `right-10` рядом с ней.
  return { paddingRight: slots === 2 ? '3.75rem' : '2.25rem' }
})

function clear(): void {
  emit('update:modelValue', '')
  emit('change', '')
  emit('clear')
  focus()
}

const baseClass = 'rounded-[var(--gr-radius-control)] border text-[var(--gr-fg)] placeholder:text-[var(--gr-muted-fg)] transition-colors duration-[var(--gr-duration-fast)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)] disabled:cursor-not-allowed'

const className = computed(() => [
  sizes[resolvedSize.value],
  resizeClass[props.resize],
  isDisabled.value ? disabledSurfaceClass : enabledSurfaceClass,
  grTextareaClass({
    state: props.state,
    invalid: isInvalid.value,
  }),
].join(' '))

// Обе ветки шаблона (со счётчиком и без) рендерят одно и то же поле, поэтому
// атрибуты живут одним объектом: двадцать строк копипасты расходятся молча.
const textareaAttrs = computed(() => ({
  'id': resolvedId.value,
  'data-gr-textarea': '',
  'name': props.name,
  'rows': props.rows,
  'maxlength': props.maxlength,
  'autocomplete': props.autocomplete,
  'placeholder': props.placeholder,
  'disabled': isDisabled.value,
  'value': props.modelValue,
  'aria-invalid': isInvalid.value ? ('true' as const) : undefined,
  'aria-describedby': describedBy.value,
  'aria-required': isRequired.value ? ('true' as const) : undefined,
  'aria-readonly': isReadonly.value ? ('true' as const) : undefined,
  'aria-label': props.ariaLabel,
  'readonly': isReadonly.value,
  'class': [baseClass, className.value],
}))

function onInput(e: Event): void {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}

/**
 * Связи потребителя складываются с описанием поля, а не затирают его: `$attrs`
 * шли поверх `textareaAttrs`, и `aria-describedby` потребителя убирал подсказку.
 */
function ariaLinks(): Record<string, string | undefined> {
  return {
    'aria-describedby': aria.describedBy(describedBy.value),
    'aria-labelledby': aria.labelledBy(),
    'aria-errormessage': aria.errorMessage(),
  }
}

// Объявленный emit уходит из `$attrs`, поэтому нативные события переизлучаем
// руками — иначе `@change`/`@focus`/`@blur` у потребителя перестали бы работать.
function onChange(e: Event): void {
  emit('change', (e.target as HTMLTextAreaElement).value)
}

function onFocus(e: FocusEvent): void {
  emit('focus', e)
}

function onBlur(e: FocusEvent): void {
  emit('blur', e)
}
</script>

<template>
  <div
    data-gr-textarea-wrap
    class="relative"
    :class="aria.ownsWidth() ? '' : 'w-full'"
    v-bind="aria.layoutAttrs()"
  >
    <!--
      Одна устойчивая разметка: обёртка есть всегда, а кнопка очистки, признак
      состояния и счётчики — лишь её соседи по условию. Раньше обёртка
      появлялась и исчезала вместе с ними, и `<textarea>` пересоздавался: стоило
      `state` стать `success` или появиться крестику на первом символе, фокус
      уходил на `<body>`, и следующие нажатия пропадали.
    -->
    <!-- `block` — без него под строчным `<textarea>` в блочной обёртке остаётся
         зазор базовой линии, и поле выходило выше на несколько пикселей. -->
    <textarea
      ref="textareaEl"
      v-autosize="autosize"
      class="block w-full"
      :style="fieldEndPadding"
      v-bind="{ ...textareaAttrs, ...aria.fieldAttrs(), ...ariaLinks() }"
      @input="onInput"
      @change="onChange"
      @focus="onFocus"
      @blur="onBlur"
    />

    <button
      v-if="showClear"
      type="button"
      data-gr-textarea-clear
      :aria-label="resolvedClearLabel"
      class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-[var(--gr-radius-sm)] text-[var(--gr-muted-fg)] transition-colors hover:bg-[var(--gr-muted)] hover:text-[var(--gr-fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gr-ring)]"
      @click="clear"
    >
      <IconX class="h-4 w-4" aria-hidden="true" />
    </button>

    <span
      v-if="signalState"
      data-gr-textarea-state
      class="absolute top-2" :class="[stateIconClass, showClear ? 'right-10' : 'right-2']"
      aria-hidden="true"
    >
      <component :is="stateIcon" class="h-4 w-4" />
    </span>

    <span v-if="signalState" :id="stateTextId" data-gr-textarea-state-text class="sr-only">{{ stateText }}</span>

    <div v-if="hasCounters" :class="countRowClass">
      <div
        v-if="showLineCount"
        :id="lineCountId"
        data-gr-textarea-line-count
        :class="lineCountClass"
      >
        {{ lineCountText }}
      </div>

      <!-- Символьный счётчик всегда прижат вправо: без счётчика строк он остаётся
           единственным в ряду, и `justify-between` его туда и отправляет. -->
      <div
        v-if="hasCharCount"
        :id="countId"
        data-gr-textarea-count
        class="ml-auto"
        :class="countClass"
      >
        <slot name="count" v-bind="countSlotProps">
          {{ countText }}
        </slot>
      </div>
    </div>
  </div>
</template>
