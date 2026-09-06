<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import IconLoader from '~icons/lucide/loader-circle'

import { useGrComponentSize } from '../GrConfigProvider/context'
import { useGrFormFieldContext } from '../GrFormField/context'
import { useGrComponentProp } from '../../composables/useGrComponentConfig'
import { useGrFormControl } from '../../composables/useGrFormControl'
import { useGranularityTranslations } from '../../internal/granularityI18n'

import {
  grSwitchLabelClass,
  grSwitchRootClass,
  grSwitchSpinnerClass,
  grSwitchStateTextClass,
  grSwitchThumbClass,
  grSwitchTrackClass,
  isGrSwitchStateTextSize,
  stateTextGhostClass,
  stateTextRoom,
  stateTextStackClass,
  type GrSwitchLabelPosition,
  type GrSwitchSize,
  type GrSwitchStateTextSize,
} from './grSwitchStyles'

export type {
  GrSwitchLabelPosition,
  GrSwitchSize,
  GrSwitchStateTextSize,
} from './grSwitchStyles'

/**
 * Пропсы публичного GR-примитива «Switch».
 */
export interface GrSwitchProps {
  /**
   * Значение переключателя. Необязательное: без `v-model` контрол рисуется
   * выключенным — так же, как `GrCheckbox`. Обязательный проп заставлял бы
   * заводить `ref` даже там, где переключатель presentational.
   */
  modelValue?: boolean
  disabled?: boolean
  /** Только для чтения: состояние видно, но не переключается. */
  readonly?: boolean
  /** Визуальное и ARIA-состояние ошибки. */
  invalid?: boolean
  /** Обязательное поле (`aria-required`). */
  required?: boolean
  ariaLabel?: string
  size?: GrSwitchSize
  /** Сторона подписи относительно дорожки. */
  labelPosition?: GrSwitchLabelPosition
  /** Идёт сохранение: бегунок показывает спиннер, переключение заблокировано. */
  loading?: boolean
  /** i18n: что именно грузится. `aria-busy` сам по себе часть AT не объявляет. */
  loadingText?: string
  /** Имя поля для нативной отправки формы. Без него скрытое поле не рендерится. */
  name?: string
  /** Значение, уходящее в форму во включённом состоянии. */
  value?: string
  /** `id` формы, если переключатель лежит вне неё. */
  form?: string
  /** Кастомный цвет фона в активном состоянии. Если не задан — `var(--gr-primary)`. */
  activeBackgroundColor?: string
  /** Кастомный цвет фона в неактивном состоянии. Если не задан — `var(--gr-muted)`. */
  inactiveBackgroundColor?: string
  /**
   * Подпись состояния внутри дорожки — на свободной от бегунка стороне.
   * Помещается только на `md` и `lg`; на мелких ступенях не рисуется.
   */
  showStateText?: boolean
  /** Текст включённого состояния. Без него — `gr.switch.on` из локали. */
  checkedText?: string
  /** Текст выключенного состояния. Без него — `gr.switch.off` из локали. */
  uncheckedText?: string
  /**
   * Дорожка растягивается под подпись, а ступень размера становится нижней
   * границей ширины. Без `showStateText` смысла не имеет: тянуться не под что.
   */
  autoWidth?: boolean
}

export interface GrSwitchEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const getCustomColor = (value?: string) => value?.trim() || undefined

// Скрытое поле — сосед кнопки, а не её потомок: интерактивный контент внутри
// `<button>` невалиден. Из-за этого корень компонента — фрагмент, и атрибуты
// потребителя надо донести до кнопки руками.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<GrSwitchProps>(),
  {
    modelValue: false,
    disabled: false,
    readonly: false,
    invalid: false,
    required: false,
    ariaLabel: undefined,
    size: undefined,
    labelPosition: 'end',
    loading: false,
    loadingText: undefined,
    name: undefined,
    value: 'on',
    form: undefined,
    activeBackgroundColor: undefined,
    inactiveBackgroundColor: undefined,
    // `undefined`, а не `false`: Vue приводит отсутствующий boolean к `false`,
    // и дефолт из `GrConfigProvider` до компонента бы не доехал.
    showStateText: undefined,
    checkedText: undefined,
    uncheckedText: undefined,
    autoWidth: undefined,
  },
)

