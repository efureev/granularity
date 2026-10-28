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
import type { GrControlShape } from '../shared/controlShape'
import { useGrComponentProp, useGrComponentSize } from '../shared/configContext'
import { useGrFormFieldContext } from '../shared/formFieldContext'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useGranularityTranslations } from '../../internal/granularityI18n'
import type { InputHTMLAttributes } from 'vue'

import { grFieldLookAttrs } from './grFieldLook'
import { addonInlinePrefixClass, addonInlineSuffixClass, addonSegmentPrefixClass, addonSegmentSuffixClass, grInputFieldClass, paddingX } from './grInputStyles'

import IconLoader from '~icons/lucide/loader-2'
import IconX from '~icons/lucide/x'
import IconCheckCircle from '~icons/lucide/check-circle'
import IconAlertTriangle from '~icons/lucide/alert-triangle'
import IconEye from '~icons/lucide/eye'
import IconEyeOff from '~icons/lucide/eye-off'
import { useControlAria } from '../../composables/internal/useControlAria'

export interface GrInputProps {
  /**
     * Значение поля. Необязательное: без `v-model` поле рисуется пустым.
     * Дефолт — пустая строка, а не `undefined`: длина значения читается
     * напрямую (`showClear`), и `undefined` уронил бы рендер.
     */
  modelValue?: string
  /** Нативный `type`: меняет клавиатуру и браузерную проверку формата. По умолчанию `text`. */
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url'
  /** Подсказка в пустом поле. Подпись не заменяет: имя даёт `GrFormField` или `ariaLabel`. */
  placeholder?: string
  /** Нативный `autocomplete`: чем браузеру заполнять поле — `email`, `one-time-code` и т. п. */
  autocomplete?: string
  /** Нативный `inputmode`: какую экранную клавиатуру показать, не меняя `type`. */
  inputmode?: InputHTMLAttributes['inputmode']
  /** Выключить поле: очистка и показ пароля пропадают. Складывается с `GrFormField`. */
  disabled?: boolean
  /** Только для чтения: значение видно и выделяемо, но не редактируется. */
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
  state?: 'default' | 'success' | 'warning' | 'danger'
  /** Нативный `name` — имя поля при отправке формы. */
  name?: string
  /** `id` поля. Не задан — берётся из `GrFormField`, чтобы подпись нашла поле. */
  id?: string
  /** Высота и кегль по шкале контролов. По умолчанию `md`; берётся из `GrConfigProvider`. */
  size?: GrInputSize
  /**
   * Форма рамки. `box` — скругление шкалы контролов, как было всегда; `pill` —
   * дорожка-пилюля, как у `GrSegmented`. Форма тянет за собой горизонтальный
   * отступ: в пилюле он не меньше половины высоты, иначе текст заезжает в дугу.
   */
  shape?: GrControlShape

  /** Показывать кнопку очистки, когда есть значение (и не disabled/readonly). */
  clearable?: boolean
  /** i18n aria-label кнопки очистки. */
  clearLabel?: string
  /** Ограничение длины + основа для счётчика символов. */
  maxlength?: number
  /** Показывать счётчик символов (`len` или `len/maxlength`). */
  showCount?: boolean
  /**
   * Аддоны `prefix`/`suffix` несут смысл, а не украшают.
   *
   * По умолчанию они скрыты от скринридера: чаще всего там иконка поиска или
   * глиф, повторяющий подпись поля, и второе прочтение мешает. Но `https://`
   * или `₽` бывают единственным местом, где сказано, что вводить, — тогда
   * аддон уезжает в `aria-describedby` поля.
   *
   * Декоративную иконку внутри слота помечайте `aria-hidden` сами: проп снимает
   * скрытие со всей обёртки, а не разбирает её содержимое.
   */
  describeAddons?: boolean
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
  /** i18n aria-label кнопки, которая прячет показанный пароль. Не задан — из локали. */
  passwordHideLabel?: string

  /** Выравнивание текста в поле. По умолчанию `left`. */
  textAlign?: GrInputTextAlign

  /** Минимальная ширина префикса. По умолчанию — по ступени размера, у `inline`-аддона — `0`. */
  prefixMinWidth?: string
  /** Максимальная ширина префикса: содержимое шире обрезается. */
  prefixMaxWidth?: string
  /** Минимальная ширина суффикса. По умолчанию — по ступени размера, у `inline`-аддона — `0`. */
  suffixMinWidth?: string
  /** Максимальная ширина суффикса: содержимое шире обрезается. */
  suffixMaxWidth?: string
  /**
     * Фиксированная ширина у prefix/suffix: аддон получает жёсткую ширину
     * (из `*MaxWidth` → `*MinWidth` → дефолт), а контент обрезается по краю
     * (prefix — справа, suffix — слева). По умолчанию аддоны «растягиваются»
     * под контент (в пределах min/max), а излишек клипается оболочкой.
     */
  prefixFixed?: boolean
  /** Жёсткая ширина суффикса — как у `prefixFixed`, только лишнее обрезается слева. */
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
  /** Новое значение на каждый ввод (`v-model`). Кнопка очистки шлёт пустую строку. */
  (e: 'update:modelValue', value: string): void
  /** Значение зафиксировано нативным `change` — по `blur` или `Enter`. */
  (e: 'change', value: string): void
  /** Поле получило фокус — нативный `focus` с `<input>`. */
  (e: 'focus', event: FocusEvent): void
  /** Поле потеряло фокус — нативный `blur` с `<input>`. */
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
    shape: undefined,

    // Настраивается через `GrConfigProvider`; дефолт — в резолвере ниже.
    clearable: undefined,
    clearLabel: undefined,
    maxlength: undefined,
    showCount: false,
    describeAddons: false,
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
const slots = defineSlots<{
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
const resolvedShape = useGrComponentProp('GrInput', 'shape', () => props.shape, 'box')
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

const aria = useControlAria()

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
  /** Поставить фокус в поле. */
  focus,
  /** Снять фокус с поля. */
  blur,
  /** Выделить содержимое поля — чтобы подставленное значение перезаписали вводом. */
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
const prefixId = useId()
const suffixId = useId()

/**
 * Аддоны в описании поля.
 *
 * Снять с них `aria-hidden` мало: `<div>` рядом с полем в его доступное имя не
 * входит, и диктор наткнулся бы на текст только при обходе страницы — то есть
 * не тогда, когда он нужен. Поэтому значащий аддон уезжает в
 * `aria-describedby`, а не просто перестаёт быть скрытым.
 */
const addonDescribedBy = computed(() => (props.describeAddons
  ? [slots.prefix ? prefixId : undefined, slots.suffix ? suffixId : undefined]
  : []))

const describedBy = computed(() =>
  [
    field?.describedById.value,
    props.showCount ? countId : undefined,
    signalState.value ? stateTextId : undefined,
    ...addonDescribedBy.value,
  ]
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
  paddingX: () => paddingX[resolvedShape.value][resolvedSize.value],
  trailingReserve: () => trailingReserve.value,
})

// Рамка, кольцо и недоступность — на оболочке (`focus-within`), размеры и выравнивание — на инпуте.
const shellAttrs = computed(() => grFieldLookAttrs({
  size: resolvedSize.value,
  state: props.state,
  invalid: isInvalid.value,
  disabled: isDisabled.value,
  readonly: isReadonly.value,
  shape: resolvedShape.value,
}))

const className = computed(() => grInputFieldClass({
  size: resolvedSize.value,
  align: props.textAlign,
  shape: resolvedShape.value,
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
  <div data-gr-input :class="aria.ownsWidth() ? '' : 'w-full'" v-bind="aria.layoutAttrs()">
    <!-- `class` и `style` потребителя — на корне: он держит рамку и ширину.
         На нативное поле уходит остальное — там `aria-*` и `data-*` что-то значат.
         `overflow-hidden` обрезает отсек аддона по внешней дуге рамки: «скруглять
         только внешние углы» получается само. -->
    <div class="relative w-full overflow-hidden" v-bind="shellAttrs">
      <div
          v-if="$slots.prefix"
          :id="prefixId"
          ref="prefixEl"
          data-testid="gr-input-prefix"
          class="absolute inset-y-0 left-0 flex items-center justify-center text-[var(--gr-muted-fg)] pointer-events-none select-none truncate"
          :class="prefixAddonClass"
          :style="prefixStyle"
          :aria-hidden="describeAddons ? undefined : 'true'"
      >
        <slot name="prefix" />
      </div>

      <input
          :id="resolvedId"
          ref="inputEl"
          v-bind="aria.fieldAttrs()"
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
          :aria-describedby="aria.describedBy(describedBy)"
          :aria-labelledby="aria.labelledBy()"
          :aria-errormessage="aria.errorMessage()"
          :aria-required="isRequired ? 'true' : undefined"
          :aria-readonly="isReadonly ? 'true' : undefined"
          :aria-label="ariaLabel"
          :aria-busy="props.loading ? 'true' : undefined"
          class="w-full bg-transparent text-[var(--gr-fg)] placeholder:text-[var(--gr-muted-fg)] focus:outline-none disabled:cursor-not-allowed disabled:text-[var(--gr-muted-fg)]"
          :class="[className, type === 'search' ? '' : 'focus:placeholder:text-transparent']"
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
          :id="suffixId"
          ref="suffixEl"
          data-testid="gr-input-suffix"
          class="absolute inset-y-0 right-0 flex items-center justify-center text-[var(--gr-muted-fg)] pointer-events-none select-none truncate"
          :class="[suffixAddonClass, suffixFixed ? '[direction:rtl]' : '']"
          :style="suffixStyle"
          :aria-hidden="describeAddons ? undefined : 'true'"
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

<style>
/*
 * Рамка поля — общая для всех полей экосистемы: её ставят атрибутами
 * `grFieldLookAttrs` и `GrInput`, и `GrSelect`, и пикеры спутников
 * (`docs/field.md`). Атрибуты взаимоисключающие там, где спорили бы: при ошибке
 * подсветки `data-gr-state` нет, у недоступного нет «только для чтения».
 */
[data-gr-field] {
  --gr-input-ring-color: var(--gr-ring);
  border-width: 1px;
  border-color: var(--gr-input);
  background-color: var(--gr-bg);
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-duration: var(--gr-duration-fast);
  transition-timing-function: var(--gr-ease-out);
}

[data-gr-field][data-gr-size='xs'] {
  border-radius: var(--gr-radius-control-xs);
}

[data-gr-field][data-gr-size='sm'] {
  border-radius: var(--gr-radius-control-sm);
}

[data-gr-field][data-gr-size='md'] {
  border-radius: var(--gr-radius-control-md);
}

[data-gr-field][data-gr-size='lg'] {
  border-radius: var(--gr-radius-control-lg);
}

[data-gr-field][data-gr-shape='pill'] {
  border-radius: var(--gr-radius-full);
}

/* Ступень — внешняя высота: рамка входит в неё, а не прибавляется сверху. */
[data-gr-field='line'][data-gr-size='xs'] {
  height: 1.75rem;
}

[data-gr-field='line'][data-gr-size='sm'] {
  height: 2rem;
}

[data-gr-field='line'][data-gr-size='md'] {
  height: 2.5rem;
}

[data-gr-field='line'][data-gr-size='lg'] {
  height: 2.75rem;
}

[data-gr-field='wrap'][data-gr-size='xs'] {
  min-height: 1.75rem;
}

[data-gr-field='wrap'][data-gr-size='sm'] {
  min-height: 2rem;
}

[data-gr-field='wrap'][data-gr-size='md'] {
  min-height: 2.5rem;
}

[data-gr-field='wrap'][data-gr-size='lg'] {
  min-height: 2.75rem;
}

/*
 * Подсветка `state` — решение разработчика, ошибка — вердикт валидации, тема
 * вправе развести их по цвету. Недоступность и «только чтение» гасят лишь рамку
 * покоя: подсветка и ошибка остаются видны.
 */
[data-gr-field][data-gr-state='success'] {
  --gr-input-ring-color: var(--gr-success);
  border-color: var(--gr-success);
}

[data-gr-field][data-gr-state='warning'] {
  --gr-input-ring-color: var(--gr-warning);
  border-color: var(--gr-warning);
}

[data-gr-field][data-gr-state='danger'] {
  --gr-input-ring-color: var(--gr-danger);
  border-color: var(--gr-danger);
}

[data-gr-field][data-gr-invalid] {
  --gr-input-ring-color: var(--gr-invalid-ring);
  border-color: var(--gr-invalid-brd);
}

[data-gr-field][data-gr-readonly]:not([data-gr-state], [data-gr-invalid]) {
  border-color: var(--gr-input-readonly-brd);
}

[data-gr-field][data-gr-off]:not([data-gr-state], [data-gr-invalid]) {
  border-color: var(--gr-disabled-brd);
}

/*
 * Отклик на указатель и фокус — только у рабочего поля без подсветки: у
 * недоступного и у поля только для чтения рамке нечего обещать, а у ошибки и
 * подсветки она — сообщение. Под указателем сфокусированное поле держит рамку
 * фокуса.
 */
[data-gr-field]:not([data-gr-off], [data-gr-readonly], [data-gr-invalid], [data-gr-state]):hover:not(:focus-within) {
  border-color: var(--gr-input-hover);
}

[data-gr-field]:not([data-gr-off], [data-gr-readonly], [data-gr-invalid], [data-gr-state]):focus-within {
  border-color: var(--gr-input-focus-brd);
}

[data-gr-field]:not([data-gr-trigger]):focus-within,
[data-gr-field][data-gr-trigger]:focus-visible {
  box-shadow: 0 0 0 var(--gr-input-focus-ring-width) var(--gr-input-ring-color);
}

[data-gr-field][data-gr-readonly] {
  background-color: var(--gr-input-readonly-bg);
}

/*
 * Недоступное поле гасится подложкой, а не `opacity`: прозрачность разбавляет
 * выверенные на AA роли текста.
 */
[data-gr-field][data-gr-off] {
  background-color: var(--gr-muted);
  color: var(--gr-muted-fg);
  cursor: not-allowed;
}

/*
 * Свой крестик (`clearable`) — единственная кнопка очистки: Chromium и Safari
 * рисуют у `type="search"` ещё и нативный, и у поля их становилось два. Без
 * `clearable` нативный тоже не нужен — он есть не во всех браузерах.
 */
[data-gr-input] input[type='search']::-webkit-search-cancel-button,
[data-gr-input] input[type='search']::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
}
</style>