// Контекст `GrFormField`: id для `<label for>`, описание ошибкой, невалидность.
// `<button>` — labelable-элемент, поэтому клик по подписи фокусирует переключатель.
const field = useGrFormFieldContext()
const fieldId = computed(() => field?.id.value)
const describedBy = computed(() => field?.describedById.value)
const {
  disabled: isDisabled,
  invalid: isInvalid,
  required: isRequired,
  readonly: isReadonly,
} = useGrFormControl(() => props)

const { t } = useGranularityTranslations()

const rootEl = ref<HTMLButtonElement | null>(null)

function focus(): void {
  rootEl.value?.focus()
}

function blur(): void {
  rootEl.value?.blur()
}

defineExpose({ focus, blur })

// Эффективный размер: локальный проп → `GrConfigProvider` → дефолт компонента.
const resolvedSize = useGrComponentSize(() => props.size, {
  component: 'GrSwitch',
  supported: ['xs', 'sm', 'md', 'lg'],
})

const emit = defineEmits<GrSwitchEmits>()
defineSlots<{
  /** Подпись переключателя. */
  default?: () => any
}>()

const resolvedShowStateText = useGrComponentProp(
  'GrSwitch',
  'showStateText',
  () => props.showStateText,
  false,
)

const resolvedAutoWidth = useGrComponentProp(
  'GrSwitch',
  'autoWidth',
  () => props.autoWidth,
  false,
)

// Ступень, на которой подпись помещается в дорожку, — иначе её нет вовсе.
const stateTextSize = computed<GrSwitchStateTextSize | undefined>(() => {
  if (!resolvedShowStateText.value)
    return undefined

  return isGrSwitchStateTextSize(resolvedSize.value) ? resolvedSize.value : undefined
})

const hasStateText = computed(() => stateTextSize.value !== undefined)

const rootClass = computed(() => grSwitchRootClass(props.labelPosition))

const trackClass = computed(() => grSwitchTrackClass(resolvedSize.value, hasStateText.value && resolvedAutoWidth.value))

const trackStyle = computed(() => {
  const isChecked = props.modelValue
  const defaultBackgroundColor = isChecked ? 'var(--gr-primary)' : 'var(--gr-muted)'
  const customBackgroundColor = getCustomColor(
    isChecked ? props.activeBackgroundColor : props.inactiveBackgroundColor,
  )
  // Недоступность гасится токеном и перебивает кастомный цвет: иначе выключенный
  // переключатель остался бы таким же ярким, как рабочий.
  const backgroundColor = isDisabled.value
    ? 'var(--gr-disabled-bg)'
    : customBackgroundColor ?? defaultBackgroundColor

  return {
    '--gr-switch-track-bg': backgroundColor,
    '--gr-switch-track-brd': isDisabled.value
      ? 'var(--gr-disabled-brd)'
      : customBackgroundColor
        ? backgroundColor
        : isChecked
          ? 'var(--gr-primary)'
          : 'var(--gr-brd)',
    'backgroundColor': 'var(--gr-switch-track-bg)',
  }
})

const thumbClass = computed(() => grSwitchThumbClass({ size: resolvedSize.value, checked: props.modelValue }))

const spinnerClass = computed(() => grSwitchSpinnerClass(resolvedSize.value))

const labelClass = computed(() => grSwitchLabelClass(resolvedSize.value, isDisabled.value))

const resolvedLoadingText = computed(() => props.loadingText ?? t('gr.switch.loading', 'Saving…'))

const stateTextClass = computed(() => (stateTextSize.value
  ? grSwitchStateTextClass({
      size: stateTextSize.value,
      checked: props.modelValue,
      disabled: isDisabled.value,
      autoWidth: resolvedAutoWidth.value,
    })
  : ''))

const checkedStateText = computed(() => props.checkedText ?? t('gr.switch.on', 'ON'))
const uncheckedStateText = computed(() => props.uncheckedText ?? t('gr.switch.off', 'OFF'))

const resolvedStateText = computed(() => (
  props.modelValue ? checkedStateText.value : uncheckedStateText.value
))

// Невидимый дубль держит ширину: без него дорожка меняла бы размер на каждом
// щелчке, потому что «вкл» и «выкл» почти никогда не равны по ширине.
const ghostStateText = computed(() => (
  props.modelValue ? uncheckedStateText.value : checkedStateText.value
))

if (__GR_DEV__) {
  watchEffect(() => {
    if (resolvedAutoWidth.value && !resolvedShowStateText.value) {
      console.warn(
        '[granularity] GrSwitch: `autoWidth` без `showStateText` ничего не делает — '
        + 'дорожке не подо что растягиваться.',
      )
    }
  })

  watchEffect(() => {
    if (!resolvedShowStateText.value || isGrSwitchStateTextSize(resolvedSize.value))
      return

    console.warn(
      `[granularity] GrSwitch: подпись состояния не нарисована на ступени \`${resolvedSize.value}\`: `
      + `рядом с бегунком ${stateTextRoom[resolvedSize.value]}px, а минимально читаемой подписи нужен `
      + `${stateTextRoom.md}px. Подписи живут на \`md\` и \`lg\`.`,
    )
  })
}

// Выключенный переключатель не отправляется вовсе — так устроен чекбокс в HTML,
// и сервер отличает «выкл» по отсутствию ключа.
const submitsValue = computed(
  () => props.modelValue && !isDisabled.value && Boolean(props.name),
)

function toggle(): void {
  if (isDisabled.value || isReadonly.value || props.loading) {
    return
  }

  const next = !props.modelValue
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<template>
  <input
      v-if="submitsValue"
      type="hidden"
      :name="name"
      :value="value"
      :form="form"
  >

  <button
      :id="fieldId"
      ref="rootEl"
      v-bind="$attrs"
      type="button"
      role="switch"
      data-gr-switch
      :aria-checked="modelValue ? 'true' : 'false'"
      :aria-label="ariaLabel"
      :aria-describedby="describedBy"
      :aria-invalid="isInvalid ? 'true' : undefined"
      :aria-required="isRequired ? 'true' : undefined"
      :aria-readonly="isReadonly ? 'true' : undefined"
      :aria-busy="loading ? 'true' : undefined"
      :disabled="isDisabled"
      :class="rootClass"
      @click="toggle"
      @focus="emit('focus', $event)"
      @blur="emit('blur', $event)"
  >
    <span
        data-testid="gr-switch-track"
        data-gr-switch-track
        :class="trackClass"
        :style="trackStyle"
    >
      <span
          v-if="stateTextSize"
          data-testid="gr-switch-state-text"
          data-gr-switch-state-text
          :class="stateTextClass"
          aria-hidden="true"
      >
        <span :class="stateTextStackClass">{{ resolvedStateText }}</span>
        <span
            v-if="resolvedAutoWidth"
            data-gr-switch-state-text-ghost
            :class="stateTextGhostClass"
        >{{ ghostStateText }}</span>
      </span>
      <span
          data-testid="gr-switch-thumb"
          data-gr-switch-thumb
          :class="thumbClass"
          aria-hidden="true"
      >
        <IconLoader v-if="loading" data-gr-switch-spinner :class="spinnerClass" />
      </span>
    </span>
    <span
        v-if="$slots.default"
        data-gr-switch-label
        :class="labelClass"
    >
      <slot />
    </span>
    <span v-if="loading" data-gr-switch-loading-text class="sr-only">{{ resolvedLoadingText }}</span>
  </button>
</template>
